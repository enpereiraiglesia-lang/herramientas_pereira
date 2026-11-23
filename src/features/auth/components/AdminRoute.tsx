import { Navigate, Outlet } from 'react-router-dom'
import { Spinner } from '../../../components/ui/Spinner'
import { useAuth } from '../hooks/useAuth'

/** Solo deja pasar a usuarios con rol administrador */
export function AdminRoute() {
  const { esAdmin, loading } = useAuth()
  if (loading) return <Spinner />
  if (!esAdmin) return <Navigate to="/" replace />
  return <Outlet />
}
