import { useState, type FormEvent } from 'react'
import { Pencil } from 'lucide-react'
import { Avatar } from '../../../components/ui/Avatar'
import { Button } from '../../../components/ui/Button'
import { inputClass } from '../../../components/ui/Field'
import { Input } from '../../../components/ui/Input'
import { formatFecha } from '../../../lib/format'
import { OPCIONES_ROL, type DatosUsuario, type RolUsuario, type Usuario } from '../types'
import { RolBadge } from './RolBadge'

interface Props {
  usuario: Usuario
  esYo: boolean
  guardando: boolean
  onCambiarRol: (rol: RolUsuario) => void
  onActualizar: (datos: DatosUsuario) => Promise<boolean>
}

export function UsuarioItem({ usuario, esYo, guardando, onCambiarRol, onActualizar }: Props) {
  const [editando, setEditando] = useState(false)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const ok = await onActualizar({
      nombre: String(f.get(`nombre-${usuario.id}`)).trim(),
      telefono: String(f.get(`telefono-${usuario.id}`) ?? '').trim() || null,
    })
    if (ok) setEditando(false)
  }

  if (editando)
    return (
      <li className="p-4">
        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-3 md:grid-cols-[1fr_1fr_auto] md:items-end">
          <Input label="Nombre" name={`nombre-${usuario.id}`} defaultValue={usuario.nombre} required />
          <Input label="Teléfono" name={`telefono-${usuario.id}`} type="tel" defaultValue={usuario.telefono ?? ''} />
          <div className="flex gap-2">
            <Button type="button" variant="secondary" onClick={() => setEditando(false)}>
              Cancelar
            </Button>
            <Button type="submit" loading={guardando}>
              Guardar
            </Button>
          </div>
        </form>
      </li>
    )

  return (
    <li className="flex flex-col gap-3 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
      <div className="flex min-w-0 items-center gap-3">
        <Avatar nombre={usuario.nombre} />
        <div className="min-w-0">
          <p className="flex items-center gap-2 font-semibold text-navy-900">
            <span className="truncate">{usuario.nombre}</span>
            {esYo && <span className="text-xs font-normal text-slate-400">(tú)</span>}
            <RolBadge rol={usuario.rol} />
          </p>
          <p className="truncate text-sm text-slate-500">
            {usuario.email ?? '—'}
            {usuario.telefono && ` · ${usuario.telefono}`}
          </p>
          <p className="text-xs text-slate-400">Desde {formatFecha(usuario.created_at)}</p>
        </div>
      </div>
      <div className="flex items-center gap-2 sm:w-72">
        <select
          aria-label={`Rol de ${usuario.nombre}`}
          className={inputClass}
          value={usuario.rol}
          disabled={guardando}
          onChange={(e) => onCambiarRol(e.target.value as RolUsuario)}
        >
          {OPCIONES_ROL.map((o) => (
            <option key={o.value} value={o.value}>
              {o.label}
            </option>
          ))}
        </select>
        <Button variant="secondary" onClick={() => setEditando(true)} aria-label={`Editar a ${usuario.nombre}`}>
          <Pencil />
          <span className="hidden sm:inline">Editar</span>
        </Button>
      </div>
    </li>
  )
}
