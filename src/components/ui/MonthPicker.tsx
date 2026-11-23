import { useState } from 'react'
import { CalendarRange, X } from 'lucide-react'
import { CalendarioMeses } from './calendario/CalendarioMeses'
import { fueraDeRango, mesActual, nombreMes } from './calendario/fechas'
import { Popover } from './calendario/Popover'
import { Field, inputClass } from './Field'

interface Props {
  label: string
  name: string
  /** Mes en formato AAAA-MM */
  value?: string | null
  defaultValue?: string | null
  onChange?: (mes: string | null) => void
  min?: string
  max?: string
  required?: boolean
  placeholder?: string
  error?: string
}

/** Campo para elegir mes y año con una grilla de meses */
export function MonthPicker({
  label,
  name,
  value,
  defaultValue = null,
  onChange,
  min,
  max,
  required,
  placeholder = 'Elegir mes',
  error,
}: Props) {
  const [interno, setInterno] = useState<string | null>(defaultValue)
  const valor = value !== undefined ? value : interno

  function cambiar(v: string | null) {
    if (value === undefined) setInterno(v)
    onChange?.(v)
  }

  return (
    <Field label={label} htmlFor={name} error={error}>
      <Popover
        etiqueta={label}
        disparador={({ abierto, alternar }) => (
          <div className="relative">
            <button
              id={name}
              type="button"
              data-disparador
              onClick={alternar}
              aria-haspopup="dialog"
              aria-expanded={abierto}
              className={`${inputClass} flex items-center gap-2.5 pr-10 text-left ${abierto ? 'ring-2 ring-primary-600' : ''}`}
            >
              <CalendarRange className={`h-4 w-4 shrink-0 ${valor ? 'text-primary-600' : 'text-slate-400'}`} />
              {valor ? (
                <span className="truncate capitalize">{nombreMes(valor)}</span>
              ) : (
                <span className="text-slate-400">{placeholder}</span>
              )}
            </button>
            {valor && !required && (
              <button
                type="button"
                onClick={() => cambiar(null)}
                aria-label={`Borrar ${label}`}
                className="absolute inset-y-0 right-1 my-auto flex h-9 w-9 items-center justify-center rounded-md text-slate-400 hover:bg-slate-100 hover:text-slate-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
            <input
              tabIndex={-1}
              aria-hidden
              name={name}
              required={required}
              value={valor ?? ''}
              onChange={() => {}}
              className="pointer-events-none absolute inset-0 opacity-0"
            />
          </div>
        )}
      >
        {(cerrar) => (
          <>
            <CalendarioMeses
              valor={valor}
              min={min}
              max={max}
              onElegir={(m) => {
                cambiar(m)
                cerrar()
              }}
            />
            <div className="mt-3 flex justify-end border-t border-slate-100 pt-3">
              <button
                type="button"
                disabled={fueraDeRango(mesActual(), min, max)}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-primary-700 hover:bg-primary-50 disabled:opacity-40"
                onClick={() => {
                  cambiar(mesActual())
                  cerrar()
                }}
              >
                Este mes
              </button>
            </div>
          </>
        )}
      </Popover>
    </Field>
  )
}
