import { HeartHandshake, Sparkles, UserCheck, Users, type LucideIcon } from 'lucide-react'
import { useAuth } from '../../auth/hooks/useAuth'
import { useResumen } from '../hooks/useResumen'

interface StatProps {
  label: string
  value: number | string
  Icono: LucideIcon
  tono: string
}

function Stat({ label, value, Icono, tono }: StatProps) {
  return (
    <div className="flex items-center gap-4 rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs sm:p-5">
      <span className={`flex h-11 w-11 shrink-0 items-center justify-center rounded-lg ${tono}`}>
        <Icono className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="truncate text-xs font-medium uppercase tracking-wide text-slate-500">{label}</p>
        <p className="mt-0.5 text-2xl font-semibold text-navy-900">{value}</p>
      </div>
    </div>
  )
}

export function ResumenStats() {
  const { user } = useAuth()
  const { resumen, loading } = useResumen(user?.id)
  const v = (n: number | undefined) => (loading ? '—' : (n ?? 0))

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <Stat label="Contactos totales" value={v(resumen?.total)} Icono={Users} tono="bg-navy-50 text-navy-800" />
      <Stat label="Nuevos sin llamar" value={v(resumen?.nuevos)} Icono={Sparkles} tono="bg-primary-50 text-primary-600" />
      <Stat label="Asignados a mí" value={v(resumen?.misAsignados)} Icono={UserCheck} tono="bg-sky-50 text-sky-600" />
      <Stat label="Integrados" value={v(resumen?.integrados)} Icono={HeartHandshake} tono="bg-emerald-50 text-emerald-600" />
    </div>
  )
}
