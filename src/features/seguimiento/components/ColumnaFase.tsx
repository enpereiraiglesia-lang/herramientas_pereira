import { useDroppable } from '@dnd-kit/core'
import { colorFase, type Fase, type TarjetaContacto } from '../types'
import { TarjetaSeguimiento } from './TarjetaSeguimiento'

interface Props {
  fase: Fase
  contactos: TarjetaContacto[]
  onAbrir: (id: string) => void
}

export function ColumnaFase({ fase, contactos, onAbrir }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: fase.clave })
  const color = colorFase(fase.color)

  return (
    <section
      className={`flex w-[82vw] max-w-72 shrink-0 snap-start flex-col rounded-xl sm:w-72 border border-t-4 bg-slate-100/70 transition-colors ${color.borde} ${
        isOver ? 'border-primary-400 bg-primary-50/70' : 'border-slate-200'
      }`}
      aria-label={`Fase ${fase.nombre}`}
    >
      <header className="px-3 pb-2 pt-3">
        <div className="flex items-center justify-between gap-2">
          <h3 className="flex items-center gap-2 text-sm font-semibold text-navy-900">
            <span className={`h-2 w-2 rounded-full ${color.punto}`} />
            {fase.orden}. {fase.nombre}
          </h3>
          <span className="rounded-md bg-white px-2 py-0.5 text-xs font-semibold text-slate-600 ring-1 ring-slate-200">
            {contactos.length}
          </span>
        </div>
        {fase.descripcion && <p className="mt-1 text-xs text-slate-500">{fase.descripcion}</p>}
      </header>

      <div ref={setNodeRef} className="flex min-h-32 flex-1 flex-col gap-2 overflow-y-auto px-3 pb-3">
        {contactos.map((c) => (
          <TarjetaSeguimiento key={c.id} contacto={c} onAbrir={() => onAbrir(c.id)} />
        ))}
        {contactos.length === 0 && (
          <p className="rounded-lg border border-dashed border-slate-300 px-3 py-6 text-center text-xs text-slate-400">
            Arrastra aquí un contacto
          </p>
        )}
      </div>
    </section>
  )
}
