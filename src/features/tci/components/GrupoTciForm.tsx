import { useState, type FormEvent } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, UserCheck } from 'lucide-react'
import { Alert } from '../../../components/ui/Alert'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { Select } from '../../../components/ui/Select'
import { usePermisos } from '../../permisos/hooks/usePermisos'
import { useMiembrosTci } from '../hooks/useTci'
import { METAS_VACIAS, type GrupoTci, type GrupoTciInput, type Metas } from '../types'
import { MetasCampos } from './MetasCampos'

interface Props {
  salidaId: string
  inicial?: GrupoTci | null
  sugerencia: string
  guardando: boolean
  error: string | null
  onSubmit: (input: GrupoTciInput) => Promise<boolean>
  onCancel: () => void
}

export function GrupoTciForm({ salidaId, inicial, sugerencia, guardando, error, onSubmit, onCancel }: Props) {
  const [lider, setLider] = useState(inicial?.lider_id ?? '')
  const { miembros, loading, error: errorMiembros } = useMiembrosTci()
  const { puede } = usePermisos()
  const elegido = miembros.find((m) => m.id === lider)
  const [metas, setMetas] = useState<Metas>(
    inicial
      ? {
          meta_kits: inicial.meta_kits,
          meta_casas: inicial.meta_casas,
          meta_referidos: inicial.meta_referidos,
          meta_contactos: inicial.meta_contactos,
        }
      : METAS_VACIAS
  )

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    await onSubmit({
      salida_id: salidaId,
      nombre: String(f.get('nombre')).trim(),
      zona: String(f.get('zona') ?? '').trim() || null,
      lider_id: lider || null,
      ...metas,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && <Alert>{error}</Alert>}
      <Input label="Nombre del grupo *" name="nombre" required defaultValue={inicial?.nombre ?? sugerencia} autoComplete="off" />
      <Input label="Zona / calles asignadas" name="zona" placeholder="Ej: Calles 10 a 15" defaultValue={inicial?.zona ?? ''} />
      <div className="flex flex-col gap-1.5">
        <Select
          label="Líder del grupo (miembro de la iglesia)"
          name="lider_id"
          value={lider}
          disabled={loading}
          placeholder={!loading && miembros.length === 0 ? 'No hay miembros registrados' : 'Sin líder'}
          options={miembros.map((m) => ({ value: m.id, label: m.nombre }))}
          onChange={(e) => setLider(e.target.value)}
        />
        {errorMiembros && <p className="text-xs text-rose-600">No se pudo cargar la lista de miembros.</p>}
        {!loading && miembros.length === 0 && puede('miembros') && (
          <p className="text-xs text-slate-500">
            Primero registra al líder en{' '}
            <Link to="/miembros" className="font-medium text-primary-600 hover:underline">
              Miembros
            </Link>
            .
          </p>
        )}
        {elegido &&
          (elegido.tiene_usuario ? (
            <p className="flex items-start gap-1.5 text-xs text-emerald-700">
              <UserCheck className="mt-px h-3.5 w-3.5 shrink-0" />
              Tiene usuario en la app: podrá entrar a “Salidas TCI”, diligenciar las metas y subir fotos de este grupo.
            </p>
          ) : (
            <p className="flex items-start gap-1.5 text-xs text-amber-700">
              <AlertTriangle className="mt-px h-3.5 w-3.5 shrink-0" />
              Este miembro no tiene usuario en la app. Para que pueda diligenciar el grupo, créale un usuario con el
              mismo correo registrado en su ficha de miembro.
            </p>
          ))}
      </div>
      <fieldset className="rounded-xl border border-slate-200 bg-slate-50 p-4">
        <legend className="px-1 text-sm font-semibold text-navy-900">Metas iniciales del equipo</legend>
        <p className="mb-3 text-xs text-slate-500">
          Lo que el equipo se propone alcanzar. En el reporte se compara con lo alcanzado. Se pueden cambiar después.
        </p>
        <MetasCampos metas={metas} onChange={setMetas} />
      </fieldset>
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={guardando}>
          {inicial ? 'Guardar cambios' : 'Crear grupo'}
        </Button>
      </div>
    </form>
  )
}
