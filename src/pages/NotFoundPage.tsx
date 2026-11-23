import { Link } from 'react-router-dom'
import { SearchX } from 'lucide-react'
import { EmptyState } from '../components/ui/EmptyState'

export function NotFoundPage() {
  return (
    <EmptyState
      icon={SearchX}
      title="Página no encontrada"
      description="La dirección que buscas no existe."
      action={
        <Link to="/" className="text-sm font-semibold text-primary-600 hover:text-primary-700">
          Ir al inicio
        </Link>
      }
    />
  )
}
