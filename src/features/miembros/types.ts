import type { Tables, TablesInsert } from '../../types/database'

export type Miembro = Tables<'miembros'>
export type MiembroInput = Omit<TablesInsert<'miembros'>, 'id' | 'created_at' | 'creado_por'>

export type FiltroSiNo = '' | 'si' | 'no'

export type RangoEdad = NonNullable<Miembro['rango_edad']>

export const RANGOS_EDAD: Record<RangoEdad, string> = {
  tropa: 'Tropa',
  capitan: 'Capitán',
  valiente_de_david: 'Valiente de David',
  intendente: 'Intendente',
  colportor: 'Colportor',
}

export const OPCIONES_RANGO_EDAD = (Object.keys(RANGOS_EDAD) as RangoEdad[]).map((value) => ({
  value,
  label: RANGOS_EDAD[value],
}))

export interface FiltrosMiembros {
  busqueda: string
  inversionista: FiltroSiNo
  ceppev: FiltroSiNo
  rangoEdad: RangoEdad | ''
}

export const OPCIONES_SI_NO = [
  { value: 'si', label: 'Sí' },
  { value: 'no', label: 'No' },
]
