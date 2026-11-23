import { Link } from 'react-router-dom'
import { Select } from '../../../components/ui/Select'
import { usePermisos } from '../../permisos/hooks/usePermisos'
import { useLideres } from '../hooks/useGrupos'

interface Props {
  value: string
  onChange: (value: string) => void
}

/** Selector de líder: muestra los miembros de la iglesia */
export function LiderSelect({ value, onChange }: Props) {
  const { opciones, loading, error } = useLideres()
  const { puede } = usePermisos()
  const sinMiembros = !loading && opciones.length === 0

  return (
    <div className="flex flex-col gap-1">
      <Select
        label="Líder (miembro de la iglesia)"
        name="lider_id"
        placeholder={sinMiembros ? 'No hay miembros registrados' : 'Sin líder'}
        options={opciones}
        value={value}
        disabled={loading}
        onChange={(e) => onChange(e.target.value)}
      />
      {error && <p className="text-xs text-rose-600">No se pudo cargar la lista de miembros.</p>}
      {sinMiembros && puede('miembros') && (
        <p className="text-xs text-slate-500">
          Primero registra al líder en{' '}
          <Link to="/miembros" className="font-medium text-primary-600 hover:underline">
            Miembros
          </Link>
          .
        </p>
      )}
    </div>
  )
}
