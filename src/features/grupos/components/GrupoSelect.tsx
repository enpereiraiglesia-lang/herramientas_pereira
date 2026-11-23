import { Select } from '../../../components/ui/Select'
import { useOpcionesGrupo } from '../hooks/useGrupos'
import { TIPOS_GRUPO, type TipoGrupo } from '../types'

interface Props {
  tipo: TipoGrupo
  value: string
  onChange: (value: string) => void
  disabled?: boolean
}

/** Selector para vincular un contacto con un grupo familiar o una cámara */
export function GrupoSelect({ tipo, value, onChange, disabled }: Props) {
  const { opciones, loading } = useOpcionesGrupo(tipo)
  return (
    <Select
      label={TIPOS_GRUPO[tipo].singular}
      name={`vinculo_${tipo}`}
      placeholder="Sin vincular"
      options={opciones}
      value={value}
      disabled={disabled || loading}
      onChange={(e) => onChange(e.target.value)}
    />
  )
}
