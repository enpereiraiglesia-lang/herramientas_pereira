import type { Enums, Tables } from '../../types/database'

export type Fase = Tables<'fases_seguimiento'>
export type ComentarioRow = Tables<'seguimiento_comentarios'>

interface Mini {
  id: string
  nombre: string
}

export interface TarjetaContacto {
  id: string
  nombre: string
  telefono: string | null
  estado: Enums<'estado_contacto'>
  fase: string
  fase_actualizada_at: string
  grupo_familiar_id: string | null
  camara_id: string | null
  asignado: Mini | null
  grupo_familiar: Mini | null
  camara: Mini | null
  comentarios: { tipo: ComentarioRow['tipo'] }[]
}

export interface Comentario extends ComentarioRow {
  autor: Mini | null
}

export interface FiltrosTablero {
  busqueda: string
  asignadoA: string // '' = todos, 'sin' = sin asignar, o id
}

/** Clases de color por fase (deben ser literales para Tailwind) */
export const COLORES_FASE: Record<string, { punto: string; borde: string; suave: string }> = {
  slate: { punto: 'bg-slate-400', borde: 'border-t-slate-400', suave: 'bg-slate-50 text-slate-700' },
  sky: { punto: 'bg-sky-500', borde: 'border-t-sky-500', suave: 'bg-sky-50 text-sky-700' },
  blue: { punto: 'bg-primary-500', borde: 'border-t-primary-500', suave: 'bg-primary-50 text-primary-700' },
  amber: { punto: 'bg-amber-500', borde: 'border-t-amber-500', suave: 'bg-amber-50 text-amber-800' },
  violet: { punto: 'bg-violet-500', borde: 'border-t-violet-500', suave: 'bg-violet-50 text-violet-700' },
  emerald: { punto: 'bg-emerald-500', borde: 'border-t-emerald-500', suave: 'bg-emerald-50 text-emerald-700' },
}

export const colorFase = (color: string | undefined) => COLORES_FASE[color ?? ''] ?? COLORES_FASE.blue

/** Días que lleva el contacto en su fase actual */
export function diasEnFase(desde: string) {
  return Math.max(0, Math.floor((Date.now() - new Date(desde).getTime()) / 86_400_000))
}
