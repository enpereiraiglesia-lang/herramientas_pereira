import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ExternalLink } from 'lucide-react'
import { Drawer } from '../../../components/ui/Drawer'
import { Select } from '../../../components/ui/Select'
import { TelefonoLinks } from '../../contactos/components/TelefonoLinks'
import { usePermisos } from '../../permisos/hooks/usePermisos'
import { diasEnFase, type Fase, type TarjetaContacto } from '../types'
import { ComentariosFase } from './ComentariosFase'
import { VincularGrupos } from './VincularGrupos'

interface Props {
  contacto: TarjetaContacto
  fases: Fase[]
  onMover: (fase: string) => void
  onActualizado: () => void
  onCerrar: () => void
}

function Seccion({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <section className="border-b border-slate-100 pb-5">
      <h3 className="mb-3 text-sm font-semibold text-navy-900">{titulo}</h3>
      {children}
    </section>
  )
}

/** Detalle del contacto dentro del tablero: fase, vínculos y comentarios */
export function PanelSeguimiento({ contacto, fases, onMover, onActualizado, onCerrar }: Props) {
  const { puede } = usePermisos()
  const dias = diasEnFase(contacto.fase_actualizada_at)

  return (
    <Drawer
      abierto
      onCerrar={onCerrar}
      titulo={contacto.nombre}
      subtitulo={`Responsable: ${contacto.asignado?.nombre ?? 'sin asignar'} · ${
        dias === 0 ? 'entró hoy a esta fase' : `${dias} día${dias === 1 ? '' : 's'} en esta fase`
      }`}
    >
      <div className="flex flex-col gap-5">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <TelefonoLinks telefono={contacto.telefono} />
          {puede('contactos') && (
            <Link
              to={`/contactos/${contacto.id}`}
              className="inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-primary-600 hover:text-primary-700"
            >
              Ver ficha
              <ExternalLink className="h-4 w-4" />
            </Link>
          )}
        </div>

        <Seccion titulo="Fase del seguimiento">
          <Select
            label="Mover a la fase"
            name="fase_contacto"
            value={contacto.fase}
            onChange={(e) => onMover(e.target.value)}
            options={fases.map((f) => ({ value: f.clave, label: `${f.orden}. ${f.nombre}` }))}
          />
        </Seccion>

        <Seccion titulo="Vínculos">
          <VincularGrupos contacto={contacto} onActualizado={onActualizado} />
        </Seccion>

        <section>
          <h3 className="mb-3 text-sm font-semibold text-navy-900">Comentarios por fase</h3>
          <ComentariosFase
            key={contacto.fase}
            contactoId={contacto.id}
            faseActual={contacto.fase}
            fases={fases}
            onCambio={onActualizado}
          />
        </section>
      </div>
    </Drawer>
  )
}
