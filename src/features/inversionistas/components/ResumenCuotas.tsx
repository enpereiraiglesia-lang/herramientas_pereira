import { CircleCheck, CircleDashed, HandCoins, Layers, type LucideIcon } from 'lucide-react'
import { nombreMes } from '../../../components/ui/calendario/fechas'
import { formatMoneda } from '../../../lib/format'

interface Props {
  mes: string
  total: number
  pagadas: number
  recaudadoMes: number
  cuotasAnio: number
  recaudadoAnio: number
}

function Tarjeta({
  Icono,
  tono,
  titulo,
  valor,
  detalle,
}: {
  Icono: LucideIcon
  tono: string
  titulo: string
  valor: string
  detalle: string
}) {
  return (
    <div className="flex items-start gap-3 rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs">
      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${tono}`}>
        <Icono className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-medium uppercase tracking-wide text-slate-500">{titulo}</p>
        <p className="mt-0.5 truncate text-2xl font-semibold tabular-nums text-navy-900">{valor}</p>
        <p className="truncate text-xs text-slate-500 first-letter:uppercase">{detalle}</p>
      </div>
    </div>
  )
}

/** Totales del mes y del año, con barra de avance del recaudo */
export function ResumenCuotas({ mes, total, pagadas, recaudadoMes, cuotasAnio, recaudadoAnio }: Props) {
  const faltan = Math.max(total - pagadas, 0)
  const avance = total ? Math.round((pagadas / total) * 100) : 0
  const mesTexto = nombreMes(mes)

  return (
    <section className="mb-6 flex flex-col gap-3">
      <div className="rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs sm:p-5">
        <div className="flex flex-wrap items-end justify-between gap-2">
          <div>
            <p className="text-sm text-slate-500">
              Recaudo de <span className="font-medium capitalize text-navy-900">{mesTexto}</span>
            </p>
            <p className="mt-1 text-3xl font-semibold tabular-nums text-navy-900">
              {pagadas}
              <span className="text-lg font-medium text-slate-400"> / {total} cuotas</span>
            </p>
          </div>
          <span
            className={`rounded-full px-3 py-1 text-sm font-semibold tabular-nums ${
              avance === 100 ? 'bg-emerald-50 text-emerald-700' : 'bg-primary-50 text-primary-700'
            }`}
          >
            {avance}%
          </span>
        </div>
        <div
          className="mt-3 h-2.5 overflow-hidden rounded-full bg-slate-100"
          role="progressbar"
          aria-valuenow={avance}
          aria-valuemin={0}
          aria-valuemax={100}
          aria-label="Avance del recaudo"
        >
          <div
            className={`h-full rounded-full transition-all duration-500 ${avance === 100 ? 'bg-emerald-500' : 'bg-primary-600'}`}
            style={{ width: `${avance}%` }}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Tarjeta
          Icono={CircleCheck}
          tono="bg-emerald-50 text-emerald-600"
          titulo="Cuotas recaudadas"
          valor={String(pagadas)}
          detalle={`de ${total} inversionista${total === 1 ? '' : 's'}`}
        />
        <Tarjeta
          Icono={CircleDashed}
          tono="bg-amber-50 text-amber-600"
          titulo="Faltan por pagar"
          valor={String(faltan)}
          detalle={faltan ? 'Envíales un recordatorio' : '¡Todos al día!'}
        />
        <Tarjeta
          Icono={HandCoins}
          tono="bg-primary-50 text-primary-600"
          titulo="Recaudado en el mes"
          valor={formatMoneda(recaudadoMes)}
          detalle={mesTexto}
        />
        <Tarjeta
          Icono={Layers}
          tono="bg-navy-50 text-navy-700"
          titulo={`Cuotas en ${mes.slice(0, 4)}`}
          valor={String(cuotasAnio)}
          detalle={`${formatMoneda(recaudadoAnio)} en el año`}
        />
      </div>
    </section>
  )
}
