import type { ReactNode } from 'react'

export type BadgeColor = 'gray' | 'blue' | 'green' | 'yellow' | 'red' | 'purple'

const colors: Record<BadgeColor, string> = {
  gray: 'bg-slate-50 text-slate-700 ring-slate-500/20',
  blue: 'bg-primary-50 text-primary-700 ring-primary-600/20',
  green: 'bg-emerald-50 text-emerald-700 ring-emerald-600/20',
  yellow: 'bg-amber-50 text-amber-800 ring-amber-600/20',
  red: 'bg-rose-50 text-rose-700 ring-rose-600/20',
  purple: 'bg-navy-50 text-navy-800 ring-navy-700/20',
}

export function Badge({ color = 'gray', children }: { color?: BadgeColor; children: ReactNode }) {
  return (
    <span
      className={`inline-flex items-center gap-1 whitespace-nowrap rounded-md px-2 py-0.5 text-xs font-medium ring-1 ring-inset ${colors[color]}`}
    >
      {children}
    </span>
  )
}
