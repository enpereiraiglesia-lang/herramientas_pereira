import { useState, type FormEvent } from 'react'
import {
  ArrowLeft,
  CalendarCheck2,
  CircleAlert,
  ChevronLeft,
  ChevronRight,
  HandCoins,
  Mail,
  MessageCircle,
  Pencil,
  Phone,
  Undo2,
  Wallet,
} from 'lucide-react'
import { Alert } from '../../../components/ui/Alert'
import { Avatar } from '../../../components/ui/Avatar'
import { Button } from '../../../components/ui/Button'
import { Drawer } from '../../../components/ui/Drawer'
import { inputClass } from '../../../components/ui/Field'
import { MESES_CORTOS, fechaCorta, mesActual, nombreMes } from '../../../components/ui/calendario/fechas'
import { formatMoneda, linkWhatsApp, telefonoLimpio } from '../../../lib/format'
import { armarMensaje } from '../mensaje'
import type { Cuota, CuotaInput, InversionistaConEstado } from '../types'
import { CuotaForm } from './CuotaForm'

interface Props {
  persona: InversionistaConEstado
  /** Mes elegido en el módulo (AAAA-MM); define el año que se muestra */
  mes: string
  plantilla: string
  guardando: boolean
  error: string | null
  limpiarError: () => void
  onCambiarAnio: (anio: number) => void
  onDefinirCuota: (monto: number | null) => Promise<boolean>
  onGuardarCuota: (input: CuotaInput, existente: Cuota | null) => Promise<boolean>
  onAnular: (id: string) => Promise<boolean>
  onCerrar: () => void
}

type Vista = { tipo: 'detalle' } | { tipo: 'cuota'; mes: string; cuota: Cuota | null }

/** Campo de dinero con separador de miles */
function CuotaPactada({
  valor,
  sugerido,
  guardando,
  onGuardar,
}: {
  valor: number | null
  sugerido: number | null
  guardando: boolean
  onGuardar: (monto: number | null) => Promise<boolean>
}) {
  const [editando, setEditando] = useState(valor == null)
  const [texto, setTexto] = useState(valor != null ? String(valor) : sugerido != null ? String(sugerido) : '')
  const numero = Number(texto.replace(/\D/g, '')) || 0

  async function guardar(e: FormEvent) {
    e.preventDefault()
    if (await onGuardar(texto ? numero : null)) setEditando(false)
  }

  return (
    <section className="rounded-xl border border-primary-200 bg-primary-50/50 p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-sm font-semibold text-navy-900">
          <Wallet className="h-4 w-4 text-primary-600" />
          Cuota mensual pactada
        </div>
        {!editando && (
          <button
            type="button"
            onClick={() => setEditando(true)}
            className="-mt-1 -mr-1 flex min-h-9 items-center gap-1.5 rounded-lg px-2 text-sm font-medium text-primary-700 hover:bg-primary-100"
          >
            <Pencil className="h-3.5 w-3.5" />
            Cambiar
          </button>
        )}
      </div>

      {editando ? (
        <form onSubmit={guardar} className="mt-3 flex flex-col gap-2">
          <div className="flex gap-2">
            <div className="relative flex-1">
              <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">$</span>
              <input
                autoFocus
                inputMode="numeric"
                aria-label="Cuota mensual"
                placeholder="0"
                value={numero ? numero.toLocaleString('es-CO') : texto}
                onChange={(e) => setTexto(e.target.value.replace(/\D/g, ''))}
                className={`${inputClass} pl-7 text-lg font-semibold tabular-nums`}
              />
            </div>
            <Button type="submit" loading={guardando}>
              Guardar
            </Button>
          </div>
          <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
            {sugerido != null && valor == null ? (
              <span className="text-slate-500">Sugerida según su último pago: {formatMoneda(sugerido)}</span>
            ) : (
              <span className="text-slate-500">Se usará como monto al registrar sus cuotas.</span>
            )}
            {valor != null && (
              <span className="flex gap-3">
                <button
                  type="button"
                  className="font-medium text-rose-600 hover:underline"
                  onClick={async () => {
                    if (await onGuardar(null)) setTexto('')
                  }}
                >
                  Quitar cuota
                </button>
                <button type="button" className="font-medium text-slate-500 hover:underline" onClick={() => setEditando(false)}>
                  Cancelar
                </button>
              </span>
            )}
          </div>
        </form>
      ) : (
        <p className="mt-1 text-3xl font-semibold tabular-nums text-navy-900">
          {formatMoneda(valor)}
          <span className="text-base font-medium text-slate-400"> / mes</span>
        </p>
      )}
    </section>
  )
}

