import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { Spinner } from '../../../components/ui/Spinner'
import { useAuth } from '../../auth/hooks/useAuth'
import { usePermisos } from '../hooks/usePermisos'
import { primeraRutaPermitida, type Modulo } from '../modulos'
import { SinAcceso } from './SinAcceso'

/** Protege una ruta según el módulo. Si no tiene acceso, lo manda al primer módulo permitido. */
export function ModuloRoute({ modulo }: { modulo: Modulo }) {
  const { loading } = useAuth()
  const { puede } = usePermisos()
  const { pathname } = useLocation()

  if (loading) return <Spinner />
  if (puede(modulo)) return <Outlet />

  const destino = primeraRutaPermitida(puede)
  if (destino && destino !== pathname) return <Navigate to={destino} replace />
  return <SinAcceso />
}
