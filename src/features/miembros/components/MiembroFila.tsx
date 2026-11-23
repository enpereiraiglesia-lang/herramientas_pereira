import { Briefcase, GraduationCap, HandCoins, House, Shield, Mail, MapPin, Pencil, RefreshCw, Smartphone, Trash2, Zap } from 'lucide-react'
import { Avatar } from '../../../components/ui/Avatar'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { formatMesAnio, telefonoLimpio, tiempoDesde } from '../../../lib/format'
import { tiempoEnServicio, type InfoRotacion } from '../rotacion'
import { RANGOS_EDAD, type MiembroDirectorio } from '../types'

interface Props {
  miembro: MiembroDirectorio
  rotacion: InfoRotacion | null
  onEditar: () => void
  onEliminar: () => void
}

/** Fila del directorio: en celular se muestra como tarjeta, en escritorio como fila de tabla */
const ESTILO_ROTACION = {
  al_dia: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  proxima: 'bg-amber-50 text-amber-800 ring-amber-600/30',
  vencida: 'bg-rose-50 text-rose-700 ring-rose-600/30',
}

export function MiembroFila({ miembro: m, rotacion, onEditar, onEliminar }: Props) {
  return (
    <li className="grid grid-cols-1 gap-3 px-4 py-4 sm:px-6 lg:grid-cols-[minmax(0,1.6fr)_minmax(0,1.4fr)_minmax(0,1.8fr)_minmax(0,1.4fr)_auto] lg:items-start lg:items-center">
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

      {/* Servicio y herramientas */}
      <div className="flex min-w-0 flex-col gap-1.5 text-sm">
        {m.servicioActual ? (
          <>
            <p className="flex min-w-0 items-center gap-1.5 font-medium text-navy-900">
              <Briefcase className="h-3.5 w-3.5 shrink-0 text-primary-600" />
              <span className="truncate">{m.servicioActual.servicio.nombre}</span>
              <span className="shrink-0 text-xs font-normal text-slate-500">· {tiempoEnServicio(m.servicioActual.fecha_inicio)}</span>
            </p>
            {rotacion && (
              <span
                title={rotacion.detalle}
                className={`inline-flex items-center gap-1 self-start rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${ESTILO_ROTACION[rotacion.estado]}`}
              >
                <RefreshCw className="h-3 w-3" />
                {rotacion.texto}
              </span>
            )}
          </>
        ) : (
          <button type="button" onClick={onEditar} className="self-start text-xs font-medium text-slate-400 hover:text-primary-700 hover:underline">
            Sin servicio asignado
          </button>
        )}
        {(m.grupoFamiliar || m.camara) && (
          <div className="flex flex-wrap gap-1">
            {m.grupoFamiliar && (
              <Badge>
                <House className="h-3 w-3" />
                {m.grupoFamiliar.nombre}
              </Badge>
            )}
            {m.camara && (
              <Badge>
                <Zap className="h-3 w-3" />
                {m.camara.nombre}
              </Badge>
            )}
          </div>
        )}
      </div>

      {/* Indicadores */}
      <div className="flex flex-wrap items-center gap-1.5">
        {m.rango_edad && (
          <Badge color="purple">
            <Shield className="h-3 w-3" />
            {RANGOS_EDAD[m.rango_edad]}
          </Badge>
        )}
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
