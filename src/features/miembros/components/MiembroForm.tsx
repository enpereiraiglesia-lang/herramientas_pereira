import { useState, type FormEvent } from 'react'
import { Alert } from '../../../components/ui/Alert'
import { Button } from '../../../components/ui/Button'
import { Input } from '../../../components/ui/Input'
import { mesActual } from '../../../components/ui/calendario/fechas'
import { MonthPicker } from '../../../components/ui/MonthPicker'
import { GrupoSelect } from '../../grupos/components/GrupoSelect'
import { tiempoDesde } from '../../../lib/format'
import type { Miembro, MiembroInput } from '../types'
import { PreguntaSiNo } from './PreguntaSiNo'

interface Props {
  inicial?: Miembro | null
  guardando: boolean
  error: string | null
  onSubmit: (input: MiembroInput) => Promise<boolean>
  onCancel: () => void
}

export function MiembroForm({ inicial, guardando, error, onSubmit, onCancel }: Props) {
  const [inversionista, setInversionista] = useState(inicial?.inversionista_reino ?? false)
  const [fueCeppev, setFueCeppev] = useState(inicial?.fue_ceppev ?? false)
  const [grupoFamiliar, setGrupoFamiliar] = useState(inicial?.grupo_familiar_id ?? '')
  const [camara, setCamara] = useState(inicial?.camara_id ?? '')
  // El input "month" usa el formato AAAA-MM; en la BD se guarda el día 1 de ese mes
  const [mesCeppev, setMesCeppev] = useState(inicial?.fecha_ceppev?.slice(0, 7) ?? '')
  const [mesMaximo] = useState(mesActual)

  async function handleSubmit(e: FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    const texto = (k: string) => String(f.get(k) ?? '').trim() || null
    await onSubmit({
      nombre: String(f.get('nombre')).trim(),
      celular: texto('celular'),
      correo: texto('correo')?.toLowerCase() ?? null,
      direccion: texto('direccion'),
      // Solo se envía si cambió (así no se pierde un grupo inactivo que no aparece en la lista)
      ...(grupoFamiliar !== (inicial?.grupo_familiar_id ?? '') && { grupo_familiar_id: grupoFamiliar || null }),
      ...(camara !== (inicial?.camara_id ?? '') && { camara_id: camara || null }),
      inversionista_reino: inversionista,
      fue_ceppev: fueCeppev,
      fecha_ceppev: fueCeppev && mesCeppev ? `${mesCeppev}-01` : null,
    })
  }

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {error && <Alert>{error}</Alert>}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
        <Input label="Nombre completo *" name="nombre" required defaultValue={inicial?.nombre} autoComplete="off" />
        <Input label="Celular" name="celular" type="tel" inputMode="tel" defaultValue={inicial?.celular ?? ''} />
        <Input label="Correo" name="correo" type="email" defaultValue={inicial?.correo ?? ''} />
        <Input label="Dirección" name="direccion" defaultValue={inicial?.direccion ?? ''} />
        <GrupoSelect tipo="grupo_familiar" value={grupoFamiliar} onChange={setGrupoFamiliar} />
        <GrupoSelect tipo="camara" value={camara} onChange={setCamara} />
      </div>

      <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4 md:grid-cols-2">
        <PreguntaSiNo
          pregunta="¿Es inversionista del Reino?"
          name="inversionista_reino"
          valor={inversionista}
          onChange={setInversionista}
        />
        <PreguntaSiNo pregunta="¿Ha ido al CEPPEV?" name="fue_ceppev" valor={fueCeppev} onChange={setFueCeppev} />
        {fueCeppev && (
          <div className="md:col-start-2">
            <MonthPicker
              label="¿Cuándo fue? (mes y año) *"
              name="mes_ceppev"
              required
              max={mesMaximo}
              value={mesCeppev || null}
              onChange={(v) => setMesCeppev(v ?? '')}
            />
            {mesCeppev && (
              <p className="mt-1.5 text-sm text-primary-700">Fue {tiempoDesde(`${mesCeppev}-01`)}</p>
            )}
          </div>
        )}
      </div>

      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button type="button" variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" loading={guardando}>
          Guardar miembro
        </Button>
      </div>
    </form>
  )
}
