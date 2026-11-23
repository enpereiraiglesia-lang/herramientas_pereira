import { supabase } from '../../../lib/supabase'
import { hoyISO } from '../../../lib/format'
import type { ContactoConRelaciones, ContactoInput, FiltrosContactos } from '../types'

const SELECT_CON_RELACIONES = `
  *,
  asignado:usuarios!contactos_asignado_a_fkey(id, nombre),
  registrador:usuarios!contactos_registrado_por_fkey(id, nombre)
`

export const contactosService = {
  async listar(filtros: FiltrosContactos): Promise<ContactoConRelaciones[]> {
    let query = supabase.from('contactos').select(SELECT_CON_RELACIONES).order('created_at', { ascending: false })

    const q = filtros.busqueda.trim()
    if (q) query = query.or(`nombre.ilike.%${q}%,telefono.ilike.%${q}%,direccion.ilike.%${q}%`)
    if (filtros.estado) query = query.eq('estado', filtros.estado)
    if (filtros.asignadoA === 'sin') query = query.is('asignado_a', null)
    else if (filtros.asignadoA) query = query.eq('asignado_a', filtros.asignadoA)

    const { data, error } = await query
    if (error) throw error
    return data as unknown as ContactoConRelaciones[]
  },

  async obtener(id: string): Promise<ContactoConRelaciones> {
    const { data, error } = await supabase.from('contactos').select(SELECT_CON_RELACIONES).eq('id', id).single()
    if (error) throw error
    return data as unknown as ContactoConRelaciones
  },

  /** Contactos asignados al usuario que necesitan llamada (nuevos o con próxima llamada vencida). */
  async pendientesDe(perfilId: string): Promise<ContactoConRelaciones[]> {
    const { data, error } = await supabase
      .from('contactos')
      .select(SELECT_CON_RELACIONES)
      .eq('asignado_a', perfilId)
      .not('estado', 'in', '(integrado,no_interesado)')
      .or(`ultima_llamada_at.is.null,proxima_llamada.lte.${hoyISO()}`)
      .order('proxima_llamada', { ascending: true, nullsFirst: true })
    if (error) throw error
    return data as unknown as ContactoConRelaciones[]
  },

  /** Conteos para el panel principal */
  async resumen(perfilId: string) {
    const base = () => supabase.from('contactos').select('id', { count: 'exact', head: true })
    const resultados = await Promise.all([
      base(),
      base().eq('estado', 'nuevo'),
      base().eq('asignado_a', perfilId),
      base().eq('estado', 'integrado'),
    ])
    const [total, nuevos, misAsignados, integrados] = resultados.map((r) => {
      if (r.error) throw r.error
      return r.count ?? 0
    })
    return { total, nuevos, misAsignados, integrados }
  },

  async crear(input: ContactoInput) {
    const { data, error } = await supabase.from('contactos').insert(input).select('id').single()
    if (error) throw error
    return data
  },

  async actualizar(id: string, input: Partial<ContactoInput>) {
    const { error } = await supabase.from('contactos').update(input).eq('id', id)
    if (error) throw error
  },

  async eliminar(id: string) {
    const { error } = await supabase.from('contactos').delete().eq('id', id)
    if (error) throw error
  },
}
