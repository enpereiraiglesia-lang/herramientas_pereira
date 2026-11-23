import { useState } from 'react'
import { Link } from 'react-router-dom'
import { Check, Search } from 'lucide-react'
import { Alert } from '../../../components/ui/Alert'
import { Avatar } from '../../../components/ui/Avatar'
import { Button } from '../../../components/ui/Button'
import { inputClass } from '../../../components/ui/Field'
import { Spinner } from '../../../components/ui/Spinner'
import { usePermisos } from '../../permisos/hooks/usePermisos'
import { useMiembrosTci } from '../hooks/useTci'

interface Props {
  yaEstan: Set<string>
  guardando: boolean
  error: string | null
  onSubmit: (miembros: string[]) => Promise<boolean>
  onCancel: () => void
}

const normalizar = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/** Buscar y elegir varios miembros a la vez para el equipo */
export function AgregarIntegrantes({ yaEstan, guardando, error, onSubmit, onCancel }: Props) {
  const { miembros, loading, error: errorCarga } = useMiembrosTci()
  const { puede } = usePermisos()
  const [busqueda, setBusqueda] = useState('')
  const [elegidos, setElegidos] = useState<Set<string>>(new Set())

  const q = normalizar(busqueda.trim())
  const disponibles = miembros.filter((m) => !yaEstan.has(m.id) && (!q || normalizar(m.nombre).includes(q)))

  function alternar(id: string) {
    setElegidos((s) => {
      const n = new Set(s)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })
  }

  return (
    <div className="flex flex-col gap-5">
      {error && <Alert>{error}</Alert>}
      {errorCarga && <Alert>{errorCarga}</Alert>}

      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar miembro por nombre"
          aria-label="Buscar miembro"
          className={`${inputClass} pl-9`}
          autoFocus
        />
      </div>

      {loading ? (
        <Spinner />
      ) : disponibles.length === 0 ? (
        <p className="rounded-lg bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
          {miembros.length === 0 ? (
            <>
              No hay miembros registrados.{' '}
              {puede('miembros') && (
                <Link to="/miembros" className="font-medium text-primary-600 hover:underline">
                  Regístralos en Miembros
                </Link>
              )}
            </>
          ) : (
            'No hay miembros que coincidan o ya están todos en el grupo.'
          )}
        </p>
      ) : (
        <ul className="max-h-72 divide-y divide-slate-100 overflow-y-auto rounded-xl border border-slate-200">
          {disponibles.map((m) => {
            const activo = elegidos.has(m.id)
            return (
              <li key={m.id}>
                <button
                  type="button"
                  onClick={() => alternar(m.id)}
                  aria-pressed={activo}
                  className={`flex min-h-12 w-full items-center gap-3 px-3 py-2 text-left text-sm transition-colors ${activo ? 'bg-primary-50' : 'hover:bg-slate-50'}`}
                >
                  <Avatar nombre={m.nombre} size="sm" />
                  <span className="min-w-0 flex-1 truncate font-medium text-navy-900">{m.nombre}</span>
                  <span
                    className={`flex h-5 w-5 items-center justify-center rounded-md ring-1 ring-inset ${
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


      <div className="sticky bottom-0 -mx-4 flex flex-col-reverse gap-2 border-t border-slate-200 bg-white px-4 py-3 sm:-mx-6 sm:flex-row sm:justify-end sm:px-6">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button disabled={!elegidos.size} loading={guardando} onClick={() => onSubmit([...elegidos])}>
          Agregar {elegidos.size ? `${elegidos.size} ` : ''}al equipo
        </Button>
      </div>
    </div>
  )
}
