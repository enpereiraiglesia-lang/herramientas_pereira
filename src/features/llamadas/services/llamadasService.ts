import { supabase } from '../../../lib/supabase'
import type { LlamadaConAutor, LlamadaConContacto, LlamadaInput } from '../types'

const AUTOR = 'autor:usuarios!llamadas_llamado_por_fkey(id, nombre)'

export const llamadasService = {
  async listarPorContacto(contactoId: string): Promise<LlamadaConAutor[]> {
    const { data, error } = await supabase
      .from('llamadas')
      .select(`*, ${AUTOR}`)
      .eq('contacto_id', contactoId)
      .order('fecha_llamada', { ascending: false })
    if (error) throw error
    return data as unknown as LlamadaConAutor[]
  },

  async recientes(limite = 10): Promise<LlamadaConContacto[]> {
    const { data, error } = await supabase
      .from('llamadas')
      .select(`*, ${AUTOR}, contacto:contactos(id, nombre)`)
      .order('fecha_llamada', { ascending: false })
      .limit(limite)
    if (error) throw error
    return data as unknown as LlamadaConContacto[]
  },

  async crear(input: LlamadaInput) {
    const { error } = await supabase.from('llamadas').insert(input)
    if (error) throw error
  },

  async eliminar(id: string) {
    const { error } = await supabase.from('llamadas').delete().eq('id', id)
    if (error) throw error
  },
}
