import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import {
  DIAS_SEMANA,
  MESES_CORTOS,
  diasDeLaGrilla,
  fechaLarga,
  fueraDeRango,
  hoy,
  nombreMes,
  sumarDias,
  sumarMeses,
  sumarMesesAMes,
} from './fechas'
import { botonNav, celdaGrande } from './estilos'

type Vista = 'dias' | 'meses' | 'anios'

interface Props {
  valor: string | null
  onElegir: (iso: string) => void
  min?: string
  max?: string
}

/** Calendario de días con vistas rápidas de meses y años, y navegación con teclado */
export function Calendario({ valor, onElegir, min, max }: Props) {
  const inicial = valor ?? (max && hoy() > max ? max : min && hoy() < min ? min : hoy())
  const [enfoque, setEnfoque] = useState(inicial)
  const [vista, setVista] = useState<Vista>('dias')
  const [usandoTeclado, setUsandoTeclado] = useState(false)
  const grilla = useRef<HTMLDivElement>(null)

  const mes = enfoque.slice(0, 7)
  const anio = Number(enfoque.slice(0, 4))
  const dias = diasDeLaGrilla(mes)
  const hoyISO = hoy()

  // Al abrir, el foco va al día seleccionado (o a hoy) para poder usar el teclado
  useEffect(() => {
    grilla.current?.querySelector<HTMLButtonElement>(`[data-fecha="${enfoque}"]`)?.focus({ preventScroll: true })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (usandoTeclado) grilla.current?.querySelector<HTMLButtonElement>(`[data-fecha="${enfoque}"]`)?.focus()
  }, [enfoque, usandoTeclado])

  function mover(e: KeyboardEvent) {
    const pasos: Record<string, () => string> = {
      ArrowLeft: () => sumarDias(enfoque, -1),
      ArrowRight: () => sumarDias(enfoque, 1),
      ArrowUp: () => sumarDias(enfoque, -7),
      ArrowDown: () => sumarDias(enfoque, 7),
      PageUp: () => sumarMeses(enfoque, e.shiftKey ? -12 : -1),
      PageDown: () => sumarMeses(enfoque, e.shiftKey ? 12 : 1),
      Home: () => sumarDias(enfoque, -((new Date(`${enfoque}T00:00`).getDay() + 6) % 7)),
      End: () => sumarDias(enfoque, 6 - ((new Date(`${enfoque}T00:00`).getDay() + 6) % 7)),
    }
    const paso = pasos[e.key]
    if (!paso) return
    e.preventDefault()
    setUsandoTeclado(true)
    setEnfoque(paso())
  }

  const mesAnteriorBloqueado = !!min && sumarMesesAMes(mes, -1) < min.slice(0, 7)
  const mesSiguienteBloqueado = !!max && sumarMesesAMes(mes, 1) > max.slice(0, 7)

  if (vista === 'meses' || vista === 'anios') {
    const inicioDecada = anio - (anio % 12)
    return (
      <div>
        <div className="mb-2 flex items-center justify-between">
          <button
            type="button"
            className={botonNav}
            aria-label={vista === 'meses' ? 'Año anterior' : 'Años anteriores'}
            onClick={() => setEnfoque(sumarMeses(enfoque, vista === 'meses' ? -12 : -144))}
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            type="button"
            className="rounded-lg px-3 py-1.5 text-sm font-semibold text-navy-900 hover:bg-slate-100"
            onClick={() => setVista(vista === 'meses' ? 'anios' : 'dias')}
          >
            {vista === 'meses' ? anio : `${inicioDecada} – ${inicioDecada + 11}`}
          </button>
          <button
            type="button"
            className={botonNav}
            aria-label={vista === 'meses' ? 'Año siguiente' : 'Años siguientes'}
            onClick={() => setEnfoque(sumarMeses(enfoque, vista === 'meses' ? 12 : 144))}
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
        <div className="grid grid-cols-3 gap-1.5">
          {vista === 'meses'
            ? MESES_CORTOS.map((nombre, i) => {
                const m = `${anio}-${String(i + 1).padStart(2, '0')}`
                const activo = valor?.startsWith(m)
                const bloqueado = fueraDeRango(m, min?.slice(0, 7), max?.slice(0, 7))
                return (
                  <button
                    key={m}
                    type="button"
                    disabled={bloqueado}
                    onClick={() => {
                      setEnfoque(sumarMeses(enfoque, (i - Number(enfoque.slice(5, 7)) + 1)))
                      setVista('dias')
                    }}
                    className={celdaGrande(!!activo, hoyISO.startsWith(m))}
                  >
                    {nombre}
                  </button>
                )
              })
            : Array.from({ length: 12 }, (_, i) => inicioDecada + i).map((a) => (
                <button
                  key={a}
                  type="button"
                  disabled={fueraDeRango(String(a), min?.slice(0, 4), max?.slice(0, 4))}
                  onClick={() => {
                    setEnfoque(sumarMeses(enfoque, (a - anio) * 12))
                    setVista('meses')
                  }}
                  className={celdaGrande(valor?.startsWith(String(a)) ?? false, hoyISO.startsWith(String(a)))}
                >
                  {a}
                </button>
              ))}
        </div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-2 flex items-center justify-between">
        <button
          type="button"
          className={botonNav}
          aria-label="Mes anterior"
          disabled={mesAnteriorBloqueado}
          onClick={() => setEnfoque(sumarMeses(enfoque, -1))}
        >
          <ChevronLeft className="h-4 w-4" />
        </button>
        <button
          type="button"
          className="rounded-lg px-3 py-1.5 text-sm font-semibold capitalize text-navy-900 hover:bg-slate-100"
          onClick={() => setVista('meses')}
          aria-label="Elegir mes y año"
        >
          {nombreMes(mes)}
        </button>
        <button
          type="button"
          className={botonNav}
          aria-label="Mes siguiente"
          disabled={mesSiguienteBloqueado}
          onClick={() => setEnfoque(sumarMeses(enfoque, 1))}
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>

      <div className="grid grid-cols-7 pb-1" aria-hidden>
        {DIAS_SEMANA.map((d) => (
          <span key={d} className="text-center text-[11px] font-semibold uppercase tracking-wide text-slate-400">
            {d}
          </span>
        ))}
      </div>

      <div ref={grilla} role="grid" className="grid grid-cols-7 gap-y-0.5" onKeyDown={mover}>
        {dias.map((d) => {
          const delMes = d.startsWith(mes)
          const seleccionado = d === valor
          const esHoy = d === hoyISO
          const bloqueado = fueraDeRango(d, min, max)
          return (
            <button
              key={d}
              type="button"
              role="gridcell"
              data-fecha={d}
              tabIndex={d === enfoque ? 0 : -1}
              disabled={bloqueado}
              aria-selected={seleccionado}
              aria-label={fechaLarga(d)}
              onClick={() => onElegir(d)}
              className={`relative mx-auto flex h-10 w-10 items-center justify-center rounded-full text-sm tabular-nums transition-colors outline-none focus-visible:ring-2 focus-visible:ring-primary-500 focus-visible:ring-offset-1 disabled:pointer-events-none disabled:text-slate-300 sm:h-9 sm:w-9 ${
                seleccionado
                  ? 'bg-primary-600 font-semibold text-white shadow-sm hover:bg-primary-700'
                  : esHoy
                    ? 'font-semibold text-primary-700 ring-1 ring-inset ring-primary-300 hover:bg-primary-50'
                    : delMes
                      ? 'text-slate-700 hover:bg-slate-100'
                      : 'text-slate-400 hover:bg-slate-50'
              }`}
            >
              {Number(d.slice(8))}
            </button>
          )
        })}
      </div>
    </div>
  )
}
