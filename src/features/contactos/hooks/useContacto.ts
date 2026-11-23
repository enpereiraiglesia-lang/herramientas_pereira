import { useAsync } from '../../../lib/useAsync'
import { contactosService } from '../services/contactosService'

export function useContacto(id: string | undefined) {
  const { data, loading, error, reload } = useAsync(
    () => (id ? contactosService.obtener(id) : Promise.resolve(null)),
    [id]
  )
  return { contacto: data, loading, error, reload }
}
