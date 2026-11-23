/** Utilidades de fecha para los calendarios. Trabajan con cadenas ISO locales
 *  ("AAAA-MM-DD" para días y "AAAA-MM" para meses) para evitar problemas de zona horaria. */

export const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
]
export const MESES_CORTOS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']
export const DIAS_SEMANA = ['lu', 'ma', 'mi', 'ju', 'vi', 'sá', 'do']

const dos = (n: number) => String(n).padStart(2, '0')

export function aISO(d: Date) {
  return `${d.getFullYear()}-${dos(d.getMonth() + 1)}-${dos(d.getDate())}`
}

export function desdeISO(iso: string) {
  const [a, m, d] = iso.slice(0, 10).split('-').map(Number)
  return new Date(a, (m || 1) - 1, d || 1)
}

export const hoy = () => aISO(new Date())
export const mesActual = () => hoy().slice(0, 7)

export function sumarDias(iso: string, dias: number) {
  const d = desdeISO(iso)
  d.setDate(d.getDate() + dias)
  return aISO(d)
}

/** Suma meses conservando el día cuando existe (31 ene + 1 mes = 28/29 feb) */
export function sumarMeses(iso: string, meses: number) {
  const d = desdeISO(iso)
  const dia = d.getDate()
  d.setDate(1)
  d.setMonth(d.getMonth() + meses)
  const ultimo = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate()
  d.setDate(Math.min(dia, ultimo))
  return aISO(d)
}

/** "AAAA-MM" + n meses */
export function sumarMesesAMes(mes: string, n: number) {
  return sumarMeses(`${mes}-01`, n).slice(0, 7)
}

/** 42 días (6 semanas, empezando en lunes) que cubren el mes indicado */
export function diasDeLaGrilla(mes: string) {
  const primero = desdeISO(`${mes}-01`)
  const desfase = (primero.getDay() + 6) % 7 // lunes = 0
  const inicio = sumarDias(`${mes}-01`, -desfase)
  return Array.from({ length: 42 }, (_, i) => sumarDias(inicio, i))
}

export function nombreMes(mes: string, { corto = false } = {}) {
  const [a, m] = mes.split('-').map(Number)
  return `${(corto ? MESES_CORTOS : MESES)[m - 1]} ${a}`
}

/** "lunes, 23 de noviembre de 2026" */
export function fechaLarga(iso: string) {
  return desdeISO(iso).toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
}

/** "23 nov 2026" */
export function fechaCorta(iso: string) {
  const d = desdeISO(iso)
  return `${d.getDate()} ${MESES_CORTOS[d.getMonth()]} ${d.getFullYear()}`
}

export function fueraDeRango(valor: string, min?: string, max?: string) {
  return (!!min && valor < min) || (!!max && valor > max)
}
