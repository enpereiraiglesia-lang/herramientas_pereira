import type { ReactNode } from 'react'

interface Props {
  label: string
  htmlFor: string
  error?: string
  children: ReactNode
}

export function Field({ label, htmlFor, error, children }: Props) {
  return (
    <div className="flex flex-col gap-1.5">
      <label htmlFor={htmlFor} className="text-sm font-medium text-navy-900">
        {label}
      </label>
      {children}
      {error && <p className="text-sm text-rose-600">{error}</p>}
    </div>
  )
}

export const inputClass =
  'min-h-11 w-full rounded-lg border-0 bg-white px-3 py-2 text-base text-slate-900 shadow-xs ring-1 ring-inset ring-slate-300 outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-primary-600 disabled:bg-slate-50 disabled:text-slate-500 sm:text-sm'
