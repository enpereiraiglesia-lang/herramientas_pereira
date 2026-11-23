import { useAsync } from '../../../lib/useAsync'
import { contactosService } from '../services/contactosService'

export function useResumen(perfilId: string | undefined) {
  const { data, loading, error } = useAsync(
    () => (perfilId ? contactosService.resumen(perfilId) : Promise.resolve(null)),
    [perfilId]
  )
  return { resumen: data, loading, error }
}
