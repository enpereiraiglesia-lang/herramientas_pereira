import { CalendarRange, ChevronDown, ChevronLeft, ChevronRight } from 'lucide-react'
import { CalendarioMeses, type MarcaMes } from './calendario/CalendarioMeses'
import { mesActual, nombreMes, sumarMesesAMes } from './calendario/fechas'
import { Popover } from './calendario/Popover'

interface Props {
  /** Mes en formato AAAA-MM */
  mes: string
  onChange: (mes: string) => void
  marcas?: Record<string, MarcaMes>
}

const flecha =
  'flex h-11 w-11 items-center justify-center text-slate-500 transition-colors hover:bg-slate-50 hover:text-navy-900'

/** Control de barra de herramientas: ‹ Noviembre 2026 › con selector desplegable */
export function MesNavegador({ mes, onChange, marcas }: Props) {
  const esActual = mes === mesActual()
  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center rounded-lg bg-white shadow-xs ring-1 ring-inset ring-slate-300">
        <button type="button" className={`${flecha} rounded-l-lg`} aria-label="Mes anterior" onClick={() => onChange(sumarMesesAMes(mes, -1))}>
          <ChevronLeft className="h-4 w-4" />
        </button>
        <Popover
          etiqueta="Elegir mes"
          alinear="derecha"
          disparador={({ abierto, alternar }) => (
            <button
              type="button"
              data-disparador
              onClick={alternar}
              aria-expanded={abierto}
              className="flex min-h-11 min-w-40 items-center justify-center gap-2 border-x border-slate-200 px-3 text-sm font-semibold capitalize text-navy-900 hover:bg-slate-50"
            >
              <CalendarRange className="h-4 w-4 text-primary-600" />
              {nombreMes(mes)}
              <ChevronDown className={`h-3.5 w-3.5 text-slate-400 transition-transform ${abierto ? 'rotate-180' : ''}`} />
            </button>
          )}
        >
          {(cerrar) => (
            <>
              <CalendarioMeses
                valor={mes}
                marcas={marcas}
                onElegir={(m) => {
                  onChange(m)
                  cerrar()
                }}
              />
              {marcas && (
                <div className="mt-3 flex flex-wrap gap-x-3 gap-y-1 border-t border-slate-100 pt-3 text-xs text-slate-500">
                  <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-emerald-500" />Completo</span>
                  <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-amber-400" />Parcial</span>
                  <span className="flex items-center gap-1.5"><i className="h-2 w-2 rounded-full bg-slate-300" />Sin cuotas</span>
                </div>
              )}
            </>
          )}
        </Popover>
        <button type="button" className={`${flecha} rounded-r-lg`} aria-label="Mes siguiente" onClick={() => onChange(sumarMesesAMes(mes, 1))}>
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      {!esActual && (
        <button
          type="button"
          onClick={() => onChange(mesActual())}
          className="min-h-11 rounded-lg px-3 text-sm font-semibold text-primary-700 hover:bg-primary-50"
        >
          Este mes
        </button>
      )}
    </div>
  )
}
