import type { FormEvent } from 'react'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { TextArea } from '../../../components/ui/TextArea'
import type { NuevoContactoGrupo as Datos } from '../services/membresiaService'

interface Props {
  /** Fase en la que queda el contacto ("Grupo familiar" o "Cámara de energización") */
  fase: string
  guardando: boolean
  onGuardar: (datos: Datos) => Promise<boolean>
  onCancelar: () => void
}

/** Registro rápido de un contacto nuevo que llega al grupo familiar o a la cámara */
export function NuevoContactoGrupo({ fase, guardando, onGuardar, onCancelar }: Props) {
  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const form = e.currentTarget
    const f = new FormData(form)
    const texto = (k: string) => String(f.get(k) ?? '').trim() || null
    const ok = await onGuardar({
      nombre: String(f.get('nc_nombre')).trim(),
      telefono: texto('nc_telefono'),
      direccion: texto('nc_direccion'),
      observaciones: texto('nc_observaciones'),
    })
    if (ok) form.reset()
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-3 rounded-xl border border-primary-200 bg-primary-50/40 p-3">
      <p className="text-sm font-semibold text-navy-900">Nuevo contacto en el grupo</p>
      <Input label="Nombre completo *" name="nc_nombre" required autoFocus autoComplete="off" />
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Input label="Teléfono" name="nc_telefono" type="tel" inputMode="tel" />
        <Input label="Dirección" name="nc_direccion" />
      </div>
      <TextArea label="Observaciones" name="nc_observaciones" rows={2} placeholder="¿Quién lo invitó? Petición de oración..." />
      <p className="text-xs text-slate-500">
        Queda registrado en Contactos, vinculado aquí y en la fase “{fase}” del seguimiento.
      </p>
      <div className="flex justify-end gap-2">
        <Button type="button" variant="secondary" onClick={onCancelar}>
          Cancelar
        </Button>
        <Button type="submit" loading={guardando}>
          Registrar contacto
        </Button>
      </div>
    </form>
  )
}
