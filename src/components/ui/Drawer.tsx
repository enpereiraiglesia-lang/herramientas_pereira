import { useEffect, type ReactNode } from 'react'
import { X } from 'lucide-react'

interface Props {
  abierto: boolean
  titulo: ReactNode
  subtitulo?: ReactNode
  onCerrar: () => void
  children: ReactNode
}

/** Panel lateral derecho (pantalla completa en móvil) */
export function Drawer({ abierto, titulo, subtitulo, onCerrar, children }: Props) {
  useEffect(() => {
    if (!abierto) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && onCerrar()
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [abierto, onCerrar])

  if (!abierto) return null

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true">
      <button aria-label="Cerrar panel" className="absolute inset-0 bg-navy-950/40" onClick={onCerrar} />
      <div className="relative flex h-full w-full flex-col bg-white pr-[env(safe-area-inset-right)] shadow-2xl sm:max-w-xl">
        <header className="flex items-start justify-between gap-3 border-b border-slate-200 px-4 pt-[max(1rem,env(safe-area-inset-top))] pb-4 sm:px-6">
          <div className="min-w-0">
            <h2 className="truncate text-lg font-semibold text-navy-900">{titulo}</h2>
            {subtitulo && <div className="mt-1 text-sm text-slate-500">{subtitulo}</div>}
          </div>
          <button
            onClick={onCerrar}
            aria-label="Cerrar"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100"
          >
            <X className="h-5 w-5" />
          </button>
        </header>
        <div className="flex-1 overflow-y-auto overscroll-contain px-4 pt-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:px-6">{children}</div>
      </div>
    </div>
  )
}
