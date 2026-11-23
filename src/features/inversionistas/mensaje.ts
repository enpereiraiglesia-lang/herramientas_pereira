import { MENSAJE_RECORDATORIO } from './types'

const CLAVE = 'familymission.mensaje_recordatorio'

/** Lee la plantilla guardada en este navegador (o la de por defecto) */
export function leerPlantilla() {
  try {
    return localStorage.getItem(CLAVE) || MENSAJE_RECORDATORIO
  } catch {
    return MENSAJE_RECORDATORIO
  }
}

export function guardarPlantilla(texto: string) {
  try {
    if (texto === MENSAJE_RECORDATORIO) localStorage.removeItem(CLAVE)
    else localStorage.setItem(CLAVE, texto)
  } catch {
    /* sin almacenamiento disponible: se usa solo en esta sesión */
  }
}

/** Reemplaza {nombre} (primer nombre), {mes} y {monto} (lo pendiente) en la plantilla */
export function armarMensaje(plantilla: string, nombre: string, mes: string, monto?: string) {
  const primerNombre = nombre.trim().split(/\s+/)[0] ?? nombre
  return plantilla
    .replaceAll('{nombre}', primerNombre)
    .replaceAll('{mes}', mes)
    .replaceAll(' por {monto}', monto ? ` por ${monto}` : '')
    .replaceAll('{monto}', monto ?? '')
}
