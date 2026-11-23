import { supabase } from '../../../lib/supabase'
import type { CuotaInput } from '../types'

export const inversionistasService = {
  async listarInversionistas() {
    const { data, error } = await supabase
      .from('miembros')
      .select('id, nombre, celular, correo, cuota_mensual')
      .eq('inversionista_reino', true)
      .order('nombre')
    if (error) throw error
    return data
  },

  /** Cuotas de un año completo (para el mes elegido y el historial) */
  async listarCuotas(anio: number) {
    const { data, error } = await supabase
      .from('cuotas_inversionistas')
      .select('*')
      .gte('periodo', `${anio}-01-01`)
      .lte('periodo', `${anio}-12-01`)
    if (error) throw error
    return data
  },

  async registrar(input: CuotaInput) {
    const { error } = await supabase.from('cuotas_inversionistas').insert(input)
    if (error) throw error
  },

  async actualizar(id: string, input: Partial<CuotaInput>) {
    const { data, error } = await supabase.from('cuotas_inversionistas').update(input).eq('id', id).select('id')
    if (error) throw error
    if (!data.length) throw new Error('No tienes permiso para editar esta cuota')
  },

  /** Cuota mensual pactada del inversionista (null = sin definir) */
  async definirCuota(miembroId: string, monto: number | null) {
    const { error } = await supabase.rpc('definir_cuota_inversionista', { p_miembro: miembroId, p_monto: monto })
    if (error) throw error
  },

  async anular(id: string) {
    const { data, error } = await supabase.from('cuotas_inversionistas').delete().eq('id', id).select('id')
    if (error) throw error
    if (!data.length) throw new Error('No tienes permiso para anular esta cuota')
  },
}
