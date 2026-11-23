import { useDeferredValue, useState } from 'react'
import { HandCoins, IdCard, Search, UserPlus } from 'lucide-react'
import { Alert } from '../../../components/ui/Alert'
import { Button } from '../../../components/ui/Button'
import { Drawer } from '../../../components/ui/Drawer'
import { EmptyState } from '../../../components/ui/EmptyState'
import { inputClass } from '../../../components/ui/Field'
import { MesNavegador } from '../../../components/ui/MesNavegador'
import { PageHeader } from '../../../components/ui/PageHeader'
import { Spinner } from '../../../components/ui/Spinner'
import { mesActual, nombreMes } from '../../../components/ui/calendario/fechas'
import { useInversionistas } from '../hooks/useInversionistas'
import { formatMoneda } from '../../../lib/format'
import {
  CATEGORIAS,
  CUOTA_INVERSIONISTA,
  type Categoria,
  type Cuota,
  type CuotaInput,
  type FiltroEstado,
  type InversionistaConEstado,
  type ParticipacionConEstado,
} from '../types'
import { CategoriaBadge } from './CategoriaBadge'
import { AgregarMiembroInversionista, CrearInversionista } from './AgregarInversionista'
import { CuotaForm } from './CuotaForm'
import { DetalleInversionista } from './DetalleInversionista'
import { InversionistaFila } from './InversionistaFila'
import { armarMensaje, leerPlantilla } from '../mensaje'
import { MensajeRecordatorio } from './MensajeRecordatorio'
import { ResumenCuotas } from './ResumenCuotas'

interface Formulario {
  persona: InversionistaConEstado
  participacion: ParticipacionConEstado
  cuota: Cuota | null
}

/** Orden en la grilla: primero quienes deben algo del mes */
const ORDEN_ESTADO = { pendiente: 0, parcial: 1, sin_participacion: 2, al_dia: 3 }

function tieneCategoria(p: InversionistaConEstado, c: Categoria) {
  return c === 'sin_cuota' ? p.categorias.length === 0 : p.categorias.includes(c)
}

const normalizar = (s: string) =>
  s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()

