import { useState, type FormEvent } from 'react'
import { Alert } from '../../../components/ui/Alert'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { TextArea } from '../../../components/ui/TextArea'
import { UsuarioSelect } from '../../usuarios/components/UsuarioSelect'
import { LiderSelect } from './LiderSelect'
import { DIAS_SEMANA,TIPOS_GRUPO, type Grupo, type GrupoInput, type TipoGrupo } from '../types'

interface Props {
  tipo: TipoGrupo
  inicial?: Grupo | null
  guardando: boolean
  error: string | null
  onSubmit: (input: GrupoInput) => Promise<boolean>
  onCancel: () => void
}

export function GrupoForm({ tipo, inicial, guardando, error, onSubmit, onCancel }: Props) {
  const [liderId, setLiderId] = useState(inicial?.lider_id ?? '')
  const [responsableId, setResponsableId] = useState(inicial?.responsable_id ?? '')
  const { singular } = TIPOS_GRUPO[tipo]
  // Los grupos familiares solo tienen líder; las cámaras conservan el responsable
  const conResponsable = tipo !== 'grupo_familiar'
  const conDireccion = tipo !== 'camara'

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const texto = (k: string) => String(f.get(k) ?? '').trim() || null
    await onSubmit({
      nombre: String(f.get('nombre')).trim(),
      descripcion: texto('descripcion'),
      // Las cámaras son en línea: no tienen dirección
      ...(conDireccion && { direccion: texto('direccion') }),
      dia_reunion: texto('dia_reunion'),
      hora_reunion: texto('hora_reunion'),
      lider_id: liderId || null,
      ...(conResponsable && { responsable_id: responsableId || null }),
      activo: f.get('activo') === 'on',
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-4">
      {error && <Alert>{error}</Alert>}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input label={`Nombre del ${singular.toLowerCase()} *`} name="nombre" required defaultValue={inicial?.nombre} />
        {conDireccion && <Input label="Dirección / lugar" name="direccion" defaultValue={inicial?.direccion ?? ''} />}
        <LiderSelect value={liderId} onChange={setLiderId} />
        {conResponsable && (
          <UsuarioSelect
            label="Responsable (usuario de la app)"
            name="responsable_id"
            placeholder="Sin responsable"
            value={responsableId}
            onChange={setResponsableId}
          />
        )}
        <Select
          label="Día de reunión"
          name="dia_reunion"
          placeholder="Sin definir"
          options={DIAS_SEMANA}
          defaultValue={inicial?.dia_reunion ?? ''}
        />
        <Input label="Hora" name="hora_reunion" type="time" defaultValue={inicial?.hora_reunion?.slice(0, 5) ?? ''} />
      </div>
      <TextArea label="Descripción" name="descripcion" rows={3} defaultValue={inicial?.descripcion ?? ''} />
      <label className="flex min-h-11 items-center gap-3 text-sm text-navy-900">
        <input
          type="checkbox"
          name="activo"
          defaultChecked={inicial?.activo ?? true}
          className="h-5 w-5 rounded accent-primary-600"
        />
        Activo (aparece para vincular contactos)
      </label>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={guardando}>
          Guardar
        </Button>
      </div>
    </form>
  )
}
