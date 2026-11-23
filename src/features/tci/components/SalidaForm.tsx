import { useState, type FormEvent } from 'react'
import { Alert } from '../../../components/ui/Alert'
import { Button } from '../../../components/ui/Button'
import { DatePicker } from '../../../components/ui/DatePicker'
import { Input } from '../../../components/ui/Input'
import { TextArea } from '../../../components/ui/TextArea'
import { hoy } from '../../../components/ui/calendario/fechas'
import type { Salida, SalidaInput } from '../types'

interface Props {
  inicial?: Salida | null
  guardando: boolean
  error: string | null
  onSubmit: (input: SalidaInput) => Promise<unknown>
  onCancel: () => void
}

export function SalidaForm({ inicial, guardando, error, onSubmit, onCancel }: Props) {
  const [fecha, setFecha] = useState<string | null>(inicial?.fecha ?? hoy())

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const texto = (k: string) => String(f.get(k) ?? '').trim() || null
    await onSubmit({
      nombre: String(f.get('nombre')).trim(),
      fecha: fecha ?? hoy(),
      lugar: texto('lugar'),
      notas: texto('notas'),
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && <Alert>{error}</Alert>}
      <Input
        label="Nombre de la salida *"
        name="nombre"
        required
        placeholder="Ej: Salida TCI – Barrio El Jardín"
        defaultValue={inicial?.nombre}
        autoComplete="off"
      />
      <DatePicker label="Fecha *" name="fecha" required value={fecha} onChange={setFecha} />
      <Input label="Lugar / sector" name="lugar" placeholder="Ej: Comuna 5" defaultValue={inicial?.lugar ?? ''} />
      <TextArea label="Notas" name="notas" rows={3} defaultValue={inicial?.notas ?? ''} />
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={guardando}>
          {inicial ? 'Guardar cambios' : 'Crear salida'}
        </Button>
      </div>
    </form>
  )
}
