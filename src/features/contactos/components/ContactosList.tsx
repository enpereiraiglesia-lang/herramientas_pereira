import { Alert } from '../../../components/ui/Alert'
import { EmptyState } from '../../../components/ui/EmptyState'
import { Spinner } from '../../../components/ui/Spinner'
import type { ContactoConRelaciones } from '../types'
import { BotonNuevoContacto } from './BotonNuevoContacto'
import { ContactoCard } from './ContactoCard'

interface Props {
  contactos: ContactoConRelaciones[]
  loading: boolean
  error: string | null
  vacioTitulo?: string
}

export function ContactosList({ contactos, loading, error, vacioTitulo = 'No hay contactos' }: Props) {
  if (loading) return <Spinner />
  if (error) return <Alert>{error}</Alert>
  if (contactos.length === 0)
    return (
      <EmptyState
        title={vacioTitulo}
        description="Registra a las personas que contactas en la calle para darles seguimiento."
        action={<BotonNuevoContacto variante="link" />}
      />
    )

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
      {contactos.map((c) => (
        <ContactoCard key={c.id} contacto={c} />
      ))}
    </div>
  )
}
