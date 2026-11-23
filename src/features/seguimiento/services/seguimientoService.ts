import { supabase } from '../../../lib/supabase'
import type { Comentario, TarjetaContacto } from '../types'

const SELECT_TARJETA = `
  id, nombre, telefono, estado, fase, fase_actualizada_at, grupo_familiar_id, camara_id,
  asignado:usuarios!contactos_asignado_a_fkey(id, nombre),
  grupo_familiar:grupos!contactos_grupo_familiar_id_fkey(id, nombre),
  camara:grupos!contactos_camara_id_fkey(id, nombre),
  comentarios:seguimiento_comentarios(tipo)
`

export const seguimientoService = {
  async fases() {
    const { data, error } = await supabase.from('fases_seguimiento').select('*').order('orden')
    if (error) throw error
    return data
  },

  async tablero(): Promise<TarjetaContacto[]> {
    const { data, error } = await supabase
      .from('contactos')
      .select(SELECT_TARJETA)
      .order('fase_actualizada_at', { ascending: false })
    if (error) throw error
    return data as unknown as TarjetaContacto[]
  },

  async moverFase(contactoId: string, fase: string) {
    const { data, error } = await supabase.from('contactos').update({ fase }).eq('id', contactoId).select('id')
    if (error) throw error
    if (!data.length) throw new Error('No tienes permiso para mover este contacto')
  },

  async vincular(contactoId: string, vinculos: { grupo_familiar_id?: string | null; camara_id?: string | null }) {
    const { data, error } = await supabase.from('contactos').update(vinculos).eq('id', contactoId).select('id')
    if (error) throw error
    if (!data.length) throw new Error('No tienes permiso para editar este contacto')
  },

  async comentarios(contactoId: string): Promise<Comentario[]> {
    const { data, error } = await supabase
      .from('seguimiento_comentarios')
      .select('*, autor:usuarios!seguimiento_comentarios_autor_id_fkey(id, nombre)')
      .eq('contacto_id', contactoId)
      .order('created_at', { ascending: false })
    if (error) throw error
    return data as unknown as Comentario[]
  },

  async comentar(contactoId: string, fase: string, texto: string, autorId: string | undefined) {
    const { error } = await supabase
      .from('seguimiento_comentarios')
      .insert({ contacto_id: contactoId, fase, texto, autor_id: autorId })
    if (error) throw error
  },

  async eliminarComentario(id: string) {
    const { error } = await supabase.from('seguimiento_comentarios').delete().eq('id', id)
    if (error) throw error
  },
}
