import { Minus, Plus } from 'lucide-react'
import { METRICAS, type Metas } from '../types'

interface Props {
  metas: Metas
  onChange: (metas: Metas) => void
}

/** Cuatro campos numéricos para las metas, con botones +/- cómodos en celular */
export function MetasCampos({ metas, onChange }: Props) {
  const boton =
    'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-slate-600 ring-1 ring-inset ring-slate-300 hover:bg-slate-50 active:scale-95'
  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
      {METRICAS.map((m) => {
        const clave = `meta_${m.clave}` as const
        const valor = metas[clave]
        const Icono = m.icono
        return (
          <div key={m.clave} className="flex flex-col gap-1.5">
            <label htmlFor={clave} className="flex items-center gap-1.5 text-sm font-medium text-navy-900">
              <Icono className={`h-4 w-4 ${m.color.texto}`} />
              Meta de {m.label.toLowerCase()}
            </label>
            <div className="flex items-center gap-1.5">
              <button type="button" className={boton} aria-label="Restar" onClick={() => onChange({ ...metas, [clave]: Math.max(0, valor - 1) })}>
                <Minus className="h-4 w-4" />
              </button>
              <input
                id={clave}
                type="number"
                inputMode="numeric"
                min={0}
                value={valor}
                onFocus={(e) => e.target.select()}
                onChange={(e) => onChange({ ...metas, [clave]: Math.max(0, Number(e.target.value.replace(/\D/g, '')) || 0) })}
                className="h-11 w-full min-w-0 rounded-lg border-0 bg-white text-center text-base font-semibold tabular-nums text-navy-900 shadow-xs ring-1 ring-inset ring-slate-300 outline-none [appearance:textfield] focus:ring-2 focus:ring-primary-600 [&::-webkit-inner-spin-button]:appearance-none"
              />
              <button type="button" className={boton} aria-label="Sumar" onClick={() => onChange({ ...metas, [clave]: valor + 1 })}>
                <Plus className="h-4 w-4" />
              </button>
            </div>
          </div>
        )
      })}
    </div>
  )
}
