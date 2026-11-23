import { useState } from 'react'
import { mensajeError } from '../../../lib/errores'
import { useAsync } from '../../../lib/useAsync'
import { miembrosService } from '../services/miembrosService'
import type { FiltrosMiembros, MiembroInput, ServicioElegido } from '../types'

export function useMiembros(filtros: FiltrosMiembros) {
  const { data, loading, error, reload } = useAsync(
    () => miembrosService.listar(filtros),
    [filtros.busqueda, filtros.inversionista, filtros.ceppev, filtros.rangoEdad]
  )
  const [guardando, setGuardando] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  async function ejecutar(fn: () => Promise<unknown>) {
    setGuardando(true)
    setSaveError(null)
    try {
      await fn()
      await reload()
      return true
    } catch (err) {
      const msg = mensajeError(err, 'No se pudo guardar')
      setSaveError(
        msg.includes('miembros_correo_idx')
          ? 'Ya existe un miembro con ese correo'
          : msg.includes('servicios_nombre_idx')
            ? 'Ya existe un servicio con ese nombre'
            : msg
      )
      return false
    } finally {
      setGuardando(false)
    }
  }

  return {
    miembros: data ?? [],
    loading,
    error,
    guardando,
    saveError,
    limpiarError: () => setSaveError(null),
    crear: (input: MiembroInput, servicio?: ServicioElegido) =>
      ejecutar(async () => {
        const id = await miembrosService.crear(input)
        if (servicio?.servicioId) await miembrosService.asignarServicio(id, servicio.servicioId, servicio.fechaInicio)
      }),
    actualizar: (id: string, input: MiembroInput, servicio?: ServicioElegido) =>
      ejecutar(async () => {
        await miembrosService.actualizar(id, input)
        if (servicio) await miembrosService.asignarServicio(id, servicio.servicioId, servicio.fechaInicio)
      }),
    eliminar: (id: string) => ejecutar(() => miembrosService.eliminar(id)),
  }
}
