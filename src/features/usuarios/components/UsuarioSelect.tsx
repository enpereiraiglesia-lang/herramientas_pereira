import { Select } from '../../../components/ui/Select'
import { useUsuarios } from '../hooks/useUsuarios'

interface Props {
  label?: string
  name?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  /** Agrega la opción "Sin asignar" (valor 'sin'), útil en filtros */
  incluirSinAsignar?: boolean
}

export function UsuarioSelect({
  label = 'Asignado a',
  name = 'asignado_a',
  value,
  onChange,
  placeholder = 'Sin asignar',
  incluirSinAsignar = false,
}: Props) {
  const { usuarios, loading } = useUsuarios()
  const opciones = usuarios.map((u) => ({ value: u.id, label: u.nombre }))
  if (incluirSinAsignar) opciones.unshift({ value: 'sin', label: 'Sin asignar' })

  return (
    <Select
      label={label}
      name={name}
      value={value}
      disabled={loading}
      placeholder={placeholder}
      onChange={(e) => onChange(e.target.value)}
      options={opciones}
    />
  )
}
