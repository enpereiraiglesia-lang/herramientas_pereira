import { useDeferredValue, useState } from 'react'
import { HandCoins, Search } from 'lucide-react'
import { Alert } from '../../../components/ui/Alert'
import { Drawer } from '../../../components/ui/Drawer'
import { EmptyState } from '../../../components/ui/EmptyState'
import { inputClass } from '../../../components/ui/Field'
import { MesNavegador } from '../../../components/ui/MesNavegador'
import { PageHeader } from '../../../components/ui/PageHeader'
import { Spinner } from '../../../components/ui/Spinner'
import { mesActual, nombreMes } from '../../../components/ui/calendario/fechas'
import { useInversionistas } from '../hooks/useInversionistas'
import type { Cuota, CuotaInput, FiltroEstado, InversionistaConEstado } from '../types'
import { CuotaForm } from './CuotaForm'
import { InversionistaFila } from './InversionistaFila'
import { armarMensaje, leerPlantilla } from '../mensaje'
import { MensajeRecordatorio } from './MensajeRecordatorio'
import { ResumenCuotas } from './ResumenCuotas'

interface Formulario {
  persona: InversionistaConEstado
  cuota: Cuota | null
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
  const busquedaDiferida = useDeferredValue(busqueda)
  const [plantilla, setPlantilla] = useState(leerPlantilla)
  const [formulario, setFormulario] = useState<Formulario | null>(null)

  const { inversionistas, cuotasDelAnio, marcas, loading, error, guardando, saveError, limpiarError, registrar, actualizar, anular } =
    useInversionistas(mes)

  const pagadas = inversionistas.filter((p) => p.cuotaDelMes)
  const pendientes = inversionistas.length - pagadas.length
  const recaudadoMes = pagadas.reduce((s, p) => s + (p.cuotaDelMes?.monto ?? 0), 0)
  const idsActivos = new Set(inversionistas.map((p) => p.id))
  const cuotasActivas = cuotasDelAnio.filter((c) => idsActivos.has(c.miembro_id))
  const recaudadoAnio = cuotasActivas.reduce((s, c) => s + (c.monto ?? 0), 0)

  const q = normalizar(busquedaDiferida.trim())
  const visibles = inversionistas
    .filter((p) => (filtro === 'pendientes' ? !p.cuotaDelMes : filtro === 'al_dia' ? !!p.cuotaDelMes : true))
    .filter((p) => !q || normalizar(p.nombre).includes(q) || (p.celular ?? '').includes(q))
    // Pendientes primero: son los que requieren acción
    .sort((a, b) => Number(!!a.cuotaDelMes) - Number(!!b.cuotaDelMes))

  function abrir(persona: InversionistaConEstado, cuota: Cuota | null) {
    limpiarError()
    setFormulario({ persona, cuota })
  }

  async function guardar(input: CuotaInput) {
    if (!formulario) return false
    const ok = formulario.cuota ? await actualizar(formulario.cuota.id, input) : await registrar(input)
    if (ok) setFormulario(null)
    return ok
  }

  async function anularCuota(p: InversionistaConEstado) {
    if (p.cuotaDelMes && confirm(`¿Anular la cuota de ${nombreMes(mes)} de ${p.nombre}?`)) await anular(p.cuotaDelMes.id)
  }

  const pestanas: { valor: FiltroEstado; label: string; total: number }[] = [
    { valor: 'todos', label: 'Todos', total: inversionistas.length },
    { valor: 'pendientes', label: 'Pendientes', total: pendientes },
    { valor: 'al_dia', label: 'Al día', total: pagadas.length },
  ]

  return (
    <>
      <PageHeader
        title="Inversionistas del Reino"
        subtitle="Registro de cuotas mensuales de los miembros inversionistas"
        actions={<MesNavegador mes={mes} onChange={setMes} marcas={marcas} />}
      />

      {loading && inversionistas.length === 0 ? (
        <Spinner />
      ) : error ? (
        <Alert>{error}</Alert>
      ) : inversionistas.length === 0 ? (
        <EmptyState
          icon={HandCoins}
          title="Aún no hay inversionistas"
          description="En el módulo Miembros, marca “¿Es inversionista del Reino?” en Sí y aparecerán aquí."
        />
      ) : (
        <>
          <ResumenCuotas
            mes={mes}
            total={inversionistas.length}
            pagadas={pagadas.length}
            recaudadoMes={recaudadoMes}
            cuotasAnio={cuotasActivas.length}
            recaudadoAnio={recaudadoAnio}
          />

          <MensajeRecordatorio plantilla={plantilla} onChange={setPlantilla} />

          {!formulario && saveError && (
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
            </header>

            {visibles.length === 0 ? (
              <p className="px-6 py-10 text-center text-sm text-slate-500">
                {filtro === 'pendientes' && !q
                  ? `¡Todos pagaron la cuota de ${nombreMes(mes)}! 🎉`
                  : 'No hay inversionistas que coincidan.'}
              </p>
            ) : (
              <ul className="divide-y divide-slate-100">
                {visibles.map((p) => (
                  <InversionistaFila
                    key={p.id}
                    inversionista={p}
                    mes={mes}
                    mensaje={armarMensaje(plantilla, p.nombre, nombreMes(mes))}
                    onRegistrar={() => abrir(p, null)}
                    onEditar={() => abrir(p, p.cuotaDelMes)}
                    onAnular={() => anularCuota(p)}
                    onElegirMes={setMes}
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
        subtitulo={formulario?.persona.nombre}
        onCerrar={() => setFormulario(null)}
      >
        {formulario && (
          <CuotaForm
            key={`${formulario.persona.id}-${formulario.cuota?.id ?? mes}`}
            miembroId={formulario.persona.id}
            mesInicial={mes}
            inicial={formulario.cuota}
            montoSugerido={formulario.persona.ultimoMonto}
            guardando={guardando}
            error={saveError}
            onSubmit={guardar}
            onCancel={() => setFormulario(null)}
          />
        )}
      </Drawer>
    </>
  )
}
