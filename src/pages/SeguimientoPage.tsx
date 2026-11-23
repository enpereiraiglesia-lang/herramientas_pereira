import { PageHeader } from '../components/ui/PageHeader'
import { TableroSeguimiento } from '../features/seguimiento/components/TableroSeguimiento'

export function SeguimientoPage() {
  return (
    <>
      <PageHeader
        title="Seguimiento"
        subtitle="Arrastra cada tarjeta a la fase en la que está la persona. Pulsa una tarjeta para comentar y vincular."
      />
      <TableroSeguimiento />
    </>
  )
}
