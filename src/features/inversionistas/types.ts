import type { Tables, TablesInsert } from '../../types/database'

export type Cuota = Tables<'cuotas_inversionistas'>
export type CuotaInput = Omit<TablesInsert<'cuotas_inversionistas'>, 'id' | 'created_at' | 'registrado_por'>

export type Inversionista = Pick<Tables<'miembros'>, 'id' | 'nombre' | 'celular' | 'correo' | 'cuota_mensual'>

export type FiltroEstado = 'todos' | 'pendientes' | 'al_dia'

/** Inversionista con su cuota del mes elegido y su historial del año */
export interface InversionistaConEstado extends Inversionista {
  cuotaDelMes: Cuota | null
  /** Cuotas del año, indexadas por mes AAAA-MM */
  cuotasDelAnio: Record<string, Cuota>
  ultimoMonto: number | null
}

// ---------- Categoría según la cuota pactada ----------

/** Cuota mínima para ser "Inversionista"; por debajo es "Microinversionista" */
export const CUOTA_INVERSIONISTA = 400_000

export type Categoria = 'inversionista' | 'microinversionista' | 'sin_cuota'

export const CATEGORIAS: Record<Categoria, { label: string; color: 'green' | 'blue' | 'gray' }> = {
  inversionista: { label: 'Inversionista', color: 'green' },
  microinversionista: { label: 'Microinversionista', color: 'blue' },
  sin_cuota: { label: 'Sin cuota definida', color: 'gray' },
}

export function categoriaDe(cuotaMensual: number | null): Categoria {
  if (cuotaMensual == null) return 'sin_cuota'
  return cuotaMensual < CUOTA_INVERSIONISTA ? 'microinversionista' : 'inversionista'
}

/** Mensaje de recordatorio por defecto. {nombre} y {mes} se reemplazan al enviar. */
export const MENSAJE_RECORDATORIO =
  'Hola {nombre}, ¡bendiciones! 🙏 Te escribimos para recordarte con cariño que tu cuota de Inversionista del Reino correspondiente a {mes} está pendiente. Gracias por sembrar en la obra del Señor. Cualquier inquietud, quedamos atentos.'
