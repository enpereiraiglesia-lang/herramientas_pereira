import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, MapPin, MessageCircle, Target, UserPlus, Users } from 'lucide-react'
import { Alert } from '../../../components/ui/Alert'
import { Avatar } from '../../../components/ui/Avatar'
import { Button } from '../../../components/ui/Button'
import { Drawer } from '../../../components/ui/Drawer'
import { EmptyState } from '../../../components/ui/EmptyState'
import { Spinner } from '../../../components/ui/Spinner'
import { fechaLarga } from '../../../components/ui/calendario/fechas'
import { useGrupoTci } from '../hooks/useTci'
import { METAS_VACIAS, totales, type GrupoCompleto, type IntegranteConMiembro, type Metas } from '../types'
import { AgregarIntegrantes } from './AgregarIntegrantes'
import { FotosGrupo } from './FotosGrupo'
import { IntegranteTarjeta } from './IntegranteTarjeta'
import { MetasCampos } from './MetasCampos'
import { ReporteDrawer } from './ReporteDrawer'
import { ResumenMetricas } from './ResumenMetricas'

type Panel =
  | { tipo: 'agregar' }
  | { tipo: 'metas'; integrante: IntegranteConMiembro | null } // null = a todos
  | { tipo: 'reporte' }
  | null

function metasDe(i: IntegranteConMiembro | null): Metas {
  if (!i) return METAS_VACIAS
  return { meta_kits: i.meta_kits, meta_casas: i.meta_casas, meta_referidos: i.meta_referidos, meta_contactos: i.meta_contactos }
}

function FormMetas({
  inicial,
  aTodos,
  guardando,
  error,
  onSubmit,
  onCancel,
}: {
  inicial: Metas
  aTodos: boolean
  guardando: boolean
  error: string | null
  onSubmit: (m: Metas) => void
  onCancel: () => void
}) {
  const [metas, setMetas] = useState(inicial)
  return (
    <div className="flex flex-col gap-5">
      {error && <Alert>{error}</Alert>}
      {aTodos && <Alert type="info">Estas metas reemplazan las de todos los integrantes del grupo.</Alert>}
      <MetasCampos metas={metas} onChange={setMetas} />
      <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
        <Button variant="secondary" onClick={onCancel}>
          Cancelar
        </Button>
        <Button loading={guardando} onClick={() => onSubmit(metas)}>
          Guardar metas
        </Button>
      </div>
    </div>
  )
}

