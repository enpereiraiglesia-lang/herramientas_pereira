import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Button } from '../../../components/ui/Button'
import { Field, inputClass } from '../../../components/ui/Field'
import { mensajeError } from '../../../lib/errores'
import { useAsync } from '../../../lib/useAsync'
import { miembrosService } from '../services/miembrosService'
import type { Servicio } from '../types'

const NUEVO = '__nuevo__'

interface Props {
  value: string
  onChange: (servicio: Servicio | null) => void
}

/** Selector del servicio que realiza el miembro, con opción de crear uno nuevo */
export function ServicioSelect({ value, onChange }: Props) {
  const { data, loading, reload } = useAsync(() => miembrosService.servicios(), [])
  const servicios = data ?? []
  const [creando, setCreando] = useState(false)
  const [nombre, setNombre] = useState('')
  const [meses, setMeses] = useState(3)
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function crear() {
    if (!nombre.trim()) return
    setGuardando(true)
    setError(null)
    try {
      const nuevo = await miembrosService.crearServicio(nombre, meses)
      await reload()
      onChange(nuevo)
      setCreando(false)
      setNombre('')
      setMeses(3)
    } catch (err) {
      const msg = mensajeError(err, 'No se pudo crear el servicio')
      setError(msg.includes('servicios_nombre_idx') ? 'Ya existe un servicio con ese nombre' : msg)
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <Field label="Servicio o herramienta" htmlFor="servicio_id">
        <select
          id="servicio_id"
          className={inputClass}
          disabled={loading}
          value={creando ? NUEVO : value}
          onChange={(e) => {
            if (e.target.value === NUEVO) {
              setCreando(true)
              return
            }
            setCreando(false)
            onChange(servicios.find((s) => s.id === e.target.value) ?? null)
          }}
        >
          <option value="">Sin servicio</option>
          {servicios.map((s) => (
            <option key={s.id} value={s.id}>
              {s.nombre} (rota cada {s.meses_rotacion} mes{s.meses_rotacion === 1 ? '' : 'es'})
            </option>
          ))}
          <option value={NUEVO}>+ Agregar un servicio nuevo…</option>
        </select>
      </Field>

      {creando && (
        <div className="flex flex-col gap-2 rounded-lg border border-primary-200 bg-primary-50/50 p-3">
          <div className="grid grid-cols-[minmax(0,1fr)_7rem] gap-2">
            <input
              autoFocus
              value={nombre}
              onChange={(e) => setNombre(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  e.preventDefault()
                  void crear()
                }
              }}
              placeholder="Ej: Alabanza, Ujieres, Multimedia"
              aria-label="Nombre del servicio"
              className={inputClass}
            />
            <select
              value={meses}
              onChange={(e) => setMeses(Number(e.target.value))}
              aria-label="Rotar cada"
              className={inputClass}
            >
              {[1, 2, 3, 4, 6, 12].map((n) => (
                <option key={n} value={n}>
                  {n} mes{n === 1 ? '' : 'es'}
                </option>
              ))}
            </select>
          </div>
          {error && <p className="text-xs text-rose-600">{error}</p>}
          <div className="flex justify-end gap-2">
            <Button type="button" variant="secondary" onClick={() => setCreando(false)}>
              Cancelar
            </Button>
            <Button type="button" onClick={crear} loading={guardando} disabled={!nombre.trim()}>
              <Plus />
              Crear servicio
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
