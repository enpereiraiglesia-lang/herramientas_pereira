import { useState } from 'react'
import { mensajeError } from '../../../lib/errores'
import { useAsync } from '../../../lib/useAsync'
import { membresiaService, type NuevoContactoGrupo } from '../services/membresiaService'
import type { TipoGrupo } from '../types'

export function useMembresia(tipo: TipoGrupo, grupoId: string, nombreGrupo: string, onCambio: () => void) {
  const miembros = useAsync(() => membresiaService.miembros(tipo, grupoId), [tipo, grupoId])
  const contactos = useAsync(() => membresiaService.contactos(tipo, grupoId), [tipo, grupoId])
  const [guardando, setGuardando] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  async function ejecutar(fn: () => Promise<unknown>, recargar: () => Promise<void>) {
    setGuardando(true)
    setSaveError(null)
    try {
      await fn()
      await recargar()
      onCambio()
      return true
    } catch (err) {
      setSaveError(mensajeError(err, 'No se pudo guardar'))
      return false
    } finally {
      setGuardando(false)
    }
  }

  return {
    miembros: miembros.data ?? [],
    contactos: contactos.data ?? [],
    loading: miembros.loading || contactos.loading,
    error: miembros.error ?? contactos.error,
    guardando,
    saveError,
    limpiarError: () => setSaveError(null),
    agregarMiembros: (ids: string[]) => ejecutar(() => membresiaService.agregarMiembros(grupoId, ids), miembros.reload),
    quitarMiembro: (id: string) => ejecutar(() => membresiaService.quitarMiembro(grupoId, id), miembros.reload),
    vincularContactos: (ids: string[]) =>
      ejecutar(() => membresiaService.vincularContactos(grupoId, ids), contactos.reload),
    quitarContacto: (id: string) => ejecutar(() => membresiaService.quitarContacto(grupoId, id), contactos.reload),
    crearContacto: (input: NuevoContactoGrupo) =>
      ejecutar(() => membresiaService.crearContacto(tipo, grupoId, nombreGrupo, input), contactos.reload),
  }
}
