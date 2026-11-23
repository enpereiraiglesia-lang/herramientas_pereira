import { FunctionsHttpError } from '@supabase/supabase-js'
import { supabase } from '../../../lib/supabase'
import type { DatosUsuario, NuevoUsuarioInput, RolUsuario } from '../types'

export const usuariosService = {
  async listar() {
    const { data, error } = await supabase.from('usuarios').select('*').order('nombre')
    if (error) throw error
    return data
  },

  /** Crea la cuenta mediante la Edge Function (solo administradores) */
  async crear(input: NuevoUsuarioInput) {
    const { data, error } = await supabase.functions.invoke<{ id: string }>('crear-usuario', { body: input })
    if (error) {
      if (error instanceof FunctionsHttpError) {
        const cuerpo = await error.context.json().catch(() => null)
        throw new Error(cuerpo?.error ?? 'No se pudo crear el usuario')
      }
      throw new Error('No se pudo conectar con la función "crear-usuario". ¿Está desplegada?')
    }
    return data
  },

  /** Solo un administrador puede cambiar el rol (lo valida RLS en Supabase) */
  async cambiarRol(id: string, rol: RolUsuario) {
    const { data, error } = await supabase.from('usuarios').update({ rol }).eq('id', id).select('id')
    if (error) throw error
    if (!data.length) throw new Error('No tienes permiso para cambiar este rol')
  },

  /** Módulos visibles para un colaborador (solo administradores, lo valida RLS) */
  async actualizarModulos(id: string, modulos: string[]) {
    const { data, error } = await supabase.from('usuarios').update({ modulos }).eq('id', id).select('id')
    if (error) throw error
    if (!data.length) throw new Error('No tienes permiso para cambiar los módulos')
  },

  async actualizar(id: string, datos: DatosUsuario) {
    const { data, error } = await supabase.from('usuarios').update(datos).eq('id', id).select('id')
    if (error) throw error
    if (!data.length) throw new Error('No tienes permiso para editar este usuario')
  },
}
