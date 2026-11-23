import { supabase } from '../../../lib/supabase'
import { TIPOS_GRUPO, type GrupoConRelaciones, type GrupoInput, type PersonaMini, type TipoGrupo } from '../types'

function selectCon(tipo: TipoGrupo) {
  const fkMiembros = tipo === 'grupo_familiar' ? 'miembros_grupo_familiar_id_fkey' : 'miembros_camara_id_fkey'
  const integrantes = `, integrantes:miembros!${fkMiembros}(count)`
  return `
    *,
    responsable:usuarios!grupos_responsable_id_fkey(id, nombre),
    contactos:contactos!${TIPOS_GRUPO[tipo].fkContactos}(count)${integrantes}
  `
}

export const gruposService = {
  /** Miembros de la iglesia que se pueden elegir como líder (solo id y nombre) */
  async lideres(): Promise<PersonaMini[]> {
    const { data, error } = await supabase.rpc('miembros_para_lider')
    if (error) throw error
    return data ?? []
  },

  async listar(tipo: TipoGrupo): Promise<GrupoConRelaciones[]> {
    const [grupos, lideres] = await Promise.all([
      supabase
        .from('grupos')
        .select(selectCon(tipo))
        .eq('tipo', tipo)
        .order('activo', { ascending: false })
        .order('nombre'),
      gruposService.lideres(),
    ])
    if (grupos.error) throw grupos.error

    // El nombre del líder sale de la función (el directorio de miembros es privado)
    const porId = new Map(lideres.map((l) => [l.id, l]))
    return (grupos.data as unknown as Omit<GrupoConRelaciones, 'lider'>[]).map((g) => ({
      ...g,
      lider: g.lider_id ? (porId.get(g.lider_id) ?? null) : null,
    }))
  },

  /** Lista corta para los selectores de vinculación */
  async opciones(tipo: TipoGrupo) {
    const { data, error } = await supabase
      .from('grupos')
      .select('id, nombre')
      .eq('tipo', tipo)
      .eq('activo', true)
      .order('nombre')
    if (error) throw error
    return data
  },

  async crear(tipo: TipoGrupo, input: GrupoInput) {
    const { error } = await supabase.from('grupos').insert({ ...input, tipo })
    if (error) throw error
  },

  async actualizar(id: string, input: Partial<GrupoInput>) {
    const { data, error } = await supabase.from('grupos').update(input).eq('id', id).select('id')
    if (error) throw error
    if (!data.length) throw new Error('No tienes permiso para editar este grupo')
  },

  async eliminar(id: string) {
    const { data, error } = await supabase.from('grupos').delete().eq('id', id).select('id')
    if (error) throw error
    if (!data.length) throw new Error('Solo quien lo creó o un administrador puede eliminarlo')
  },
}
