import { METRICAS, porcentaje, type Totales } from '../types'

/** Tarjetas con logro vs. meta de las cuatro métricas */
export function ResumenMetricas({ totales, compacto = false }: { totales: Totales; compacto?: boolean }) {
  return (
    <div className={`grid gap-3 ${compacto ? 'grid-cols-2' : 'grid-cols-2 xl:grid-cols-4'}`}>
      {METRICAS.map((m) => {
        const { meta, logro } = totales[m.clave]
        const pct = porcentaje(logro, meta)
        const Icono = m.icono
        return (
          <div key={m.clave} className="rounded-xl border border-slate-200/80 bg-white p-3 shadow-xs sm:p-4">
            <div className="flex items-center gap-2">
              <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${m.color.suave} ${m.color.texto}`}>
                <Icono className="h-4 w-4" />
              </span>
              <p className="min-w-0 truncate text-xs font-medium text-slate-500 sm:text-sm">{m.label}</p>
            </div>
            <p className="mt-2 text-2xl font-semibold tabular-nums text-navy-900">
              {logro}
              <span className="text-sm font-medium text-slate-400"> / {meta}</span>
            </p>
            <div className="mt-2 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-slate-100">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${pct >= 100 ? 'bg-emerald-500' : m.color.barra}`}
                  style={{ width: `${Math.min(pct, 100)}%` }}
                />
              </div>
              <span className={`text-xs font-semibold tabular-nums ${pct >= 100 ? 'text-emerald-600' : 'text-slate-500'}`}>
                {pct}%
              </span>
            </div>
          </div>
        )
      })}
    </div>
  )
}

/** Barra de avance general (0–100) */
export function BarraAvance({ valor, className = '' }: { valor: number | null; className?: string }) {
  const v = valor ?? 0
  return (
    <div className={`flex items-center gap-2 ${className}`}>
      <div className="h-2 flex-1 overflow-hidden rounded-full bg-slate-100">
        <div
          className={`h-full rounded-full transition-all duration-500 ${v >= 100 ? 'bg-emerald-500' : 'bg-primary-600'}`}
          style={{ width: `${Math.min(v, 100)}%` }}
        />
      </div>
      <span className="w-10 text-right text-xs font-semibold tabular-nums text-slate-600">
        {valor == null ? '—' : `${v}%`}
      </span>
    </div>
  )
}
