import { useParams } from 'react-router-dom'
import { PageHeader } from '../components/ui/PageHeader'
import { ContactoEditar } from '../features/contactos/components/ContactoEditar'

export function ContactoEditarPage() {
  const { id = '' } = useParams()
  return (
    <>
      <PageHeader title="Editar contacto" />
      <ContactoEditar id={id} />
    </>
  )
}
