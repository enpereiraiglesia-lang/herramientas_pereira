import { useState } from 'react'
import { Download, RefreshCw, Share, SquarePlus, X } from 'lucide-react'
import { NOMBRE_APP } from '../lib/marca'
import { aplicarActualizacion, instalarApp } from './pwa'
import { usePwa } from './usePwa'

const CLAVE_DESCARTADO = 'familymission.instalar_descartado'
const DIAS_SIN_MOSTRAR = 14

function descartadoReciente() {
  try {
    const t = Number(localStorage.getItem(CLAVE_DESCARTADO) ?? 0)
    return Date.now() - t < DIAS_SIN_MOSTRAR * 86_400_000
  } catch {
    return false
  }
}

function guardarDescarte() {
  try {
    localStorage.setItem(CLAVE_DESCARTADO, String(Date.now()))
  } catch {
    /* sin almacenamiento: se vuelve a mostrar la próxima vez */
  }
}

const tarjeta =
  'pointer-events-auto w-full max-w-md rounded-2xl border border-slate-200 bg-white p-4 shadow-2xl animate-[aparecer_200ms_ease-out]'

/** Avisos flotantes: versión nueva disponible e invitación a instalar la app */
export function AvisosPwa() {
  const { actualizacion, instalable, enModoApp, esIOS } = usePwa()
  const [oculto, setOculto] = useState(descartadoReciente)

  const verInstalar = !enModoApp && !oculto && (instalable || esIOS)
  if (!actualizacion && !verInstalar) return null

  function cerrar() {
    guardarDescarte()
    setOculto(true)
  }

  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-0 z-40 flex flex-col items-center gap-3 px-4 pb-[max(1rem,env(safe-area-inset-bottom))] lg:left-64">
      {actualizacion ? (
        <div className={`${tarjeta} flex items-center gap-3`} role="status">
          <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary-50 text-primary-600">
            <RefreshCw className="h-5 w-5" />
          </span>
          <p className="min-w-0 flex-1 text-sm text-slate-700">
            <strong className="block font-semibold text-navy-900">Nueva versión disponible</strong>
            Actualiza para ver las últimas mejoras.
          </p>
          <button
            type="button"
            onClick={aplicarActualizacion}
            className="min-h-11 shrink-0 rounded-lg bg-primary-600 px-4 text-sm font-semibold text-white hover:bg-primary-700"
          >
            Actualizar
          </button>
        </div>
      ) : (
        <div className={tarjeta} role="dialog" aria-label="Instalar la aplicación">
          <div className="flex items-start gap-3">
            <img src="/icons/icon-192.png" alt="" className="h-12 w-12 shrink-0 rounded-xl" />
            <div className="min-w-0 flex-1">
              <p className="font-semibold text-navy-900">Instala {NOMBRE_APP}</p>
              <p className="text-sm text-slate-500">Ábrela desde tu pantalla de inicio, como una aplicación.</p>
            </div>
            <button
              type="button"
              onClick={cerrar}
              aria-label="Ahora no"
              className="-mt-1 -mr-1 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg text-slate-400 hover:bg-slate-100"
            >
              <X className="h-5 w-5" />
            </button>
          </div>

          {instalable ? (
            <button
              type="button"
              onClick={async () => {
                if (!(await instalarApp())) cerrar()
              }}
              className="mt-3 flex min-h-11 w-full items-center justify-center gap-2 rounded-lg bg-primary-600 px-4 text-sm font-semibold text-white hover:bg-primary-700"
            >
              <Download className="h-4 w-4" />
              Instalar aplicación
            </button>
          ) : (
            <ol className="mt-3 flex flex-col gap-2 rounded-xl bg-slate-50 p-3 text-sm text-slate-700">
              <li className="flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-600 text-xs font-semibold text-white">1</span>
                Toca <Share className="h-4 w-4 text-primary-600" aria-label="Compartir" /> <strong>Compartir</strong> en Safari
              </li>
              <li className="flex items-center gap-2">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary-600 text-xs font-semibold text-white">2</span>
                Elige <SquarePlus className="h-4 w-4 text-primary-600" aria-hidden /> <strong>Agregar a inicio</strong>
              </li>
            </ol>
          )}
        </div>
      )}
    </div>
  )
}
