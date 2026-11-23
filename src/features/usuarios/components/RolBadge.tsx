import { Badge } from '../../../components/ui/Badge'
import { ROLES, type RolUsuario } from '../types'

export function RolBadge({ rol }: { rol: RolUsuario }) {
  return <Badge color={rol === 'administrador' ? 'purple' : 'blue'}>{ROLES[rol].label}</Badge>
}
