import { CircleCheck, CircleDashed, MessageCircle, Pencil, Plus, Smartphone, Undo2 } from 'lucide-react'
import { Avatar } from '../../../components/ui/Avatar'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { fechaCorta } from '../../../components/ui/calendario/fechas'
import { formatMoneda, linkWhatsApp, telefonoLimpio } from '../../../lib/format'
import type { InversionistaConEstado } from '../types'
import { HistorialAnual } from './HistorialAnual'

interface Props {
  inversionista: InversionistaConEstado
  mes: string
  mensaje: string
  onRegistrar: () => void
  onEditar: () => void
  onAnular: () => void
  onElegirMes: (mes: string) => void
  /** Abre el detalle (doble clic en la fila o toque en el nombre) */
  onDetalle: () => void
}

/** Fila de un inversionista: estado de la cuota del mes, historial del año y acciones */
export function InversionistaFila({ inversionista: p, mes, mensaje, onRegistrar, onEditar, onAnular, onElegirMes, onDetalle }: Props) {
  const cuota = p.cuotaDelMes

  return (
    <li
      onDoubleClick={(e) => {
        // El doble clic sobre botones o enlaces no abre el detalle
        if (!(e.target as HTMLElement).closest('button, a, input')) onDetalle()
      }}
      title="Doble clic para ver el detalle"
      className="grid cursor-pointer grid-cols-1 gap-4 px-4 py-4 transition-colors select-none hover:bg-slate-50/70 sm:px-6 lg:grid-cols-[minmax(0,1.5fr)_minmax(0,1fr)_minmax(0,1.6fr)_auto] lg:items-center"
    >
      {/* Persona */}
      <div className="flex min-w-0 items-center gap-3">
        <Avatar nombre={p.nombre} />
        <div className="min-w-0">
          <button
            type="button"
            onClick={onDetalle}
            className="block max-w-full truncate text-left font-semibold text-navy-900 hover:text-primary-700 hover:underline"
          >
            {p.nombre}
          </button>
          <p className="text-xs text-slate-500">
            Cuota:{' '}
            {p.cuota_mensual != null ? (
              <span className="font-medium text-navy-900">{formatMoneda(p.cuota_mensual)}/mes</span>
            ) : (
              <span className="text-amber-700">sin definir</span>
            )}
          </p>
          {p.celular ? (
            <a
              href={`tel:${telefonoLimpio(p.celular)}`}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-primary-700"
            >
              <Smartphone className="h-3 w-3" />
              {p.celular}
            </a>
          ) : (
            <p className="text-xs text-slate-400">Sin celular</p>
          )}
        </div>
      </div>

      {/* Estado del mes */}
      <div className="flex min-w-0 flex-col items-start gap-1">
        {cuota ? (
          <>
            <Badge color="green">
              <CircleCheck className="h-3 w-3" />
              Pagada
            </Badge>
            <p className="text-xs text-slate-500">
              {fechaCorta(cuota.fecha_pago)}
              {cuota.monto != null && (
                <>
                  {' · '}
                  <span className="font-medium text-navy-900">{formatMoneda(cuota.monto)}</span>
                </>
              )}
            </p>
          </>
        ) : (
          <Badge color="yellow">
            <CircleDashed className="h-3 w-3" />
            Pendiente
          </Badge>
        )}
      </div>

      {/* Historial del año */}
      <HistorialAnual anio={Number(mes.slice(0, 4))} mesElegido={mes} cuotas={p.cuotasDelAnio} onElegirMes={onElegirMes} />

      {/* Acciones */}
      <div className="flex flex-wrap items-center justify-end gap-1.5">
        {cuota ? (
          <>
            <Button variant="ghost" onClick={onEditar} aria-label={`Editar cuota de ${p.nombre}`} title="Editar cuota">
              <Pencil />
            </Button>
            <Button variant="ghost" onClick={onAnular} aria-label={`Anular cuota de ${p.nombre}`} title="Anular cuota">
              <Undo2 className="text-rose-600" />
            </Button>
          </>
        ) : (
          <>
            {p.celular ? (
              <a
                href={linkWhatsApp(p.celular, mensaje)}
                target="_blank"
                rel="noreferrer"
                title="Enviar recordatorio por WhatsApp"
                className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-emerald-50 px-3 text-sm font-semibold text-emerald-700 ring-1 ring-inset ring-emerald-600/20 transition-colors hover:bg-emerald-100"
              >
                <MessageCircle className="h-4 w-4" />
                Recordar
              </a>
            ) : (
              <span
                title="Agrega un celular en el directorio de miembros"
                className="inline-flex min-h-11 cursor-not-allowed items-center gap-2 rounded-lg px-3 text-sm font-medium text-slate-400 ring-1 ring-inset ring-slate-200"
              >
                <MessageCircle className="h-4 w-4" />
                Sin celular
              </span>
            )}
            <Button onClick={onRegistrar}>
              <Plus />
              Registrar
            </Button>
          </>
        )}
      </div>
    </li>
  )
}
