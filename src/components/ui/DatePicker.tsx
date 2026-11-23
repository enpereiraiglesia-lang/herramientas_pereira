import { useState } from 'react'
import { CalendarDays, X } from 'lucide-react'
import { Calendario } from './calendario/Calendario'
import { fechaCorta, fueraDeRango, hoy, sumarDias } from './calendario/fechas'
import { Popover } from './calendario/Popover'
import { Field, inputClass } from './Field'

interface Props {
  label: string
  name: string
  /** Controlado: fecha AAAA-MM-DD o null */
  value?: string | null
  /** No controlado: valor inicial */
  defaultValue?: string | null
  onChange?: (valor: string | null) => void
  min?: string
  max?: string
  required?: boolean
  placeholder?: string
  error?: string
  ayuda?: string
}

function relativo(iso: string) {
  const h = hoy()
  if (iso === h) return 'Hoy'
  if (iso === sumarDias(h, -1)) return 'Ayer'
  if (iso === sumarDias(h, 1)) return 'Mañana'
  return null
}

/** Campo de fecha con calendario propio (en español, semana desde el lunes).
 *  Envía el valor en un input oculto con `name`, así funciona con FormData. */
export function DatePicker({
  label,
  name,
  value,
  defaultValue = null,
  onChange,
  min,
  max,
  required,
  placeholder = 'Elegir fecha',
  error,
  ayuda,
}: Props) {
  const [interno, setInterno] = useState<string | null>(defaultValue)
  const valor = value !== undefined ? value : interno

  function cambiar(v: string | null) {
    if (value === undefined) setInterno(v)
    onChange?.(v)
  }

  const etiquetaRel = valor ? relativo(valor) : null
  const hoyPermitido = !fueraDeRango(hoy(), min, max)

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
              <CalendarDays className={`h-4 w-4 shrink-0 ${valor ? 'text-primary-600' : 'text-slate-400'}`} />
              {valor ? (
                <span className="truncate">
                  {etiquetaRel && <span className="font-medium text-navy-900">{etiquetaRel} · </span>}
                  {fechaCorta(valor)}
                </span>
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
            {/* Campo para FormData y validación nativa de "requerido" */}
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
            <Calendario
              valor={valor}
              min={min}
              max={max}
              onElegir={(v) => {
                cambiar(v)
                cerrar()
              }}
            />
            <div className="mt-3 flex items-center justify-between border-t border-slate-100 pt-3">
              {!required ? (
                <button
                  type="button"
                  className="rounded-lg px-3 py-2 text-sm font-medium text-slate-500 hover:bg-slate-100"
                  onClick={() => {
                    cambiar(null)
                    cerrar()
                  }}
                >
                  Borrar
                </button>
              ) : (
                <span />
              )}
              <button
                type="button"
                disabled={!hoyPermitido}
                className="rounded-lg px-3 py-2 text-sm font-semibold text-primary-700 hover:bg-primary-50 disabled:opacity-40"
                onClick={() => {
                  cambiar(hoy())
                  cerrar()
                }}
              >
                Hoy
              </button>
            </div>
          </>
        )}
      </Popover>
      {ayuda && !error && <p className="text-xs text-slate-500">{ayuda}</p>}
    </Field>
  )
}
