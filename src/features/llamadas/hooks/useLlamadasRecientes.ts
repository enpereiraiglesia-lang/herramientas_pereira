import { useAsync } from '../../../lib/useAsync'
import { llamadasService } from '../services/llamadasService'

export function useLlamadasRecientes(limite = 10) {
  const { data, loading, error } = useAsync(() => llamadasService.recientes(limite), [limite])
  return { llamadas: data ?? [], loading, error }
}
