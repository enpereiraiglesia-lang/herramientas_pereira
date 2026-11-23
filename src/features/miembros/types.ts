import type { Tables, TablesInsert } from '../../types/database'

export type Miembro = Tables<'miembros'>
export type MiembroInput = Omit<TablesInsert<'miembros'>, 'id' | 'created_at' | 'creado_por'>

export type FiltroSiNo = '' | 'si' | 'no'

export interface FiltrosMiembros {
  busqueda: string
  inversionista: FiltroSiNo
  ceppev: FiltroSiNo
}

export const OPCIONES_SI_NO = [
  { value: 'si', label: 'Sí' },
  { value: 'no', label: 'No' },
]
