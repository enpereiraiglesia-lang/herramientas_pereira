import type { AuthChangeEvent, Session } from '@supabase/supabase-js'
import { supabase } from '../../../lib/supabase'

export const authService = {
  getSession: () => supabase.auth.getSession(),

  onAuthChange: (callback: (event: AuthChangeEvent, session: Session | null) => void) =>
    supabase.auth.onAuthStateChange(callback),

  async signIn(email: string, password: string) {
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) throw error
  },

  async signUp(email: string, password: string, nombre: string) {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      // Al confirmar el correo, Supabase regresa a la página de inicio de la app
      options: { data: { nombre }, emailRedirectTo: `${window.location.origin}/` },
    })
    if (error) throw error
    return data
  },

  async signOut() {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
  },

  /** ¿Es líder de algún grupo TCI? (da acceso al módulo aunque no lo tenga asignado) */
  async esLiderTci() {
    const { data, error } = await supabase.rpc('es_lider_tci')
    if (error) return false // la migración aún no se ha aplicado
    return Boolean(data)
  },

  async getPerfil(userId: string) {
    const { data, error } = await supabase.from('usuarios').select('*').eq('id', userId).maybeSingle()
    if (error) throw error
    return data
  },
}
