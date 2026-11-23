import { useState, type FormEvent } from 'react'
import { Alert } from '../../../components/ui/Alert'
import { Button } from '../../../components/ui/Button'
import { DatePicker } from '../../../components/ui/DatePicker'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { TextArea } from '../../../components/ui/TextArea'
import { hoyISO } from '../../../lib/format'
import { usePermisos } from '../../permisos/hooks/usePermisos'
import { UsuarioSelect } from '../../usuarios/components/UsuarioSelect'
import { OPCIONES_ESTADO, type Contacto, type ContactoInput, type EstadoContacto } from '../types'

interface Props {
  inicial?: Contacto | null
  saving: boolean
  error: string | null
  onSubmit: (input: ContactoInput) => void
  onCancel: () => void
}

export function ContactoForm({ inicial, saving, error, onSubmit, onCancel }: Props) {
  const [asignadoA, setAsignadoA] = useState(inicial?.asignado_a ?? '')
  const { puede } = usePermisos() // sin el módulo "asignar" se conserva la asignación actual

  function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const texto = (k: string) => String(f.get(k) ?? '').trim() || null
    onSubmit({
      nombre: String(f.get('nombre')).trim(),
      telefono: texto('telefono'),
      direccion: texto('direccion'),
      lugar_contacto: texto('lugar_contacto'),
      observaciones: texto('observaciones'),
      fecha_contacto: String(f.get('fecha_contacto')) || hoyISO(),
      estado: (f.get('estado') as EstadoContacto) || 'nuevo',
      asignado_a: asignadoA || null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <Alert>{error}</Alert>}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input label="Nombre completo *" name="nombre" required defaultValue={inicial?.nombre} autoComplete="off" />
        <Input label="Teléfono" name="telefono" type="tel" inputMode="tel" defaultValue={inicial?.telefono ?? ''} />
        <Input label="Dirección" name="direccion" defaultValue={inicial?.direccion ?? ''} />
        <Input
          label="Lugar donde se contactó"
          name="lugar_contacto"
          placeholder="Ej: Parque central"
          defaultValue={inicial?.lugar_contacto ?? ''}
        />
        <DatePicker
          label="Fecha de contacto"
          name="fecha_contacto"
          required
          max={hoyISO()}
          defaultValue={inicial?.fecha_contacto ?? hoyISO()}
        />
        <Select label="Estado" name="estado" options={OPCIONES_ESTADO} defaultValue={inicial?.estado ?? 'nuevo'} />
        {puede('asignar') && (
          <UsuarioSelect label="Asignar a (quién lo llamará)" value={asignadoA} onChange={setAsignadoA} />
        )}
      </div>
      <TextArea
        label="Observaciones"
        name="observaciones"
        placeholder="Petición de oración, situación familiar, interés mostrado..."
        defaultValue={inicial?.observaciones ?? ''}
      />
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={saving}>
          Guardar contacto
        </Button>
      </div>
    </form>
  )
}
