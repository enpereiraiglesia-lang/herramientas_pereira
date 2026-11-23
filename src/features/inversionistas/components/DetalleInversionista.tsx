import { useState, type FormEvent } from 'react'
import {
  ArrowLeft,
  CalendarCheck2,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  HandCoins,
  Mail,
  MapPin,
  MessageCircle,
  Pencil,
  Phone,
  Plus,
  Undo2,
  UserMinus,
  UserPen,
  Wallet,
  X,
} from 'lucide-react'
import { Alert } from '../../../components/ui/Alert'
import { Avatar } from '../../../components/ui/Avatar'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { DatePicker } from '../../../components/ui/DatePicker'
import { Drawer } from '../../../components/ui/Drawer'
import { Input } from '../../../components/ui/Input'
import { MESES_CORTOS, fechaCorta, mesActual, nombreMes } from '../../../components/ui/calendario/fechas'
import { formatMoneda, linkWhatsApp, telefonoLimpio } from '../../../lib/format'
import { COLOR_ICONO, ICONO_CATEGORIA } from '../estilos'
import { armarMensaje } from '../mensaje'
import type { DatosExterno } from '../services/inversionistasService'
import {
  CATEGORIAS,
  categoriaDe,
  type Cuota,
  type CuotaInput,
  type InversionistaConEstado,
  type ParticipacionConEstado,
  type ParticipacionInput,
} from '../types'
import { CampoCuota } from './AgregarInversionista'
import { CategoriaBadge, CategoriasPersona } from './CategoriaBadge'
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
  onGuardarCuota: (input: CuotaInput, existente: Cuota | null) => Promise<boolean>
  onAnular: (id: string) => Promise<boolean>
  onCrearParticipacion: (input: ParticipacionInput) => Promise<boolean>
  onActualizarParticipacion: (id: string, input: ParticipacionInput) => Promise<boolean>
  onFinalizarParticipacion: (id: string) => Promise<boolean>
  /** Solo para quienes no son miembros (sus datos no se editan en Miembros) */
  onActualizarExterno: (datos: Omit<DatosExterno, 'cuota' | 'fechaAporte'>) => Promise<boolean>
  onQuitar: () => Promise<boolean>
  onCerrar: () => void
}

type Vista =
  | { tipo: 'detalle' }
  | { tipo: 'cuota'; participacion: ParticipacionConEstado; mes: string; cuota: Cuota | null }
  | { tipo: 'participacion'; participacion: ParticipacionConEstado | null }
  | { tipo: 'datos' }

function Volver({ onClick }: { onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="-ml-2 inline-flex min-h-11 items-center gap-1.5 self-start rounded-lg px-2 text-sm font-medium text-slate-500 hover:bg-slate-100 hover:text-navy-900"
    >
      <ArrowLeft className="h-4 w-4" />
      Volver al detalle
    </button>
  )
}

/** Formulario de una participación: monto, fecha de aporte y nota */
function FormParticipacion({
  inicial,
  guardando,
  error,
  onGuardar,
  onCancelar,
}: {
  inicial: ParticipacionConEstado | null
  guardando: boolean
  error: string | null
  onGuardar: (input: ParticipacionInput) => Promise<boolean>
  onCancelar: () => void
}) {
  const [monto, setMonto] = useState(inicial ? String(inicial.monto) : '')
  const [fecha, setFecha] = useState<string | null>(inicial?.fecha_aporte ?? null)
  const categoria = monto ? categoriaDe(Number(monto)) : null

  async function enviar(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    await onGuardar({ monto: Number(monto) || 0, fecha_aporte: fecha, nota: String(f.get('p_nota') ?? '').trim() || null })
  }

  return (
    <form onSubmit={enviar} className="flex flex-col gap-4">
      {error && <Alert>{error}</Alert>}
      <CampoCuota valor={monto} onChange={setMonto} requerido />
      {categoria && (
        <p className="-mt-2 flex items-center gap-2 text-sm text-slate-600">
          Esta participación es <CategoriaBadge categoria={categoria} />
        </p>
      )}
      <DatePicker
        label="Fecha de aporte"
        name="p_fecha"
        value={fecha}
        onChange={setFecha}
        placeholder="Sin definir"
        ayuda="Día del mes en que hace este aporte."
      />
      <Input label="Nota" name="p_nota" placeholder="Ej: aporte para la obra misionera" defaultValue={inicial?.nota ?? ''} />
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button type="submit" loading={guardando}>
          {inicial ? 'Guardar cambios' : 'Agregar participación'}
        </Button>
      </div>
    </form>
  )
}

