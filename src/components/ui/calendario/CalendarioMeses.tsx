import { useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { botonNav, celdaGrande } from './estilos'
import { MESES_CORTOS, fueraDeRango, mesActual } from './fechas'

export type MarcaMes = 'completo' | 'parcial' | 'vacio'

interface Props {
  /** Mes elegido en formato AAAA-MM */
  valor: string | null
  onElegir: (mes: string) => void
  min?: string
  max?: string
  /** Indicador opcional por mes (por ejemplo, el estado de recaudo) */
  marcas?: Record<string, MarcaMes>
}

const COLOR_MARCA: Record<MarcaMes, string> = {
  completo: 'bg-emerald-500',
  parcial: 'bg-amber-400',
  vacio: 'bg-slate-300',
}

/** Selector de mes: navegación por año y grilla de 12 meses */
export function CalendarioMeses({ valor, onElegir, min, max, marcas }: Props) {
  const [anio, setAnio] = useState(Number((valor ?? mesActual()).slice(0, 4)))
  const actual = mesActual()

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          className={botonNav}
          aria-label="Año anterior"
          disabled={!!min && anio - 1 < Number(min.slice(0, 4))}
          onClick={() => setAnio(anio - 1)}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <span className="text-sm font-semibold text-navy-900">{anio}</span>
        <button
          type="button"
          className={botonNav}
          aria-label="Año siguiente"
          disabled={!!max && anio + 1 > Number(max.slice(0, 4))}
          onClick={() => setAnio(anio + 1)}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
      <div className="grid grid-cols-3 gap-1.5">
        {MESES_CORTOS.map((nombre, i) => {
          const m = `${anio}-${String(i + 1).padStart(2, '0')}`
          const marca = marcas?.[m]
          return (
            <button
              key={m}
              type="button"
              disabled={fueraDeRango(m, min, max)}
              onClick={() => onElegir(m)}
              aria-pressed={m === valor}
              className={`relative ${celdaGrande(m === valor, m === actual)}`}
            >
              {nombre}
              {marca && (
                <span
                  className={`absolute bottom-1.5 left-1/2 h-1 w-1 -translate-x-1/2 rounded-full ${
                    m === valor ? 'bg-white' : COLOR_MARCA[marca]
                  }`}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
