import { useDraggable } from '@dnd-kit/core'
import { Clock, GripVertical, House, MessageSquareText, Phone, Zap } from 'lucide-react'
import { Avatar } from '../../../components/ui/Avatar'
import { diasEnFase, type TarjetaContacto } from '../types'

interface Props {
  contacto: TarjetaContacto
  onAbrir?: () => void
  /** true cuando se dibuja dentro del DragOverlay */
  flotante?: boolean
}

/** Contenido visual de la tarjeta (se reutiliza en el overlay de arrastre) */
export function TarjetaContenido({ contacto, flotante }: Omit<Props, 'onAbrir'>) {
  const comentarios = contacto.comentarios.filter((c) => c.tipo === 'comentario').length
  const dias = diasEnFase(contacto.fase_actualizada_at)

  return (
    <div
      className={`rounded-lg border bg-white p-3 text-left ${
        flotante ? 'rotate-2 border-primary-300 shadow-xl' : 'border-slate-200 shadow-xs hover:border-primary-300'
      }`}
    >
      <div className="flex items-start gap-2">
        <GripVertical className="mt-0.5 h-4 w-4 shrink-0 text-slate-300" />
        <div className="min-w-0 flex-1">
          <p className="truncate text-sm font-semibold text-navy-900">{contacto.nombre}</p>
          {contacto.telefono && (
            <p className="mt-0.5 flex items-center gap-1 text-xs text-slate-500">
              <Phone className="h-3 w-3" />
              {contacto.telefono}
            </p>
          )}
        </div>
        {contacto.asignado && <Avatar nombre={contacto.asignado.nombre} size="sm" />}
      </div>

      {(contacto.grupo_familiar || contacto.camara) && (
        <div className="mt-2 flex flex-wrap gap-1 pl-6">
          {contacto.grupo_familiar && (
            <span className="inline-flex max-w-full items-center gap-1 truncate rounded bg-violet-50 px-1.5 py-0.5 text-[11px] font-medium text-violet-700">
              <House className="h-3 w-3 shrink-0" />
              <span className="truncate">{contacto.grupo_familiar.nombre}</span>
            </span>
          )}
          {contacto.camara && (
            <span className="inline-flex max-w-full items-center gap-1 truncate rounded bg-amber-50 px-1.5 py-0.5 text-[11px] font-medium text-amber-800">
              <Zap className="h-3 w-3 shrink-0" />
              <span className="truncate">{contacto.camara.nombre}</span>
            </span>
          )}
        </div>
      )}

      <div className="mt-2 flex items-center gap-3 pl-6 text-[11px] text-slate-400">
        <span className="flex items-center gap-1" title="Días en esta fase">
          <Clock className="h-3 w-3" />
          {dias === 0 ? 'Hoy' : `${dias} d`}
        </span>
        <span className="flex items-center gap-1" title="Comentarios">
          <MessageSquareText className="h-3 w-3" />
          {comentarios}
        </span>
      </div>
    </div>
  )
}

/** Tarjeta arrastrable del tablero */
export function TarjetaSeguimiento({ contacto, onAbrir }: Props) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: contacto.id })

  return (
    <div
      ref={setNodeRef}
      {...attributes}
      {...listeners}
      onClick={onAbrir}
      aria-label={`${contacto.nombre}. Arrastra para cambiar de fase o pulsa para ver detalles`}
      className={`cursor-grab touch-manipulation rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-primary-600 active:cursor-grabbing ${
        isDragging ? 'opacity-30' : ''
      }`}
    >
      <TarjetaContenido contacto={contacto} />
    </div>
  )
}
