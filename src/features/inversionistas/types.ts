import type { Tables, TablesInsert } from '../../types/database'

export type Cuota = Tables<'cuotas_inversionistas'>
export type CuotaInput = Omit<TablesInsert<'cuotas_inversionistas'>, 'id' | 'created_at' | 'registrado_por'>

export type Inversionista = Pick<Tables<'miembros'>, 'id' | 'nombre' | 'celular' | 'correo'>

export type FiltroEstado = 'todos' | 'pendientes' | 'al_dia'

/** Inversionista con su cuota del mes elegido y su historial del año */
export interface InversionistaConEstado extends Inversionista {
  cuotaDelMes: Cuota | null
  /** Cuotas del año, indexadas por mes AAAA-MM */
  cuotasDelAnio: Record<string, Cuota>
  ultimoMonto: number | null
}

/** Mensaje de recordatorio por defecto. {nombre} y {mes} se reemplazan al enviar. */
export const MENSAJE_RECORDATORIO =
  'Hola {nombre}, ¡bendiciones! 🙏 Te escribimos para recordarte con cariño que tu cuota de Inversionista del Reino correspondiente a {mes} está pendiente. Gracias por sembrar en la obra del Señor. Cualquier inquietud, quedamos atentos.'
