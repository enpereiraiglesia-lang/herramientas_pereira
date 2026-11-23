import { useEffect, useRef, useState } from 'react'
import { AlertCircle, Check, Loader2, Minus, Plus, Target, UserMinus } from 'lucide-react'
import { Avatar } from '../../../components/ui/Avatar'
import { Button } from '../../../components/ui/Button'
import { METRICAS, avanceGeneral, porcentaje, totales, type IntegranteConMiembro, type Logros, type Metrica } from '../types'
import { BarraAvance } from './ResumenMetricas'

type Estado = 'listo' | 'pendiente' | 'guardando' | 'guardado' | 'error'

interface Props {
  integrante: IntegranteConMiembro
  onGuardar: (cambios: Partial<Logros>) => Promise<unknown>
  onEditarMetas: () => void
  onQuitar: () => void
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
    'flex h-11 w-11 shrink-0 items-center justify-center rounded-lg bg-white text-slate-600 shadow-xs ring-1 ring-inset ring-slate-300 transition-colors active:scale-95 hover:bg-slate-50 disabled:opacity-40'

  return (
    <div className={`flex flex-col gap-2 rounded-xl p-3 ${cumplida ? 'bg-emerald-50 ring-1 ring-emerald-200' : 'bg-slate-50'}`}>
      <div className="flex items-center justify-between gap-2">
        <span className="flex min-w-0 items-center gap-1.5 text-xs font-medium text-slate-600">
          <Icono className={`h-3.5 w-3.5 shrink-0 ${metrica.color.texto}`} />
          <span className="truncate">{metrica.label}</span>
        </span>
        {cumplida && <Check className="h-4 w-4 shrink-0 text-emerald-600" aria-label="Meta cumplida" />}
      </div>
      <div className="flex items-center gap-1.5">
        <button type="button" className={boton} onClick={() => onChange(Math.max(0, valor - 1))} disabled={valor <= 0} aria-label={`Restar ${metrica.label}`}>
          <Minus className="h-4 w-4" />
        </button>
        <input
          type="number"
          inputMode="numeric"
          min={0}
          value={valor}
          onFocus={(e) => e.target.select()}
          onChange={(e) => onChange(Math.max(0, Number(e.target.value.replace(/\D/g, '')) || 0))}
          aria-label={metrica.label}
          className="h-11 w-full min-w-0 rounded-lg border-0 bg-white text-center text-lg font-semibold tabular-nums text-navy-900 shadow-xs ring-1 ring-inset ring-slate-300 outline-none [appearance:textfield] focus:ring-2 focus:ring-primary-600 [&::-webkit-inner-spin-button]:appearance-none"
        />
        <button type="button" className={`${boton} !bg-primary-600 !text-white !ring-primary-600 hover:!bg-primary-700`} onClick={() => onChange(valor + 1)} aria-label={`Sumar ${metrica.label}`}>
          <Plus className="h-4 w-4" />
        </button>
      </div>
      <div className="flex items-center gap-2">
        <div className="h-1 flex-1 overflow-hidden rounded-full bg-slate-200">
          <div className={`h-full rounded-full ${cumplida ? 'bg-emerald-500' : metrica.color.barra}`} style={{ width: `${Math.min(pct, 100)}%` }} />
        </div>
        <span className="text-[11px] tabular-nums text-slate-500">
          meta <strong className="font-semibold text-navy-900">{meta}</strong>
        </span>
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
        No se guardó
      </span>
    )
  return null
}

/** Tarjeta de un integrante: contadores de logros que se guardan solos */
export function IntegranteTarjeta({ integrante: i, onGuardar, onEditarMetas, onQuitar }: Props) {
  const [logros, setLogros] = useState<Logros>({
    logro_kits: i.logro_kits,
    logro_casas: i.logro_casas,
    logro_referidos: i.logro_referidos,
    logro_contactos: i.logro_contactos,
  })
  const [estado, setEstado] = useState<Estado>('listo')
  const pendientes = useRef<Partial<Logros>>({})
  const temporizador = useRef<ReturnType<typeof setTimeout> | null>(null)
  const guardarRef = useRef(onGuardar)
  useEffect(() => {
    guardarRef.current = onGuardar
  }, [onGuardar])

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
      pendientes.current = { ...cambios, ...pendientes.current } // se reintenta en el próximo cambio
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

  const avance = avanceGeneral(totales([{ ...i, ...logros }]))
  const sinMetas = METRICAS.every((m) => i[`meta_${m.clave}`] === 0)

  return (
    <li className="rounded-xl border border-slate-200/80 bg-white shadow-xs">
      <header className="flex items-center gap-3 border-b border-slate-100 px-4 py-3">
        <Avatar nombre={i.miembro?.nombre ?? '?'} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-navy-900">{i.miembro?.nombre ?? 'Miembro'}</p>
          <div className="flex items-center gap-3">
            <BarraAvance valor={avance} className="w-32" />
            <IndicadorEstado estado={estado} />
          </div>
        </div>
        <Button variant="ghost" onClick={onEditarMetas} aria-label="Editar metas" title="Editar metas">
          <Target />
        </Button>
        <Button variant="ghost" onClick={onQuitar} aria-label={`Quitar a ${i.miembro?.nombre}`} title="Quitar del grupo">
          <UserMinus className="text-rose-600" />
        </Button>
      </header>
      {sinMetas && (
        <button
          type="button"
          onClick={onEditarMetas}
          className="mx-4 mt-3 flex w-[calc(100%-2rem)] items-center gap-2 rounded-lg bg-amber-50 px-3 py-2 text-left text-xs font-medium text-amber-800 hover:bg-amber-100"
        >
          <Target className="h-3.5 w-3.5" />
          Aún no tiene metas asignadas. Toca aquí para asignarlas.
        </button>
      )}
      <div className="grid grid-cols-1 gap-2 p-3 min-[420px]:grid-cols-2 xl:grid-cols-4">
        {METRICAS.map((m) => (
          <Contador
            key={m.clave}
            metrica={m}
            valor={logros[`logro_${m.clave}`]}
            meta={i[`meta_${m.clave}`]}
            onChange={(v) => cambiar(`logro_${m.clave}`, v)}
          />
        ))}
      </div>
    </li>
  )
}
