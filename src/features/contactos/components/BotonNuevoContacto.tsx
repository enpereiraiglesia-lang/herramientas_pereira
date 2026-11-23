import { Link } from 'react-router-dom'
import { Plus, UserPlus } from 'lucide-react'
import { linkBoton } from '../../../components/ui/estilos'
import { usePermisos } from '../../permisos/hooks/usePermisos'

/** Enlace a "Nuevo contacto"; solo se muestra si el usuario tiene el módulo */
export function BotonNuevoContacto({ variante = 'boton' }: { variante?: 'boton' | 'link' | 'claro' }) {
  const { puede } = usePermisos()
  if (!puede('registrar_contacto')) return null

  if (variante === 'link')
    return (
      <Link to="/contactos/nuevo" className="inline-flex items-center gap-1.5 text-sm font-semibold text-primary-600 hover:text-primary-700">
        <Plus className="h-4 w-4" />
        Registrar contacto
      </Link>
    )

  if (variante === 'claro')
    return (
      <Link
        to="/contactos/nuevo"
        className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold text-navy-900 shadow-sm hover:bg-primary-50"
      >
        <UserPlus className="h-4 w-4" />
        Nuevo contacto
      </Link>
    )

  return (
    <Link to="/contactos/nuevo" className={linkBoton.primary}>
      <UserPlus />
      Nuevo contacto
    </Link>
  )
}
