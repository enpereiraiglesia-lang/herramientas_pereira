import { useCallback, useState } from 'react'
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  MouseSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
  type DragStartEvent,
} from '@dnd-kit/core'
import { Alert } from '../../../components/ui/Alert'
import { Spinner } from '../../../components/ui/Spinner'
import { useTablero } from '../hooks/useTablero'
import type { FiltrosTablero as Filtros } from '../types'
import { ColumnaFase } from './ColumnaFase'
import { FiltrosTablero } from './FiltrosTablero'
import { PanelSeguimiento } from './PanelSeguimiento'
import { TarjetaContenido } from './TarjetaSeguimiento'

/** Tablero kanban: una columna por fase, las tarjetas se arrastran entre fases */
export function TableroSeguimiento() {
  const [filtros, setFiltros] = useState<Filtros>({ busqueda: '', asignadoA: '' })
  const { fases, porFase, total, buscar, loading, error, mover, recargar } = useTablero(filtros)
  const [arrastrando, setArrastrando] = useState<string | null>(null)
  const [abierto, setAbierto] = useState<string | null>(null)
  const cerrar = useCallback(() => setAbierto(null), [])

  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 6 } }),
    // En celular: mantener presionado para arrastrar, así el scroll sigue funcionando
    useSensor(TouchSensor, { activationConstraint: { delay: 220, tolerance: 8 } }),
    useSensor(KeyboardSensor)
  )

  function onDragStart(e: DragStartEvent) {
    setArrastrando(String(e.active.id))
  }

  function onDragEnd(e: DragEndEvent) {
    setArrastrando(null)
    const id = String(e.active.id)
    const destino = e.over ? String(e.over.id) : null
    if (destino && buscar(id)?.fase !== destino) void mover(id, destino)
  }

  if (loading) return <Spinner label="Cargando tablero..." />

  const tarjetaActiva = arrastrando ? buscar(arrastrando) : null
  const contactoAbierto = abierto ? buscar(abierto) : null

  return (
    <>
      <FiltrosTablero filtros={filtros} total={total} onChange={setFiltros} />
      {error && (
        <div className="mb-4">
          <Alert>{error}</Alert>
        </div>
      )}

      <DndContext
        sensors={sensors}
        onDragStart={onDragStart}
        onDragEnd={onDragEnd}
        onDragCancel={() => setArrastrando(null)}
      >
        <div className="-mx-4 snap-x snap-mandatory scroll-px-4 overflow-x-auto overscroll-x-contain px-4 pb-4 sm:-mx-6 sm:snap-none sm:px-6 lg:-mx-10 lg:px-10">
          <div className="flex min-h-[60vh] gap-4">
            {fases.map((f) => (
              <ColumnaFase key={f.clave} fase={f} contactos={porFase[f.clave] ?? []} onAbrir={setAbierto} />
            ))}
          </div>
        </div>
        <DragOverlay dropAnimation={null}>
          {tarjetaActiva && <TarjetaContenido contacto={tarjetaActiva} flotante />}
        </DragOverlay>
      </DndContext>

      {contactoAbierto && (
        <PanelSeguimiento
          key={contactoAbierto.id}
          contacto={contactoAbierto}
          fases={fases}
          onMover={(fase) => mover(contactoAbierto.id, fase)}
          onActualizado={recargar}
          onCerrar={cerrar}
        />
      )}
    </>
  )
}