/** Detalle del inversionista: cuota pactada, estado de cada mes del año e historial */
export function DetalleInversionista({
  persona: p,
  mes,
  plantilla,
  guardando,
  error,
  limpiarError,
  onCambiarAnio,
  onDefinirCuota,
  onGuardarCuota,
  onAnular,
  onCerrar,
}: Props) {
  const [vista, setVista] = useState<Vista>({ tipo: 'detalle' })
  const anio = Number(mes.slice(0, 4))
  const actual = mesActual()

  const meses = MESES_CORTOS.map((nombre, i) => {
    const m = `${anio}-${String(i + 1).padStart(2, '0')}`
    return { m, nombre, cuota: p.cuotasDelAnio[m] ?? null, vencido: m <= actual }
  })
  const pagadas = meses.filter((x) => x.cuota)
  const vencidosSinPago = meses.filter((x) => x.vencido && !x.cuota)
  const aportado = pagadas.reduce((s, x) => s + (x.cuota?.monto ?? 0), 0)
  const deuda = p.cuota_mensual != null ? vencidosSinPago.length * p.cuota_mensual : null
  const historial = [...pagadas].sort((a, b) => b.m.localeCompare(a.m))

  function abrirCuota(m: string, cuota: Cuota | null) {
    limpiarError()
    setVista({ tipo: 'cuota', mes: m, cuota })
  }

  async function anular(c: Cuota) {
    if (confirm(`¿Anular la cuota de ${nombreMes(c.periodo.slice(0, 7))}?`)) await onAnular(c.id)
  }

  const mesPendiente = vencidosSinPago.at(-1)?.m ?? mes

  return (
    <Drawer abierto titulo={p.nombre} subtitulo="Inversionista del Reino" onCerrar={onCerrar}>
      {vista.tipo === 'cuota' ? (
        <div className="flex flex-col gap-4">
          <button
            type="button"
            onClick={() => setVista({ tipo: 'detalle' })}
            className="-ml-2 inline-flex min-h-11 items-center gap-1.5 self-start rounded-lg px-2 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-navy-900"
          >
            <ArrowLeft className="h-4 w-4" />
            Volver al detalle
          </button>
          <h3 className="text-base font-semibold text-navy-900">
            {vista.cuota ? 'Editar cuota' : 'Registrar cuota'} de <span className="capitalize">{nombreMes(vista.mes)}</span>
          </h3>
          <CuotaForm
            key={`${vista.mes}-${vista.cuota?.id ?? 'nueva'}`}
            miembroId={p.id}
            mesInicial={vista.mes}
            inicial={vista.cuota}
            montoSugerido={p.cuota_mensual ?? p.ultimoMonto}
            guardando={guardando}
            error={error}
            onSubmit={async (input) => {
              const ok = await onGuardarCuota(input, vista.cuota)
              if (ok) setVista({ tipo: 'detalle' })
              return ok
            }}
            onCancel={() => setVista({ tipo: 'detalle' })}
          />
        </div>
      ) : (
        <div className="flex flex-col gap-5">
          {error && <Alert>{error}</Alert>}

          {/* Contacto */}
          <div className="flex items-center gap-3">
            <Avatar nombre={p.nombre} />
            <div className="min-w-0 flex-1 text-sm">
              {p.celular ? (
                <a href={`tel:${telefonoLimpio(p.celular)}`} className="flex items-center gap-1.5 text-slate-700 hover:text-primary-700">
                  <Phone className="h-3.5 w-3.5 text-slate-400" />
                  {p.celular}
                </a>
              ) : (
                <p className="text-slate-400">Sin celular</p>
              )}
              {p.correo && (
                <a href={`mailto:${p.correo}`} className="flex min-w-0 items-center gap-1.5 text-slate-700 hover:text-primary-700">
                  <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <span className="truncate">{p.correo}</span>
                </a>
              )}
            </div>
            {p.celular && vencidosSinPago.length > 0 && (
              <a
                href={linkWhatsApp(p.celular, armarMensaje(plantilla, p.nombre, nombreMes(mesPendiente)))}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg bg-emerald-50 px-3 text-sm font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20 hover:bg-emerald-100"
              >
                <MessageCircle className="h-4 w-4" />
                Recordar
              </a>
            )}
          </div>

          <CuotaPactada
            key={String(p.cuota_mensual)}
            valor={p.cuota_mensual}
            sugerido={p.ultimoMonto}
            guardando={guardando}
            onGuardar={onDefinirCuota}
          />

          {/* Año */}
          <section className="flex flex-col gap-3">
            <div className="flex items-center justify-between">
              <h3 className="text-base font-semibold text-navy-900">Cuotas de {anio}</h3>
              <div className="flex items-center">
                <button
                  type="button"
                  aria-label="Año anterior"
                  onClick={() => onCambiarAnio(anio - 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  aria-label="Año siguiente"
                  onClick={() => onCambiarAnio(anio + 1)}
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-3 gap-2">
              <div className="rounded-xl bg-emerald-50 p-3">
                <CalendarCheck2 className="h-4 w-4 text-emerald-600" />
                <p className="mt-1 text-xl font-semibold tabular-nums text-navy-900">{pagadas.length}</p>
                <p className="text-[11px] text-slate-600">cuotas pagadas</p>
              </div>
              <div className="rounded-xl bg-primary-50 p-3">
                <HandCoins className="h-4 w-4 text-primary-600" />
                <p className="mt-1 truncate text-xl font-semibold tabular-nums text-navy-900">{formatMoneda(aportado)}</p>
                <p className="text-[11px] text-slate-600">aportado</p>
              </div>
              <div className={`rounded-xl p-3 ${vencidosSinPago.length ? 'bg-amber-50' : 'bg-slate-50'}`}>
                <CircleAlert className={`h-4 w-4 ${vencidosSinPago.length ? 'text-amber-600' : 'text-slate-400'}`} />
                <p className="mt-1 text-xl font-semibold tabular-nums text-navy-900">{vencidosSinPago.length}</p>
                <p className="text-[11px] text-slate-600">
                  {deuda ? `pendientes · ${formatMoneda(deuda)}` : 'meses pendientes'}
                </p>
              </div>
            </div>

            {/* 12 meses */}
            <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {meses.map(({ m, nombre, cuota, vencido }) => (
                <li key={m}>
                  <button
                    type="button"
                    onClick={() => abrirCuota(m, cuota)}
                    title={cuota ? 'Editar cuota' : 'Registrar cuota'}
                    className={`flex w-full flex-col items-start rounded-xl px-3 py-2 text-left ring-1 ring-inset transition-colors ${
                      cuota
                        ? 'bg-emerald-50 ring-emerald-200 hover:bg-emerald-100'
                        : vencido
                          ? 'bg-white ring-rose-200 hover:bg-rose-50'
                          : 'border border-dashed border-slate-300 bg-white ring-transparent hover:bg-slate-50'
                    } ${m === mes ? 'outline-2 outline-offset-1 outline-navy-900' : ''}`}
                  >
                    <span className="text-xs font-semibold uppercase text-slate-500">{nombre}</span>
                    <span
                      className={`text-sm font-semibold tabular-nums ${
                        cuota ? 'text-emerald-700' : vencido ? 'text-rose-600' : 'text-slate-400'
                      }`}
                    >
                      {cuota ? (cuota.monto != null ? formatMoneda(cuota.monto) : 'Pagada') : vencido ? 'Pendiente' : '—'}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
            <p className="text-xs text-slate-500">Toca un mes para registrar o editar su cuota.</p>
          </section>

          {/* Historial */}
          <section className="flex flex-col gap-2">
            <h3 className="text-base font-semibold text-navy-900">Historial de pagos</h3>
            {historial.length === 0 ? (
              <p className="rounded-lg border border-dashed border-slate-300 px-4 py-6 text-center text-sm text-slate-500">
                No hay pagos registrados en {anio}.
              </p>
            ) : (
              <ul className="divide-y divide-slate-100 rounded-xl border border-slate-200">
                {historial.map(({ m, cuota }) =>
                  cuota ? (
                    <li key={m} className="flex items-center gap-3 px-3 py-2.5">
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium capitalize text-navy-900">{nombreMes(m)}</p>
                        <p className="truncate text-xs text-slate-500">
                          Pagó el {fechaCorta(cuota.fecha_pago)}
                          {cuota.notas && ` · ${cuota.notas}`}
                        </p>
                      </div>
                      <span className="text-sm font-semibold tabular-nums text-navy-900">{formatMoneda(cuota.monto)}</span>
                      <button
                        type="button"
                        onClick={() => abrirCuota(m, cuota)}
                        aria-label={`Editar cuota de ${nombreMes(m)}`}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => anular(cuota)}
                        aria-label={`Anular cuota de ${nombreMes(m)}`}
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-rose-600 hover:bg-rose-50"
                      >
                        <Undo2 className="h-4 w-4" />
                      </button>
                    </li>
                  ) : null
                )}
              </ul>
            )}
          </section>
        </div>
      )}
    </Drawer>
  )
}
