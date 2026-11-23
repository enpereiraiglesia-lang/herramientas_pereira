import { useState } from 'react'
import { ArrowRightLeft, Check, Search } from 'lucide-react'
import { Avatar } from '../../../components/ui/Avatar'
import { Button } from '../../../components/ui/Button'
import { inputClass } from '../../../components/ui/Field'
import { Spinner } from '../../../components/ui/Spinner'
import { useAsync } from '../../../lib/useAsync'
import type { OpcionMembresia } from '../types'

interface Props {
  grupoId: string
  cargar: () => Promise<OpcionMembresia[]>
  textoBoton: (n: number) => string
  placeholder: string
  /** Ej. "grupo familiar" o "cámara de energización" (para los avisos) */
  tipoGrupo: string
  guardando: boolean
  onAgregar: (ids: string[]) => Promise<boolean>
  onCancelar: () => void
}

const normalizar = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/** Buscar y elegir varias personas para agregar al grupo */
export function SelectorMembresia({ grupoId, cargar, textoBoton, placeholder, tipoGrupo, guardando, onAgregar, onCancelar }: Props) {
  const { data, loading, error } = useAsync(cargar, [grupoId])
  const [busqueda, setBusqueda] = useState('')
  const [elegidos, setElegidos] = useState<Set<string>>(new Set())

  const q = normalizar(busqueda.trim())
  const opciones = (data ?? [])
    .filter((o) => o.grupoId !== grupoId)
    .filter((o) => !q || normalizar(o.nombre).includes(q) || (o.detalle ?? '').includes(q))
    // Primero los que no están en ningún grupo
    .sort((a, b) => Number(!!a.grupoId) - Number(!!b.grupoId))
  const mover = (data ?? []).filter((o) => elegidos.has(o.id) && o.grupoId).length

  function alternar(id: string) {
    setElegidos((s) => {
      const n = new Set(s)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  }

  return (
    <div className="flex flex-col gap-3 rounded-xl border border-primary-200 bg-primary-50/40 p-3">
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          autoFocus
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder={placeholder}
          aria-label={placeholder}
          className={`${inputClass} pl-9`}
        />
      </div>

      {loading ? (
        <Spinner />
      ) : error ? (
        <p className="text-sm text-rose-600">{error}</p>
      ) : opciones.length === 0 ? (
        <p className="py-4 text-center text-sm text-slate-500">No hay resultados.</p>
      ) : (
        <ul className="max-h-64 divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-200 bg-white">
          {opciones.map((o) => {
            const activo = elegidos.has(o.id)
            return (
              <li key={o.id}>
                <button
                  type="button"
                  onClick={() => alternar(o.id)}
                  aria-pressed={activo}
                  className={`flex min-h-12 w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors ${activo ? 'bg-primary-50' : 'hover:bg-slate-50'}`}
                >
                  <Avatar nombre={o.nombre} size="sm" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate font-medium text-navy-900">{o.nombre}</span>
                    {(o.detalle || o.grupoNombre) && (
                      <span className="block truncate text-xs text-slate-500">
                        {o.detalle}
                        {o.detalle && o.grupoNombre && ' · '}
                        {o.grupoNombre && <span className="text-amber-700">En: {o.grupoNombre}</span>}
                      </span>
                    )}
                  </span>
                  <span
                    className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-md ring-1 ring-inset ${
                      activo ? 'bg-primary-600 text-white ring-primary-600' : 'bg-white ring-slate-300'
                    }`}
                  >
                    {activo && <Check className="h-3.5 w-3.5" />}
                  </span>
                </button>
              </li>
            )
          })}
        </ul>
      )}

      {mover > 0 && (
        <p className="flex items-start gap-1.5 text-xs text-amber-800">
          <ArrowRightLeft className="mt-px h-3.5 w-3.5 shrink-0" />
          {mover === 1 ? '1 persona elegida está' : `${mover} personas elegidas están`} en{' '}
          {tipoGrupo.startsWith('cámara') ? 'otra' : 'otro'} {tipoGrupo} y se{mover === 1 ? ' moverá' : ' moverán'} aquí.
        </p>
      )}

      <div className="flex justify-end gap-2">
        <Button variant="secondary" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button
          disabled={!elegidos.size}
          loading={guardando}
          onClick={async () => {
            if (await onAgregar([...elegidos])) setElegidos(new Set())
          }}
        >
          {textoBoton(elegidos.size)}
        </Button>
      </div>
    </div>
  )
}
