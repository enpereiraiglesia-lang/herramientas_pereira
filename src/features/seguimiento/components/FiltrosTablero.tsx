import { Input } from '../../../components/ui/Input'
import { UsuarioSelect } from '../../usuarios/components/UsuarioSelect'
import type { FiltrosTablero as Filtros } from '../types'

interface Props {
  filtros: Filtros
  total: number
  onChange: (filtros: Filtros) => void
}

export function FiltrosTablero({ filtros, total, onChange }: Props) {
  return (
    <div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-end">
      <div className="sm:w-72">
        <Input
          label="Buscar"
          name="buscar_tablero"
          type="search"
          placeholder="Nombre o teléfono"
          value={filtros.busqueda}
          onChange={(e) => onChange({ ...filtros, busqueda: e.target.value })}
        />
      </div>
      <div className="sm:w-64">
        <UsuarioSelect
          label="Responsable de llamar"
          name="filtro_tablero_asignado"
          placeholder="Todos"
          incluirSinAsignar
          value={filtros.asignadoA}
          onChange={(asignadoA) => onChange({ ...filtros, asignadoA })}
        />
      </div>
      <p className="pb-3 text-sm text-slate-500 sm:ml-auto">
        {total} contacto{total === 1 ? '' : 's'} en seguimiento
      </p>
    </div>
  )
}
