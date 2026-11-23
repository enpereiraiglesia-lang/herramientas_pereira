import { CircleCheck, CircleDashed, MessageCircle, Pencil, Plus, Smartphone, Undo2 } from 'lucide-react'
import { Avatar } from '../../../components/ui/Avatar'
import { Badge } from '../../../components/ui/Badge'
import { fechaCorta } from '../../../components/ui/calendario/fechas'
import { formatMoneda, linkWhatsApp, telefonoLimpio } from '../../../lib/format'
import { CATEGORIAS, type Cuota, type InversionistaConEstado, type ParticipacionConEstado } from '../types'
import { COLOR_ICONO, ICONO_CATEGORIA } from '../estilos'
import { CategoriasPersona } from './CategoriaBadge'
import { HistorialAnual } from './HistorialAnual'

interface Props {
  inversionista: InversionistaConEstado
  mes: string
  mensaje: string
  onRegistrar: (p: ParticipacionConEstado) => void
  onEditar: (p: ParticipacionConEstado, c: Cuota) => void
  onAnular: (p: ParticipacionConEstado, c: Cuota) => void
  onElegirMes: (mes: string) => void
  /** Abre el detalle (doble clic en la fila o toque en el nombre) */
  onDetalle: () => void
}


/** Una línea por participación: monto, categoría, estado del mes y acción */
function LineaParticipacion({
  p,
  onRegistrar,
  onEditar,
  onAnular,
}: {
  p: ParticipacionConEstado
  onRegistrar: () => void
  onEditar: () => void
  onAnular: () => void
}) {
  const Icono = ICONO_CATEGORIA[p.categoria]
  const cuota = p.cuotaDelMes
  return (
    <li
      className={`flex flex-wrap items-center gap-x-3 gap-y-2 rounded-lg px-2.5 py-2 ring-1 ring-inset ${
        cuota ? 'bg-emerald-50/40 ring-emerald-100' : 'bg-white ring-slate-200'
      }`}
    >
      <span
        className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-lg ${COLOR_ICONO[p.categoria]}`}
        title={CATEGORIAS[p.categoria].label}
      >
        <Icono className="h-4 w-4" />
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-semibold tabular-nums text-navy-900">
          {formatMoneda(p.monto)}
          <span className="ml-1.5 text-xs font-medium text-slate-500">{CATEGORIAS[p.categoria].label}</span>
        </p>
        <p className="truncate text-xs text-slate-500">
          {cuota ? (
            <span className="inline-flex items-center gap-1 text-emerald-700">
              <CircleCheck className="h-3 w-3" />
              Pagada el {fechaCorta(cuota.fecha_pago)}
              {cuota.monto != null && cuota.monto !== p.monto && ` · ${formatMoneda(cuota.monto)}`}
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 text-amber-700">
              <CircleDashed className="h-3 w-3" />
              Pendiente{p.fecha_aporte && ` · aporta el día ${Number(p.fecha_aporte.slice(8, 10))}`}
            </span>
          )}
        </p>
      </div>
      {cuota ? (
        <div className="flex">
          <button
            type="button"
            onClick={onEditar}
            aria-label="Editar cuota"
            title="Editar cuota"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <Pencil className="h-4 w-4" />
          </button>
          <button
            type="button"
            onClick={onAnular}
            aria-label="Anular cuota"
            title="Anular cuota"
            className="flex h-9 w-9 items-center justify-center rounded-lg text-rose-600 hover:bg-rose-50"
          >
            <Undo2 className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={onRegistrar}
          className="inline-flex min-h-9 items-center gap-1.5 rounded-lg bg-primary-600 px-3 text-xs font-semibold text-white shadow-sm hover:bg-primary-700"
        >
          <Plus className="h-3.5 w-3.5" />
          Registrar
        </button>
      )}
    </li>
  )
}

/** Fila de un inversionista: sus participaciones con el estado del mes, historial del año y recordatorio */
export function InversionistaFila({ inversionista: p, mes, mensaje, onRegistrar, onEditar, onAnular, onElegirMes, onDetalle }: Props) {
  const varias = p.participaciones.length > 1

  return (
    <li
      onDoubleClick={(e) => {
        // El doble clic sobre botones o enlaces no abre el detalle
        if (!(e.target as HTMLElement).closest('button, a, input')) onDetalle()
      }}
      title="Doble clic para ver el detalle"
      className="grid cursor-pointer grid-cols-1 gap-4 px-4 py-4 transition-colors select-none hover:bg-slate-50/70 sm:px-6 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1.8fr)_minmax(0,1.1fr)] lg:items-start"
    >
      {/* Persona */}
      <div className="flex min-w-0 items-start gap-3">
        <Avatar nombre={p.nombre} />
        <div className="flex min-w-0 flex-col gap-1">
          <button
            type="button"
            onClick={onDetalle}
            className="block max-w-full truncate text-left font-semibold text-navy-900 hover:text-primary-700 hover:underline"
          >
            {p.nombre}
          </button>
          <div className="flex flex-wrap gap-1">
            <CategoriasPersona categorias={p.categorias} />
            {!p.es_miembro && <Badge color="gray">No miembro</Badge>}
          </div>
          {p.celular ? (
            <a href={`tel:${telefonoLimpio(p.celular)}`} className="flex items-center gap-1 text-xs text-slate-500 hover:text-primary-700">
              <Smartphone className="h-3 w-3" />
              {p.celular}
            </a>
          ) : (
            <p className="text-xs text-slate-400">Sin celular</p>
          )}
          {p.celular && p.pendienteMes > 0 && (
            <a
              href={linkWhatsApp(p.celular, mensaje)}
              target="_blank"
              rel="noreferrer"
              title="Enviar recordatorio por WhatsApp"
              className="mt-1 inline-flex min-h-9 items-center gap-1.5 self-start rounded-lg bg-emerald-50 px-3 text-xs font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20 hover:bg-emerald-100"
            >
              <MessageCircle className="h-3.5 w-3.5" />
              Recordar {formatMoneda(p.pendienteMes)}
            </a>
          )}
        </div>
      </div>

      {/* Participaciones del mes */}
      <div className="flex min-w-0 flex-col gap-1.5">
        {p.participaciones.length === 0 ? (
          <button
            type="button"
            onClick={onDetalle}
            className="rounded-lg border border-dashed border-amber-300 bg-amber-50/50 px-3 py-2.5 text-left text-sm text-amber-800 hover:bg-amber-50"
          >
            Sin participación definida. <span className="font-semibold underline">Agregar participación</span>
          </button>
        ) : (
          <>
            <ul className="flex flex-col gap-1.5">
              {p.participaciones.map((x) => (
                <LineaParticipacion
                  key={x.id}
                  p={x}
                  onRegistrar={() => onRegistrar(x)}
                  onEditar={() => x.cuotaDelMes && onEditar(x, x.cuotaDelMes)}
                  onAnular={() => x.cuotaDelMes && onAnular(x, x.cuotaDelMes)}
                />
              ))}
            </ul>
            {varias && (
              <p className="flex flex-wrap gap-x-3 px-1 text-xs text-slate-500">
                <span>
                  Total <strong className="font-semibold text-navy-900">{formatMoneda(p.totalMensual)}</strong>/mes
                </span>
                <span>
                  Pagado <strong className="font-semibold text-emerald-700">{formatMoneda(p.pagadoMes)}</strong>
                </span>
                {p.pendienteMes > 0 && (
                  <span>
                    Falta <strong className="font-semibold text-amber-700">{formatMoneda(p.pendienteMes)}</strong>
                  </span>
                )}
              </p>
            )}
          </>
        )}
      </div>

      {/* Historial del año */}
      <HistorialAnual anio={Number(mes.slice(0, 4))} mesElegido={mes} participaciones={p.participaciones} onElegirMes={onElegirMes} />
    </li>
  )
}
