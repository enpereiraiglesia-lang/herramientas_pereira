import { useDeferredValue, useState } from 'react'
import { useContactos } from '../hooks/useContactos'
import type { FiltrosContactos } from '../types'
import { ContactosFiltros } from './ContactosFiltros'
import { ContactosList } from './ContactosList'

const FILTROS_INICIALES: FiltrosContactos = { busqueda: '', estado: '', asignadoA: '' }

/** Listado de contactos con búsqueda y filtros */
export function ContactosExplorer() {
  const [filtros, setFiltros] = useState(FILTROS_INICIALES)
  const busqueda = useDeferredValue(filtros.busqueda)
  const { contactos, loading, error } = useContactos({ ...filtros, busqueda })

  return (
    <>
      <ContactosFiltros filtros={filtros} onChange={setFiltros} />
      {!loading && !error && (
        <p className="mb-3 text-sm text-slate-500">
          {contactos.length} contacto{contactos.length === 1 ? '' : 's'}
        </p>
      )}
      <ContactosList contactos={contactos} loading={loading} error={error} />
    </>
  )
}
