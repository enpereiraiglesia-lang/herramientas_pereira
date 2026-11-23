import { useState, type FormEvent } from 'react'
import { Check, Search } from 'lucide-react'
import { Alert } from '../../../components/ui/Alert'
import { Avatar } from '../../../components/ui/Avatar'
import { Button } from '../../../components/ui/Button'
import { DatePicker } from '../../../components/ui/DatePicker'
import { Field, inputClass } from '../../../components/ui/Field'
import { Input } from '../../../components/ui/Input'
import { Spinner } from '../../../components/ui/Spinner'
import { hoy } from '../../../components/ui/calendario/fechas'
import { formatMoneda } from '../../../lib/format'
import { useAsync } from '../../../lib/useAsync'
import { inversionistasService, type DatosExterno } from '../services/inversionistasService'
import { CUOTA_INVERSIONISTA } from '../types'

const normalizar = (s: string) => s.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase()

/** Campo de cuota mensual con separador de miles */
export function CampoCuota({ valor, onChange, requerido }: { valor: string; onChange: (v: string) => void; requerido?: boolean }) {
  const numero = Number(valor) || 0
  return (
    <Field label={`Monto mensual de la participación${requerido ? ' *' : ''}`} htmlFor="cuota_nueva">
      <div className="relative">
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-sm text-slate-400">$</span>
        <input
          id="cuota_nueva"
          inputMode="numeric"
          autoComplete="off"
          placeholder="0"
          required={requerido}
          value={numero ? numero.toLocaleString('es-CO') : valor}
          onChange={(e) => onChange(e.target.value.replace(/\D/g, ''))}
          className={`${inputClass} pl-7 tabular-nums`}
        />
      </div>
      <p className="text-xs text-slate-500">
        Desde {formatMoneda(CUOTA_INVERSIONISTA)} es Inversionista; menor, Microinversionista. Si aporta más de una
        participación, agrega las demás en su detalle.
      </p>
    </Field>
  )
}

interface CrearProps {
  guardando: boolean
  error: string | null
  onCrear: (datos: DatosExterno) => Promise<boolean>
  onCancelar: () => void
}

/** Formulario para crear un inversionista que no está en la lista de miembros */
export function CrearInversionista({ guardando, error, onCrear, onCancelar }: CrearProps) {
  const [cuota, setCuota] = useState('')
  const [fechaAporte, setFechaAporte] = useState<string | null>(hoy())

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    await onCrear({
      nombre: String(f.get('inv_nombre')).trim(),
      direccion: String(f.get('inv_direccion') ?? ''),
      correo: String(f.get('inv_correo') ?? ''),
      celular: String(f.get('inv_telefono') ?? ''),
      cuota: cuota ? Number(cuota) : null,
      fechaAporte,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <Alert>{error}</Alert>}
      <Input label="Nombre completo *" name="inv_nombre" required autoComplete="off" autoFocus />
      <Input label="Dirección" name="inv_direccion" autoComplete="street-address" />
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Input label="Correo" name="inv_correo" type="email" autoComplete="email" />
        <Input label="Teléfono" name="inv_telefono" type="tel" inputMode="tel" autoComplete="tel" />
      </div>
      <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 sm:grid-cols-2">
        <CampoCuota valor={cuota} onChange={setCuota} requerido />
        <DatePicker
          label="Fecha de aporte *"
          name="inv_fecha_aporte"
          required
          value={fechaAporte}
          onChange={setFechaAporte}
          ayuda="Día del mes en que hace su aporte."
        />
      </div>
      <p className="text-xs text-slate-500">
        No necesita estar en el directorio de Miembros. Aparecerá en la lista con la etiqueta “No miembro”.
      </p>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button type="submit" loading={guardando}>
          Crear inversionista
        </Button>
      </div>
    </form>
  )
}

interface MiembroProps {
  guardando: boolean
  error: string | null
  onAgregar: (miembroId: string, cuota: number | null) => Promise<boolean>
  onCancelar: () => void
}

/** Marcar como inversionista a un miembro que ya está en el directorio */
export function AgregarMiembroInversionista({ guardando, error, onAgregar, onCancelar }: MiembroProps) {
  const [cuota, setCuota] = useState('')
  const [elegido, setElegido] = useState<string | null>(null)
  const [busqueda, setBusqueda] = useState('')
  const miembros = useAsync(() => inversionistasService.miembrosNoInversionistas(), [])

  const q = normalizar(busqueda.trim())
  const opciones = (miembros.data ?? []).filter((m) => !q || normalizar(m.nombre).includes(q))

  return (
    <div className="flex flex-col gap-4">
      {error && <Alert>{error}</Alert>}
      <div className="relative">
        <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
        <input
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
          placeholder="Buscar miembro"
          aria-label="Buscar miembro"
          className={`${inputClass} pl-9`}
        />
      </div>
      {miembros.loading ? (
        <Spinner />
      ) : miembros.error ? (
        <Alert>{miembros.error}</Alert>
      ) : opciones.length === 0 ? (
        <p className="rounded-lg bg-slate-50 px-4 py-6 text-center text-sm text-slate-500">
          {miembros.data?.length ? 'No hay miembros que coincidan.' : 'Todos los miembros ya son inversionistas.'}
        </p>
      ) : (
        <ul className="max-h-64 divide-y divide-slate-100 overflow-y-auto rounded-xl border border-slate-200">
          {opciones.map((m) => (
            <li key={m.id}>
              <button
                type="button"
                onClick={() => setElegido(m.id)}
                aria-pressed={elegido === m.id}
                className={`flex min-h-12 w-full items-center gap-3 px-3 py-2 text-left text-sm ${
                  elegido === m.id ? 'bg-primary-50' : 'hover:bg-slate-50'
                }`}
              >
                <Avatar nombre={m.nombre} size="sm" />
                <span className="min-w-0 flex-1 truncate font-medium text-navy-900">{m.nombre}</span>
                {elegido === m.id && <Check className="h-4 w-4 text-primary-600" />}
              </button>
            </li>
          ))}
        </ul>
      )}
      <CampoCuota valor={cuota} onChange={setCuota} />
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button disabled={!elegido} loading={guardando} onClick={() => elegido && onAgregar(elegido, cuota ? Number(cuota) : null)}>
          Agregar como inversionista
        </Button>
      </div>
    </div>
  )
}
