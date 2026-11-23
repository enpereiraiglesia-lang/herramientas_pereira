import type { ReactNode } from 'react'

interface Props {
  title?: string
  description?: string
  actions?: ReactNode
  children: ReactNode
  className?: string
}

export function Card({ title, description, actions, children, className = '' }: Props) {
  return (
    <section className={`rounded-xl border border-slate-200/80 bg-white shadow-xs ${className}`}>
      {(title || actions) && (
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3 sm:px-6">
          <div>
            {title && <h2 className="text-base font-semibold text-navy-900">{title}</h2>}
            {description && <p className="text-sm text-slate-500">{description}</p>}
          </div>
          {actions}
        </header>
      )}
      <div className="p-4 sm:p-6">{children}</div>
    </section>
  )
}
