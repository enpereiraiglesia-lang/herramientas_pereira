import { Alert } from '../../../components/ui/Alert'
import { Spinner } from '../../../components/ui/Spinner'
import { formatFecha, formatFechaHora } from '../../../lib/format'
import type { LlamadaConAutor } from '../types'
import { ResultadoBadge } from './ResultadoBadge'

interface Props {
  llamadas: LlamadaConAutor[]
  loading: boolean
  error: string | null
  usuarioId?: string
  onEliminar: (id: string) => void
}

export function LlamadasHistorial({ llamadas, loading, error, usuarioId, onEliminar }: Props) {
  if (loading) return <Spinner label="Cargando llamadas..." />
  if (error) return <Alert>{error}</Alert>
  if (llamadas.length === 0) return <p className="text-base text-slate-500">Aún no se ha registrado ninguna llamada.</p>

  return (
    <ol className="relative flex flex-col gap-4 border-l-2 border-slate-200 pl-4">
      {llamadas.map((ll) => (
        <li key={ll.id} className="relative">
          <span className="absolute -left-[23px] top-1.5 h-3 w-3 rounded-full bg-primary-500" />
          <div className="flex flex-wrap items-center gap-2">
            <ResultadoBadge resultado={ll.resultado} />
            <span className="text-sm text-slate-500">{formatFechaHora(ll.fecha_llamada)}</span>
          </div>
          <p className="mt-1 text-sm text-slate-600">
            Llamó: <strong className="font-medium text-slate-800">{ll.autor?.nombre ?? 'Desconocido'}</strong>
            {ll.proxima_llamada && <> · Próxima: {formatFecha(ll.proxima_llamada)}</>}
          </p>
          {ll.notas && <p className="mt-1 whitespace-pre-line text-base text-slate-700">{ll.notas}</p>}
          {usuarioId === ll.llamado_por && (
            <button
              type="button"
              onClick={() => confirm('¿Eliminar esta llamada?') && onEliminar(ll.id)}
              className="mt-1 min-h-11 text-sm text-red-600 hover:underline"
            >
              Eliminar
            </button>
          )}
        </li>
      ))}
    </ol>
  )
}
