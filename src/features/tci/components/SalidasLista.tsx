import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { ChevronRight, Footprints, MapPin, Plus, Users } from 'lucide-react'
import { Alert } from '../../../components/ui/Alert'
import { Badge } from '../../../components/ui/Badge'
import { Button } from '../../../components/ui/Button'
import { Drawer } from '../../../components/ui/Drawer'
import { EmptyState } from '../../../components/ui/EmptyState'
import { PageHeader } from '../../../components/ui/PageHeader'
import { Spinner } from '../../../components/ui/Spinner'
import { MESES_CORTOS, desdeISO, hoy } from '../../../components/ui/calendario/fechas'
import { usePermisos } from '../../permisos/hooks/usePermisos'
import { useSalidas } from '../hooks/useTci'
import { avanceGeneral, totales, type SalidaInput, type SalidaResumen } from '../types'
import { BarraAvance } from './ResumenMetricas'
import { SalidaForm } from './SalidaForm'

function TarjetaSalida({ salida }: { salida: SalidaResumen }) {
  const d = desdeISO(salida.fecha)
  const integrantes = salida.grupos.flatMap((g) => g.integrantes)
  const avance = avanceGeneral(totales(integrantes))
  const h = hoy()

  return (
    <Link
      to={`/tci/${salida.id}`}
      className="group flex gap-4 rounded-xl border border-slate-200/80 bg-white p-4 shadow-xs transition-all hover:-translate-y-0.5 hover:border-primary-300 hover:shadow-md"
    >
      <div className="flex h-16 w-14 shrink-0 flex-col items-center justify-center rounded-lg bg-navy-900 text-white">
        <span className="text-[11px] font-semibold uppercase tracking-wide text-primary-300">{MESES_CORTOS[d.getMonth()]}</span>
        <span className="text-2xl font-bold leading-none tabular-nums">{d.getDate()}</span>
        <span className="text-[10px] text-navy-300">{d.getFullYear()}</span>
      </div>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-start justify-between gap-2">
          <p className="truncate font-semibold text-navy-900 group-hover:text-primary-700">{salida.nombre}</p>
          {salida.fecha === h ? <Badge color="green">Hoy</Badge> : salida.fecha > h ? <Badge color="blue">Próxima</Badge> : null}
        </div>
        <div className="flex flex-wrap gap-x-4 gap-y-0.5 text-xs text-slate-500">
          {salida.lugar && (
            <span className="flex items-center gap-1">
              <MapPin className="h-3 w-3" />
              {salida.lugar}
            </span>
          )}
          <span className="flex items-center gap-1">
            <Users className="h-3 w-3" />
            {salida.grupos.length} grupo{salida.grupos.length === 1 ? '' : 's'} · {integrantes.length} integrantes
          </span>
        </div>
        <BarraAvance valor={avance} className="mt-auto" />
      </div>
      <ChevronRight className="h-5 w-5 shrink-0 self-center text-slate-300 group-hover:text-primary-500" />
    </Link>
  )
}

/** Listado de salidas TCI */
export function SalidasLista() {
  const { salidas, loading, error, guardando, saveError, limpiarError, crear } = useSalidas()
  const { tieneModulo, esLiderTci } = usePermisos()
  const esCoordinador = tieneModulo('tci')
  const [creando, setCreando] = useState(false)
  const navigate = useNavigate()

  async function guardar(input: SalidaInput) {
    const id = await crear(input)
    if (id) navigate(`/tci/${id}`)
  }

  return (
    <>
      <PageHeader
        title="Salidas TCI"
        subtitle={
          esCoordinador
            ? 'Arma grupos temporales, asigna metas y comparte el reporte'
            : 'Diligencia las metas y fotos de los grupos que lideras'
        }
        actions={
          esCoordinador && (
            <Button
              onClick={() => {
                limpiarError()
                setCreando(true)
              }}
            >
              <Plus />
              Nueva salida
            </Button>
          )
        }
      />

      {loading && salidas.length === 0 ? (
        <Spinner />
      ) : error ? (
        <Alert>{error}</Alert>
      ) : salidas.length === 0 ? (
        <EmptyState
          icon={Footprints}
          title="Aún no hay salidas"
          description={
            esCoordinador
              ? 'Crea la primera salida TCI y arma sus grupos.'
              : esLiderTci
                ? 'Todavía no hay salidas con grupos a tu cargo.'
                : 'Cuando te asignen como líder de un grupo, aparecerá aquí.'
          }
          action={
            esCoordinador && (
              <Button onClick={() => setCreando(true)}>
                <Plus />
                Nueva salida
              </Button>
            )
          }
        />
      ) : (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {salidas.map((s) => (
            <TarjetaSalida key={s.id} salida={s} />
          ))}
        </div>
      )}

      <Drawer abierto={creando} titulo="Nueva salida TCI" onCerrar={() => setCreando(false)}>
        {creando && (
          <SalidaForm guardando={guardando} error={saveError} onSubmit={guardar} onCancel={() => setCreando(false)} />
        )}
      </Drawer>
    </>
  )
}
