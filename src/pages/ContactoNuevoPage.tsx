import { PageHeader } from '../components/ui/PageHeader'
import { ContactoNuevo } from '../features/contactos/components/ContactoNuevo'

export function ContactoNuevoPage() {
  return (
    <>
      <PageHeader title="Nuevo contacto" subtitle="Registra a la persona con quien compartiste el evangelio" />
      <ContactoNuevo />
    </>
  )
}
