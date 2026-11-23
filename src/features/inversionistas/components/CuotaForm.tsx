import { useState, type FormEvent } from 'react'
import { Alert } from '../../../components/ui/Alert'
import { Button } from '../../../components/ui/Button'
import { DatePicker } from '../../../components/ui/DatePicker'
import { Field, inputClass } from '../../../components/ui/Field'
import { MonthPicker } from '../../../components/ui/MonthPicker'
import { TextArea } from '../../../components/ui/TextArea'
import { hoy } from '../../../components/ui/calendario/fechas'
import { formatMoneda } from '../../../lib/format'
import type { Cuota, CuotaInput } from '../types'

interface Props {
  miembroId: string
  mesInicial: string
  inicial: Cuota | null
  montoSugerido: number | null
  guardando: boolean
  error: string | null
  onSubmit: (input: CuotaInput) => Promise<boolean>
  onCancel: () => void
}

/** Formulario para registrar o editar la cuota de un mes */
export function CuotaForm({ miembroId, mesInicial, inicial, montoSugerido, guardando, error, onSubmit, onCancel }: Props) {
  const [mes, setMes] = useState<string | null>(inicial?.periodo.slice(0, 7) ?? mesInicial)
  const [fechaPago, setFechaPago] = useState<string | null>(inicial?.fecha_pago ?? hoy())
  const [monto, setMonto] = useState(
    inicial?.monto != null ? String(inicial.monto) : montoSugerido != null ? String(montoSugerido) : ''
  )

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (!mes || !fechaPago) return
    const f = new FormData(e.currentTarget)
    const valor = monto.replace(/[^\d]/g, '')
    await onSubmit({
      miembro_id: miembroId,
      periodo: `${mes}-01`,
      fecha_pago: fechaPago,
      monto: valor ? Number(valor) : null,
      notas: String(f.get('notas') ?? '').trim() || null,
    })
  }

  const montoNumero = Number(monto.replace(/[^\d]/g, '')) || 0

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && <Alert>{error}</Alert>}

      <MonthPicker label="Mes de la cuota *" name="periodo" required value={mes} onChange={setMes} />

      <DatePicker
        label="Fecha de pago *"
        name="fecha_pago"
        required
        max={hoy()}
        value={fechaPago}
        onChange={setFechaPago}
      />

      <Field label="Monto" htmlFor="monto">
        <div className="relative">
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">$</span>
          <input
            id="monto"
            inputMode="numeric"
            autoComplete="off"
            placeholder="0"
            value={montoNumero ? montoNumero.toLocaleString('es-CO') : monto}
            onChange={(e) => setMonto(e.target.value.replace(/[^\d]/g, ''))}
            className={`${inputClass} pl-7 tabular-nums`}
          />
        </div>
        {montoSugerido != null && !inicial && (
          <button
            type="button"
            onClick={() => setMonto(String(montoSugerido))}
            className="self-start text-xs font-medium text-primary-700 hover:underline"
          >
            Usar su última cuota: {formatMoneda(montoSugerido)}
          </button>
        )}
      </Field>

      <TextArea label="Notas" name="notas" rows={2} placeholder="Ej: pagó por transferencia" defaultValue={inicial?.notas ?? ''} />

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={guardando}>
          {inicial ? 'Guardar cambios' : 'Registrar cuota'}
        </Button>
      </div>
    </form>
  )
}
