import { useState } from 'react'
import { mensajeError } from '../../../lib/errores'
import { useAsync } from '../../../lib/useAsync'
import { miembrosService } from '../services/miembrosService'
import type { FiltrosMiembros, MiembroInput } from '../types'

export function useMiembros(filtros: FiltrosMiembros) {
  const { data, loading, error, reload } = useAsync(
    () => miembrosService.listar(filtros),
    [filtros.busqueda, filtros.inversionista, filtros.ceppev]
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
      setSaveError(msg.includes('miembros_correo_idx') ? 'Ya existe un miembro con ese correo' : msg)
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
    crear: (input: MiembroInput) => ejecutar(() => miembrosService.crear(input)),
    actualizar: (id: string, input: MiembroInput) => ejecutar(() => miembrosService.actualizar(id, input)),
    eliminar: (id: string) => ejecutar(() => miembrosService.eliminar(id)),
  }
}
