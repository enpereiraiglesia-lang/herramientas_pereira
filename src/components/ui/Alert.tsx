import type { ReactNode } from 'react'
import { AlertCircle, CheckCircle2, Info } from 'lucide-react'

const estilos = {
  error: { clase: 'border-rose-200 bg-rose-50 text-rose-800', Icono: AlertCircle },
  success: { clase: 'border-emerald-200 bg-emerald-50 text-emerald-800', Icono: CheckCircle2 },
  info: { clase: 'border-primary-200 bg-primary-50 text-primary-900', Icono: Info },
}

export function Alert({ type = 'error', children }: { type?: keyof typeof estilos; children: ReactNode }) {
  const { clase, Icono } = estilos[type]
  return (
    <div className={`flex gap-3 rounded-lg border px-4 py-3 text-sm ${clase}`} role={type === 'error' ? 'alert' : 'status'}>
      <Icono className="mt-0.5 h-4 w-4 shrink-0" />
      <div>{children}</div>
    </div>
  )
}
