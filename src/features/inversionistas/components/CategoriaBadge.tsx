import { Gem, Sprout } from 'lucide-react'
import { Badge } from '../../../components/ui/Badge'
import { CATEGORIAS, categoriaDe } from '../types'

/** Inversionista (cuota ≥ $400.000) o Microinversionista (cuota menor) */
export function CategoriaBadge({ cuotaMensual }: { cuotaMensual: number | null }) {
  const categoria = categoriaDe(cuotaMensual)
  if (categoria === 'sin_cuota') return null
  const { label, color } = CATEGORIAS[categoria]
  const Icono = categoria === 'inversionista' ? Gem : Sprout
  return (
    <Badge color={color}>
      <Icono className="h-3 w-3" />
      {label}
    </Badge>
  )
}
