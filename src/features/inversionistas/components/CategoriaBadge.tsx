import { Badge } from '../../../components/ui/Badge'
import { ICONO_CATEGORIA } from '../estilos'
import { CATEGORIAS, type Categoria } from '../types'

/** Insignia de una categoría: 💎 Inversionista (≥ $400.000) o 🌱 Microinversionista */
export function CategoriaBadge({ categoria, sufijo }: { categoria: Categoria; sufijo?: string }) {
  const { label, color } = CATEGORIAS[categoria]
  const Icono = ICONO_CATEGORIA[categoria]
  return (
    <Badge color={color}>
      <Icono className="h-3 w-3" />
      {label}
      {sufijo}
    </Badge>
  )
}

/** Todas las categorías de una persona (puede ser Inversionista y Microinversionista a la vez) */
export function CategoriasPersona({ categorias }: { categorias: Categoria[] }) {
  if (!categorias.length) return <Badge color="gray">Sin participación</Badge>
  return (
    <>
      {categorias.map((c) => (
        <CategoriaBadge key={c} categoria={c} />
      ))}
    </>
  )
}
