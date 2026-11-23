import { useState, type ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { IdCard, Link2, MessageCircle, Phone, UserMinus, UserPlus, Users } from 'lucide-react'
import { Alert } from '../../../components/ui/Alert'
import { Avatar } from '../../../components/ui/Avatar'
import { Button } from '../../../components/ui/Button'
import { Drawer } from '../../../components/ui/Drawer'
import { Spinner } from '../../../components/ui/Spinner'
import { linkWhatsApp, telefonoLimpio } from '../../../lib/format'
import { EstadoBadge } from '../../contactos/components/EstadoBadge'
import { usePermisos } from '../../permisos/hooks/usePermisos'
import { useMembresia } from '../hooks/useMembresia'
import { membresiaService } from '../services/membresiaService'
import { TIPOS_GRUPO, type GrupoConRelaciones } from '../types'
import { NuevoContactoGrupo } from './NuevoContactoGrupo'
import { SelectorMembresia } from './SelectorMembresia'

type Pestana = 'miembros' | 'contactos'
type Accion = 'agregar_miembros' | 'vincular_contactos' | 'nuevo_contacto' | null

interface Props {
  grupo: GrupoConRelaciones
  onCerrar: () => void
  onCambio: () => void
}

function AccionesTelefono({ telefono }: { telefono: string | null }) {
  if (!telefono) return null
  const icono = 'flex h-10 w-10 items-center justify-center rounded-lg transition-colors'
  return (
    <>
      <a href={`tel:${telefonoLimpio(telefono)}`} aria-label={`Llamar al ${telefono}`} title="Llamar" className={`${icono} text-primary-600 hover:bg-primary-50`}>
        <Phone className="h-4 w-4" />
      </a>
      <a
        href={linkWhatsApp(telefono)}
        target="_blank"
        rel="noreferrer"
        aria-label="Escribir por WhatsApp"
        title="WhatsApp"
        className={`${icono} text-emerald-600 hover:bg-emerald-50`}
      >
        <MessageCircle className="h-4 w-4" />
      </a>
    </>
  )
}

function Fila({
  nombre,
  detalle,
  extra,
  telefono,
  onQuitar,
  enlace,
}: {
  nombre: string
  detalle: string | null
  extra?: ReactNode
  telefono: string | null
  onQuitar: () => void
  enlace?: string
}) {
  const titulo = <p className="truncate font-medium text-navy-900">{nombre}</p>
  return (
    <li className="flex items-center gap-3 py-2.5">
      <Avatar nombre={nombre} />
      <div className="min-w-0 flex-1">
        {enlace ? (
          <Link to={enlace} className="hover:text-primary-700 [&_p]:hover:text-primary-700">
            {titulo}
          </Link>
        ) : (
          titulo
        )}
        <div className="flex flex-wrap items-center gap-x-2 gap-y-0.5 text-xs text-slate-500">
          {detalle ?? <span className="text-slate-400">Sin teléfono</span>}
          {extra}
        </div>
      </div>
      <div className="flex shrink-0 items-center">
        <AccionesTelefono telefono={telefono} />
        <button
          type="button"
          onClick={onQuitar}
          aria-label={`Quitar a ${nombre} del grupo`}
          title="Quitar del grupo"
          className="flex h-10 w-10 items-center justify-center rounded-lg text-rose-600 hover:bg-rose-50"
        >
          <UserMinus className="h-4 w-4" />
        </button>
      </div>
    </li>
  )
}

/** Membresía de un grupo familiar o una cámara: miembros de la iglesia y contactos */
export function MembresiaDrawer({ grupo, onCerrar, onCambio }: Props) {
  const m = useMembresia(grupo.tipo, grupo.id, grupo.nombre, onCambio)
  const singular = TIPOS_GRUPO[grupo.tipo].singular.toLowerCase()
  const { puede } = usePermisos()
  const [pestana, setPestana] = useState<Pestana>('miembros')
  const [accion, setAccion] = useState<Accion>(null)

  function abrirAccion(a: Accion) {
    m.limpiarError()
    setAccion(a)
  }

  async function cerrarSiOk(p: Promise<boolean>) {
    const ok = await p
    if (ok) setAccion(null)
    return ok
  }

  const pestanas: { valor: Pestana; label: string; total: number; Icono: typeof Users }[] = [
    { valor: 'miembros', label: 'Miembros', total: m.miembros.length, Icono: IdCard },
    { valor: 'contactos', label: 'Contactos', total: m.contactos.length, Icono: Users },
  ]

  return (
    <Drawer
      abierto
      titulo={grupo.nombre}
      subtitulo={`Membresía · ${m.miembros.length + m.contactos.length} personas${grupo.lider ? ` · Líder: ${grupo.lider.nombre}` : ''}`}
      onCerrar={onCerrar}
    >
      <div className="flex flex-col gap-4">
        <div role="tablist" aria-label="Tipo de integrante" className="flex gap-1 rounded-lg bg-slate-100 p-1">
          {pestanas.map(({ valor, label, total, Icono }) => (
            <button
              key={valor}
              role="tab"
              type="button"
              aria-selected={pestana === valor}
              onClick={() => {
                setPestana(valor)
                setAccion(null)
              }}
              className={`flex min-h-10 flex-1 items-center justify-center gap-2 rounded-md text-sm font-medium transition-colors ${
                pestana === valor ? 'bg-white text-navy-900 shadow-xs' : 'text-slate-500 hover:text-navy-900'
              }`}
            >
              <Icono className="h-4 w-4" />
              {label}
              <span
                className={`rounded-full px-1.5 text-xs tabular-nums ${
                  pestana === valor ? 'bg-primary-50 text-primary-700' : 'bg-slate-200 text-slate-600'
                }`}
              >
                {total}
              </span>
            </button>
          ))}
        </div>

        {m.saveError && <Alert>{m.saveError}</Alert>}

        {/* Acciones */}
        {pestana === 'miembros' ? (
          accion === 'agregar_miembros' ? (
            <SelectorMembresia
              grupoId={grupo.id}
              cargar={() => membresiaService.opcionesMiembros(grupo.tipo)}
              tipoGrupo={singular}
              placeholder="Buscar miembro de la iglesia"
              textoBoton={(n) => (n ? `Agregar ${n} miembro${n === 1 ? '' : 's'}` : 'Agregar miembros')}
              guardando={m.guardando}
              onAgregar={(ids) => cerrarSiOk(m.agregarMiembros(ids))}
              onCancelar={() => setAccion(null)}
            />
          ) : (
            <Button onClick={() => abrirAccion('agregar_miembros')} fullWidth>
              <UserPlus />
              Agregar miembros
            </Button>
          )
        ) : accion === 'vincular_contactos' ? (
          <SelectorMembresia
            grupoId={grupo.id}
            cargar={() => membresiaService.opcionesContactos(grupo.tipo)}
            tipoGrupo={singular}
            placeholder="Buscar contacto por nombre o teléfono"
            textoBoton={(n) => (n ? `Vincular ${n} contacto${n === 1 ? '' : 's'}` : 'Vincular contactos')}
            guardando={m.guardando}
            onAgregar={(ids) => cerrarSiOk(m.vincularContactos(ids))}
            onCancelar={() => setAccion(null)}
          />
        ) : accion === 'nuevo_contacto' ? (
          <NuevoContactoGrupo
            fase={TIPOS_GRUPO[grupo.tipo].singular}
            guardando={m.guardando}
            onGuardar={(datos) => cerrarSiOk(m.crearContacto(datos))}
            onCancelar={() => setAccion(null)}
          />
        ) : (
          <div className="grid grid-cols-2 gap-2">
            <Button onClick={() => abrirAccion('nuevo_contacto')}>
              <UserPlus />
              Nuevo contacto
            </Button>
            <Button variant="secondary" onClick={() => abrirAccion('vincular_contactos')}>
              <Link2 />
              Vincular existente
            </Button>
          </div>
        )}

        {/* Lista */}
        {m.loading && m.miembros.length + m.contactos.length === 0 ? (
          <Spinner />
        ) : m.error ? (
          <Alert>{m.error}</Alert>
        ) : pestana === 'miembros' ? (
          m.miembros.length === 0 ? (
            <p className="rounded-lg border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
              Aún no hay miembros de la iglesia aquí.
            </p>
          ) : (
            <ul className="divide-y divide-slate-100">
              {m.miembros.map((p) => (
                <Fila
                  key={p.id}
                  nombre={p.nombre}
                  detalle={p.celular}
                  telefono={p.celular}
                  extra={grupo.lider_id === p.id && <span className="font-medium text-primary-700">· Líder</span>}
                  onQuitar={() => confirm(`¿Quitar a ${p.nombre} de ${grupo.nombre}?`) && m.quitarMiembro(p.id)}
                />
              ))}
            </ul>
          )
        ) : m.contactos.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
            Aún no hay contactos vinculados.
          </p>
        ) : (
          <ul className="divide-y divide-slate-100">
            {m.contactos.map((c) => (
              <Fila
                key={c.id}
                nombre={c.nombre}
                detalle={c.telefono}
                telefono={c.telefono}
                extra={<EstadoBadge estado={c.estado} />}
                enlace={puede('contactos') ? `/contactos/${c.id}` : undefined}
                onQuitar={() => confirm(`¿Desvincular a ${c.nombre} de ${grupo.nombre}?`) && m.quitarContacto(c.id)}
              />
            ))}
          </ul>
        )}
      </div>
    </Drawer>
  )
}
