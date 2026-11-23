import type { BadgeColor } from '../../components/ui/Badge'
import type { Enums, Tables, TablesInsert } from '../../types/database'

export type Llamada = Tables<'llamadas'>
export type ResultadoLlamada = Enums<'resultado_llamada'>
export type LlamadaInput = Omit<TablesInsert<'llamadas'>, 'id' | 'created_at'>

export interface LlamadaConAutor extends Llamada {
  autor: { id: string; nombre: string } | null
}

export interface LlamadaConContacto extends LlamadaConAutor {
  contacto: { id: string; nombre: string } | null
}

export const RESULTADOS: Record<ResultadoLlamada, { label: string; color: BadgeColor }> = {
  contesto: { label: 'Contestó', color: 'green' },
  no_contesto: { label: 'No contestó', color: 'gray' },
  volver_a_llamar: { label: 'Volver a llamar', color: 'yellow' },
  numero_equivocado: { label: 'Número equivocado', color: 'red' },
  no_interesado: { label: 'No interesado', color: 'purple' },
}

export const OPCIONES_RESULTADO = (Object.keys(RESULTADOS) as ResultadoLlamada[]).map((value) => ({
  value,
  label: RESULTADOS[value].label,
}))
