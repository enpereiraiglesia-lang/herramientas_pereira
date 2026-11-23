import { useState, type FormEvent } from 'react'
import { Clock } from 'lucide-react'
import { Alert } from '../../../components/ui/Alert'
import { Button } from '../../../components/ui/Button'
import { DatePicker } from '../../../components/ui/DatePicker'
import { Field, inputClass } from '../../../components/ui/Field'
import { Select } from '../../../components/ui/Select'
import { TextArea } from '../../../components/ui/TextArea'
import { hoy, sumarDias } from '../../../components/ui/calendario/fechas'
import { OPCIONES_RESULTADO, type LlamadaInput, type ResultadoLlamada } from '../types'

interface Props {
  contactoId: string
  saving: boolean
  error: string | null
  onSubmit: (input: LlamadaInput) => Promise<boolean>
}

function horaActual() {
  const d = new Date()
  return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
}

/** Atajos para programar la próxima llamada */
const ATAJOS = [
  { label: 'Mañana', dias: 1 },
  { label: 'En 3 días', dias: 3 },
  { label: 'En 1 semana', dias: 7 },
  { label: 'En 2 semanas', dias: 14 },
]

export function LlamadaForm({ contactoId, saving, error, onSubmit }: Props) {
  const [fecha, setFecha] = useState<string | null>(hoy)
  const [hora, setHora] = useState(horaActual)
  const [proxima, setProxima] = useState<string | null>(null)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const f = new FormData(form)
    const ok = await onSubmit({
      contacto_id: contactoId,
      resultado: f.get('resultado') as ResultadoLlamada,
      fecha_llamada: fecha ? new Date(`${fecha}T${hora || '00:00'}`).toISOString() : undefined,
      notas: String(f.get('notas') ?? '').trim() || null,
      proxima_llamada: proxima,
    })
    if (ok) {
      form.reset()
      setFecha(hoy())
      setHora(horaActual())
      setProxima(null)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <Alert>{error}</Alert>}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Select label="Resultado *" name="resultado" options={OPCIONES_RESULTADO} defaultValue="contesto" required />
        <div className="grid grid-cols-[minmax(0,1fr)_7.5rem] gap-2">
          <DatePicker label="Fecha de la llamada" name="fecha_llamada" required max={hoy()} value={fecha} onChange={setFecha} />
          <Field label="Hora" htmlFor="hora_llamada">
            <div className="relative">
              <Clock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
              <input
                id="hora_llamada"
                type="time"
                value={hora}
                onChange={(e) => setHora(e.target.value)}
                className={`${inputClass} pl-9 tabular-nums`}
              />
            </div>
          </Field>
        </div>
        <div className="flex flex-col gap-2 sm:col-span-2">
          <DatePicker
            label="Próxima llamada"
            name="proxima_llamada"
            min={hoy()}
            value={proxima}
            onChange={setProxima}
            placeholder="Sin programar"
          />
          <div className="flex flex-wrap gap-1.5">
            {ATAJOS.map((a) => {
              const valor = sumarDias(hoy(), a.dias)
              const activo = proxima === valor
              return (
                <button
                  key={a.dias}
                  type="button"
                  onClick={() => setProxima(activo ? null : valor)}
                  className={`min-h-9 rounded-full px-3 text-xs font-semibold ring-1 ring-inset transition-colors ${
                    activo
                      ? 'bg-primary-600 text-white ring-primary-600'
                      : 'bg-white text-slate-600 ring-slate-300 hover:bg-slate-50'
                  }`}
                >
                  {a.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>
      <TextArea label="Notas de la llamada" name="notas" rows={3} placeholder="¿Qué se habló? ¿Petición de oración?" />
      <Button type="submit" loading={saving} className="sm:self-end">
        Registrar llamada
      </Button>
    </form>
  )
}
