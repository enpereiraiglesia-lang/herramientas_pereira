import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { UsuarioSelect } from '../../usuarios/components/UsuarioSelect'
import { OPCIONES_ESTADO, type EstadoContacto, type FiltrosContactos } from '../types'

interface Props {
  filtros: FiltrosContactos
  onChange: (filtros: FiltrosContactos) => void
}

export function ContactosFiltros({ filtros, onChange }: Props) {
  return (
    <div className="mb-6 grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:grid-cols-2 lg:grid-cols-3">
      <Input
        label="Buscar"
        name="busqueda"
        type="search"
        placeholder="Nombre, teléfono o dirección"
        value={filtros.busqueda}
        onChange={(e) => onChange({ ...filtros, busqueda: e.target.value })}
      />
      <Select
        label="Estado"
        name="estado"
        placeholder="Todos"
        options={OPCIONES_ESTADO}
        value={filtros.estado}
        onChange={(e) => onChange({ ...filtros, estado: e.target.value as EstadoContacto | '' })}
      />
      <UsuarioSelect
        label="Asignado a"
        name="filtro_asignado"
        placeholder="Todos"
        incluirSinAsignar
        value={filtros.asignadoA}
        onChange={(asignadoA) => onChange({ ...filtros, asignadoA })}
      />
    </div>
  )
}
