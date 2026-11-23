import { Link } from 'react-router-dom'
import { CalendarClock, MapPin, Phone, UserRound } from 'lucide-react'
import { Avatar } from '../../../components/ui/Avatar'
import { formatFecha } from '../../../lib/format'
import type { ContactoConRelaciones } from '../types'
import { EstadoBadge } from './EstadoBadge'

export function ContactoCard({ contacto }: { contacto: ContactoConRelaciones }) {
  return (
    <Link
      to={`/contactos/${contacto.id}`}
      className="group flex min-w-0 flex-col gap-3 rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs transition hover:border-primary-300 hover:shadow-md"
    >
      <div className="flex items-start gap-3">
        <Avatar nombre={contacto.nombre} />
        <div className="min-w-0 flex-1">
          <h3 className="truncate font-semibold text-navy-900 group-hover:text-primary-700">{contacto.nombre}</h3>
          <p className="flex items-center gap-1.5 text-sm text-slate-600">
            <Phone className="h-3.5 w-3.5 text-slate-400" />
            {contacto.telefono || 'Sin teléfono'}
          </p>
        </div>
        <EstadoBadge estado={contacto.estado} />
      </div>

      {contacto.direccion && (
        <p className="flex items-center gap-1.5 truncate text-sm text-slate-500">
          <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
          <span className="truncate">{contacto.direccion}</span>
        </p>
      )}

      <div className="flex flex-wrap gap-x-4 gap-y-1 border-t border-slate-100 pt-3 text-xs text-slate-500">
        <span className="flex items-center gap-1.5">
          <UserRound className="h-3.5 w-3.5 text-slate-400" />
          {contacto.asignado?.nombre ?? 'Sin asignar'}
        </span>
        <span className="flex items-center gap-1.5">
          <CalendarClock className="h-3.5 w-3.5 text-slate-400" />
          Última llamada: {formatFecha(contacto.ultima_llamada_at)}
        </span>
      </div>
    </Link>
  )
}
