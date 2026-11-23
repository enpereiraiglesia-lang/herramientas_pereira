import { Gem, Sprout } from 'lucide-react'

/** Ícono de cada categoría: 💎 Inversionista, 🌱 Microinversionista */
export const ICONO_CATEGORIA = { inversionista: Gem, microinversionista: Sprout, sin_cuota: Sprout } as const

/** Fondo y color del ícono de cada categoría */
export const COLOR_ICONO = {
  inversionista: 'bg-emerald-50 text-emerald-600',
  microinversionista: 'bg-primary-50 text-primary-600',
  sin_cuota: 'bg-slate-100 text-slate-500',
} as const
