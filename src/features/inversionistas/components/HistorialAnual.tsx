import { MESES_CORTOS, fechaCorta, mesActual } from '../../../components/ui/calendario/fechas'
import { formatMoneda } from '../../../lib/format'
import type { Cuota } from '../types'

interface Props {
  anio: number
  mesElegido: string
  cuotas: Record<string, Cuota>
  onElegirMes: (mes: string) => void
}

/** 12 casillas (ene–dic) con el estado de pago de cada mes del año */
export function HistorialAnual({ anio, mesElegido, cuotas, onElegirMes }: Props) {
  const actual = mesActual()
  const pagadas = Object.keys(cuotas).length

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <div className="grid grid-cols-12 gap-0.5 sm:gap-1">
        {MESES_CORTOS.map((nombre, i) => {
          const m = `${anio}-${String(i + 1).padStart(2, '0')}`
          const cuota = cuotas[m]
          const futuro = m > actual
          const titulo = cuota
            ? `${nombre}: pagada el ${fechaCorta(cuota.fecha_pago)}${cuota.monto != null ? ` · ${formatMoneda(cuota.monto)}` : ''}`
            : `${nombre}: ${futuro ? 'aún no vence' : 'pendiente'}`
          return (
            <button
              key={m}
              type="button"
              title={titulo}
              aria-label={titulo}
              onClick={() => onElegirMes(m)}
              className={`flex h-7 items-center justify-center rounded text-[10px] font-semibold uppercase transition-colors ${
                cuota
                  ? 'bg-emerald-500 text-white hover:bg-emerald-600'
                  : futuro
                    ? 'border border-dashed border-slate-200 text-slate-300 hover:bg-slate-50'
                    : 'bg-rose-50 text-rose-400 ring-1 ring-inset ring-rose-200 hover:bg-rose-100'
              } ${m === mesElegido ? 'outline-2 outline-offset-1 outline-navy-900' : ''}`}
            >
              {nombre[0]}
            </button>
          )
        })}
      </div>
      <p className="text-xs text-slate-500">
        <strong className="font-semibold text-navy-900">{pagadas}</strong> de 12 cuotas en {anio}
      </p>
    </div>
  )
}
