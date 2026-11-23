import { DoorOpen, Handshake, Sprout, UserRoundPlus, type LucideIcon } from 'lucide-react'
import type { Tables, TablesInsert } from '../../types/database'

export type Salida = Tables<'salidas_tci'>
export type SalidaInput = Omit<TablesInsert<'salidas_tci'>, 'id' | 'created_at' | 'creado_por'>
export type GrupoTci = Tables<'tci_grupos'>
export type GrupoTciInput = Omit<TablesInsert<'tci_grupos'>, 'id' | 'created_at'>
export type Integrante = Tables<'tci_integrantes'>
export type FotoTci = Tables<'tci_fotos'>

export interface PersonaMini {
  id: string
  nombre: string
}

/** Miembro elegible como líder o integrante */
export interface MiembroTci extends PersonaMini {
  /** Su correo coincide con un usuario de la app (puede entrar a diligenciar) */
  tiene_usuario: boolean
}

export interface IntegranteConMiembro extends Integrante {
  miembro: PersonaMini | null
}

export interface FotoConUrl extends FotoTci {
  url: string | null
}

export interface GrupoCompleto extends GrupoTci {
  lider: PersonaMini | null
  integrantes: IntegranteConMiembro[]
  fotos: Pick<FotoTci, 'id' | 'ruta'>[]
}

export interface SalidaResumen extends Salida {
  grupos: (GrupoTci & { integrantes: { count: number }[] })[]
}

export interface SalidaCompleta extends Salida {
  grupos: GrupoCompleto[]
}

export interface GrupoDetalle extends GrupoTci {
  salida: Salida
  lider: PersonaMini | null
  integrantes: IntegranteConMiembro[]
}

// ---------- Métricas ----------

export type ClaveMetrica = 'kits' | 'casas' | 'referidos' | 'contactos'

export interface Metrica {
  clave: ClaveMetrica
  label: string
  corto: string
  emoji: string
  icono: LucideIcon
  /** Clases de color: fondo suave, texto y barra */
  color: { suave: string; texto: string; barra: string }
}

export const METRICAS: Metrica[] = [
  {
    clave: 'kits',
    label: 'Kits sembrados',
    corto: 'Kits',
    emoji: '🌱',
    icono: Sprout,
    color: { suave: 'bg-emerald-50', texto: 'text-emerald-700', barra: 'bg-emerald-500' },
  },
  {
    clave: 'casas',
    label: 'Casas abiertas',
    corto: 'Casas',
    emoji: '🏠',
    icono: DoorOpen,
    color: { suave: 'bg-amber-50', texto: 'text-amber-700', barra: 'bg-amber-500' },
  },
  {
    clave: 'referidos',
    label: 'Referidos',
    corto: 'Referidos',
    emoji: '🤝',
    icono: Handshake,
    color: { suave: 'bg-violet-50', texto: 'text-violet-700', barra: 'bg-violet-500' },
  },
  {
    clave: 'contactos',
    label: 'Contactos',
    corto: 'Contactos',
    emoji: '📇',
    icono: UserRoundPlus,
    color: { suave: 'bg-primary-50', texto: 'text-primary-700', barra: 'bg-primary-600' },
  },
]

export type Metas = Record<`meta_${ClaveMetrica}`, number>
export type Logros = Record<`logro_${ClaveMetrica}`, number>
export type Totales = Record<ClaveMetrica, { meta: number; logro: number }>

/** Metas y logros del equipo (columnas de tci_grupos) */
export type Metricas = Metas & Logros
type ConMetricas = Metricas

/** Suma las metas y logros de uno o varios equipos */
export function totales(equipos: ConMetricas[]): Totales {
  const t = {} as Totales
  for (const m of METRICAS) {
    t[m.clave] = {
      meta: equipos.reduce((s, i) => s + i[`meta_${m.clave}`], 0),
      logro: equipos.reduce((s, i) => s + i[`logro_${m.clave}`], 0),
    }
  }
  return t
}

export function porcentaje(logro: number, meta: number) {
  if (!meta) return logro > 0 ? 100 : 0
  return Math.round((logro / meta) * 100)
}

/** Avance general: promedio del cumplimiento de las métricas que tienen meta */
export function avanceGeneral(t: Totales) {
  const conMeta = METRICAS.filter((m) => t[m.clave].meta > 0)
  if (!conMeta.length) return null
  return Math.round(conMeta.reduce((s, m) => s + Math.min(porcentaje(t[m.clave].logro, t[m.clave].meta), 100), 0) / conMeta.length)
}

export const METAS_VACIAS: Metas = { meta_kits: 0, meta_casas: 0, meta_referidos: 0, meta_contactos: 0 }
