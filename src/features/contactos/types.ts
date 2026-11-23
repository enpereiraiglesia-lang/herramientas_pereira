import type { BadgeColor } from '../../components/ui/Badge'
import type { Enums, Tables, TablesInsert } from '../../types/database'

export type Contacto = Tables<'contactos'>
export type EstadoContacto = Enums<'estado_contacto'>
export type ContactoInput = Omit<TablesInsert<'contactos'>, 'id' | 'created_at' | 'ultima_llamada_at'>

export interface PerfilMini {
  id: string
  nombre: string
}

export interface ContactoConRelaciones extends Contacto {
  asignado: PerfilMini | null
  registrador: PerfilMini | null
}

export interface FiltrosContactos {
  busqueda: string
  estado: EstadoContacto | ''
  asignadoA: string // '' = todos, 'sin' = sin asignar, o id del perfil
}

export const ESTADOS: Record<EstadoContacto, { label: string; color: BadgeColor }> = {
  nuevo: { label: 'Nuevo', color: 'blue' },
  en_seguimiento: { label: 'En seguimiento', color: 'yellow' },
  sin_respuesta: { label: 'Sin respuesta', color: 'gray' },
  integrado: { label: 'Integrado', color: 'green' },
  no_interesado: { label: 'No interesado', color: 'red' },
}

export const OPCIONES_ESTADO = (Object.keys(ESTADOS) as EstadoContacto[]).map((value) => ({
  value,
  label: ESTADOS[value].label,
}))
