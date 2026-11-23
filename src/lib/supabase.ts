import { createClient } from '@supabase/supabase-js'
import type { Database } from '../types/database'

const url = (import.meta.env.VITE_SUPABASE_URL ?? '').trim()
const anonKey = (import.meta.env.VITE_SUPABASE_ANON_KEY ?? '').trim()

/** Variables de entorno que faltan al compilar (se muestran en pantalla en vez de fallar en blanco) */
export const variablesFaltantes = [
  !url && 'VITE_SUPABASE_URL',
  !anonKey && 'VITE_SUPABASE_ANON_KEY',
].filter(Boolean) as string[]

// Con valores de relleno el cliente se crea sin lanzar error; main.tsx muestra el aviso de configuración
export const supabase = createClient<Database>(
  url || 'https://configuracion-faltante.supabase.co',
  anonKey || 'configuracion-faltante'
)
