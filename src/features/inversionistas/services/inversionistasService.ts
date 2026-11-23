import { supabase } from '../../../lib/supabase'
import type { CuotaInput, Inversionista, Participacion, ParticipacionInput } from '../types'

/** Datos de un inversionista que no es miembro de la iglesia */
export interface DatosExterno {
  nombre: string
  direccion: string
  correo: string
  celular: string
  /** Monto de su primera participación */
  cuota: number | null
  /** Fecha de aporte AAAA-MM-DD */
  fechaAporte: string | null
}

export type InversionistaConParticipaciones = Inversionista & { participaciones: Participacion[] }

export const inversionistasService = {
  async listarInversionistas(): Promise<InversionistaConParticipaciones[]> {
    const { data, error } = await supabase
      .from('miembros')
      .select('id, nombre, celular, correo, direccion, es_miembro, participaciones:participaciones_inversion(*)')
      .eq('inversionista_reino', true)
      .order('nombre')
    if (error) throw error
    return data as unknown as InversionistaConParticipaciones[]
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

  async anular(id: string) {
    const { data, error } = await supabase.from('cuotas_inversionistas').delete().eq('id', id).select('id')
    if (error) throw error
    if (!data.length) throw new Error('No tienes permiso para anular esta cuota')
  },

  // ---------- Participaciones ----------

  async crearParticipacion(miembroId: string, input: ParticipacionInput) {
    const { error } = await supabase.from('participaciones_inversion').insert({ ...input, miembro_id: miembroId })
    if (error) throw error
  },

  async actualizarParticipacion(id: string, input: Partial<ParticipacionInput>) {
    const { data, error } = await supabase.from('participaciones_inversion').update(input).eq('id', id).select('id')
    if (error) throw error
    if (!data.length) throw new Error('No tienes permiso para editar esta participación')
  },

  /** Finaliza la participación: deja de cobrarse pero conserva su historial de cuotas */
  async finalizarParticipacion(id: string) {
    const { data, error } = await supabase
      .from('participaciones_inversion')
      .update({ activa: false })
      .eq('id', id)
      .select('id')
    if (error) throw error
    if (!data.length) throw new Error('No tienes permiso para finalizar esta participación')
  },

  // ---------- Agregar y quitar inversionistas ----------

  async miembrosNoInversionistas() {
    const { data, error } = await supabase.rpc('miembros_no_inversionistas')
    if (error) throw error
    return data ?? []
  },

  async agregarMiembro(miembroId: string, cuota: number | null) {
    const { error } = await supabase.rpc('agregar_miembro_inversionista', { p_miembro: miembroId, p_cuota: cuota })
    if (error) throw error
  },

  async crearExterno(d: DatosExterno) {
    const { error } = await supabase.rpc('crear_inversionista_externo', {
      p_nombre: d.nombre,
      p_direccion: d.direccion,
      p_correo: d.correo,
      p_celular: d.celular,
      p_cuota: d.cuota,
      p_fecha_aporte: d.fechaAporte,
    })
    if (error) throw error
  },

  async actualizarExterno(id: string, d: Omit<DatosExterno, 'cuota' | 'fechaAporte'>) {
    const { error } = await supabase.rpc('actualizar_inversionista_externo', {
      p_id: id,
      p_nombre: d.nombre,
      p_direccion: d.direccion,
      p_correo: d.correo,
      p_celular: d.celular,
      p_fecha_aporte: null,
    })
    if (error) throw error
  },

  /** Miembro: deja de ser inversionista. No miembro: se elimina con sus cuotas. */
  async quitar(id: string) {
    const { error } = await supabase.rpc('quitar_inversionista', { p_id: id })
    if (error) throw error
  },
}
