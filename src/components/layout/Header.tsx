import { Link } from 'react-router-dom'
import { Menu } from 'lucide-react'
import { Logo } from '../ui/Logo'

/** Barra superior solo para móvil/tablet: abre el menú lateral (respeta el notch en modo app) */
export function Header({ onAbrirMenu }: { onAbrirMenu: () => void }) {
  return (
    <header className="sticky top-0 z-20 flex min-h-16 items-center gap-2 bg-navy-900 px-4 pt-[env(safe-area-inset-top)] shadow-sm lg:hidden">
      <button
        className="flex h-11 w-11 items-center justify-center rounded-lg text-white hover:bg-white/10"
        onClick={onAbrirMenu}
        aria-label="Abrir menú"
      >
        <Menu className="h-6 w-6" />
      </button>
      <Link to="/" className="flex min-h-11 items-center">
        <Logo tono="oscuro" subtitulo={false} />
      </Link>
    </header>
  )
}
