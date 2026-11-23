import { CircleCheckBig } from 'lucide-react'
import { Alert } from '../../../components/ui/Alert'
import { EmptyState } from '../../../components/ui/EmptyState'
import { Spinner } from '../../../components/ui/Spinner'
import { useAuth } from '../../auth/hooks/useAuth'
import { usePendientes } from '../hooks/usePendientes'
import { ContactoCard } from './ContactoCard'

/** Contactos asignados al usuario que aún no se llaman o cuya próxima llamada ya venció */
export function MisPendientes() {
  const { user } = useAuth()
  const { pendientes, loading, error } = usePendientes(user?.id)

  if (loading) return <Spinner />
  if (error) return <Alert>{error}</Alert>
  if (pendientes.length === 0)
    return (
      <EmptyState
        icon={CircleCheckBig}
        title="Estás al día"
        description="No tienes llamadas pendientes por ahora."
      />
    )

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {pendientes.map((c) => (
        <ContactoCard key={c.id} contacto={c} />
      ))}
    </div>
  )
}
