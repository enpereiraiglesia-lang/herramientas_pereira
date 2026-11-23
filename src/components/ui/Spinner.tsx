import { Loader2 } from 'lucide-react'

export function Spinner({ label = 'Cargando...' }: { label?: string }) {
  return (
    <div className="flex items-center justify-center gap-3 py-10 text-sm text-slate-500" role="status">
      <Loader2 className="h-5 w-5 animate-spin text-primary-600" />
      <span>{label}</span>
    </div>
  )
}
