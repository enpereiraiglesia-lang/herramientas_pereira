import { Suspense, useState } from 'react'
import { Outlet } from 'react-router-dom'
import { Header } from './Header'
import { Sidebar } from './Sidebar'
import { Spinner } from '../ui/Spinner'
import { AvisosPwa } from '../../pwa/AvisosPwa'

export function Layout() {
  const [menuAbierto, setMenuAbierto] = useState(false)

  return (
    <div className="flex min-h-dvh pr-[env(safe-area-inset-right)] pl-[env(safe-area-inset-left)] lg:pl-0">
      <Sidebar abierto={menuAbierto} onCerrar={() => setMenuAbierto(false)} />

      <div className="flex min-w-0 flex-1 flex-col">
        <Header onAbrirMenu={() => setMenuAbierto(true)} />
        <main className="mx-auto w-full max-w-7xl flex-1 px-4 py-6 sm:px-6 lg:px-10 lg:py-10">
          <Suspense fallback={<Spinner />}>
            <Outlet />
          </Suspense>
        </main>
        <footer className="border-t border-slate-200 px-4 pt-4 pb-[max(1rem,env(safe-area-inset-bottom))] text-center text-xs text-slate-400">
          «Id por todo el mundo y predicad el evangelio» — Marcos 16:15
        </footer>
        <AvisosPwa />
      </div>
    </div>
  )
}
