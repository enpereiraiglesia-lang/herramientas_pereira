import { useState } from 'react'
import { Alert } from '../../../components/ui/Alert'
import { mensajeError } from '../../../lib/errores'
import { GrupoSelect } from '../../grupos/components/GrupoSelect'
import { seguimientoService } from '../services/seguimientoService'
import type { TarjetaContacto } from '../types'

interface Props {
  contacto: TarjetaContacto
  onActualizado: () => void
}

/** Vincula el contacto con un grupo familiar y una cámara de energización (se guarda al elegir) */
export function VincularGrupos({ contacto, onActualizado }: Props) {
  const [guardando, setGuardando] = useState(false)
  const [error, setError] = useState<string | null>(null)

  async function guardar(campo: 'grupo_familiar_id' | 'camara_id', valor: string) {
    setGuardando(true)
    setError(null)
    try {
      await seguimientoService.vincular(contacto.id, { [campo]: valor || null })
      onActualizado()
    } catch (err) {
      setError(mensajeError(err, 'No se pudo vincular'))
    } finally {
      setGuardando(false)
    }
  }

  return (
    <div className="flex flex-col gap-3">
      {error && <Alert>{error}</Alert>}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <GrupoSelect
          tipo="grupo_familiar"
          value={contacto.grupo_familiar_id ?? ''}
          disabled={guardando}
          onChange={(v) => guardar('grupo_familiar_id', v)}
        />
        <GrupoSelect
          tipo="camara"
          value={contacto.camara_id ?? ''}
          disabled={guardando}
          onChange={(v) => guardar('camara_id', v)}
        />
      </div>
    </div>
  )
}
