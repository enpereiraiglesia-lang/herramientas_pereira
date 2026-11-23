import type { ReactNode } from 'react'
import { Inbox, type LucideIcon } from 'lucide-react'

interface Props {
  title: string
  description?: string
  action?: ReactNode
  icon?: LucideIcon
}

export function EmptyState({ title, description, action, icon: Icon = Inbox }: Props) {
  return (
    <div className="flex flex-col items-center gap-2 rounded-xl border border-dashed border-slate-300 bg-white px-4 py-12 text-center">
      <span className="mb-1 flex h-12 w-12 items-center justify-center rounded-full bg-primary-50 text-primary-600">
        <Icon className="h-6 w-6" />
      </span>
      <p className="text-base font-semibold text-navy-900">{title}</p>
      {description && <p className="max-w-md text-sm text-slate-500">{description}</p>}
      {action && <div className="mt-3">{action}</div>}
    </div>
  )
}
