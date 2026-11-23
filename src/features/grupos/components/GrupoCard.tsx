import { CalendarDays, Crown, IdCard, MapPin, Pencil, Trash2, UserPlus, UserRoundCog, Users, Video } from 'lucide-react'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { TIPOS_GRUPO, type GrupoConRelaciones } from '../types'

interface Props {
  grupo: GrupoConRelaciones
  onEditar: () => void
  onEliminar: () => void
  /** Abre la membresía (miembros y contactos) */
  onMembresia?: () => void
}

function Dato({ Icono, label, valor }: { Icono: typeof Users; label: string; valor: string }) {
  return (
    <div className="flex items-center gap-2 text-sm">
      <Icono className="h-4 w-4 shrink-0 text-slate-400" />
      <span className="text-slate-500">{label}:</span>
      <span className="truncate font-medium text-navy-900">{valor}</span>
    </div>
  )
}

export function GrupoCard({ grupo, onEditar, onEliminar, onMembresia }: Props) {
  const { icono: Icono } = TIPOS_GRUPO[grupo.tipo]
  const contactos = grupo.contactos[0]?.count ?? 0
  const integrantes = grupo.integrantes?.[0]?.count ?? 0
  const horario = [grupo.dia_reunion, grupo.hora_reunion?.slice(0, 5)].filter(Boolean).join(' · ')

  return (
    <article
      className={`flex flex-col rounded-xl border border-slate-200/80 bg-white shadow-xs ${grupo.activo ? '' : 'opacity-60'}`}
    >
      <header className="flex items-start gap-3 border-b border-slate-100 p-4">
        <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
          <Icono className="h-5 w-5" />
        </span>
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-navy-900">{grupo.nombre}</h3>
          {grupo.descripcion && <p className="line-clamp-2 text-sm text-slate-500">{grupo.descripcion}</p>}
        </div>
        {!grupo.activo && <Badge>Inactivo</Badge>}
      </header>

      <div className="flex flex-1 flex-col gap-2 p-4">
        <Dato Icono={Crown} label="Líder" valor={grupo.lider?.nombre ?? 'Sin asignar'} />
        {grupo.tipo !== 'grupo_familiar' && (
          <Dato Icono={UserRoundCog} label="Responsable" valor={grupo.responsable?.nombre ?? 'Sin asignar'} />
        )}
        {horario && <Dato Icono={CalendarDays} label="Reunión" valor={horario} />}
        {grupo.tipo === 'camara' ? (
          <Dato Icono={Video} label="Modalidad" valor="En línea" />
        ) : (
          grupo.direccion && <Dato Icono={MapPin} label="Lugar" valor={grupo.direccion} />
        )}
        {onMembresia && (
          <button
            type="button"
            onClick={onMembresia}
            className="mt-auto inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-primary-50 px-3 text-sm font-semibold text-primary-700 ring-1 ring-inset ring-primary-600/20 transition-colors hover:bg-primary-100"
          >
            <UserPlus className="h-4 w-4" />
            {grupo.tipo === 'camara' ? 'Membresía de la cámara' : 'Membresía del grupo'}
          </button>
        )}
      </div>

      <footer className="flex items-center justify-between gap-2 border-t border-slate-100 px-4 py-2">
        {onMembresia ? (
          <button
            type="button"
            onClick={onMembresia}
            className="flex min-h-11 items-center gap-3 rounded-lg px-2 text-sm text-slate-600 transition-colors hover:bg-primary-50 hover:text-primary-700"
            title="Ver y administrar la membresía"
          >
            <span className="flex items-center gap-1.5">
              <IdCard className="h-4 w-4" />
              <strong className="font-semibold text-navy-900">{integrantes}</strong> miembro{integrantes === 1 ? '' : 's'}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="h-4 w-4" />
              <strong className="font-semibold text-navy-900">{contactos}</strong> contacto{contactos === 1 ? '' : 's'}
            </span>
          </button>
        ) : (
          <span className="flex items-center gap-1.5 text-sm text-slate-500">
            <Users className="h-4 w-4" />
            {contactos} contacto{contactos === 1 ? '' : 's'}
          </span>
        )}
        <div className="flex gap-1">
          <Button variant="ghost" onClick={onEditar} aria-label={`Editar ${grupo.nombre}`}>
            <Pencil />
          </Button>
          <Button variant="ghost" onClick={onEliminar} aria-label={`Eliminar ${grupo.nombre}`}>
            <Trash2 className="text-rose-600" />
          </Button>
        </div>
      </footer>
    </article>
  )
}
