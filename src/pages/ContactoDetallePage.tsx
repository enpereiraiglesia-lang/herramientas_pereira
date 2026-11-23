import { Link, useParams } from 'react-router-dom'
import { ArrowLeft } from 'lucide-react'
import { ContactoDetalle } from '../features/contactos/components/ContactoDetalle'

export function ContactoDetallePage() {
  const { id = '' } = useParams()
  return (
    <>
      <Link
        to="/contactos"
        className="mb-4 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-slate-500 hover:text-primary-700"
      >
        <ArrowLeft className="h-4 w-4" />
        Volver a contactos
      </Link>
      <ContactoDetalle id={id} />
    </>
  )
}
