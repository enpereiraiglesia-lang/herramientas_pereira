import { useEffect, useState, type ReactNode } from 'react'
import type { Session } from '@supabase/supabase-js'
import { authService } from '../services/authService'
import { AuthContext } from '../hooks/AuthContext'
import type { Perfil } from '../types'

export function AuthProvider({ children }: { children: ReactNode }) {
  const [session, setSession] = useState<Session | null>(null)
  const [sessionLoading, setSessionLoading] = useState(true)
  // Guardamos el id para el que se cargó el perfil; así sabemos si está pendiente
  const [perfilState, setPerfilState] = useState<{ userId: string; perfil: Perfil | null; esLiderTci: boolean } | null>(null)

  useEffect(() => {
    authService.getSession().then(({ data }) => {
      setSession(data.session)
      setSessionLoading(false)
    })
    const { data } = authService.onAuthChange((_event, newSession) => {
      setSession(newSession)
    })
    return () => data.subscription.unsubscribe()
  }, [])

  const userId = session?.user.id
  useEffect(() => {
    if (!userId) return
    Promise.all([authService.getPerfil(userId), authService.esLiderTci()])
      .then(([perfil, esLiderTci]) => setPerfilState({ userId, perfil, esLiderTci }))
      .catch(() => setPerfilState({ userId, perfil: null, esLiderTci: false }))
  }, [userId])

  const perfilCargado = !userId || perfilState?.userId === userId
  const perfil = userId && perfilState?.userId === userId ? perfilState.perfil : null

  const value = {
    session,
    user: session?.user ?? null,
    perfil,
    loading: sessionLoading || !perfilCargado,
    esAdmin: perfil?.rol === 'administrador',
    esLiderTci: Boolean(perfil && perfilState?.esLiderTci),
    signIn: authService.signIn,
    signUp: async (email: string, password: string, nombre: string) => {
      const data = await authService.signUp(email, password, nombre)
      return Boolean(data.session) // false = requiere confirmar correo
    },
    signOut: authService.signOut,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
