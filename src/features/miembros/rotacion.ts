import { desdeISO, fechaCorta, hoy, sumarMeses } from '../../components/ui/calendario/fechas'

/** Días antes de la fecha de rotación en que se empieza a avisar */
export const DIAS_AVISO_ROTACION = 30

export type EstadoRotacion = 'al_dia' | 'proxima' | 'vencida'

export interface InfoRotacion {
  estado: EstadoRotacion
  /** Fecha en que le corresponde rotar (AAAA-MM-DD) */
  fechaRotacion: string
  /** Días que faltan (negativo = vencida) */
  dias: number
  /** "Faltan 2 meses y 5 días", "Rota hoy", "Vencida hace 8 días" */
  texto: string
  /** "Rota el 23 feb 2027" */
  detalle: string
}

function diasEntre(desde: string, hasta: string) {
  return Math.round((desdeISO(hasta).getTime() - desdeISO(desde).getTime()) / 86_400_000)
}

/** Tiempo entre dos fechas en meses de calendario y días: "12 días", "3 meses", "2 meses y 5 días" */
export function duracion(desde: string, hasta: string) {
  const [a, b] = desde <= hasta ? [desde, hasta] : [hasta, desde]
  let meses = 0
  while (sumarMeses(a, meses + 1) <= b) meses++
  const dias = diasEntre(sumarMeses(a, meses), b)
  const textoDias = `${dias} día${dias === 1 ? '' : 's'}`
  if (!meses) return textoDias
  return `${meses} mes${meses === 1 ? '' : 'es'}${dias ? ` y ${textoDias}` : ''}`
}

/** Cuánto falta para rotar a alguien que empezó un servicio en `fechaInicio` */
export function infoRotacion(fechaInicio: string, mesesRotacion: number): InfoRotacion {
  const fechaRotacion = sumarMeses(fechaInicio, mesesRotacion)
  const h = hoy()
  const dias = diasEntre(h, fechaRotacion)
  const estado: EstadoRotacion = dias < 0 ? 'vencida' : dias <= DIAS_AVISO_ROTACION ? 'proxima' : 'al_dia'
  const tiempo = duracion(h, fechaRotacion)
  const texto = dias < 0 ? `Rotación vencida hace ${tiempo}` : dias === 0 ? 'Le toca rotar hoy' : `Faltan ${tiempo} para rotar`
  return { estado, fechaRotacion, dias, texto, detalle: `${dias < 0 ? 'Debía rotar' : 'Rota'} el ${fechaCorta(fechaRotacion)}` }
}

/** Tiempo que lleva en el servicio: "lleva 1 mes y 3 días" */
export function tiempoEnServicio(fechaInicio: string) {
  const h = hoy()
  return fechaInicio >= h ? 'empieza hoy' : `lleva ${duracion(fechaInicio, h)}`
}
