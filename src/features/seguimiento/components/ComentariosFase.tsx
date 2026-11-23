import { useState, type FormEvent } from 'react'
import { ArrowRightLeft, Send, Trash2 } from 'lucide-react'
import { Alert } from '../../../components/ui/Alert'
import { Avatar } from '../../../components/ui/Avatar'
import { Button } from '../../../components/ui/Button'
import { Select } from '../../../components/ui/Select'
import { Spinner } from '../../../components/ui/Spinner'
import { TextArea } from '../../../components/ui/TextArea'
import { formatFechaHora } from '../../../lib/format'
import { useAuth } from '../../auth/hooks/useAuth'
import { useComentarios } from '../hooks/useComentarios'
import { colorFase, type Comentario, type Fase } from '../types'

interface Props {
  contactoId: string
  faseActual: string
  fases: Fase[]
  /** Se llama al agregar o eliminar un comentario (para actualizar el contador de la tarjeta) */
  onCambio?: () => void
}

/** Comentarios agrupados por fase + formulario para agregar uno nuevo */
export function ComentariosFase({ contactoId, faseActual, fases, onCambio }: Props) {
  const { user, esAdmin } = useAuth()
  const { comentarios, loading, error, guardando, saveError, comentar, eliminar } = useComentarios(contactoId)
  const [fase, setFase] = useState(faseActual)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const texto = String(new FormData(form).get('texto') ?? '').trim()
    if (texto && (await comentar(fase, texto))) {
      form.reset()
      onCambio?.()
    }
  }

  async function borrar(id: string) {
    if (!confirm('¿Eliminar este comentario?')) return
    await eliminar(id)
    onCambio?.()
  }

  const porFase = fases
    .map((f) => ({ fase: f, items: comentarios.filter((c) => c.fase === f.clave) }))
    .filter((g) => g.items.length > 0 || g.fase.clave === faseActual)

  return (
    <div className="flex flex-col gap-5">
      <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-slate-50 p-3">
        {saveError && <Alert>{saveError}</Alert>}
        <Select
          label="Fase del comentario"
          name="fase_comentario"
          value={fase}
          onChange={(e) => setFase(e.target.value)}
          options={fases.map((f) => ({ value: f.clave, label: `${f.orden}. ${f.nombre}` }))}
        />
        <TextArea label="Comentario" name="texto" rows={3} required placeholder="¿Qué pasó en esta fase?" />
        <Button type="submit" loading={guardando} className="self-end">
          <Send />
          Agregar comentario
        </Button>
      </form>

      {loading && comentarios.length === 0 ? (
        <Spinner />
      ) : error ? (
        <Alert>{error}</Alert>
      ) : (
        porFase.map(({ fase: f, items }) => (
          <section key={f.clave}>
            <h4 className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500">
              <span className={`h-2 w-2 rounded-full ${colorFase(f.color).punto}`} />
              {f.nombre}
              {f.clave === faseActual && <span className="font-normal normal-case text-primary-600">· fase actual</span>}
            </h4>
            {items.length === 0 ? (
              <p className="pl-4 text-sm text-slate-400">Sin comentarios en esta fase.</p>
            ) : (
              <ul className="flex flex-col gap-2">
                {items.map((c) => (
                  <ItemComentario
                    key={c.id}
                    comentario={c}
                    puedeEliminar={c.tipo === 'comentario' && (esAdmin || c.autor_id === user?.id)}
                    onEliminar={() => borrar(c.id)}
                  />
                ))}
              </ul>
            )}
          </section>
        ))
      )}
    </div>
  )
}

function ItemComentario({
  comentario: c,
  puedeEliminar,
  onEliminar,
}: {
  comentario: Comentario
  puedeEliminar: boolean
  onEliminar: () => void
}) {
  if (c.tipo === 'cambio_fase')
    return (
      <li className="flex items-center gap-2 pl-4 text-xs text-slate-500">
        <ArrowRightLeft className="h-3.5 w-3.5 text-slate-400" />
        <span>
          {c.texto} · {c.autor?.nombre ?? 'Sistema'} · {formatFechaHora(c.created_at)}
        </span>
      </li>
    )

  return (
    <li className="flex gap-3 rounded-lg border border-slate-200 bg-white p-3">
      <Avatar nombre={c.autor?.nombre ?? '?'} size="sm" />
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-semibold text-navy-900">{c.autor?.nombre ?? 'Usuario'}</p>
          <span className="shrink-0 text-xs text-slate-400">{formatFechaHora(c.created_at)}</span>
        </div>
        <p className="mt-1 whitespace-pre-line text-sm text-slate-700">{c.texto}</p>
        {puedeEliminar && (
          <button
            onClick={onEliminar}
            className="mt-1 inline-flex min-h-8 items-center gap-1 text-xs text-rose-600 hover:underline"
          >
            <Trash2 className="h-3 w-3" />
            Eliminar
          </button>
        )}
      </div>
    </li>
  )
}
