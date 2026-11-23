import { useState } from 'react'
import { mensajeError } from '../../../lib/errores'
import { useAsync } from '../../../lib/useAsync'
import { gruposService } from '../services/gruposService'
import type { GrupoInput, TipoGrupo } from '../types'

export function useGrupos(tipo: TipoGrupo) {
  const { data, loading, error, reload } = useAsync(() => gruposService.listar(tipo), [tipo])
  const [guardando, setGuardando] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  async function ejecutar(fn: () => Promise<unknown>) {
    setGuardando(true)
    setSaveError(null)
    try {
      await fn()
      await reload()
      return true
    } catch (err) {
      setSaveError(mensajeError(err, 'No se pudo guardar'))
      return false
    } finally {
      setGuardando(false)
    }
  }

  return {
    grupos: data ?? [],
    reload,
    loading,
    error,
    guardando,
    saveError,
    limpiarError: () => setSaveError(null),
    crear: (input: GrupoInput) => ejecutar(() => gruposService.crear(tipo, input)),
    actualizar: (id: string, input: Partial<GrupoInput>) => ejecutar(() => gruposService.actualizar(id, input)),
    eliminar: (id: string) => ejecutar(() => gruposService.eliminar(id)),
  }
}

/** Miembros de la iglesia para el selector de líder */
export function useLideres() {
  const { data, loading, error } = useAsync(() => gruposService.lideres(), [])
  return { opciones: (data ?? []).map((m) => ({ value: m.id, label: m.nombre })), loading, error }
}

export function useOpcionesGrupo(tipo: TipoGrupo) {
  const { data, loading } = useAsync(() => gruposService.opciones(tipo), [tipo])
  return { opciones: (data ?? []).map((g) => ({ value: g.id, label: g.nombre })), loading }
}
