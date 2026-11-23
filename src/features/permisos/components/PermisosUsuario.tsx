import { ShieldCheck } from 'lucide-react'
import { Avatar } from '../../../components/ui/Avatar'
import { Switch } from '../../../components/ui/Switch'
import { RolBadge } from '../../usuarios/components/RolBadge'
import type { Usuario } from '../../usuarios/types'
import { LISTA_MODULOS, MODULOS, type Modulo } from '../modulos'

interface Props {
  usuario: Usuario
  guardando: boolean
  onCambiar: (modulos: Modulo[]) => void
}

/** Tarjeta con los interruptores de módulos de un usuario */
export function PermisosUsuario({ usuario, guardando, onCambiar }: Props) {
  const esAdmin = usuario.rol === 'administrador'
  const actuales = usuario.modulos as Modulo[]

  function alternar(modulo: Modulo) {
    const nuevos = actuales.includes(modulo) ? actuales.filter((m) => m !== modulo) : [...actuales, modulo]
    onCambiar(LISTA_MODULOS.filter((m) => nuevos.includes(m))) // mantiene el orden del catálogo
  }

  return (
    <article
      className={`rounded-xl border bg-white shadow-xs transition-colors ${
        guardando ? 'border-primary-400' : 'border-slate-200/80'
      }`}
    >
      <header className="flex items-center gap-3 border-b border-slate-100 p-4">
        <Avatar nombre={usuario.nombre} />
        <div className="min-w-0 flex-1">
          <p className="truncate font-semibold text-navy-900">{usuario.nombre}</p>
          <p className="truncate text-sm text-slate-500">{usuario.email}</p>
        </div>
        <RolBadge rol={usuario.rol} />
      </header>

      {esAdmin ? (
        <div className="flex items-center gap-3 p-4 text-sm text-slate-600">
          <ShieldCheck className="h-5 w-5 text-navy-700" />
          Acceso completo a todos los módulos
        </div>
      ) : (
        <ul className="divide-y divide-slate-100">
          {LISTA_MODULOS.map((m) => {
            const { icono: Icono, label, descripcion } = MODULOS[m]
            return (
              <li key={m} className="flex min-h-14 items-center gap-3 px-4 py-2.5">
                <Icono className="h-5 w-5 shrink-0 text-slate-400" />
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-medium text-navy-900">{label}</p>
                  <p className="truncate text-xs text-slate-500">{descripcion}</p>
                </div>
                <Switch
                  label={`${label} para ${usuario.nombre}`}
                  checked={actuales.includes(m)}
                  disabled={guardando}
                  onChange={() => alternar(m)}
                />
              </li>
            )
          })}
        </ul>
      )}
    </article>
  )
}
