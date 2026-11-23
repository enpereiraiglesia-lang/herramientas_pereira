import type { Session, User } from '@supabase/supabase-js'
import type { Tables } from '../../types/database'

export type Perfil = Tables<'usuarios'>

export interface AuthState {
  session: Session | null
  user: User | null
  perfil: Perfil | null
  loading: boolean
}
