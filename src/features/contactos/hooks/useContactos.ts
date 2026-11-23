import { useAsync } from '../../../lib/useAsync'
import { contactosService } from '../services/contactosService'
import type { FiltrosContactos } from '../types'

export function useContactos(filtros: FiltrosContactos) {
  const { data, loading, error, reload } = useAsync(
    () => contactosService.listar(filtros),
    [filtros.busqueda, filtros.estado, filtros.asignadoA]
  )
  return { contactos: data ?? [], loading, error, reload }
}
