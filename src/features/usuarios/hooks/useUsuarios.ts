import { useState } from 'react'
import { mensajeError } from '../../../lib/errores'
import { useAsync } from '../../../lib/useAsync'
import { usuariosService } from '../services/usuariosService'
import type { DatosUsuario, NuevoUsuarioInput, RolUsuario } from '../types'

export function useUsuarios() {
  const { data, loading, error, reload } = useAsync(() => usuariosService.listar(), [])
  const [guardandoId, setGuardandoId] = useState<string | null>(null)
  const [saveError, setSaveError] = useState<string | null>(null)

  /** Ejecuta una acción, recarga la lista y devuelve true si salió bien */
  async function ejecutar(id: string, fn: () => Promise<unknown>, porDefecto: string) {
    setGuardandoId(id)
    setSaveError(null)
    try {
      await fn()
      await reload()
      return true
    } catch (err) {
      setSaveError(mensajeError(err, porDefecto))
      return false
    } finally {
      setGuardandoId(null)
    }
  }

  return {
    usuarios: data ?? [],
    loading,
    error,
    guardandoId,
    saveError,
    crear: (input: NuevoUsuarioInput) => ejecutar('nuevo', () => usuariosService.crear(input), 'No se pudo crear el usuario'),
    cambiarRol: (id: string, rol: RolUsuario) =>
      ejecutar(id, () => usuariosService.cambiarRol(id, rol), 'No se pudo cambiar el rol'),
    actualizarModulos: (id: string, modulos: string[]) =>
      ejecutar(id, () => usuariosService.actualizarModulos(id, modulos), 'No se pudieron guardar los módulos'),
    actualizar: (id: string, datos: DatosUsuario) =>
      ejecutar(id, () => usuariosService.actualizar(id, datos), 'No se pudo guardar el usuario'),
  }
}
