export function formatFecha(value: string | null | undefined) {
  if (!value) return '—'
  const date = value.length === 10 ? new Date(`${value}T00:00:00`) : new Date(value)
  return date.toLocaleDateString('es', { day: '2-digit', month: 'short', year: 'numeric' })
}

export function formatFechaHora(value: string | null | undefined) {
  if (!value) return '—'
  return new Date(value).toLocaleString('es', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })
}

/** "hace 1 año y 3 meses", "hace 5 meses", "este mes" (para fechas pasadas) */
export function tiempoDesde(value: string | null | undefined) {
  if (!value) return null
  const fecha = new Date(`${value.slice(0, 10)}T00:00:00`)
  const hoy = new Date()
  const meses = (hoy.getFullYear() - fecha.getFullYear()) * 12 + (hoy.getMonth() - fecha.getMonth())
  if (meses <= 0) return 'este mes'
  const anios = Math.floor(meses / 12)
  const resto = meses % 12
  const partes = [
    anios > 0 && `${anios} año${anios === 1 ? '' : 's'}`,
    resto > 0 && `${resto} mes${resto === 1 ? '' : 'es'}`,
  ].filter(Boolean)
  return `hace ${partes.join(' y ')}`
}

/** "marzo de 2024" a partir de una fecha ISO */
export function formatMesAnio(value: string | null | undefined) {
  if (!value) return '—'
  return new Date(`${value.slice(0, 10)}T00:00:00`).toLocaleDateString('es', { month: 'long', year: 'numeric' })
}

export function hoyISO() {
  const d = new Date()
  d.setMinutes(d.getMinutes() - d.getTimezoneOffset())
  return d.toISOString().slice(0, 10)
}

/** Limpia el teléfono para usar en links tel: y WhatsApp */
export function telefonoLimpio(tel: string) {
  return tel.replace(/[^\d+]/g, '')
}

/** Indicativo que se agrega a los celulares locales (10 dígitos) para WhatsApp */
export const INDICATIVO_PAIS = '57'

/** Link de WhatsApp con mensaje opcional. Los números locales reciben el indicativo del país. */
export function linkWhatsApp(tel: string, mensaje?: string) {
  const limpio = telefonoLimpio(tel)
  let numero = limpio.replace(/^\+/, '')
  if (!limpio.startsWith('+') && numero.length === 10) numero = `${INDICATIVO_PAIS}${numero}`
  return `https://wa.me/${numero}${mensaje ? `?text=${encodeURIComponent(mensaje)}` : ''}`
}

/** Moneda usada para mostrar los montos */
const MONEDA = new Intl.NumberFormat('es-CO', { style: 'currency', currency: 'COP', maximumFractionDigits: 0 })

export function formatMoneda(valor: number | null | undefined) {
  return valor == null ? '—' : MONEDA.format(valor)
}
