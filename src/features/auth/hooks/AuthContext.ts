import { createContext } from 'react'
import type { AuthState } from '../types'

export interface AuthContextValue extends AuthState {
  esAdmin: boolean
  /** Líder de algún grupo TCI: puede entrar al módulo TCI aunque no lo tenga asignado */
  esLiderTci: boolean
  signIn: (email: string, password: string) => Promise<void>
  signUp: (email: string, password: string, nombre: string) => Promise<boolean>
  signOut: () => Promise<void>
}

export const AuthContext = createContext<AuthContextValue | null>(null)
