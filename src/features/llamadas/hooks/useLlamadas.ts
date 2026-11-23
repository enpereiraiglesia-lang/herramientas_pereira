import { mensajeError } from '../../../lib/errores'
import { useState } from 'react'
import { useAsync } from '../../../lib/useAsync'
import { llamadasService } from '../services/llamadasService'
import type { LlamadaInput } from '../types'

/** Historial de llamadas de un contacto + acciones para registrar/eliminar */
export function useLlamadas(contactoId: string | undefined) {
  const { data, loading, error, reload } = useAsync(
    () => (contactoId ? llamadasService.listarPorContacto(contactoId) : Promise.resolve([])),
    [contactoId]
  )
  const [saving, setSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  async function registrar(input: LlamadaInput) {
    setSaving(true)
    setSaveError(null)
    try {
      await llamadasService.crear(input)
      await reload()
      return true
    } catch (err) {
      setSaveError(mensajeError(err, 'No se pudo registrar la llamada'))
      return false
    } finally {
      setSaving(false)
    }
  }

  async function eliminar(id: string) {
    await llamadasService.eliminar(id)
    await reload()
  }

  return { llamadas: data ?? [], loading, error, saving, saveError, registrar, eliminar }
}
