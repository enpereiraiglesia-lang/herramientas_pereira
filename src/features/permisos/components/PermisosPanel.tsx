import { useState } from 'react'
import { Alert } from '../../../components/ui/Alert'
import { Input } from '../../../components/ui/Input'
import { Spinner } from '../../../components/ui/Spinner'
import { useUsuarios } from '../../usuarios/hooks/useUsuarios'
import { PermisosUsuario } from './PermisosUsuario'

/** Administración de permisos: módulos visibles para cada colaborador */
export function PermisosPanel() {
  const { usuarios, loading, error, guardandoId, saveError, actualizarModulos } = useUsuarios()
  const [busqueda, setBusqueda] = useState('')

  if (loading && usuarios.length === 0) return <Spinner />
  if (error) return <Alert>{error}</Alert>

  const q = busqueda.trim().toLowerCase()
  const filtrados = usuarios
    .filter((u) => !q || u.nombre.toLowerCase().includes(q) || u.email?.toLowerCase().includes(q))
    // Colaboradores primero: son a quienes se les eligen módulos
    .sort((a, b) => (a.rol === b.rol ? 0 : a.rol === 'colaborador' ? -1 : 1))

  return (
    <div className="flex flex-col gap-4">
      <Alert type="info">
        Marca los módulos que puede ver cada colaborador. Los cambios se guardan al instante y el colaborador los
        verá al recargar la página. Los administradores siempre ven todo.
      </Alert>
      {saveError && <Alert>{saveError}</Alert>}
      <div className="sm:max-w-sm">
        <Input
          label="Buscar usuario"
          name="buscar_usuario"
          type="search"
          value={busqueda}
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filtrados.map((u) => (
          <PermisosUsuario
            key={u.id}
            usuario={u}
            guardando={guardandoId === u.id}
            onCambiar={(modulos) => actualizarModulos(u.id, modulos)}
          />
        ))}
      </div>
    </div>
  )
}
