import { useState } from 'react'
import { ChevronDown, MessageCircle, RotateCcw } from 'lucide-react'
import { MENSAJE_RECORDATORIO } from '../types'
import { guardarPlantilla } from '../mensaje'

interface Props {
  plantilla: string
  onChange: (texto: string) => void
}

/** Panel plegable para personalizar el mensaje de WhatsApp */
export function MensajeRecordatorio({ plantilla, onChange }: Props) {
  const [abierto, setAbierto] = useState(false)

  function cambiar(texto: string) {
    onChange(texto)
    guardarPlantilla(texto)
  }

  return (
    <div className="mb-4 rounded-xl border border-slate-200/80 bg-white shadow-xs">
      <button
        type="button"
        onClick={() => setAbierto(!abierto)}
        aria-expanded={abierto}
        className="flex min-h-12 w-full items-center gap-3 px-4 text-left sm:px-6"
      >
        <MessageCircle className="h-4 w-4 text-emerald-600" />
        <span className="flex-1 text-sm font-medium text-navy-900">Mensaje de recordatorio por WhatsApp</span>
        <ChevronDown className={`h-4 w-4 text-slate-400 transition-transform ${abierto ? 'rotate-180' : ''}`} />
      </button>
      {abierto && (
        <div className="flex flex-col gap-2 border-t border-slate-100 px-4 py-4 sm:px-6">
          <textarea
            value={plantilla}
            onChange={(e) => cambiar(e.target.value)}
            rows={4}
            aria-label="Plantilla del mensaje"
            className="w-full rounded-lg border-0 bg-white px-3 py-2 text-base text-slate-900 sm:text-sm shadow-xs ring-1 ring-inset ring-slate-300 outline-none focus:ring-2 focus:ring-primary-600"
          />
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs text-slate-500">
            <p>
              Usa <code className="rounded bg-slate-100 px-1 py-0.5">{'{nombre}'}</code> y{' '}
              <code className="rounded bg-slate-100 px-1 py-0.5">{'{mes}'}</code>; se reemplazan al enviar.
            </p>
            {plantilla !== MENSAJE_RECORDATORIO && (
              <button
                type="button"
                onClick={() => cambiar(MENSAJE_RECORDATORIO)}
                className="inline-flex items-center gap-1 font-medium text-primary-700 hover:underline"
              >
                <RotateCcw className="h-3 w-3" />
                Restaurar mensaje original
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
