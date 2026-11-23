import { supabase } from '../../../lib/supabase'
import { TIPOS_GRUPO, type ContactoDeGrupo, type MiembroDeGrupo, type OpcionMembresia, type TipoGrupo } from '../types'

export interface NuevoContactoGrupo {
  nombre: string
  telefono: string | null
  direccion: string | null
  observaciones: string | null
}

/** Columna que vincula a miembros y contactos con cada tipo de grupo */
const COLUMNA = {
  grupo_familiar: 'grupo_familiar_id',
  camara: 'camara_id',
} as const satisfies Record<TipoGrupo, string>

/** Membresía de un grupo familiar o una cámara: miembros de la iglesia y contactos */
export const membresiaService = {
  async miembros(tipo: TipoGrupo, grupoId: string): Promise<MiembroDeGrupo[]> {
    const { data, error } = await supabase
      .from('miembros')
      .select('id, nombre, celular, correo')
      .eq(COLUMNA[tipo], grupoId)
      .order('nombre')
    if (error) throw error
    return data
  },

  async contactos(tipo: TipoGrupo, grupoId: string): Promise<ContactoDeGrupo[]> {
    const { data, error } = await supabase
      .from('contactos')
      .select('id, nombre, telefono, estado, fase')
      .eq(COLUMNA[tipo], grupoId)
      .order('nombre')
    if (error) throw error
    return data
  },

  async opcionesMiembros(tipo: TipoGrupo): Promise<OpcionMembresia[]> {
    const { data, error } = await supabase.rpc('miembros_para_grupo', { p_tipo: tipo })
    if (error) throw error
    return (data ?? []).map((m) => ({
      id: m.id,
      nombre: m.nombre,
      detalle: null,
      grupoId: m.grupo_id,
      grupoNombre: m.grupo_nombre,
    }))
  },

  async opcionesContactos(tipo: TipoGrupo): Promise<OpcionMembresia[]> {
    const { data, error } = await supabase
      .from('contactos')
      .select(`id, nombre, telefono, grupo_id:${COLUMNA[tipo]}, grupo:grupos!${TIPOS_GRUPO[tipo].fkContactos}(nombre)`)
      .order('nombre')
      .limit(1000)
    if (error) throw error
    return (
      data as unknown as {
        id: string
        nombre: string
        telefono: string | null
        grupo_id: string | null
        grupo: { nombre: string } | null
      }[]
    ).map((c) => ({
      id: c.id,
      nombre: c.nombre,
      detalle: c.telefono,
      grupoId: c.grupo_id,
      grupoNombre: c.grupo?.nombre ?? null,
    }))
  },

  async agregarMiembros(grupoId: string, ids: string[]) {
    const { error } = await supabase.rpc('asignar_miembros_grupo', { p_grupo: grupoId, p_miembros: ids })
    if (error) throw error
  },

  async quitarMiembro(grupoId: string, id: string) {
    const { error } = await supabase.rpc('quitar_miembro_grupo', { p_grupo: grupoId, p_miembro: id })
    if (error) throw error
  },

  async vincularContactos(grupoId: string, ids: string[]) {
    for (const id of ids) {
      const { error } = await supabase.rpc('vincular_contacto_grupo', { p_contacto: id, p_grupo: grupoId })
      if (error) throw error
    }
  },

  async quitarContacto(grupoId: string, id: string) {
    const { error } = await supabase.rpc('desvincular_contacto_grupo', { p_contacto: id, p_grupo: grupoId })
    if (error) throw error
  },

  /** Registra un contacto nuevo que ya queda en el grupo, en la fase de ese tipo de grupo */
  async crearContacto(tipo: TipoGrupo, grupoId: string, grupoNombre: string, input: NuevoContactoGrupo) {
    const { error } = await supabase.from('contactos').insert({
      ...input,
      [COLUMNA[tipo]]: grupoId,
      fase: tipo, // las fases "grupo_familiar" y "camara" usan la misma clave que el tipo
      estado: 'en_seguimiento',
      lugar_contacto: `${TIPOS_GRUPO[tipo].singular} ${grupoNombre}`,
    })
    if (error) throw error
  },
}
