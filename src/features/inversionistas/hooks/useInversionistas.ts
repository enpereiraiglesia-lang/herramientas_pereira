import { useMemo, useState } from 'react'
import { mensajeError } from '../../../lib/errores'
import { useAsync } from '../../../lib/useAsync'
import type { MarcaMes } from '../../../components/ui/calendario/CalendarioMeses'
import { mesActual } from '../../../components/ui/calendario/fechas'
import { inversionistasService, type DatosExterno } from '../services/inversionistasService'
import {
  categoriaDe,
  estadoDelMes,
  type Categoria,
  type Cuota,
  type CuotaInput,
  type InversionistaConEstado,
  type ParticipacionConEstado,
  type ParticipacionInput,
} from '../types'

/** Carga los inversionistas, sus participaciones y las cuotas del año del mes elegido (AAAA-MM) */
export function useInversionistas(mes: string) {
  const anio = Number(mes.slice(0, 4))
  const personas = useAsync(() => inversionistasService.listarInversionistas(), [])
  const cuotas = useAsync(() => inversionistasService.listarCuotas(anio), [anio])
  const [guardando, setGuardando] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const inversionistas = useMemo<InversionistaConEstado[]>(() => {
    const porParticipacion = new Map<string, Record<string, Cuota>>()
    for (const c of cuotas.data ?? []) {
      const deLaParticipacion = porParticipacion.get(c.participacion_id) ?? {}
      deLaParticipacion[c.periodo.slice(0, 7)] = c
      porParticipacion.set(c.participacion_id, deLaParticipacion)
    }

    return (personas.data ?? []).map((p) => {
      const participaciones: ParticipacionConEstado[] = [...p.participaciones]
        .sort((a, b) => a.created_at.localeCompare(b.created_at))
        .map((x, i) => ({ ...x, numero: i + 1 }))
        .filter((x) => x.activa)
        .map((x) => {
          const cuotasDelAnio = porParticipacion.get(x.id) ?? {}
          return { ...x, categoria: categoriaDe(x.monto), cuotasDelAnio, cuotaDelMes: cuotasDelAnio[mes] ?? null }
        })
      const totalMensual = participaciones.reduce((s, x) => s + x.monto, 0)
      const pagadoMes = participaciones.reduce((s, x) => s + (x.cuotaDelMes ? (x.cuotaDelMes.monto ?? x.monto) : 0), 0)
      const pendienteMes = participaciones.filter((x) => !x.cuotaDelMes).reduce((s, x) => s + x.monto, 0)
      const categorias = [...new Set(participaciones.map((x) => x.categoria))].sort() as Categoria[]
      return {
        id: p.id,
        nombre: p.nombre,
        celular: p.celular,
        correo: p.correo,
        direccion: p.direccion,
        es_miembro: p.es_miembro,
        participaciones,
        categorias,
        estadoMes: estadoDelMes(participaciones, mes),
        totalMensual,
        pagadoMes,
        pendienteMes,
      }
    })
  }, [personas.data, cuotas.data, mes])

  /** Estado de recaudo de cada mes del año, contando todas las participaciones (para el selector de meses) */
  const marcas = useMemo(() => {
    const todas = inversionistas.flatMap((p) => p.participaciones)
    const resultado: Record<string, MarcaMes> = {}
    if (!todas.length) return resultado
    const hasta = mesActual()
    for (let i = 1; i <= 12; i++) {
      const m = `${anio}-${String(i).padStart(2, '0')}`
      const pagadas = todas.filter((x) => x.cuotasDelAnio[m]).length
      if (pagadas === 0 && m > hasta) continue
      resultado[m] = pagadas >= todas.length ? 'completo' : pagadas > 0 ? 'parcial' : 'vacio'
    }
    return resultado
  }, [inversionistas, anio])

  async function ejecutar(fn: () => Promise<unknown>, ...recargar: (() => Promise<void>)[]) {
    setGuardando(true)
    setSaveError(null)
    try {
      await fn()
      await Promise.all((recargar.length ? recargar : [cuotas.reload]).map((r) => r()))
      return true
    } catch (err) {
      const msg = mensajeError(err, 'No se pudo guardar')
      setSaveError(
        msg.includes('cuotas_un_pago_por_participacion')
          ? 'Esa participación ya tiene registrada la cuota de ese mes'
          : msg.includes('miembros_correo_idx')
            ? 'Ya existe una persona con ese correo'
            : msg
      )
      return false
    } finally {
      setGuardando(false)
    }
  }

  return {
    inversionistas,
    cuotasDelAnio: cuotas.data ?? [],
    marcas,
    loading: personas.loading || cuotas.loading,
    error: personas.error ?? cuotas.error,
    guardando,
    saveError,
    limpiarError: () => setSaveError(null),
    // Cuotas
    registrar: (input: CuotaInput) => ejecutar(() => inversionistasService.registrar(input)),
    actualizar: (id: string, input: Partial<CuotaInput>) => ejecutar(() => inversionistasService.actualizar(id, input)),
    anular: (id: string) => ejecutar(() => inversionistasService.anular(id)),
    // Participaciones
    crearParticipacion: (miembroId: string, input: ParticipacionInput) =>
      ejecutar(() => inversionistasService.crearParticipacion(miembroId, input), personas.reload),
    actualizarParticipacion: (id: string, input: Partial<ParticipacionInput>) =>
      ejecutar(() => inversionistasService.actualizarParticipacion(id, input), personas.reload),
    finalizarParticipacion: (id: string) =>
      ejecutar(() => inversionistasService.finalizarParticipacion(id), personas.reload),
    // Personas
    agregarMiembro: (miembroId: string, cuota: number | null) =>
      ejecutar(() => inversionistasService.agregarMiembro(miembroId, cuota), personas.reload),
    crearExterno: (datos: DatosExterno) => ejecutar(() => inversionistasService.crearExterno(datos), personas.reload),
    actualizarExterno: (id: string, datos: Omit<DatosExterno, 'cuota' | 'fechaAporte'>) =>
      ejecutar(() => inversionistasService.actualizarExterno(id, datos), personas.reload),
    quitar: (id: string) => ejecutar(() => inversionistasService.quitar(id), personas.reload, cuotas.reload),
  }
}
