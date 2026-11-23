import { mensajeError } from '../../../lib/errores'
import { useState } from 'react'
import { contactosService } from '../services/contactosService'
import type { ContactoInput } from '../types'

export function useContactoMutations() {
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function ejecutar<T>(fn: () => Promise<T>): Promise<T | null> {
    setSaving(true)
    setError(null)
    try {
      return await fn()
    } catch (err) {
      setError(mensajeError(err, 'No se pudo guardar'))
      return null
    } finally {
      setSaving(false)
    }
  }

  return {
    saving,
    error,
    crear: (input: ContactoInput) => ejecutar(() => contactosService.crear(input)),
    actualizar: (id: string, input: Partial<ContactoInput>) =>
      ejecutar(async () => {
        await contactosService.actualizar(id, input)
        return true
      }),
    eliminar: (id: string) =>
      ejecutar(async () => {
        await contactosService.eliminar(id)
        return true
      }),
  }
}
