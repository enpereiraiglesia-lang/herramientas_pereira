import { MessageCircle, Phone } from 'lucide-react'
import { linkWhatsApp, telefonoLimpio } from '../../../lib/format'

/** Botones rápidos para llamar o escribir por WhatsApp */
export function TelefonoLinks({ telefono }: { telefono: string | null }) {
  if (!telefono) return <span className="text-slate-400">Sin teléfono</span>
  const tel = telefonoLimpio(telefono)
  return (
    <div className="flex flex-wrap items-center gap-2">
      <a
        href={`tel:${tel}`}
        className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-primary-50 px-3 text-sm font-semibold text-primary-700 ring-1 ring-inset ring-primary-600/20 hover:bg-primary-100"
      >
        <Phone className="h-4 w-4" />
        {telefono}
      </a>
      <a
        href={linkWhatsApp(telefono)}
        target="_blank"
        rel="noreferrer"
        className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-emerald-50 px-3 text-sm font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20 hover:bg-emerald-100"
      >
        <MessageCircle className="h-4 w-4" />
        WhatsApp
      </a>
    </div>
  )
}
