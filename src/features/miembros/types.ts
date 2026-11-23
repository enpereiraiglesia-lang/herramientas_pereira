import type { Tables, TablesInsert } from '../../types/database'

export type Miembro = Tables<'miembros'>
export type MiembroInput = Omit<TablesInsert<'miembros'>, 'id' | 'created_at' | 'creado_por'>

export type FiltroSiNo = '' | 'si' | 'no'

export type Servicio = Tables<'servicios'>

/** Servicio que realiza hoy el miembro */
export interface AsignacionActual {
  id: string
  fecha_inicio: string
  servicio: Servicio
}

/** Miembro con su servicio actual y las herramientas a las que está vinculado */
export interface MiembroDirectorio extends Miembro {
  servicioActual: AsignacionActual | null
  grupoFamiliar: { nombre: string } | null
  camara: { nombre: string } | null
}

/** Servicio elegido en el formulario (undefined = no se tocó) */
export interface ServicioElegido {
  servicioId: string | null
  fechaInicio: string | null
}

export type FiltroRotacion = '' | 'por_rotar' | 'vencida' | 'sin_servicio'

export const OPCIONES_ROTACION = [
  { value: 'por_rotar', label: 'Le toca rotar pronto o ya' },
  { value: 'vencida', label: 'Rotación vencida' },
  { value: 'sin_servicio', label: 'Sin servicio asignado' },
]

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
  rotacion: FiltroRotacion
}

export const OPCIONES_SI_NO = [
  { value: 'si', label: 'Sí' },
  { value: 'no', label: 'No' },
]
