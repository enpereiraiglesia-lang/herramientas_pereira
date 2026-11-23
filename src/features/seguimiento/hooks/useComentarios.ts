import { useState } from 'react'
import { mensajeError } from '../../../lib/errores'
import { useAsync } from '../../../lib/useAsync'
import { useAuth } from '../../auth/hooks/useAuth'
import { seguimientoService } from '../services/seguimientoService'

export function useComentarios(contactoId: string) {
  const { user } = useAuth()
  const { data, loading, error, reload } = useAsync(() => seguimientoService.comentarios(contactoId), [contactoId])
  const [guardando, setGuardando] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  async function comentar(fase: string, texto: string) {
    setGuardando(true)
    setSaveError(null)
    try {
      await seguimientoService.comentar(contactoId, fase, texto, user?.id)
      await reload()
      return true
    } catch (err) {
      setSaveError(mensajeError(err, 'No se pudo guardar el comentario'))
      return false
    } finally {
      setGuardando(false)
    }
  }

  async function eliminar(id: string) {
    try {
      await seguimientoService.eliminarComentario(id)
      await reload()
    } catch (err) {
      setSaveError(mensajeError(err, 'No se pudo eliminar el comentario'))
    }
  }

  return { comentarios: data ?? [], loading, error, guardando, saveError, comentar, eliminar, reload }
}
