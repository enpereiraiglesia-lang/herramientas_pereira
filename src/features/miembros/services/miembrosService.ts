import { supabase } from '../../../lib/supabase'
import type { FiltrosMiembros, MiembroInput } from '../types'

export const miembrosService = {
  async listar(filtros: FiltrosMiembros) {
    // Los inversionistas que no son miembros no aparecen en el directorio
    let query = supabase.from('miembros').select('*').eq('es_miembro', true).order('nombre')

    const q = filtros.busqueda.trim()
    if (q) query = query.or(`nombre.ilike.%${q}%,celular.ilike.%${q}%,correo.ilike.%${q}%,direccion.ilike.%${q}%`)
    if (filtros.inversionista) query = query.eq('inversionista_reino', filtros.inversionista === 'si')
    if (filtros.ceppev) query = query.eq('fue_ceppev', filtros.ceppev === 'si')

    const { data, error } = await query
    if (error) throw error
    return data
  },

  async crear(input: MiembroInput) {
    const { error } = await supabase.from('miembros').insert(input)
    if (error) throw error
  },

  async actualizar(id: string, input: Partial<MiembroInput>) {
    const { data, error } = await supabase.from('miembros').update(input).eq('id', id).select('id')
    if (error) throw error
    if (!data.length) throw new Error('No tienes permiso para editar este miembro')
  },

  async eliminar(id: string) {
    const { data, error } = await supabase.from('miembros').delete().eq('id', id).select('id')
    if (error) throw error
    if (!data.length) throw new Error('Solo quien lo registró o un administrador puede eliminarlo')
  },
}
