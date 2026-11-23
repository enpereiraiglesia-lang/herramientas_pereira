import { useCallback, useEffect, useRef, useState, type ReactNode } from 'react'

interface Props {
  /** Botón que abre el panel. Recibe el estado y la función para alternar. */
  disparador: (p: { abierto: boolean; alternar: () => void }) => ReactNode
  /** Contenido del panel. Recibe una función para cerrarlo. */
  children: (cerrar: () => void) => ReactNode
  alinear?: 'izquierda' | 'derecha'
  etiqueta: string
}

const ALTO_ESTIMADO = 400

/** Panel flotante: menú desplegable en escritorio y hoja inferior en celular.
 *  Se cierra con Escape, al hacer clic fuera o al elegir una opción. */
export function Popover({ disparador, children, alinear = 'izquierda', etiqueta }: Props) {
  const [abierto, setAbierto] = useState(false)
  const [haciaArriba, setHaciaArriba] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  const cerrar = useCallback(() => setAbierto(false), [])

  const alternar = useCallback(() => {
    setAbierto((a) => {
      if (!a && ref.current) {
        const r = ref.current.getBoundingClientRect()
        setHaciaArriba(r.bottom + ALTO_ESTIMADO > window.innerHeight && r.top > ALTO_ESTIMADO)
      }
      return !a
    })
  }, [])

  useEffect(() => {
    if (!abierto) return
    const fuera = (e: MouseEvent | TouchEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) cerrar()
    }
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.stopPropagation()
        cerrar()
        ref.current?.querySelector<HTMLElement>('[data-disparador]')?.focus()
      }
    }
    document.addEventListener('mousedown', fuera)
    document.addEventListener('touchstart', fuera)
    document.addEventListener('keydown', tecla, true)
    return () => {
      document.removeEventListener('mousedown', fuera)
      document.removeEventListener('touchstart', fuera)
      document.removeEventListener('keydown', tecla, true)
    }
  }, [abierto, cerrar])

  const posicion = [
    haciaArriba ? 'sm:bottom-full sm:mb-2' : 'sm:top-full sm:mt-2',
    alinear === 'derecha' ? 'sm:right-0' : 'sm:left-0',
  ].join(' ')

  return (
    <div ref={ref} className="relative">
      {disparador({ abierto, alternar })}
      {abierto && (
        <>
          <button
            type="button"
            aria-label="Cerrar calendario"
            className="fixed inset-0 z-50 bg-navy-950/40 sm:hidden"
            onClick={cerrar}
          />
          <div
            role="dialog"
            aria-label={etiqueta}
            className={`fixed inset-x-0 bottom-0 z-50 rounded-t-2xl border border-slate-200 bg-white p-4 pb-[max(1rem,env(safe-area-inset-bottom))] shadow-2xl sm:absolute sm:inset-x-auto sm:bottom-auto sm:w-[20rem] sm:rounded-xl sm:p-3 sm:shadow-xl ${posicion} animate-[aparecer_120ms_ease-out]`}
          >
            <div className="mx-auto mb-3 h-1 w-10 rounded-full bg-slate-200 sm:hidden" />
            {children(cerrar)}
          </div>
        </>
      )}
    </div>
  )
}
