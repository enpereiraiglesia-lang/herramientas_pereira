import { Link } from 'react-router-dom'
import { PhoneCall } from 'lucide-react'
import { Alert } from '../../../components/ui/Alert'
import { Spinner } from '../../../components/ui/Spinner'
import { formatFechaHora } from '../../../lib/format'
import { useLlamadasRecientes } from '../hooks/useLlamadasRecientes'
import { ResultadoBadge } from './ResultadoBadge'

export function LlamadasRecientes() {
  const { llamadas, loading, error } = useLlamadasRecientes(8)
  if (loading) return <Spinner />
  if (error) return <Alert>{error}</Alert>
  if (llamadas.length === 0) return <p className="text-sm text-slate-500">Todavía no hay llamadas registradas.</p>

  return (
    <ul className="-my-2 divide-y divide-slate-100">
      {llamadas.map((ll) => (
        <li key={ll.id} className="flex items-start gap-3 py-3">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary-50 text-primary-600">
            <PhoneCall className="h-4 w-4" />
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-start justify-between gap-2">
              <Link
                to={`/contactos/${ll.contacto_id}`}
                className="truncate text-sm font-semibold text-navy-900 hover:text-primary-700"
              >
                {ll.contacto?.nombre ?? 'Contacto'}
              </Link>
              <ResultadoBadge resultado={ll.resultado} />
            </div>
            <p className="mt-0.5 truncate text-xs text-slate-500">
              {ll.autor?.nombre ?? '—'} · {formatFechaHora(ll.fecha_llamada)}
            </p>
          </div>
        </li>
      ))}
    </ul>
  )
}
