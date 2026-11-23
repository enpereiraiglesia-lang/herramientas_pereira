import { supabase } from '../../../lib/supabase'
import type { AsignacionActual, FiltrosMiembros, Miembro, MiembroDirectorio, MiembroInput, Servicio } from '../types'

const SELECT_DIRECTORIO = `
  *,
  grupoFamiliar:grupos!miembros_grupo_familiar_id_fkey(nombre),
  camara:grupos!miembros_camara_id_fkey(nombre),
  asignaciones:asignaciones_servicio(id, fecha_inicio, fecha_fin, servicio:servicios(*))
`

type FilaDirectorio = Miembro & {
  grupoFamiliar: { nombre: string } | null
  camara: { nombre: string } | null
  asignaciones: (AsignacionActual & { fecha_fin: string | null })[]
}

export const miembrosService = {
  async listar(filtros: FiltrosMiembros): Promise<MiembroDirectorio[]> {
    // Los inversionistas que no son miembros no aparecen en el directorio
    let query = supabase.from('miembros').select(SELECT_DIRECTORIO).eq('es_miembro', true).order('nombre')

    const q = filtros.busqueda.trim()
    if (q) query = query.or(`nombre.ilike.%${q}%,celular.ilike.%${q}%,correo.ilike.%${q}%,direccion.ilike.%${q}%`)
    if (filtros.inversionista) query = query.eq('inversionista_reino', filtros.inversionista === 'si')
    if (filtros.ceppev) query = query.eq('fue_ceppev', filtros.ceppev === 'si')
    if (filtros.rangoEdad) query = query.eq('rango_edad', filtros.rangoEdad)

    const { data, error } = await query
    if (error) throw error
    return (data as unknown as FilaDirectorio[]).map(({ asignaciones, ...m }) => {
      const actual = (asignaciones ?? []).find((a) => !a.fecha_fin) ?? null
      return {
        ...m,
        servicioActual: actual && { id: actual.id, fecha_inicio: actual.fecha_inicio, servicio: actual.servicio },
      }
    })
  },

  async crear(input: MiembroInput) {
    const { data, error } = await supabase.from('miembros').insert(input).select('id').single()
    if (error) throw error
    return data.id
  },

  // ---------- Servicios ----------

  async servicios(): Promise<Servicio[]> {
    const { data, error } = await supabase.from('servicios').select('*').eq('activo', true).order('nombre')
    if (error) throw error
    return data
  },

  async crearServicio(nombre: string, mesesRotacion: number): Promise<Servicio> {
    const { data, error } = await supabase
      .from('servicios')
      .insert({ nombre: nombre.trim(), meses_rotacion: mesesRotacion })
      .select('*')
      .single()
    if (error) throw error
    return data
  },

  /** Asigna (o rota) el servicio: el anterior queda en el historial */
  async asignarServicio(miembroId: string, servicioId: string | null, fechaInicio: string | null) {
    const { error } = await supabase.rpc('asignar_servicio_miembro', {
      p_miembro: miembroId,
      p_servicio: servicioId,
      p_fecha_inicio: fechaInicio,
    })
    if (error) throw error
  },

  async actualizar(id: string, input: Partial<MiembroInput>) {
    const { data, error } = await supabase.from('miembros').update(input).eq('id', id).select('id')
    if (error) throw error
    if (!data.length) throw new Error('No tienes permiso para editar este miembro')
  },

  async eliminar(id: string) {
    const { data, error } = await supabase.from('miembros').delete().eq('id', id).select('id')
    if (error) throw error
    if (!data.length) throw new Error('Solo quien lo registró o un administrador puede eliminarlo')
  },
}
