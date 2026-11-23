import { supabase } from '../../../lib/supabase'
import type {
  FotoConUrl,
  GrupoDetalle,
  GrupoTciInput,
  Metricas,
  MiembroTci,
  PersonaMini,
  SalidaCompleta,
  SalidaInput,
  SalidaResumen,
} from '../types'

const BUCKET = 'tci-fotos'
const LIDER = 'lider:miembros!tci_grupos_lider_id_fkey(id, nombre)'
const INTEGRANTES = 'integrantes:tci_integrantes(*, miembro:miembros(id, nombre))'

function ordenarIntegrantes<T extends { miembro: PersonaMini | null }>(lista: T[]) {
  return [...lista].sort((a, b) => (a.miembro?.nombre ?? '').localeCompare(b.miembro?.nombre ?? '', 'es'))
}

export const tciService = {
  // ---------- Salidas ----------
  async listarSalidas(): Promise<SalidaResumen[]> {
    const { data, error } = await supabase
      .from('salidas_tci')
      .select('*, grupos:tci_grupos(*, integrantes:tci_integrantes(count))')
      .order('fecha', { ascending: false })
    if (error) throw error
    return data as unknown as SalidaResumen[]
  },

  async obtenerSalida(id: string): Promise<SalidaCompleta> {
    const { data, error } = await supabase
      .from('salidas_tci')
      .select(`*, grupos:tci_grupos(*, ${LIDER}, ${INTEGRANTES}, fotos:tci_fotos(id, ruta))`)
      .eq('id', id)
      .single()
    if (error) throw error
    const salida = data as unknown as SalidaCompleta
    salida.grupos = salida.grupos
      .map((g) => ({ ...g, integrantes: ordenarIntegrantes(g.integrantes) }))
      .sort((a, b) => a.nombre.localeCompare(b.nombre, 'es', { numeric: true }))
    return salida
  },

  async crearSalida(input: SalidaInput) {
    const { data, error } = await supabase.from('salidas_tci').insert(input).select('id').single()
    if (error) throw error
    return data.id
  },

  async actualizarSalida(id: string, input: Partial<SalidaInput>) {
    const { data, error } = await supabase.from('salidas_tci').update(input).eq('id', id).select('id')
    if (error) throw error
    if (!data.length) throw new Error('No tienes permiso para editar esta salida')
  },

  async eliminarSalida(id: string) {
    const { data, error } = await supabase.from('salidas_tci').delete().eq('id', id).select('id')
    if (error) throw error
    if (!data.length) throw new Error('No tienes permiso para eliminar esta salida')
  },

  // ---------- Grupos ----------
  async obtenerGrupo(id: string): Promise<GrupoDetalle> {
    const { data, error } = await supabase
      .from('tci_grupos')
      .select(`*, salida:salidas_tci(*), ${LIDER}, ${INTEGRANTES}`)
      .eq('id', id)
      .single()
    if (error) throw error
    const grupo = data as unknown as GrupoDetalle
    grupo.integrantes = ordenarIntegrantes(grupo.integrantes)
    return grupo
  },

  async crearGrupo(input: GrupoTciInput) {
    const { error } = await supabase.from('tci_grupos').insert(input)
    if (error) throw error
  },

  async actualizarGrupo(id: string, input: Partial<GrupoTciInput>) {
    const { data, error } = await supabase.from('tci_grupos').update(input).eq('id', id).select('id')
    if (error) throw error
    if (!data.length) throw new Error('No tienes permiso para editar este grupo')
  },

  async eliminarGrupo(id: string) {
    // Borra primero los archivos de las fotos (las filas se eliminan en cascada)
    const { data: fotos } = await supabase.from('tci_fotos').select('ruta').eq('grupo_id', id)
    if (fotos?.length) await supabase.storage.from(BUCKET).remove(fotos.map((f) => f.ruta))
    const { data, error } = await supabase.from('tci_grupos').delete().eq('id', id).select('id')
    if (error) throw error
    if (!data.length) throw new Error('No tienes permiso para eliminar este grupo')
  },

  // ---------- Integrantes ----------
  async miembrosDisponibles(): Promise<MiembroTci[]> {
    const { data, error } = await supabase.rpc('miembros_para_tci')
    if (error) throw error
    return data ?? []
  },

  async agregarIntegrantes(grupoId: string, miembros: string[]) {
    const filas = miembros.map((miembro_id) => ({ grupo_id: grupoId, miembro_id }))
    const { error } = await supabase.from('tci_integrantes').insert(filas)
    if (error) throw error
  },

  /** Metas y logros del equipo (el líder también puede guardarlos) */
  async guardarMetricas(grupoId: string, valores: Partial<Metricas>) {
    const { error } = await supabase.rpc('guardar_metricas_grupo_tci', {
      p_grupo: grupoId,
      p_valores: valores as Record<string, number>,
    })
    if (error) throw error
  },

  async quitarIntegrante(id: string) {
    const { data, error } = await supabase.from('tci_integrantes').delete().eq('id', id).select('id')
    if (error) throw error
    if (!data.length) throw new Error('No tienes permiso para quitar este integrante')
  },

  // ---------- Fotos ----------
  async listarFotos(grupoId: string): Promise<FotoConUrl[]> {
    const { data, error } = await supabase
      .from('tci_fotos')
      .select('*')
      .eq('grupo_id', grupoId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return tciService.conUrls(data)
  },

  /** Agrega URLs firmadas (el bucket es privado) */
  async conUrls<T extends { ruta: string }>(fotos: T[]): Promise<(T & { url: string | null })[]> {
    if (!fotos.length) return []
    const { data } = await supabase.storage.from(BUCKET).createSignedUrls(
      fotos.map((f) => f.ruta),
      60 * 60
    )
    const porRuta = new Map((data ?? []).map((d) => [d.path, d.signedUrl]))
    return fotos.map((f) => ({ ...f, url: porRuta.get(f.ruta) ?? null }))
  },

  async subirFoto(grupoId: string, archivo: Blob) {
    const ruta = `${grupoId}/${crypto.randomUUID()}.jpg`
    const subida = await supabase.storage.from(BUCKET).upload(ruta, archivo, { contentType: 'image/jpeg' })
    if (subida.error) throw subida.error
    const { error } = await supabase.from('tci_fotos').insert({ grupo_id: grupoId, ruta })
    if (error) {
      await supabase.storage.from(BUCKET).remove([ruta])
      throw error
    }
  },

  async eliminarFoto(id: string, ruta: string) {
    const { data, error } = await supabase.from('tci_fotos').delete().eq('id', id).select('id')
    if (error) throw error
    if (!data.length) throw new Error('Solo quien subió la foto o un coordinador puede eliminarla')
    await supabase.storage.from(BUCKET).remove([ruta])
  },
}
