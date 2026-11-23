import { useDeferredValue, useState } from 'react'
import { IdCard, UserPlus } from 'lucide-react'
import { Alert } from '../../../components/ui/Alert'
import { Button } from '../../../components/ui/Button'
import { Card } from '../../../components/ui/Card'
import { EmptyState } from '../../../components/ui/EmptyState'
import { PageHeader } from '../../../components/ui/PageHeader'
import { Spinner } from '../../../components/ui/Spinner'
import { useMiembros } from '../hooks/useMiembros'
import type { FiltrosMiembros, Miembro, MiembroInput } from '../types'
import { MiembroFila } from './MiembroFila'
import { MiembroForm } from './MiembroForm'
import { MiembrosFiltros } from './MiembrosFiltros'

const FILTROS_INICIALES: FiltrosMiembros = { busqueda: '', inversionista: '', ceppev: '', rangoEdad: '' }

/** Directorio de miembros: crear, editar, filtrar y eliminar */
export function MiembrosModulo() {
  const [filtros, setFiltros] = useState(FILTROS_INICIALES)
  const busqueda = useDeferredValue(filtros.busqueda)
  const { miembros, loading, error, guardando, saveError, limpiarError, crear, actualizar, eliminar } = useMiembros({
    ...filtros,
    busqueda,
  })
  // null = cerrado, 'nuevo' = creando, o el miembro que se edita
  const [editando, setEditando] = useState<Miembro | 'nuevo' | null>(null)

  function abrir(valor: Miembro | 'nuevo') {
    limpiarError()
    setEditando(valor)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  async function guardar(input: MiembroInput) {
    const ok = editando === 'nuevo' ? await crear(input) : editando ? await actualizar(editando.id, input) : false
    if (ok) setEditando(null)
    return ok
  }

  async function borrar(m: Miembro) {
    if (confirm(`¿Eliminar a ${m.nombre} del directorio?`)) await eliminar(m.id)
  }

  const inversionistas = miembros.filter((m) => m.inversionista_reino).length
  const conCeppev = miembros.filter((m) => m.fue_ceppev).length

  return (
    <>
      <PageHeader
        title="Miembros"
        subtitle="Directorio de los miembros de la iglesia"
        actions={
          !editando && (
            <Button onClick={() => abrir('nuevo')}>
              <UserPlus />
              Nuevo miembro
            </Button>
          )
        }
      />

      {editando && (
        <Card className="mb-6" title={editando === 'nuevo' ? 'Nuevo miembro' : `Editar a ${editando.nombre}`}>
          <MiembroForm
            key={editando === 'nuevo' ? 'nuevo' : editando.id}
            inicial={editando === 'nuevo' ? null : editando}
            guardando={guardando}
            error={saveError}
            onSubmit={guardar}
            onCancel={() => setEditando(null)}
          />
        </Card>
      )}

      <MiembrosFiltros filtros={filtros} onChange={setFiltros} />
      {!editando && saveError && (
        <div className="mb-4">
          <Alert>{saveError}</Alert>
        </div>
      )}

      {loading && miembros.length === 0 ? (
        <Spinner />
      ) : error ? (
        <Alert>{error}</Alert>
      ) : miembros.length === 0 ? (
        <EmptyState
          icon={IdCard}
          title="No hay miembros que mostrar"
          description="Registra a los miembros de la iglesia o cambia los filtros."
        />
      ) : (
        <section className="rounded-xl border border-slate-200/80 bg-white shadow-xs">
          <header className="flex flex-wrap items-center gap-x-6 gap-y-1 border-b border-slate-100 px-4 py-3 text-sm text-slate-500 sm:px-6">
            <span>
              <strong className="font-semibold text-navy-900">{miembros.length}</strong> miembro
              {miembros.length === 1 ? '' : 's'}
            </span>
            <span>
              <strong className="font-semibold text-navy-900">{inversionistas}</strong> inversionistas del Reino
            </span>
            <span>
              <strong className="font-semibold text-navy-900">{conCeppev}</strong> han ido al CEPPEV
            </span>
          </header>
          <ul className="divide-y divide-slate-100">
            {miembros.map((m) => (
              <MiembroFila key={m.id} miembro={m} onEditar={() => abrir(m)} onEliminar={() => borrar(m)} />
            ))}
          </ul>
        </section>
      )}
    </>
  )
}
