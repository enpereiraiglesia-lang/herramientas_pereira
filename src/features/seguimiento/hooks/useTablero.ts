import { useMemo, useState } from 'react'
import { mensajeError } from '../../../lib/errores'
import { useAsync } from '../../../lib/useAsync'
import { seguimientoService } from '../services/seguimientoService'
import type { FiltrosTablero, TarjetaContacto } from '../types'

/** Fases + contactos del tablero, con movimiento optimista entre fases */
export function useTablero(filtros: FiltrosTablero) {
  const fases = useAsync(() => seguimientoService.fases(), [])
  const contactos = useAsync(() => seguimientoService.tablero(), [])
  // Fase elegida localmente mientras se guarda (para que la tarjeta se mueva al instante)
  const [movidos, setMovidos] = useState<Record<string, string>>({})
  const [error, setError] = useState<string | null>(null)

  const lista = useMemo(() => {
    const q = filtros.busqueda.trim().toLowerCase()
    return (contactos.data ?? [])
      .map((c) => (movidos[c.id] ? { ...c, fase: movidos[c.id] } : c))
      .filter((c) => !q || c.nombre.toLowerCase().includes(q) || c.telefono?.includes(q))
      .filter((c) =>
        filtros.asignadoA === 'sin'
          ? !c.asignado
          : filtros.asignadoA
            ? c.asignado?.id === filtros.asignadoA
            : true
      )
  }, [contactos.data, movidos, filtros.busqueda, filtros.asignadoA])

  const porFase = useMemo(() => {
    const grupos: Record<string, TarjetaContacto[]> = {}
    for (const c of lista) (grupos[c.fase] ??= []).push(c)
    return grupos
  }, [lista])

  async function mover(contactoId: string, fase: string) {
    setError(null)
    setMovidos((m) => ({ ...m, [contactoId]: fase }))
    try {
      await seguimientoService.moverFase(contactoId, fase)
      await contactos.reload()
    } catch (err) {
      setError(mensajeError(err, 'No se pudo mover el contacto'))
    } finally {
      setMovidos((m) => {
        const { [contactoId]: _, ...resto } = m
        return resto
      })
    }
  }

  return {
    fases: fases.data ?? [],
    porFase,
    total: lista.length,
    buscar: (id: string) => lista.find((c) => c.id === id) ?? null,
    loading: fases.loading || (contactos.loading && !contactos.data),
    error: fases.error ?? contactos.error ?? error,
    mover,
    recargar: contactos.reload,
  }
}
