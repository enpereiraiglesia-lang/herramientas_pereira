import { useState } from 'react'
import { useAuth } from '../../auth/hooks/useAuth'
import { BotonNuevoContacto } from '../../contactos/components/BotonNuevoContacto'
import { ROLES } from '../types'

function saludo(ahora: Date) {
  const h = ahora.getHours()
  if (h < 12) return 'Buenos días'
  if (h < 19) return 'Buenas tardes'
  return 'Buenas noches'
}

/** Encabezado de la landing: saludo con el nombre y rol del usuario */
export function Bienvenida() {
  const { perfil } = useAuth()
  const [ahora] = useState(() => new Date())
  const fecha = ahora.toLocaleDateString('es', { weekday: 'long', day: 'numeric', month: 'long' })

  return (
    <section className="relative mb-8 overflow-hidden rounded-2xl bg-navy-900 px-5 py-6 text-white sm:px-8 sm:py-8">
      <div className="pointer-events-none absolute -right-16 -top-20 h-64 w-64 rounded-full bg-primary-500/25 blur-3xl" />
      <div className="pointer-events-none absolute -bottom-24 right-40 h-56 w-56 rounded-full bg-sky-400/15 blur-3xl" />
      <div className="relative flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="text-sm capitalize text-navy-300">{fecha}</p>
          <h1 className="mt-1 text-2xl font-semibold tracking-tight sm:text-3xl">
            {saludo(ahora)},{perfil?.nombre.split(' ')[0] ?? ''}
          </h1>
          {perfil && (
            <p className="mt-2 text-sm text-navy-200">
              Sesión como <span className="font-medium text-white">{ROLES[perfil.rol].label}</span>
            </p>
          )}
        </div>
        <BotonNuevoContacto variante="claro" />
      </div>
    </section>
  )
}