/** Detalle del inversionista: participaciones, estado de cada mes e historial */
export function DetalleInversionista({
  persona: p,
  mes,
  plantilla,
  guardando,
  error,
  limpiarError,
  onCambiarAnio,
  onGuardarCuota,
  onAnular,
  onCrearParticipacion,
  onActualizarParticipacion,
  onFinalizarParticipacion,
  onActualizarExterno,
  onQuitar,
  onCerrar,
}: Props) {
  const [vista, setVista] = useState<Vista>({ tipo: 'detalle' })
  const [elegidaId, setElegidaId] = useState<string | null>(null)
  const anio = Number(mes.slice(0, 4))
  const actual = mesActual()

  // Participación que se muestra en "Cuotas del año"
  const elegida = p.participaciones.find((x) => x.id === elegidaId) ?? p.participaciones[0] ?? null

  const meses = MESES_CORTOS.map((nombre, i) => {
    const m = `${anio}-${String(i + 1).padStart(2, '0')}`
    return { m, nombre, cuota: elegida?.cuotasDelAnio[m] ?? null, vencido: m <= actual }
  })
  const pagadas = meses.filter((x) => x.cuota)
  const vencidosSinPago = meses.filter((x) => x.vencido && !x.cuota)
  const aportado = pagadas.reduce((s, x) => s + (x.cuota?.monto ?? 0), 0)
  const deuda = elegida ? vencidosSinPago.length * elegida.monto : 0
  const historial = [...pagadas].sort((a, b) => b.m.localeCompare(a.m))

  function ir(v: Vista) {
    limpiarError()
    setVista(v)
  }

  async function anular(c: Cuota) {
    if (confirm(`¿Anular la cuota de ${nombreMes(c.periodo.slice(0, 7))}?`)) await onAnular(c.id)
  }

  async function finalizar(x: ParticipacionConEstado) {
    const texto = `¿Finalizar la participación de ${formatMoneda(x.monto)}? Dejará de cobrarse desde ahora; las cuotas ya registradas se conservan.`
    if (confirm(texto)) await onFinalizarParticipacion(x.id)
  }

  async function guardarDatos(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const ok = await onActualizarExterno({
      nombre: String(f.get('d_nombre')).trim(),
      direccion: String(f.get('d_direccion') ?? ''),
      correo: String(f.get('d_correo') ?? ''),
      celular: String(f.get('d_celular') ?? ''),
    })
    if (ok) setVista({ tipo: 'detalle' })
  }

  async function quitar() {
    const texto = p.es_miembro
      ? `¿Quitar a ${p.nombre} de los inversionistas? Sigue en el directorio de Miembros y su historial de cuotas se conserva.`
      : `¿Eliminar a ${p.nombre}? No es miembro, así que se borrarán sus datos y todas sus cuotas.`
    if (confirm(texto)) await onQuitar()
  }

  const titulo = (
    <span className="flex flex-wrap items-center gap-2">
      <CategoriasPersona categorias={p.categorias} />
      {!p.es_miembro && <Badge color="gray">No miembro</Badge>}
    </span>
  )

  return (
    <Drawer abierto titulo={p.nombre} subtitulo={titulo} onCerrar={onCerrar}>
      {vista.tipo === 'datos' ? (
        <form onSubmit={guardarDatos} className="flex flex-col gap-4">
          <Volver onClick={() => setVista({ tipo: 'detalle' })} />
          {error && <Alert>{error}</Alert>}
          <Input label="Nombre completo *" name="d_nombre" required defaultValue={p.nombre} autoComplete="off" />
          <Input label="Dirección" name="d_direccion" defaultValue={p.direccion ?? ''} />
          <Input label="Correo" name="d_correo" type="email" defaultValue={p.correo ?? ''} />
          <Input label="Teléfono" name="d_celular" type="tel" inputMode="tel" defaultValue={p.celular ?? ''} />
          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <Button type="button" variant="secondary" onClick={() => setVista({ tipo: 'detalle' })}>
              Cancelar
            </Button>
            <Button type="submit" loading={guardando}>
              Guardar datos
            </Button>
          </div>
        </form>
      ) : vista.tipo === 'participacion' ? (
        <div className="flex flex-col gap-4">
          <Volver onClick={() => setVista({ tipo: 'detalle' })} />
          <h3 className="text-base font-semibold text-navy-900">
            {vista.participacion ? `Editar participación ${vista.participacion.numero}` : 'Nueva participación'}
          </h3>
          <FormParticipacion
            inicial={vista.participacion}
            guardando={guardando}
            error={error}
            onGuardar={async (input) => {
              const ok = vista.participacion
                ? await onActualizarParticipacion(vista.participacion.id, input)
                : await onCrearParticipacion(input)
              if (ok) setVista({ tipo: 'detalle' })
              return ok
            }}
            onCancelar={() => setVista({ tipo: 'detalle' })}
          />
        </div>
      ) : vista.tipo === 'cuota' ? (
        <div className="flex flex-col gap-4">
          <Volver onClick={() => setVista({ tipo: 'detalle' })} />
          <div>
            <h3 className="text-base font-semibold text-navy-900">
              {vista.cuota ? 'Editar cuota' : 'Registrar cuota'} de <span className="capitalize">{nombreMes(vista.mes)}</span>
            </h3>
            <p className="mt-1 flex items-center gap-2 text-sm text-slate-500">
              Participación {vista.participacion.numero} · {formatMoneda(vista.participacion.monto)}
              <CategoriaBadge categoria={vista.participacion.categoria} />
            </p>
          </div>
          <CuotaForm
            key={`${vista.participacion.id}-${vista.mes}-${vista.cuota?.id ?? 'nueva'}`}
            participacionId={vista.participacion.id}
            mesInicial={vista.mes}
            inicial={vista.cuota}
            montoSugerido={vista.participacion.monto}
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
              {p.direccion && (
                <p className="flex min-w-0 items-center gap-1.5 text-slate-700">
                  <MapPin className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <span className="truncate">{p.direccion}</span>
                </p>
              )}
              {p.correo && (
                <a href={`mailto:${p.correo}`} className="flex min-w-0 items-center gap-1.5 text-slate-700 hover:text-primary-700">
                  <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />
                  <span className="truncate">{p.correo}</span>
                </a>
              )}
            </div>
            {p.celular && p.pendienteMes > 0 && (
              <a
                href={linkWhatsApp(p.celular, armarMensaje(plantilla, p.nombre, nombreMes(mes), formatMoneda(p.pendienteMes)))}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-11 shrink-0 items-center gap-2 rounded-lg bg-emerald-50 px-3 text-sm font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20 hover:bg-emerald-100"
              >
                <MessageCircle className="h-4 w-4" />
                Recordar
              </a>
            )}
          </div>

          {/* Participaciones */}
          <section className="flex flex-col gap-2">
            <div className="flex items-end justify-between gap-2">
              <div>
                <h3 className="flex items-center gap-2 text-base font-semibold text-navy-900">
                  <Wallet className="h-4 w-4 text-primary-600" />
                  Participaciones
                </h3>
                {p.participaciones.length > 0 && (
                  <p className="text-sm text-slate-500">
                    Total mensual <strong className="font-semibold text-navy-900">{formatMoneda(p.totalMensual)}</strong>
                  </p>
                )}
              </div>
              <Button variant="secondary" onClick={() => ir({ tipo: 'participacion', participacion: null })}>
                <Plus />
                Agregar
              </Button>
            </div>

            {p.participaciones.length === 0 ? (
              <p className="rounded-lg border border-dashed border-amber-300 bg-amber-50/50 px-4 py-5 text-center text-sm text-amber-800">
                Aún no tiene participaciones. Agrega una con el monto que aporta cada mes.
              </p>
            ) : (
              <ul className="flex flex-col gap-2">
                {p.participaciones.map((x) => {
                  const Icono = ICONO_CATEGORIA[x.categoria]
                  return (
                    <li key={x.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white px-3 py-2.5">
                      <span className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${COLOR_ICONO[x.categoria]}`}>
                        <Icono className="h-5 w-5" />
                      </span>
                      <div className="min-w-0 flex-1">
                        <p className="flex flex-wrap items-center gap-x-2 text-sm">
                          <span className="font-semibold tabular-nums text-navy-900">{formatMoneda(x.monto)}</span>
                          <span className="text-slate-500">{CATEGORIAS[x.categoria].label}</span>
                        </p>
                        <p className="truncate text-xs text-slate-500">
                          Participación {x.numero}
                          {x.fecha_aporte && ` · aporta el día ${Number(x.fecha_aporte.slice(8, 10))}`}
                          {x.nota && ` · ${x.nota}`}
                        </p>
                      </div>
                      <button
                        type="button"
                        onClick={() => ir({ tipo: 'participacion', participacion: x })}
                        aria-label={`Editar participación ${x.numero}`}
                        title="Editar"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        onClick={() => finalizar(x)}
                        aria-label={`Finalizar participación ${x.numero}`}
                        title="Finalizar participación"
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-rose-600 hover:bg-rose-50"
                      >
                        <X className="h-4 w-4" />
                      </button>
                    </li>
                  )
                })}
              </ul>
            )}
          </section>

          {/* Cuotas del año (de la participación elegida) */}
          {elegida && (
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

              {p.participaciones.length > 1 && (
                <div role="tablist" aria-label="Participación" className="flex gap-1 overflow-x-auto rounded-lg bg-slate-100 p-1">
                  {p.participaciones.map((x) => {
                    const Icono = ICONO_CATEGORIA[x.categoria]
                    const activa = x.id === elegida.id
                    return (
                      <button
                        key={x.id}
                        type="button"
                        role="tab"
                        aria-selected={activa}
                        onClick={() => setElegidaId(x.id)}
                        className={`flex min-h-10 flex-1 items-center justify-center gap-1.5 whitespace-nowrap rounded-md px-3 text-sm font-medium transition-colors ${
                          activa ? 'bg-white text-navy-900 shadow-xs' : 'text-slate-500 hover:text-navy-900'
                        }`}
                      >
                        <Icono className="h-3.5 w-3.5" />
                        {formatMoneda(x.monto)}
                      </button>
                    )
                  })}
                </div>
              )}

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

              <ul className="grid grid-cols-3 gap-2 sm:grid-cols-4">
                {meses.map(({ m, nombre, cuota, vencido }) => (
                  <li key={m}>
                    <button
                      type="button"
                      onClick={() => ir({ tipo: 'cuota', participacion: elegida, mes: m, cuota })}
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

              {/* Historial */}
              <h4 className="mt-2 text-sm font-semibold text-navy-900">Historial de pagos</h4>
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
                          onClick={() => ir({ tipo: 'cuota', participacion: elegida, mes: m, cuota })}
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
          )}

          {/* Opciones */}
          <section className="flex flex-col gap-2 border-t border-slate-100 pt-4 sm:flex-row sm:justify-between">
            {!p.es_miembro ? (
              <Button variant="secondary" onClick={() => ir({ tipo: 'datos' })}>
                <UserPen />
                Editar datos
              </Button>
            ) : (
              <p className="self-center text-xs text-slate-500">Sus datos se editan en el módulo Miembros.</p>
            )}
            <Button variant="danger" onClick={quitar} loading={guardando}>
              <UserMinus />
              {p.es_miembro ? 'Quitar de inversionistas' : 'Eliminar inversionista'}
            </Button>
          </section>
        </div>
      )}
    </Drawer>
  )
}
