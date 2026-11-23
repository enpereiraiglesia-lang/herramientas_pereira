import { PageHeader } from '../components/ui/PageHeader'
import { BotonNuevoContacto } from '../features/contactos/components/BotonNuevoContacto'
import { ContactosExplorer } from '../features/contactos/components/ContactosExplorer'

export function ContactosPage() {
  return (
    <>
      <PageHeader title="Contactos" subtitle="Personas contactadas en la calle" actions={<BotonNuevoContacto />} />
      <ContactosExplorer />
    </>
  )
}
