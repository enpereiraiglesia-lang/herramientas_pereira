import type { Tables, TablesInsert } from '../../types/database'

export type Cuota = Tables<'cuotas_inversionistas'>
export type CuotaInput = Omit<TablesInsert<'cuotas_inversionistas'>, 'id' | 'created_at' | 'registrado_por' | 'miembro_id'>

export type Participacion = Tables<'participaciones_inversion'>
export type ParticipacionInput = Pick<Participacion, 'monto' | 'fecha_aporte' | 'nota'>

export type Inversionista = Pick<Tables<'miembros'>, 'id' | 'nombre' | 'celular' | 'correo' | 'direccion' | 'es_miembro'>

export type FiltroEstado = 'todos' | 'pendientes' | 'al_dia'

// ---------- Categoría de cada participación ----------

/** Monto mínimo para ser "Inversionista"; por debajo es "Microinversionista" */
export const CUOTA_INVERSIONISTA = 400_000

export type Categoria = 'inversionista' | 'microinversionista' | 'sin_cuota'

export const CATEGORIAS: Record<Categoria, { label: string; color: 'green' | 'blue' | 'gray' }> = {
  inversionista: { label: 'Inversionista', color: 'green' },
  microinversionista: { label: 'Microinversionista', color: 'blue' },
  sin_cuota: { label: 'Sin participación', color: 'gray' },
}

export function categoriaDe(monto: number | null): Categoria {
  if (monto == null) return 'sin_cuota'
  return monto < CUOTA_INVERSIONISTA ? 'microinversionista' : 'inversionista'
}

// ---------- Estado calculado para la grilla ----------

/** Participación con su cuota del mes elegido y su historial del año */
export interface ParticipacionConEstado extends Participacion {
  categoria: Categoria
  /** Número para identificarla: 1, 2, 3... (en orden de creación) */
  numero: number
  cuotaDelMes: Cuota | null
  /** Cuotas del año, indexadas por mes AAAA-MM */
  cuotasDelAnio: Record<string, Cuota>
}

/** Estado de un mes para una persona (todas sus participaciones activas) */
export type EstadoMes = 'al_dia' | 'parcial' | 'pendiente' | 'sin_participacion'

export interface InversionistaConEstado extends Inversionista {
  /** Participaciones activas */
  participaciones: ParticipacionConEstado[]
  /** Categorías de sus participaciones (puede tener ambas) */
  categorias: Categoria[]
  estadoMes: EstadoMes
  /** Suma de las participaciones activas */
  totalMensual: number
  pagadoMes: number
  pendienteMes: number
}

/** Estado de un mes del año para una persona */
export function estadoDelMes(participaciones: ParticipacionConEstado[], mes: string): EstadoMes {
  if (!participaciones.length) return 'sin_participacion'
  const pagadas = participaciones.filter((p) => p.cuotasDelAnio[mes]).length
  return pagadas === participaciones.length ? 'al_dia' : pagadas > 0 ? 'parcial' : 'pendiente'
}

/** Nombre corto de una participación: "Participación 1 · Inversionista" */
export function nombreParticipacion(p: Pick<ParticipacionConEstado, 'numero' | 'categoria'>) {
  return `Participación ${p.numero} · ${CATEGORIAS[p.categoria].label}`
}

/** Mensaje de recordatorio por defecto. {nombre}, {mes} y {monto} se reemplazan al enviar. */
export const MENSAJE_RECORDATORIO =
  'Hola {nombre}, ¡bendiciones! 🙏 Te escribimos para recordarte con cariño que tu aporte de Inversionista del Reino correspondiente a {mes} por {monto} está pendiente. Gracias por sembrar en la obra del Señor. Cualquier inquietud, quedamos atentos.'
