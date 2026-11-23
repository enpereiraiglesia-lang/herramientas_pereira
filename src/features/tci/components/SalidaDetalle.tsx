import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, CalendarDays, Camera, ChevronRight, MapPin, MessageCircle, Pencil, Plus, Trash2, Users } from 'lucide-react'
import { Alert } from '../../../components/ui/Alert'
import { Avatar } from '../../../components/ui/Avatar'
import { Button } from '../../../components/ui/Button'
import { Drawer } from '../../../components/ui/Drawer'
import { EmptyState } from '../../../components/ui/EmptyState'
import { Spinner } from '../../../components/ui/Spinner'
import { fechaCorta, fechaLarga } from '../../../components/ui/calendario/fechas'
import { usePermisos } from '../../permisos/hooks/usePermisos'
import { useSalida } from '../hooks/useTci'
import { METRICAS, avanceGeneral, totales, type GrupoCompleto, type GrupoTciInput, type SalidaInput } from '../types'
import { GrupoTciForm } from './GrupoTciForm'
import { ReporteDrawer } from './ReporteDrawer'
import { BarraAvance, ResumenMetricas } from './ResumenMetricas'
import { SalidaForm } from './SalidaForm'

type Panel = { tipo: 'salida' } | { tipo: 'grupo'; grupo: GrupoCompleto | null } | { tipo: 'reporte' } | null

function TarjetaGrupo({
  grupo,
  esCoordinador,
  onEditar,
  onEliminar,
}: {
  grupo: GrupoCompleto
  esCoordinador: boolean
  onEditar: () => void
  onEliminar: () => void
}) {
  const t = totales([grupo])
  return (
    <article className="flex flex-col rounded-xl border border-slate-200/80 bg-white shadow-xs transition-shadow hover:shadow-md">
      <Link to={`/tci/grupos/${grupo.id}`} className="group flex flex-1 flex-col gap-3 p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <p className="truncate font-semibold text-navy-900 group-hover:text-primary-700">{grupo.nombre}</p>
            {grupo.zona && (
              <p className="flex items-center gap-1 truncate text-xs text-slate-500">
                <MapPin className="h-3 w-3 shrink-0" />
                {grupo.zona}
              </p>
            )}
            {grupo.fecha && (
              <p className="flex items-center gap-1 truncate text-xs font-medium text-primary-700">
                <CalendarDays className="h-3 w-3 shrink-0" />
                {fechaCorta(grupo.fecha)}
              </p>
            )}
          </div>
          <ChevronRight className="h-5 w-5 shrink-0 text-slate-300 group-hover:text-primary-500" />
        </div>

        <div className="flex items-center gap-2 text-sm">
          {grupo.lider ? (
            <>
              <Avatar nombre={grupo.lider.nombre} size="sm" />
              <span className="min-w-0 truncate text-slate-700">
                <span className="text-slate-400">Líder:</span> {grupo.lider.nombre}
              </span>
            </>
          ) : (
            <span className="text-amber-700">Sin líder asignado</span>
          )}
        </div>

        <div className="grid grid-cols-4 gap-1.5">
          {METRICAS.map((m) => {
            const Icono = m.icono
            return (
              <div key={m.clave} className={`rounded-lg px-2 py-1.5 text-center ${m.color.suave}`} title={m.label}>
                <Icono className={`mx-auto h-3.5 w-3.5 ${m.color.texto}`} />
                <p className="mt-0.5 text-xs font-semibold tabular-nums text-navy-900">
                  {t[m.clave].logro}
                  <span className="font-normal text-slate-400">/{t[m.clave].meta}</span>
                </p>
              </div>
            )
          })}
        </div>

        <BarraAvance valor={avanceGeneral(t)} />

        <div className="flex gap-4 text-xs text-slate-500">
          <span className="flex items-center gap-1">
            <Users className="h-3.5 w-3.5" />
            {grupo.integrantes.length} integrantes
          </span>
          <span className="flex items-center gap-1">
            <Camera className="h-3.5 w-3.5" />
            {grupo.fotos.length} fotos
          </span>
        </div>
      </Link>
      {esCoordinador && (
        <footer className="flex justify-end gap-1 border-t border-slate-100 px-2 py-1">
          <Button variant="ghost" onClick={onEditar} aria-label={`Editar ${grupo.nombre}`}>
            <Pencil />
          </Button>
          <Button variant="ghost" onClick={onEliminar} aria-label={`Eliminar ${grupo.nombre}`}>
            <Trash2 className="text-rose-600" />
          </Button>
        </footer>
      )}
    </article>
  )
}

