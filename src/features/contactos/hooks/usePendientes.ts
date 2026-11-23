import { useAsync } from '../../../lib/useAsync'
import { contactosService } from '../services/contactosService'

/** Contactos asignados al usuario que necesitan una llamada */
export function usePendientes(perfilId: string | undefined) {
  const { data, loading, error, reload } = useAsync(
    () => (perfilId ? contactosService.pendientesDe(perfilId) : Promise.resolve([])),
    [perfilId]
  )
  return { pendientes: data ?? [], loading, error, reload }
}
