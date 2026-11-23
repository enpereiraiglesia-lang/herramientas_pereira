import { GraduationCap, HandCoins, Mail, MapPin, Pencil, Smartphone, Trash2 } from 'lucide-react'
import { Avatar } from '../../../components/ui/Avatar'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { formatMesAnio, telefonoLimpio, tiempoDesde } from '../../../lib/format'
import type { Miembro } from '../types'

interface Props {
  miembro: Miembro
  onEditar: () => void
  onEliminar: () => void
}

/** Fila del directorio: en celular se muestra como tarjeta, en escritorio como fila de tabla */
export function MiembroFila({ miembro: m, onEditar, onEliminar }: Props) {
  return (
    <li className="grid grid-cols-1 gap-3 px-4 py-4 sm:px-6 lg:grid-cols-[minmax(0,2fr)_minmax(0,2fr)_minmax(0,1.5fr)_auto] lg:items-center">
      {/* Nombre */}
      <div className="flex min-w-0 items-center gap-3">
        <Avatar nombre={m.nombre} />
        <div className="min-w-0">
          <p className="truncate font-semibold text-navy-900">{m.nombre}</p>
          {m.direccion && (
            <p className="flex items-center gap-1 truncate text-xs text-slate-500">
              <MapPin className="h-3 w-3 shrink-0" />
              <span className="truncate">{m.direccion}</span>
            </p>
          )}
        </div>
      </div>

      {/* Contacto */}
      <div className="flex min-w-0 flex-col gap-1 text-sm">
        {m.celular ? (
          <a href={`tel:${telefonoLimpio(m.celular)}`} className="flex items-center gap-1.5 text-slate-700 hover:text-primary-700">
            <Smartphone className="h-3.5 w-3.5 text-slate-400" />
            {m.celular}
          </a>
        ) : (
          <span className="text-slate-400">Sin celular</span>
        )}
        {m.correo && (
          <a href={`mailto:${m.correo}`} className="flex min-w-0 items-center gap-1.5 text-slate-700 hover:text-primary-700">
            <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
            <span className="truncate">{m.correo}</span>
          </a>
        )}
      </div>

      {/* Indicadores */}
      <div className="flex flex-wrap items-center gap-1.5">
        {m.inversionista_reino && (
          <Badge color="green">
            <HandCoins className="h-3 w-3" />
            Inversionista del Reino
          </Badge>
        )}
        {m.fue_ceppev ? (
          <Badge color="blue">
            <GraduationCap className="h-3 w-3" />
            <span title={formatMesAnio(m.fecha_ceppev)}>
              CEPPEV {m.fecha_ceppev ? tiempoDesde(m.fecha_ceppev) : ''}
            </span>
          </Badge>
        ) : (
          <Badge>Sin CEPPEV</Badge>
        )}
      </div>

      {/* Acciones */}
      <div className="flex justify-end gap-1">
        <Button variant="ghost" onClick={onEditar} aria-label={`Editar a ${m.nombre}`}>
          <Pencil />
        </Button>
        <Button variant="ghost" onClick={onEliminar} aria-label={`Eliminar a ${m.nombre}`}>
          <Trash2 className="text-rose-600" />
        </Button>
      </div>
    </li>
  )
}
