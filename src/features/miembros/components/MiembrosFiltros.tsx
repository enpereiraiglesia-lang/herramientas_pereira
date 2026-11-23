import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import {
  OPCIONES_RANGO_EDAD,
  OPCIONES_ROTACION,
  OPCIONES_SI_NO,
  type FiltroRotacion,
  type FiltroSiNo,
  type FiltrosMiembros,
  type RangoEdad,
} from '../types'

interface Props {
  filtros: FiltrosMiembros
  onChange: (filtros: FiltrosMiembros) => void
}

export function MiembrosFiltros({ filtros, onChange }: Props) {
  return (
    <div className="mb-4 grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-[2fr_1fr_1fr_1fr_1.2fr]">
      <div className="sm:col-span-2 lg:col-span-1">
        <Input
          label="Buscar"
          name="buscar_miembro"
          type="search"
          placeholder="Nombre, celular, correo o dirección"
          value={filtros.busqueda}
          onChange={(e) => onChange({ ...filtros, busqueda: e.target.value })}
        />
      </div>
      <Select
        label="Inversionista del Reino"
        name="filtro_inversionista"
        placeholder="Todos"
        options={OPCIONES_SI_NO}
        value={filtros.inversionista}
        onChange={(e) => onChange({ ...filtros, inversionista: e.target.value as FiltroSiNo })}
      />
      <Select
        label="Fue al CEPPEV"
        name="filtro_ceppev"
        placeholder="Todos"
        options={OPCIONES_SI_NO}
        value={filtros.ceppev}
        onChange={(e) => onChange({ ...filtros, ceppev: e.target.value as FiltroSiNo })}
      />
      <Select
        label="Rango de edad"
        name="filtro_rango_edad"
        placeholder="Todos"
        options={OPCIONES_RANGO_EDAD}
        value={filtros.rangoEdad}
        onChange={(e) => onChange({ ...filtros, rangoEdad: e.target.value as RangoEdad | '' })}
      />
      <Select
        label="Rotación de servicio"
        name="filtro_rotacion"
        placeholder="Todos"
        options={OPCIONES_ROTACION}
        value={filtros.rotacion}
        onChange={(e) => onChange({ ...filtros, rotacion: e.target.value as FiltroRotacion })}
      />
    </div>
  )
}