/** Pantalla del grupo: aquí el líder diligencia logros, metas y fotos */
export function GrupoTciDetalle({ id }: { id: string }) {
  const g = useGrupoTci(id)
  const [panel, setPanel] = useState<Panel>(null)

  // Totales en vivo: se recalculan con los logros que cada tarjeta reporta al guardar
  const [logrosLocales, setLogrosLocales] = useState<Record<string, Partial<IntegranteConMiembro>>>({})
  const integrantes = useMemo(
    () => (g.grupo?.integrantes ?? []).map((i) => ({ ...i, ...logrosLocales[i.id] })),
    [g.grupo, logrosLocales]
  )

  if (g.loading && !g.grupo) return <Spinner />
  if (g.error || !g.grupo) return <Alert>{g.error ?? 'No se encontró el grupo'}</Alert>
  const grupo = g.grupo

  function abrir(p: Panel) {
    g.limpiarError()
    setPanel(p)
  }

  async function guardarMetas(metas: Metas) {
    if (panel?.tipo !== 'metas') return
    const ok = panel.integrante ? await g.actualizarMetas(panel.integrante.id, metas) : await g.asignarMetasATodos(metas)
    if (ok) {
      setLogrosLocales({})
      setPanel(null)
    }
  }

  async function quitar(i: IntegranteConMiembro) {
    if (confirm(`¿Quitar a ${i.miembro?.nombre ?? 'este integrante'} del grupo?`)) await g.quitarIntegrante(i.id)
  }

  const paraReporte: GrupoCompleto = {
    ...grupo,
    integrantes,
    fotos: g.fotos.map((f) => ({ id: f.id, ruta: f.ruta })),
  }

  return (
    <>
      <Link
        to={`/tci/${grupo.salida_id}`}
        className="mb-3 inline-flex min-h-11 items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-navy-900"
      >
        <ArrowLeft className="h-4 w-4" />
        {grupo.salida.nombre}
      </Link>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
        <div className="min-w-0">
          <h1 className="text-2xl font-semibold tracking-tight text-navy-900 sm:text-[1.75rem]">{grupo.nombre}</h1>
          <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-500">
            <span className="first-letter:uppercase">{fechaLarga(grupo.salida.fecha)}</span>
            {grupo.zona && (
              <span className="flex items-center gap-1">
                <MapPin className="h-3.5 w-3.5" />
                {grupo.zona}
              </span>
            )}
            {grupo.lider && (
              <span className="flex items-center gap-1.5">
                <Avatar nombre={grupo.lider.nombre} size="sm" />
                Líder: <strong className="font-medium text-navy-900">{grupo.lider.nombre}</strong>
              </span>
            )}
          </div>
        </div>
        <button
          type="button"
          onClick={() => abrir({ tipo: 'reporte' })}
          className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-emerald-700"
        >
          <MessageCircle className="h-4 w-4" />
          Reporte del grupo
        </button>
      </div>

      {!panel && g.saveError && (
        <div className="mb-4">
          <Alert>{g.saveError}</Alert>
        </div>
      )}

      <div className="mb-6">
        <ResumenMetricas totales={totales(integrantes)} />
      </div>

      <section className="mb-6">
        <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
          <h2 className="flex items-center gap-2 text-base font-semibold text-navy-900">
            <Users className="h-4 w-4 text-slate-400" />
            Integrantes <span className="font-normal text-slate-400">({integrantes.length})</span>
          </h2>
          <div className="flex gap-2">
            {integrantes.length > 0 && (
              <Button variant="secondary" onClick={() => abrir({ tipo: 'metas', integrante: null })}>
                <Target />
                Metas a todos
              </Button>
            )}
            <Button onClick={() => abrir({ tipo: 'agregar' })}>
              <UserPlus />
              Agregar
            </Button>
          </div>
        </div>

        {integrantes.length === 0 ? (
          <EmptyState
            icon={Users}
            title="El grupo no tiene integrantes"
            description="Agrega a los miembros que salen en este grupo y asígnales sus metas."
            action={
              <Button onClick={() => abrir({ tipo: 'agregar' })}>
                <UserPlus />
                Agregar integrantes
              </Button>
            }
          />
        ) : (
          <ul className="flex flex-col gap-3">
            {grupo.integrantes.map((i) => (
              <IntegranteTarjeta
                key={`${i.id}-${i.meta_kits}-${i.meta_casas}-${i.meta_referidos}-${i.meta_contactos}-${i.logro_kits}-${i.logro_casas}-${i.logro_referidos}-${i.logro_contactos}`}
                integrante={i}
                onGuardar={async (cambios) => {
                  await g.guardarLogros(i.id, cambios)
                  setLogrosLocales((l) => ({ ...l, [i.id]: { ...l[i.id], ...cambios } }))
                }}
                onEditarMetas={() => abrir({ tipo: 'metas', integrante: i })}
                onQuitar={() => quitar(i)}
              />
            ))}
          </ul>
        )}
      </section>

      <FotosGrupo
        fotos={g.fotos}
        cargando={g.cargandoFotos}
        subiendo={g.subiendo}
        error={g.errorFotos}
        onSubir={g.subirFotos}
        onEliminar={(f) => g.eliminarFoto(f.id, f.ruta)}
      />

      <Drawer abierto={panel?.tipo === 'agregar'} titulo="Agregar integrantes" subtitulo={grupo.nombre} onCerrar={() => setPanel(null)}>
        {panel?.tipo === 'agregar' && (
          <AgregarIntegrantes
            yaEstan={new Set(grupo.integrantes.map((i) => i.miembro_id))}
            guardando={g.guardando}
            error={g.saveError}
            onSubmit={async (miembros, metas) => {
              const ok = await g.agregarIntegrantes(miembros, metas)
              if (ok) setPanel(null)
              return ok
            }}
            onCancel={() => setPanel(null)}
          />
        )}
      </Drawer>

      <Drawer
        abierto={panel?.tipo === 'metas'}
        titulo={panel?.tipo === 'metas' && panel.integrante ? 'Metas del integrante' : 'Metas para todos'}
        subtitulo={panel?.tipo === 'metas' ? (panel.integrante?.miembro?.nombre ?? grupo.nombre) : undefined}
        onCerrar={() => setPanel(null)}
      >
        {panel?.tipo === 'metas' && (
          <FormMetas
            inicial={metasDe(panel.integrante ?? grupo.integrantes[0] ?? null)}
            aTodos={!panel.integrante}
            guardando={g.guardando}
            error={g.saveError}
            onSubmit={guardarMetas}
            onCancel={() => setPanel(null)}
          />
        )}
      </Drawer>

      <ReporteDrawer
        abierto={panel?.tipo === 'reporte'}
        salida={grupo.salida}
        grupos={[paraReporte]}
        onCerrar={() => setPanel(null)}
      />
    </>
  )
}
