import { useEffect, useRef, useState } from 'react'
import { AlertCircle, Check, Loader2, Minus, Plus, Target } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { METRICAS, avanceGeneral, porcentaje, totales, type Logros, type Metrica, type Metricas } from '../types'
import { BarraAvance } from './ResumenMetricas'

type Estado = 'listo' | 'pendiente' | 'guardando' | 'guardado' | 'error'

interface Props {
  /** Metas y logros actuales del equipo */
  valores: Metricas
  onGuardarLogros: (cambios: Partial<Logros>) => Promise<unknown>
  onEditarMetas: () => void
}

const ESPERA_MS = 700

function Contador({
  metrica,
  valor,
  meta,
  onChange,
}: {
  metrica: Metrica
  valor: number
  meta: number
  onChange: (v: number) => void
}) {
  const Icono = metrica.icono
  const pct = porcentaje(valor, meta)
  const cumplida = meta > 0 && valor >= meta
  const boton =
    'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl shadow-xs ring-1 ring-inset transition-colors active:scale-95 disabled:opacity-40'

  return (
    <div className={`flex flex-col gap-3 rounded-xl border p-4 ${cumplida ? 'border-emerald-200 bg-emerald-50/60' : 'border-slate-200 bg-white'}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-2 text-sm font-semibold text-navy-900">
          <span className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${metrica.color.suave} ${metrica.color.texto}`}>
            <Icono className="h-4 w-4" />
          </span>
          <span className="truncate">{metrica.label}</span>
        </span>
        {cumplida && (
          <span className="flex items-center gap-1 text-xs font-semibold text-emerald-700">
            <Check className="h-3.5 w-3.5" />
            Meta cumplida
          </span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          className={`${boton} bg-white text-slate-600 ring-slate-300 hover:bg-slate-50`}
          onClick={() => onChange(Math.max(0, valor - 1))}
          disabled={valor <= 0}
          aria-label={`Restar ${metrica.label}`}
        >
          <Minus className="h-5 w-5" />
        </button>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={valor}
          onFocus={(e) => e.target.select()}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value.replace(/\D/g, '')) || 0))}
          aria-label={`${metrica.label} alcanzados`}
          className="h-12 w-full min-w-0 rounded-xl border-0 bg-white text-center text-2xl font-bold tabular-nums text-navy-900 shadow-xs ring-1 ring-inset ring-slate-300 outline-none [appearance:textfield] focus:ring-2 focus:ring-primary-600 [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button
          type="button"
          className={`${boton} bg-primary-600 text-white ring-primary-600 hover:bg-primary-700`}
          onClick={() => onChange(valor + 1)}
          aria-label={`Sumar ${metrica.label}`}
        >
          <Plus className="h-5 w-5" />
        </button>
      </div>

      <div className="flex flex-col gap-1">
        <div className="flex items-center justify-between text-xs">
          <span className="text-slate-500">
            Meta inicial <strong className="font-semibold text-navy-900">{meta}</strong>
          </span>
          <span className={`font-semibold tabular-nums ${cumplida ? 'text-emerald-600' : 'text-slate-600'}`}>{pct}%</span>
        </div>
        <div className="h-1.5 overflow-hidden rounded-full bg-slate-100">
          <div
            className={`h-full rounded-full transition-all duration-300 ${cumplida ? 'bg-emerald-500' : metrica.color.barra}`}
            style={{ width: `${Math.min(pct, 100)}%` }}
          />
        </div>
      </div>
    </div>
  )
}

function IndicadorEstado({ estado }: { estado: Estado }) {
  if (estado === 'pendiente' || estado === 'guardando')
    return (
      <span className="flex items-center gap-1 text-xs text-slate-400">
        <Loader2 className="h-3 w-3 animate-spin" />
        Guardando…
      </span>
    )
  if (estado === 'guardado')
    return (
      <span className="flex items-center gap-1 text-xs text-emerald-600">
        <Check className="h-3 w-3" />
        Guardado
      </span>
    )
  if (estado === 'error')
    return (
      <span className="flex items-center gap-1 text-xs text-rose-600">
        <AlertCircle className="h-3 w-3" />
        No se guardó, intenta de nuevo
      </span>
    )
  return null
}

/** Resultados del equipo: contadores de lo alcanzado frente a la meta inicial (se guardan solos) */
export function MetasEquipo({ valores, onGuardarLogros, onEditarMetas }: Props) {
  const [logros, setLogros] = useState<Logros>({
    logro_kits: valores.logro_kits,
    logro_casas: valores.logro_casas,
    logro_referidos: valores.logro_referidos,
    logro_contactos: valores.logro_contactos,
  })
  const [estado, setEstado] = useState<Estado>('listo')
  const pendientes = useRef<Partial<Logros>>({})
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null)
  const guardarRef = useRef(onGuardarLogros)
  useEffect(() => {
    guardarRef.current = onGuardarLogros
  }, [onGuardarLogros])

  async function enviar() {
    const cambios = pendientes.current
    pendientes.current = {}
    temporizador.current = null
    if (!Object.keys(cambios).length) return
    setEstado('guardando')
    try {
      await guardarRef.current(cambios)
      setEstado((e) => (e === 'guardando' ? 'guardado' : e))
    } catch {
      pendientes.current = { ...cambios, ...pendientes.current } // se reintenta con el próximo cambio
      setEstado('error')
    }
  }

  // Si se sale de la pantalla con cambios pendientes, se guardan de una vez
  useEffect(
    () => () => {
      if (temporizador.current) {
        clearTimeout(temporizador.current)
        if (Object.keys(pendientes.current).length) void guardarRef.current(pendientes.current)
      }
    },
    []
  )

  function cambiar(clave: keyof Logros, valor: number) {
    setLogros((l) => ({ ...l, [clave]: valor }))
    pendientes.current = { ...pendientes.current, [clave]: valor }
    setEstado('pendiente')
    if (temporizador.current) clearTimeout(temporizador.current)
    temporizador.current = setTimeout(enviar, ESPERA_MS)
  }

  const actuales: Metricas = { ...valores, ...logros }
  const sinMetas = METRICAS.every((m) => valores[`meta_${m.clave}`] === 0)

  return (
    <section className="rounded-xl border border-slate-200/80 bg-white shadow-xs">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 px-4 py-3 sm:px-6">
        <div className="min-w-0">
          <h2 className="text-base font-semibold text-navy-900">Resultados del equipo</h2>
          <div className="mt-1 flex items-center gap-3">
            <BarraAvance valor={avanceGeneral(totales([actuales]))} className="w-40" />
            <IndicadorEstado estado={estado} />
          </div>
        </div>
        <Button variant="secondary" onClick={onEditarMetas}>
          <Target />
          Metas iniciales
        </Button>
      </header>

      <div className="flex flex-col gap-3 p-4 sm:p-6">
        {sinMetas && (
          <button
            type="button"
            onClick={onEditarMetas}
            className="flex items-center gap-2 rounded-lg bg-amber-50 px-3 py-2.5 text-left text-sm font-medium text-amber-800 hover:bg-amber-100"
          >
            <Target className="h-4 w-4 shrink-0" />
            El equipo aún no tiene metas iniciales. Toca aquí para definirlas.
          </button>
        )}
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          {METRICAS.map((m) => (
            <Contador
              key={m.clave}
              metrica={m}
              valor={logros[`logro_${m.clave}`]}
              meta={valores[`meta_${m.clave}`]}
              onChange={(v) => cambiar(`logro_${m.clave}`, v)}
            />
          ))}
        </div>
      </div>
    </section>
  )
}
