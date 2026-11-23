import { useState } from 'react'
import { NavLink, Link, useLocation } from 'react-router-dom'
import { ChevronDown, Download, LogOut, ShieldCheck, UserCog, X, type LucideIcon } from 'lucide-react'
import { instalarApp } from '../../pwa/pwa'
import { usePwa } from '../../pwa/usePwa'
import { useAuth } from '../../features/auth/hooks/useAuth'
import { usePermisos } from '../../features/permisos/hooks/usePermisos'
import { LISTA_MODULOS, MODULOS, padreDe, type Modulo } from '../../features/permisos/modulos'
import { ROLES } from '../../features/usuarios/types'
import { Avatar } from '../ui/Avatar'
import { Logo } from '../ui/Logo'

const LINKS_ADMIN: { to: string; label: string; icono: LucideIcon }[] = [
  { to: '/usuarios', label: 'Usuarios', icono: UserCog },
  { to: '/permisos', label: 'Permisos', icono: ShieldCheck },
]

const linkClass = ({ isActive }: { isActive: boolean }) =>
  `group relative flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors ${
    isActive ? 'bg-white/10 text-white' : 'text-navy-200 hover:bg-white/5 hover:text-white'
  }`

function Item({ to, label, Icono, onClick }: { to: string; label: string; Icono: LucideIcon; onClick: () => void }) {
  return (
    <NavLink to={to} end={to === '/'} className={linkClass} onClick={onClick}>
      {({ isActive }) => (
        <>
          {isActive && <span className="absolute inset-y-2 left-0 w-1 rounded-r bg-primary-400" />}
          <Icono className={`h-5 w-5 ${isActive ? 'text-primary-300' : 'text-navy-400 group-hover:text-navy-200'}`} />
          {label}
        </>
      )}
    </NavLink>
  )
}

