import { Lock } from 'lucide-react'
import { EmptyState } from '../../../components/ui/EmptyState'

export function SinAcceso() {
  return (
    <EmptyState
      icon={Lock}
      title="Aún no tienes módulos habilitados"
      description="Pide al administrador que te habilite los módulos que necesitas. Luego recarga la página."
    />
  )
}
