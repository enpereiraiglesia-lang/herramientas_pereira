import { useState } from 'react'
import { UserPlus } from 'lucide-react'
import { Alert } from '../../../components/ui/Alert'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { Spinner } from '../../../components/ui/Spinner'
import { useAuth } from '../../auth/hooks/useAuth'
import { useUsuarios } from '../hooks/useUsuarios'
import { ROLES, type RolUsuario } from '../types'
import { NuevoUsuarioForm } from './NuevoUsuarioForm'
import { RolBadge } from './RolBadge'
import { UsuarioItem } from './UsuarioItem'

/** Gestión de usuarios: crear colaboradores/administradores, editar y cambiar rol */
export function UsuariosModulo() {
  const { user } = useAuth()
  const { usuarios, loading, error, guardandoId, saveError, crear, cambiarRol, actualizar } = useUsuarios()
  const [creando, setCreando] = useState(false)

  if (loading && usuarios.length === 0) return <Spinner />
  if (error) return <Alert>{error}</Alert>

  const total = (rol: RolUsuario) => usuarios.filter((u) => u.rol === rol).length

  return (
    <div className="flex flex-col gap-6">
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {(Object.keys(ROLES) as RolUsuario[]).map((r) => (
          <div key={r} className="rounded-xl border border-slate-200/80 bg-white p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <RolBadge rol={r} />
              <span className="text-2xl font-semibold text-navy-900">{total(r)}</span>
            </div>
            <p className="mt-2 text-sm text-slate-500">{ROLES[r].descripcion}</p>
          </div>
        ))}
      </div>

      {creando ? (
        <Card title="Nuevo usuario">
          <NuevoUsuarioForm
            saving={guardandoId === 'nuevo'}
            error={saveError}
            onSubmit={crear}
            onCancel={() => setCreando(false)}
          />
        </Card>
      ) : (
        <Button className="self-start" onClick={() => setCreando(true)}>
          <UserPlus />
          Nuevo colaborador
        </Button>
      )}

      <Card title={`Equipo (${usuarios.length})`}>
        {!creando && saveError && (
          <div className="mb-4">
            <Alert>{saveError}</Alert>
          </div>
        )}
        <ul className="-mx-4 divide-y divide-slate-100 sm:-mx-6">
          {usuarios.map((u) => (
            <UsuarioItem
              key={u.id}
              usuario={u}
              esYo={u.id === user?.id}
              guardando={guardandoId === u.id}
              onCambiarRol={(rol) => cambiarRol(u.id, rol)}
              onActualizar={(datos) => actualizar(u.id, datos)}
            />
          ))}
        </ul>
      </Card>
    </div>
  )
}
