import { useState } from 'react'
import { Plus } from 'lucide-react'
import { Alert } from '../../../components/ui/Alert'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { EmptyState } from '../../../components/ui/EmptyState'
import { PageHeader } from '../../../components/ui/PageHeader'
import { Spinner } from '../../../components/ui/Spinner'
import { useGrupos } from '../hooks/useGrupos'
import { TIPOS_GRUPO, type GrupoConRelaciones, type GrupoInput, type TipoGrupo } from '../types'
import { GrupoCard } from './GrupoCard'
import { GrupoForm } from './GrupoForm'
import { MembresiaDrawer } from './MembresiaDrawer'

/** Gestión de grupos familiares o cámaras de energización (según "tipo") */
export function GruposModulo({ tipo }: { tipo: TipoGrupo }) {
  const config = TIPOS_GRUPO[tipo]
  const { grupos, reload, loading, error, guardando, saveError, limpiarError, crear, actualizar, eliminar } = useGrupos(tipo)
  const [membresiaId, setMembresiaId] = useState<string | null>(null)
  const membresia = grupos.find((g) => g.id === membresiaId) ?? null
  // null = cerrado, 'nuevo' = creando, o el grupo que se edita
  const [editando, setEditando] = useState<GrupoConRelaciones | 'nuevo' | null>(null)

  function abrir(valor: GrupoConRelaciones | 'nuevo') {
    limpiarError()
    setEditando(valor)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function guardar(input: GrupoInput) {
    const ok = editando === 'nuevo' ? await crear(input) : editando ? await actualizar(editando.id, input) : false
    if (ok) setEditando(null)
    return ok
  }

  async function borrar(grupo: GrupoConRelaciones) {
    if (!confirm(`¿Eliminar "${grupo.nombre}"? Los miembros y contactos quedarán sin ${config.singular.toLowerCase()}.`))
      return
    await eliminar(grupo.id)
  }

  return (
    <>
      <PageHeader
        title={config.titulo}
        subtitle={config.descripcion}
        actions={
          !editando && (
            <Button onClick={() => abrir('nuevo')}>
              <Plus />
              Nuevo {config.singular.toLowerCase()}
            </Button>
          )
        }
      />

      {editando && (
        <Card
          className="mb-6"
          title={editando === 'nuevo' ? `Nuevo ${config.singular.toLowerCase()}` : `Editar ${editando.nombre}`}
        >
          <GrupoForm
            key={editando === 'nuevo' ? 'nuevo' : editando.id}
            tipo={tipo}
            inicial={editando === 'nuevo' ? null : editando}
            guardando={guardando}
            error={saveError}
            onSubmit={guardar}
            onCancel={() => setEditando(null)}
          />
        </Card>
      )}

      {!editando && saveError && (
        <div className="mb-4">
          <Alert>{saveError}</Alert>
        </div>
      )}

      {loading && grupos.length === 0 ? (
        <Spinner />
      ) : error ? (
        <Alert>{error}</Alert>
      ) : grupos.length === 0 ? (
        <EmptyState
          icon={config.icono}
          title={`Aún no hay ${config.titulo.toLowerCase()}`}
          description={
            tipo === 'grupo_familiar' ? 'Crea el primero y asígnale un líder.' : 'Crea el primero y asígnale un líder y un responsable.'
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {grupos.map((g) => (
            <GrupoCard
              key={g.id}
              grupo={g}
              onEditar={() => abrir(g)}
              onEliminar={() => borrar(g)}
              onMembresia={() => setMembresiaId(g.id)}
            />
          ))}
        </div>
      )}
      {membresia && <MembresiaDrawer grupo={membresia} onCerrar={() => setMembresiaId(null)} onCambio={() => void reload()} />}
    </>
  )
}
