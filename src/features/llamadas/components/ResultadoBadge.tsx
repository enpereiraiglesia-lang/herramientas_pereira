import { Badge } from '../../../components/ui/Badge'
import { RESULTADOS, type ResultadoLlamada } from '../types'

export function ResultadoBadge({ resultado }: { resultado: ResultadoLlamada }) {
  const { label, color } = RESULTADOS[resultado]
  return <Badge color={color}>{label}</Badge>
}