/** Inversionistas del Reino: cuotas mensuales, totales y recordatorios */
export function InversionistasModulo() {
  const [mes, setMes] = useState(mesActual)
  const [filtro, setFiltro] = useState<FiltroEstado>('todos')
  const [busqueda, setBusqueda] = useState('')
  const [categoria, setCategoria] = useState<Categoria | ''>('')
  const busquedaDiferida = useDeferredValue(busqueda)
  const [plantilla, setPlantilla] = useState(leerPlantilla)
  const [formulario, setFormulario] = useState<Formulario | null>(null)

  const {
    inversionistas,
    cuotasDelAnio,
    marcas,
    loading,
    error,
    guardando,
    saveError,
    limpiarError,
    registrar,
    actualizar,
    anular,
    crearParticipacion,
    actualizarParticipacion,
    finalizarParticipacion,
    agregarMiembro,
    crearExterno,
    actualizarExterno,
    quitar,
  } = useInversionistas(mes)
  // 'crear' = inversionista nuevo (no miembro); 'miembro' = marcar a un miembro existente
  const [agregando, setAgregando] = useState<'crear' | 'miembro' | null>(null)
  const [detalleId, setDetalleId] = useState<string | null>(null)
  const detalle = inversionistas.find((p) => p.id === detalleId) ?? null

  // Totales por participación (una persona puede tener varias)
  const participaciones = inversionistas.flatMap((p) => p.participaciones)
  const participacionesPagadas = participaciones.filter((x) => x.cuotaDelMes)
  const esperadoMes = participaciones.reduce((s, x) => s + x.monto, 0)
  const recaudadoMes = inversionistas.reduce((s, p) => s + p.pagadoMes, 0)
  const idsActivas = new Set(participaciones.map((x) => x.id))
  const cuotasActivas = cuotasDelAnio.filter((c) => idsActivas.has(c.participacion_id))
  const recaudadoAnio = cuotasActivas.reduce((s, c) => s + (c.monto ?? 0), 0)

  // Pestañas por persona
  const conPendiente = inversionistas.filter((p) => p.estadoMes === 'pendiente' || p.estadoMes === 'parcial')
  const alDia = inversionistas.filter((p) => p.estadoMes === 'al_dia')
  const ambasCategorias = inversionistas.filter((p) => p.categorias.length > 1).length

  const q = normalizar(busquedaDiferida.trim())
  const visibles = inversionistas
    .filter((p) =>
      filtro === 'pendientes'
        ? p.estadoMes === 'pendiente' || p.estadoMes === 'parcial'
        : filtro === 'al_dia'
          ? p.estadoMes === 'al_dia'
          : true
    )
    .filter((p) => !q || normalizar(p.nombre).includes(q) || (p.celular ?? '').includes(q))
    .filter((p) => !categoria || tieneCategoria(p, categoria))
    // Primero quienes deben algo: son los que requieren acción
    .sort((a, b) => ORDEN_ESTADO[a.estadoMes] - ORDEN_ESTADO[b.estadoMes])

  function abrir(persona: InversionistaConEstado, participacion: ParticipacionConEstado, cuota: Cuota | null) {
    limpiarError()
    setFormulario({ persona, participacion, cuota })
  }

  async function guardar(input: CuotaInput) {
    if (!formulario) return false
    const ok = formulario.cuota ? await actualizar(formulario.cuota.id, input) : await registrar(input)
    if (ok) setFormulario(null)
    return ok
  }

  async function anularCuota(p: InversionistaConEstado, x: ParticipacionConEstado, c: Cuota) {
    if (confirm(`¿Anular la cuota de ${nombreMes(mes)} de ${p.nombre} (${formatMoneda(x.monto)})?`)) await anular(c.id)
  }

  const pestanas: { valor: FiltroEstado; label: string; total: number }[] = [
    { valor: 'todos', label: 'Todos', total: inversionistas.length },
    { valor: 'pendientes', label: 'Con pendientes', total: conPendiente.length },
    { valor: 'al_dia', label: 'Al día', total: alDia.length },
  ]

  return (
    <>
      <PageHeader
        title="Inversionistas del Reino"
        subtitle="Registro de cuotas mensuales de los miembros inversionistas"
        actions={
          <>
            <MesNavegador mes={mes} onChange={setMes} marcas={marcas} />
            <Button
              variant="secondary"
              onClick={() => {
                limpiarError()
                setAgregando('miembro')
              }}
              title="Marcar como inversionista a un miembro de la iglesia"
            >
              <IdCard />
              <span className="sm:hidden xl:inline">Desde miembros</span>
            </Button>
            <Button
              onClick={() => {
                limpiarError()
                setAgregando('crear')
              }}
            >
              <UserPlus />
              Crear inversionista
            </Button>
          </>
        }
      />

      {loading && inversionistas.length === 0 ? (
        <Spinner />
      ) : error ? (
        <Alert>{error}</Alert>
      ) : inversionistas.length === 0 ? (
        <EmptyState
          icon={HandCoins}
          title="Aún no hay inversionistas"
          description="Crea un inversionista (no necesita ser miembro) o marca a un miembro de la iglesia."
          action={
            <Button onClick={() => setAgregando('crear')}>
              <UserPlus />
              Crear inversionista
            </Button>
          }
        />
      ) : (
        <>
          <ResumenCuotas
            mes={mes}
            total={participaciones.length}
            pagadas={participacionesPagadas.length}
            personas={inversionistas.length}
            recaudadoMes={recaudadoMes}
            cuotasAnio={cuotasActivas.length}
            recaudadoAnio={recaudadoAnio}
            esperadoMes={esperadoMes}
          />

          <div className="mb-4 flex flex-wrap items-center gap-x-4 gap-y-2 rounded-xl border border-slate-200/80 bg-white px-4 py-3 text-xs text-slate-600 shadow-xs sm:px-6">
            <span className="font-semibold text-navy-900">Cómo leer la grilla:</span>
            <span className="flex items-center gap-1.5">
              <CategoriaBadge categoria="inversionista" /> participación desde {formatMoneda(CUOTA_INVERSIONISTA)}
            </span>
            <span className="flex items-center gap-1.5">
              <CategoriaBadge categoria="microinversionista" /> participación menor
            </span>
            <span>
              Una persona puede tener <strong className="font-semibold text-navy-900">ambas</strong>: cada participación se
              cobra y se registra por separado.
              {ambasCategorias > 0 && ` Hoy ${ambasCategorias} ${ambasCategorias === 1 ? 'persona tiene' : 'personas tienen'} las dos.`}
            </span>
          </div>

          <MensajeRecordatorio plantilla={plantilla} onChange={setPlantilla} />

          {!formulario && !detalle && agregando === null && saveError && (
            <div className="mb-4">
              <Alert>{saveError}</Alert>
            </div>
          )}

          <section className="rounded-xl border border-slate-200/80 bg-white shadow-xs">
            <header className="flex flex-col gap-3 border-b border-slate-100 px-4 py-3 sm:flex-row sm:items-center sm:justify-between sm:px-6">
              <div role="tablist" aria-label="Filtrar por estado" className="flex gap-1 rounded-lg bg-slate-100 p-1">
                {pestanas.map((t) => (
                  <button
                    key={t.valor}
                    role="tab"
                    type="button"
                    aria-selected={filtro === t.valor}
                    onClick={() => setFiltro(t.valor)}
                    className={`flex min-h-9 flex-1 items-center justify-center gap-1.5 rounded-md px-3 text-sm font-medium transition-colors sm:flex-none ${
                      filtro === t.valor ? 'bg-white text-navy-900 shadow-xs' : 'text-slate-500 hover:text-navy-900'
                    }`}
                  >
                    {t.label}
                    <span
                      className={`rounded-full px-1.5 text-xs tabular-nums ${
                        filtro === t.valor ? 'bg-primary-50 text-primary-700' : 'bg-slate-200 text-slate-600'
                      }`}
                    >
                      {t.total}
                    </span>
                  </button>
                ))}
              </div>
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
              <select
                value={categoria}
                onChange={(e) => setCategoria(e.target.value as Categoria | '')}
                aria-label="Filtrar por categoría"
                className={`${inputClass} sm:w-48`}
              >
                <option value="">Todas las categorías</option>
                {(Object.keys(CATEGORIAS) as Categoria[]).map((c) => (
                  <option key={c} value={c}>
                    {CATEGORIAS[c].label} ({inversionistas.filter((p) => tieneCategoria(p, c)).length})
                  </option>
                ))}
              </select>
              <div className="relative sm:w-64">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={busqueda}
                  onChange={(e) => setBusqueda(e.target.value)}
                  placeholder="Buscar inversionista"
                  aria-label="Buscar inversionista"
                  className={`${inputClass} pl-9`}
                />
              </div>
              </div>
            </header>

            {visibles.length === 0 ? (
              <p className="px-6 py-10 text-center text-sm text-slate-500">
                {filtro === 'pendientes' && !q
                  ? `¡Todos están al día en ${nombreMes(mes)}! 🎉`
                  : 'No hay inversionistas que coincidan.'}
              </p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {visibles.map((p) => (
                  <InversionistaFila
                    key={p.id}
                    inversionista={p}
                    mes={mes}
                    mensaje={armarMensaje(plantilla, p.nombre, nombreMes(mes), formatMoneda(p.pendienteMes))}
                    onRegistrar={(x) => abrir(p, x, null)}
                    onEditar={(x, c) => abrir(p, x, c)}
                    onAnular={(x, c) => anularCuota(p, x, c)}
                    onElegirMes={setMes}
                    onDetalle={() => {
                      limpiarError()
                      setDetalleId(p.id)
                    }}
                  />
                ))}
              </ul>
            )}
          </section>
        </>
      )}

      <Drawer
        abierto={!!formulario}
        titulo={formulario?.cuota ? 'Editar cuota' : 'Registrar cuota'}
        subtitulo={
          formulario && (
            <span className="flex flex-wrap items-center gap-2">
              {formulario.persona.nombre} · {formatMoneda(formulario.participacion.monto)}
              <CategoriaBadge categoria={formulario.participacion.categoria} />
            </span>
          )
        }
        onCerrar={() => setFormulario(null)}
      >
        {formulario && (
          <CuotaForm
            key={`${formulario.participacion.id}-${formulario.cuota?.id ?? mes}`}
            participacionId={formulario.participacion.id}
            mesInicial={mes}
            inicial={formulario.cuota}
            montoSugerido={formulario.participacion.monto}
            guardando={guardando}
            error={saveError}
            onSubmit={guardar}
            onCancel={() => setFormulario(null)}
          />
        )}
      </Drawer>

      {detalle && (
        <DetalleInversionista
          persona={detalle}
          mes={mes}
          plantilla={plantilla}
          guardando={guardando}
          error={saveError}
          limpiarError={limpiarError}
          onCambiarAnio={(anio) => setMes(`${anio}${mes.slice(4)}`)}
          onCrearParticipacion={(input) => crearParticipacion(detalle.id, input)}
          onActualizarParticipacion={actualizarParticipacion}
          onFinalizarParticipacion={finalizarParticipacion}
          onGuardarCuota={(input, existente) => (existente ? actualizar(existente.id, input) : registrar(input))}
          onAnular={anular}
          onActualizarExterno={(datos) => actualizarExterno(detalle.id, datos)}
          onQuitar={async () => {
            const ok = await quitar(detalle.id)
            if (ok) setDetalleId(null)
            return ok
          }}
          onCerrar={() => setDetalleId(null)}
        />
      )}

      <Drawer
        abierto={agregando !== null}
        titulo={agregando === 'miembro' ? 'Agregar desde Miembros' : 'Crear inversionista'}
        subtitulo={agregando === 'miembro' ? 'Miembro de la iglesia que será inversionista' : 'No necesita ser miembro de la iglesia'}
        onCerrar={() => setAgregando(null)}
      >
        {agregando === 'crear' && (
          <CrearInversionista
            guardando={guardando}
            error={saveError}
            onCrear={async (datos) => {
              const ok = await crearExterno(datos)
              if (ok) setAgregando(null)
              return ok
            }}
            onCancelar={() => setAgregando(null)}
          />
        )}
        {agregando === 'miembro' && (
          <AgregarMiembroInversionista
            guardando={guardando}
            error={saveError}
            onAgregar={async (id, cuota) => {
              const ok = await agregarMiembro(id, cuota)
              if (ok) setAgregando(null)
              return ok
            }}
            onCancelar={() => setAgregando(null)}
          />
        )}
      </Drawer>
    </>
  )
}
