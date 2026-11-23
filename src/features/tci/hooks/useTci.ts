import { useCallback, useState } from 'react'
import { mensajeError } from '../../../lib/errores'
import { useAsync } from '../../../lib/useAsync'
import { tciService } from '../services/tciService'
import type { GrupoTciInput, Integrante, Metas, SalidaInput } from '../types'

/** Ejecuta una acción, recarga y guarda el error legible */
function useAccion(recargar: () => Promise<unknown>) {
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const ejecutar = useCallback(
    async (fn: () => Promise<unknown>, { recargarDespues = true } = {}) => {
      setGuardando(true)
      setError(null)
      try {
        await fn()
        if (recargarDespues) await recargar()
        return true
      } catch (err) {
        const msg = mensajeError(err, 'No se pudo guardar')
        setError(msg.includes('tci_integrante_unico') ? 'Ese miembro ya está en el grupo' : msg)
        return false
      } finally {
        setGuardando(false)
      }
    },
    [recargar]
  )

  return { ejecutar, guardando, saveError: error, limpiarError: () => setError(null) }
}

export function useSalidas() {
  const { data, loading, error, reload } = useAsync(() => tciService.listarSalidas(), [])
  const accion = useAccion(reload)
  return {
    salidas: data ?? [],
    loading,
    error,
    ...accion,
    crear: async (input: SalidaInput) => {
      let id: string | null = null
      const ok = await accion.ejecutar(async () => {
        id = await tciService.crearSalida(input)
      })
      return ok ? id : null
    },
  }
}

export function useSalida(id: string) {
  const { data, loading, error, reload } = useAsync(() => tciService.obtenerSalida(id), [id])
  const accion = useAccion(reload)
  return {
    salida: data,
    loading,
    error,
    reload,
    ...accion,
    actualizar: (input: Partial<SalidaInput>) => accion.ejecutar(() => tciService.actualizarSalida(id, input)),
    eliminar: () => accion.ejecutar(() => tciService.eliminarSalida(id), { recargarDespues: false }),
    crearGrupo: (input: GrupoTciInput) => accion.ejecutar(() => tciService.crearGrupo(input)),
    actualizarGrupo: (grupoId: string, input: Partial<GrupoTciInput>) =>
      accion.ejecutar(() => tciService.actualizarGrupo(grupoId, input)),
    eliminarGrupo: (grupoId: string) => accion.ejecutar(() => tciService.eliminarGrupo(grupoId)),
  }
}

export function useGrupoTci(id: string) {
  const grupo = useAsync(() => tciService.obtenerGrupo(id), [id])
  const fotos = useAsync(() => tciService.listarFotos(id), [id])
  const accion = useAccion(grupo.reload)
  const accionFotos = useAccion(fotos.reload)

  return {
    grupo: grupo.data,
    loading: grupo.loading,
    error: grupo.error,
    fotos: fotos.data ?? [],
    cargandoFotos: fotos.loading,
    ...accion,
    agregarIntegrantes: (miembros: string[], metas: Metas) =>
      accion.ejecutar(() => tciService.agregarIntegrantes(id, miembros, metas)),
    asignarMetasATodos: (metas: Metas) => accion.ejecutar(() => tciService.asignarMetasATodos(id, metas)),
    actualizarMetas: (integranteId: string, metas: Metas) =>
      accion.ejecutar(() => tciService.actualizarIntegrante(integranteId, metas)),
    /** Guarda logros sin recargar todo (la fila ya muestra el valor nuevo) */
    guardarLogros: (integranteId: string, cambios: Partial<Integrante>) =>
      tciService.actualizarIntegrante(integranteId, cambios),
    quitarIntegrante: (integranteId: string) => accion.ejecutar(() => tciService.quitarIntegrante(integranteId)),
    errorFotos: accionFotos.saveError,
    subiendo: accionFotos.guardando,
    subirFotos: (archivos: Blob[]) =>
      accionFotos.ejecutar(async () => {
        for (const a of archivos) await tciService.subirFoto(id, a)
      }),
    eliminarFoto: (fotoId: string, ruta: string) => accionFotos.ejecutar(() => tciService.eliminarFoto(fotoId, ruta)),
  }
}

export function useMiembrosTci() {
  const { data, loading, error } = useAsync(() => tciService.miembrosDisponibles(), [])
  return { miembros: data ?? [], loading, error }
}