/** Detalle de una salida: totales, grupos y reporte */
export function SalidaDetalle({ id }: { id: string }) {
  const s = useSalida(id)
  const { tieneModulo } = usePermisos()
  const esCoordinador = tieneModulo('tci')
  const [panel, setPanel] = useState<Panel>(null)
  const navigate = useNavigate()

  if (s.loading && !s.salida) return <Spinner />
  if (s.error || !s.salida) return <Alert>{s.error ?? 'No se encontró la salida'}</Alert>
  const salida = s.salida

  function abrir(p: Panel) {
    s.limpiarError()
    setPanel(p)
  }

  async function guardarSalida(input: SalidaInput) {
    if (await s.actualizar(input)) setPanel(null)
  }

  async function guardarGrupo(input: GrupoTciInput) {
    if (panel?.tipo !== 'grupo') return false
    const ok = panel.grupo ? await s.actualizarGrupo(panel.grupo.id, input) : await s.crearGrupo(input)
    if (ok) setPanel(null)
    return ok
  }

  async function eliminarSalida() {
    if (!confirm(`¿Eliminar "${salida.nombre}" con todos sus grupos, metas y fotos?`)) return
    if (await s.eliminar()) navigate('/tci')
  }

  async function eliminarGrupo(g: GrupoCompleto) {
    if (confirm(`¿Eliminar el grupo "${g.nombre}"? Se borrarán sus metas y fotos.`)) await s.eliminarGrupo(g.id)
  }

  const t = totales(salida.grupos)

  return (
    <>
      <Link to="/tci" className="mb-3 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-navy-900">
        <ArrowLeft className="h-4 w-4" />
        Salidas TCI
      </Link>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-navy-900 sm:text-[1.75rem]">{salida.nombre}</h1>
          <p className="mt-1 flex flex-wrap items-center gap-x-3 text-sm text-slate-500">
            <span className="first-letter:uppercase">{fechaLarga(salida.fecha)}</span>
            {salida.lugar && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {salida.lugar}
              </span>
            )}
          </p>
          {salida.notas && <p className="mt-2 max-w-2xl text-sm text-slate-600">{salida.notas}</p>}
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => abrir({ tipo: 'reporte' })}
            disabled={!salida.grupos.length}
            className="inline-flex min-h-11 items-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700 disabled:opacity-50"
          >
            <MessageCircle className="h-4 w-4" />
            Reporte
          </button>
          {esCoordinador && (
            <>
              <Button variant="secondary" onClick={() => abrir({ tipo: 'salida' })} aria-label="Editar salida">
                <Pencil />
              </Button>
              <Button variant="danger" onClick={eliminarSalida} aria-label="Eliminar salida">
                <Trash2 />
              </Button>
              <Button onClick={() => abrir({ tipo: 'grupo', grupo: null })}>
                <Plus />
                Nuevo grupo
              </Button>
            </>
          )}
        </div>
      </div>

      {!panel && s.saveError && (
        <div className="mb-4">
          <Alert>{s.saveError}</Alert>
        </div>
      )}

      {salida.grupos.length > 0 && (
        <div className="mb-6">
          <ResumenMetricas totales={t} />
        </div>
      )}

      {salida.grupos.length === 0 ? (
        <EmptyState
          icon={Users}
          title="Esta salida aún no tiene grupos"
          description="Crea los equipos, asigna un líder, define sus metas iniciales y agrega a los integrantes."
          action={
            esCoordinador && (
              <Button onClick={() => abrir({ tipo: 'grupo', grupo: null })}>
                <Plus />
                Nuevo grupo
              </Button>
            )
          }
        />
      ) : (
        <>
          <h2 className="mb-3 text-base font-semibold text-navy-900">
            Grupos <span className="font-normal text-slate-400">({salida.grupos.length})</span>
          </h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
            {salida.grupos.map((g) => (
              <TarjetaGrupo
                key={g.id}
                grupo={g}
                esCoordinador={esCoordinador}
                onEditar={() => abrir({ tipo: 'grupo', grupo: g })}
                onEliminar={() => eliminarGrupo(g)}
              />
            ))}
          </div>
        </>
      )}

      <Drawer abierto={panel?.tipo === 'salida'} titulo="Editar salida" onCerrar={() => setPanel(null)}>
        {panel?.tipo === 'salida' && (
          <SalidaForm
            inicial={salida}
            guardando={s.guardando}
            error={s.saveError}
            onSubmit={guardarSalida}
            onCancel={() => setPanel(null)}
          />
        )}
      </Drawer>

      <Drawer
        abierto={panel?.tipo === 'grupo'}
        titulo={panel?.tipo === 'grupo' && panel.grupo ? 'Editar grupo' : 'Nuevo grupo'}
        subtitulo={salida.nombre}
        onCerrar={() => setPanel(null)}
      >
        {panel?.tipo === 'grupo' && (
          <GrupoTciForm
            salidaId={salida.id}
            fechaSalida={salida.fecha}
            inicial={panel.grupo}
            sugerencia={`Grupo ${salida.grupos.length + 1}`}
            guardando={s.guardando}
            error={s.saveError}
            onSubmit={guardarGrupo}
            onCancel={() => setPanel(null)}
          />
        )}
      </Drawer>

      <ReporteDrawer
        abierto={panel?.tipo === 'reporte'}
        salida={salida}
        grupos={salida.grupos}
        onCerrar={() => setPanel(null)}
      />
    </>
  )
}
