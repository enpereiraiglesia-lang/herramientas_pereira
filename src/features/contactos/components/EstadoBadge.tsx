import { Badge } from '../../../components/ui/Badge'
import { ESTADOS, type EstadoContacto } from '../types'

export function EstadoBadge({ estado }: { estado: EstadoContacto }) {
  const { label, color } = ESTADOS[estado]
  return <Badge color={color}>{label}</Badge>
}
