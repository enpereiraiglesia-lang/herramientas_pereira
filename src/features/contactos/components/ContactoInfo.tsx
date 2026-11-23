import type { ReactNode } from 'react'
import { formatFecha } from '../../../lib/format'
import type { ContactoConRelaciones } from '../types'
import { EstadoBadge } from './EstadoBadge'
import { TelefonoLinks } from './TelefonoLinks'

function Dato({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-sm font-medium text-slate-500">{label}</dt>
      <dd className="mt-1 text-base text-slate-800">{children}</dd>
    </div>
  )
}

export function ContactoInfo({ contacto }: { contacto: ContactoConRelaciones }) {
  return (
    <dl className="grid grid-cols-1 gap-4 sm:grid-cols-2">
      <Dato label="Teléfono">
        <TelefonoLinks telefono={contacto.telefono} />
      </Dato>
      <Dato label="Estado">
        <EstadoBadge estado={contacto.estado} />
      </Dato>
      <Dato label="Dirección">{contacto.direccion || '—'}</Dato>
      <Dato label="Lugar de contacto">{contacto.lugar_contacto || '—'}</Dato>
      <Dato label="Fecha de contacto">{formatFecha(contacto.fecha_contacto)}</Dato>
      <Dato label="Registrado por">{contacto.registrador?.nombre ?? '—'}</Dato>
      <Dato label="Última llamada">{formatFecha(contacto.ultima_llamada_at)}</Dato>
      <Dato label="Próxima llamada">{formatFecha(contacto.proxima_llamada)}</Dato>
      <div className="sm:col-span-2">
        <Dato label="Observaciones">
          <span className="whitespace-pre-line">{contacto.observaciones || '—'}</span>
        </Dato>
      </div>
    </dl>
  )
}
