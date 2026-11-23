import { PageHeader } from '../components/ui/PageHeader'
import { PermisosPanel } from '../features/permisos/components/PermisosPanel'

export function PermisosPage() {
  return (
    <>
      <PageHeader title="Permisos" subtitle="Elige qué módulos puede ver cada colaborador" />
      <PermisosPanel />
    </>
  )
}
