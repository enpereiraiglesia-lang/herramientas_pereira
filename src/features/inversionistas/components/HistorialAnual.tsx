import { MESES_CORTOS, mesActual } from '../../../components/ui/calendario/fechas'
import { estadoDelMes, type ParticipacionConEstado } from '../types'

interface Props {
  anio: number
  mesElegido: string
  participaciones: ParticipacionConEstado[]
  onElegirMes: (mes: string) => void
}

const ESTILO = {
  al_dia: 'bg-emerald-500 text-white hover:bg-emerald-600',
  parcial: 'bg-amber-400 text-white hover:bg-amber-500',
  pendiente: 'bg-rose-50 text-rose-400 ring-1 ring-inset ring-rose-200 hover:bg-rose-100',
  futuro: 'border border-dashed border-slate-200 text-slate-300 hover:bg-slate-50',
}

/** 12 casillas (ene–dic): verde = todas sus participaciones pagas, ámbar = parcial, rojo = pendiente */
export function HistorialAnual({ anio, mesElegido, participaciones, onElegirMes }: Props) {
  const actual = mesActual()
  const total = participaciones.length
  const pagadasAnio = participaciones.reduce((s, p) => s + Object.keys(p.cuotasDelAnio).length, 0)

  return (
    <div className="flex min-w-0 flex-col gap-1">
      <div className="grid grid-cols-12 gap-0.5 sm:gap-1">
        {MESES_CORTOS.map((nombre, i) => {
          const m = `${anio}-${String(i + 1).padStart(2, '0')}`
          const estado = estadoDelMes(participaciones, m)
          const pagadas = participaciones.filter((p) => p.cuotasDelAnio[m]).length
          const futuro = m > actual && pagadas === 0
          const clase = futuro ? ESTILO.futuro : estado === 'sin_participacion' ? ESTILO.futuro : ESTILO[estado]
          const titulo = futuro
            ? `${nombre}: aún no vence`
            : total > 1
              ? `${nombre}: ${pagadas} de ${total} participaciones pagadas`
              : `${nombre}: ${pagadas ? 'pagada' : 'pendiente'}`
          return (
            <button
              key={m}
              type="button"
              title={titulo}
              aria-label={titulo}
              onClick={() => onElegirMes(m)}
              className={`flex h-7 items-center justify-center rounded text-[10px] font-semibold uppercase transition-colors ${clase} ${
                m === mesElegido ? 'outline-2 outline-offset-1 outline-navy-900' : ''
              }`}
            >
              {nombre[0]}
            </button>
          )
        })}
      </div>
      <p className="text-xs text-slate-500">
        <strong className="font-semibold text-navy-900">{pagadasAnio}</strong> de {12 * Math.max(total, 1)} cuotas en {anio}
      </p>
    </div>
  )
}
