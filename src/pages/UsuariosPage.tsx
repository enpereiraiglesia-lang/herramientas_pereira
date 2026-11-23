import { PageHeader } from '../components/ui/PageHeader'
import { UsuariosModulo } from '../features/usuarios/components/UsuariosModulo'

export function UsuariosPage() {
  return (
    <>
      <PageHeader title="Usuarios" subtitle="Crea colaboradores y administra los roles del equipo" />
      <UsuariosModulo />
    </>
  )
}