/** Módulo con submenú desplegable (ej. Salidas TCI → Salidas, Contactos) */
function Grupo({ modulo, hijos, onClick }: { modulo: Modulo; hijos: Modulo[]; onClick: () => void }) {
  const { pathname } = useLocation()
  const def: { label: string; ruta: string | null; icono: LucideIcon; etiquetaSubmenu?: string } = MODULOS[modulo]
  const rutas = [modulo, ...hijos].map((m) => MODULOS[m].ruta ?? '/')
  const dentro = rutas.some((r) => pathname === r || pathname.startsWith(`${r}/`))
  const [abierto, setAbierto] = useState(dentro)
  const Icono = def.icono
  const desplegado = abierto || dentro

  return (
    <div>
      <button
        type="button"
        onClick={() => setAbierto(!desplegado)}
        aria-expanded={desplegado}
        className={`group relative flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium transition-colors ${
          dentro ? 'text-white' : 'text-navy-200 hover:bg-white/5 hover:text-white'
        }`}
      >
        <Icono className={`h-5 w-5 ${dentro ? 'text-primary-300' : 'text-navy-400 group-hover:text-navy-200'}`} />
        <span className="flex-1 text-left">{def.label}</span>
        <ChevronDown className={`h-4 w-4 text-navy-400 transition-transform duration-200 ${desplegado ? 'rotate-180' : ''}`} />
      </button>
      <div className={`grid transition-[grid-template-rows] duration-200 ${desplegado ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]'}`}>
        <div className="overflow-hidden">
          <div className="mt-1 ml-5 flex flex-col gap-1 border-l border-white/10 pl-2">
            <Item to={def.ruta ?? '/'} label={def.etiquetaSubmenu ?? def.label} Icono={Icono} onClick={onClick} />
            {hijos.map((h) => (
              <Item key={h} to={MODULOS[h].ruta ?? '/'} label={MODULOS[h].label} Icono={MODULOS[h].icono} onClick={onClick} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}

interface Props {
  abierto: boolean
  onCerrar: () => void
}

export function Sidebar({ abierto, onCerrar }: Props) {
  const { perfil, signOut } = useAuth()
  const { puede, esAdmin } = usePermisos()
  const { instalable, enModoApp } = usePwa()
  // Un módulo con padre va dentro del submenú del padre (si el usuario tiene ambos)
  const enSubmenu = (m: Modulo) => {
    const padre = padreDe(m)
    return padre !== null && puede(padre)
  }
  const hijosDe = (m: Modulo) => LISTA_MODULOS.filter((h) => padreDe(h) === m && puede(h) && MODULOS[h].ruta)
  const principales = LISTA_MODULOS.filter((m) => MODULOS[m].seccion === 'principal' && puede(m) && !enSubmenu(m))
  const herramientas = LISTA_MODULOS.filter((m) => MODULOS[m].seccion === 'herramientas' && puede(m))

  return (
    <>
      {abierto && (
        <button aria-label="Cerrar menú" className="fixed inset-0 z-30 bg-navy-950/50 lg:hidden" onClick={onCerrar} />
      )}

      <aside
        className={`fixed inset-y-0 left-0 z-40 flex w-64 max-w-[80vw] flex-col bg-navy-900 pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] pl-[env(safe-area-inset-left)] transition-transform duration-200 lg:sticky lg:top-0 lg:h-dvh lg:translate-x-0 ${
          abierto ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="flex h-16 items-center justify-between border-b border-white/10 px-4">
          <Link to="/" onClick={onCerrar} className="flex min-h-11 items-center">
            <Logo tono="oscuro" />
          </Link>
          <button
            aria-label="Cerrar menú"
            onClick={onCerrar}
            className="flex h-11 w-11 items-center justify-center rounded-lg text-navy-300 hover:bg-white/10 hover:text-white lg:hidden"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-1 flex-col gap-1 overflow-y-auto px-3 py-4">
          <p className="px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-navy-400">Principal</p>
          {principales.map((m) => {
            const hijos = hijosDe(m)
            return hijos.length ? (
              <Grupo key={m} modulo={m} hijos={hijos} onClick={onCerrar} />
            ) : (
              <Item key={m} to={MODULOS[m].ruta ?? '/'} label={MODULOS[m].label} Icono={MODULOS[m].icono} onClick={onCerrar} />
            )
          })}

          {herramientas.length > 0 && (
            <>
              <p className="mt-6 px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-navy-400">
                Herramientas
              </p>
              {herramientas.map((m) => (
                <Item
                  key={m}
                  to={MODULOS[m].ruta ?? '/'}
                  label={MODULOS[m].label}
                  Icono={MODULOS[m].icono}
                  onClick={onCerrar}
                />
              ))}
            </>
          )}

          {esAdmin && (
            <>
              <p className="mt-6 px-3 pb-2 text-[11px] font-semibold uppercase tracking-wider text-navy-400">
                Administración
              </p>
              {LINKS_ADMIN.map((l) => (
                <Item key={l.to} to={l.to} label={l.label} Icono={l.icono} onClick={onCerrar} />
              ))}
            </>
          )}
        </nav>

        <div className="border-t border-white/10 p-3">
          {perfil && (
            <div className="mb-2 flex items-center gap-3 rounded-lg px-2 py-2">
              <Avatar nombre={perfil.nombre} size="sm" />
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-white">{perfil.nombre}</p>
                <p className="truncate text-xs text-navy-300">{ROLES[perfil.rol].label}</p>
              </div>
            </div>
          )}
          {instalable && !enModoApp && (
            <button
              onClick={() => void instalarApp()}
              className="mb-1 flex min-h-11 w-full items-center gap-3 rounded-lg bg-white/5 px-3 text-sm font-medium text-white hover:bg-white/10"
            >
              <Download className="h-5 w-5 text-primary-300" />
              Instalar aplicación
            </button>
          )}
          <button
            onClick={signOut}
            className="flex min-h-11 w-full items-center gap-3 rounded-lg px-3 text-sm font-medium text-navy-200 hover:bg-white/5 hover:text-white"
          >
            <LogOut className="h-5 w-5 text-navy-400" />
            Cerrar sesión
          </button>
        </div>
      </aside>
    </>
  )
}
