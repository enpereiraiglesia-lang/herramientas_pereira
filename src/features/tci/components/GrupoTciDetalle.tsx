import { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, MapPin, MessageCircle, UserMinus, UserPlus, Users } from 'lucide-react'
import { Alert } from '../../../components/ui/Alert'
import { Avatar } from '../../../components/ui/Avatar'
import { Button } from '../../../components/ui/Button'
import { Drawer } from '../../../components/ui/Drawer'
import { Spinner } from '../../../components/ui/Spinner'
import { fechaLarga } from '../../../components/ui/calendario/fechas'
import { useGrupoTci } from '../hooks/useTci'
import type { GrupoCompleto, IntegranteConMiembro, Logros, Metas, Metricas } from '../types'
import { AgregarIntegrantes } from './AgregarIntegrantes'
import { FotosGrupo } from './FotosGrupo'
import { MetasCampos } from './MetasCampos'
import { MetasEquipo } from './MetasEquipo'
import { ReporteDrawer } from './ReporteDrawer'

type Panel = { tipo: 'agregar' } | { tipo: 'metas' } | { tipo: 'reporte' } | null

function metasDe(g: Metricas): Metas {
  return { meta_kits: g.meta_kits, meta_casas: g.meta_casas, meta_referidos: g.meta_referidos, meta_contactos: g.meta_contactos }
}

function FormMetas({
  inicial,
  guardando,
  error,
  onSubmit,
  onCancel,
}: {
  inicial: Metas
  guardando: boolean
  error: string | null
  onSubmit: (m: Metas) => void
  onCancel: () => void
}) {
  const [metas, setMetas] = useState(inicial)
  return (
    <div className="flex flex-col gap-5">
      {error && <Alert>{error}</Alert>}
      <p className="text-sm text-slate-600">
        Lo que el equipo se propone alcanzar en esta salida. En el reporte se compara con lo alcanzado.
      </p>
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

/** Pantalla del grupo: el líder registra lo alcanzado por el equipo, los integrantes y las fotos */
export function GrupoTciDetalle({ id }: { id: string }) {
  const g = useGrupoTci(id)
  const [panel, setPanel] = useState<Panel>(null)
  // Logros guardados desde los contadores (para que el reporte muestre lo último sin recargar)
  const [logrosLocales, setLogrosLocales] = useState<Partial<Logros>>({})

  if (g.loading && !g.grupo) return <Spinner />
  if (g.error || !g.grupo) return <Alert>{g.error ?? 'No se encontró el grupo'}</Alert>
  const grupo = g.grupo
  const actual: Metricas = { ...grupo, ...logrosLocales }

  function abrir(p: Panel) {
    g.limpiarError()
    setPanel(p)
  }

  async function guardarMetas(metas: Metas) {
    if (await g.guardarMetas(metas)) setPanel(null)
  }

  async function quitar(i: IntegranteConMiembro) {
    if (confirm(`¿Quitar a ${i.miembro?.nombre ?? 'este integrante'} del equipo?`)) await g.quitarIntegrante(i.id)
  }

  const paraReporte: GrupoCompleto = {
    ...grupo,
    ...logrosLocales,
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
          Enviar reporte
        </button>
      </div>

      {!panel && g.saveError && (
        <div className="mb-4">
          <Alert>{g.saveError}</Alert>
        </div>
      )}

      <div className="mb-6">
        <MetasEquipo
          key={[grupo.meta_kits, grupo.meta_casas, grupo.meta_referidos, grupo.meta_contactos].join('-')}
          valores={actual}
          onGuardarLogros={async (cambios) => {
            await g.guardarLogros(cambios)
            setLogrosLocales((l) => ({ ...l, ...cambios }))
          }}
          onEditarMetas={() => abrir({ tipo: 'metas' })}
        />
      </div>

      <section className="mb-6 rounded-xl border border-slate-200/80 bg-white shadow-xs">
        <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3 sm:px-6">
          <h2 className="flex items-center gap-2 text-base font-semibold text-navy-900">
            <Users className="h-4 w-4 text-slate-400" />
            Integrantes del equipo <span className="font-normal text-slate-400">({grupo.integrantes.length})</span>
          </h2>
          <Button variant="secondary" onClick={() => abrir({ tipo: 'agregar' })}>
            <UserPlus />
            Agregar
          </Button>
        </header>
        {grupo.integrantes.length === 0 ? (
          <p className="px-6 py-8 text-center text-sm text-slate-500">Agrega a los miembros que salen en este equipo.</p>
        ) : (
          <ul className="grid grid-cols-1 gap-x-4 px-4 py-2 sm:grid-cols-2 sm:px-6 lg:grid-cols-3">
            {grupo.integrantes.map((i) => (
              <li key={i.id} className="flex items-center gap-3 border-b border-slate-100 py-2 last:border-0">
                <Avatar nombre={i.miembro?.nombre ?? '?'} size="sm" />
                <span className="min-w-0 flex-1 truncate text-sm font-medium text-navy-900">{i.miembro?.nombre ?? 'Miembro'}</span>
                <button
                  type="button"
                  onClick={() => quitar(i)}
                  aria-label={`Quitar a ${i.miembro?.nombre}`}
                  title="Quitar del equipo"
                  className="flex h-9 w-9 items-center justify-center rounded-lg text-rose-600 hover:bg-rose-50"
                >
                  <UserMinus className="h-4 w-4" />
                </button>
              </li>
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
            onSubmit={async (miembros) => {
              const ok = await g.agregarIntegrantes(miembros)
              if (ok) setPanel(null)
              return ok
            }}
            onCancel={() => setPanel(null)}
          />
        )}
      </Drawer>

      <Drawer abierto={panel?.tipo === 'metas'} titulo="Metas iniciales del equipo" subtitulo={grupo.nombre} onCerrar={() => setPanel(null)}>
        {panel?.tipo === 'metas' && (
          <FormMetas
            inicial={metasDe(grupo)}
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
