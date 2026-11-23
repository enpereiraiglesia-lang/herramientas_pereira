import { Navigate } from 'react-router-dom'
import { PhoneCall, ShieldCheck, Users } from 'lucide-react'
import { Logo } from '../components/ui/Logo'
import { LoginForm } from '../features/auth/components/LoginForm'
import { useAuth } from '../features/auth/hooks/useAuth'
import { RUTA_LANDING } from '../lib/rutas'

const PUNTOS = [
  { Icono: Users, texto: 'Registra a cada persona que contactas en la calle' },
  { Icono: PhoneCall, texto: 'Da seguimiento con llamadas y su historial' },
  { Icono: ShieldCheck, texto: 'Asigna responsables y controla los permisos del equipo' },
]

export function LoginPage() {
  const { session } = useAuth()
  if (session) return <Navigate to={RUTA_LANDING} replace />

  return (
    <div className="grid min-h-dvh pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)] lg:grid-cols-2">
      {/* Panel de marca (solo escritorio) */}
      <aside className="relative hidden overflow-hidden bg-navy-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
        <div className="pointer-events-none absolute -left-24 top-1/3 h-96 w-96 rounded-full bg-primary-500/20 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 right-0 h-80 w-80 rounded-full bg-sky-400/10 blur-3xl" />
        <div className="relative">
          <Logo tono="oscuro" />
        </div>
        <div className="relative max-w-md">
          <h2 className="text-3xl font-semibold leading-tight tracking-tight">
            Cada persona alcanzada merece un seguimiento.
          </h2>
          <ul className="mt-8 flex flex-col gap-4">
            {PUNTOS.map(({ Icono, texto }) => (
              <li key={texto} className="flex items-center gap-3 text-navy-200">
                <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-white/10 text-primary-300">
                  <Icono className="h-4 w-4" />
                </span>
                {texto}
              </li>
            ))}
          </ul>
        </div>
        <p className="relative text-sm text-navy-400">«Id por todo el mundo y predicad el evangelio» — Marcos 16:15</p>
      </aside>

      {/* Formulario */}
      <main className="flex items-center justify-center bg-surface px-4 py-12">
        <div className="w-full max-w-sm">
          <div className="mb-8 lg:hidden">
            <Logo />
          </div>
          <h1 className="text-2xl font-semibold tracking-tight text-navy-900">Iniciar sesión</h1>
          <p className="mb-8 mt-1 text-sm text-slate-500">Ingresa con tu correo y contraseña</p>
          <LoginForm />
        </div>
      </main>
    </div>
  )
}
