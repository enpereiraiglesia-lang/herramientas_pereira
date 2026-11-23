import { useMemo, useState } from 'react'
import { mensajeError } from '../../../lib/errores'
import { useAsync } from '../../../lib/useAsync'
import type { MarcaMes } from '../../../components/ui/calendario/CalendarioMeses'
import { mesActual } from '../../../components/ui/calendario/fechas'
import { inversionistasService } from '../services/inversionistasService'
import type { Cuota, CuotaInput, InversionistaConEstado } from '../types'

/** Carga los inversionistas y las cuotas del año del mes elegido (AAAA-MM) */
export function useInversionistas(mes: string) {
  const anio = Number(mes.slice(0, 4))
  const personas = useAsync(() => inversionistasService.listarInversionistas(), [])
  const cuotas = useAsync(() => inversionistasService.listarCuotas(anio), [anio])
  const [guardando, setGuardando] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)

  const inversionistas = useMemo<InversionistaConEstado[]>(() => {
    const porMiembro = new Map<string, Record<string, Cuota>>()
    for (const c of cuotas.data ?? []) {
      const delMiembro = porMiembro.get(c.miembro_id) ?? {}
      delMiembro[c.periodo.slice(0, 7)] = c
      porMiembro.set(c.miembro_id, delMiembro)
    }
    return (personas.data ?? []).map((p) => {
      const cuotasDelAnio = porMiembro.get(p.id) ?? {}
      const conMonto = Object.values(cuotasDelAnio)
        .filter((c) => c.monto != null)
        .sort((a, b) => b.periodo.localeCompare(a.periodo))
      return {
        ...p,
        cuotasDelAnio,
        cuotaDelMes: cuotasDelAnio[mes] ?? null,
        ultimoMonto: conMonto[0]?.monto ?? null,
      }
    })
  }, [personas.data, cuotas.data, mes])

  /** Estado de recaudo de cada mes del año (para el selector de meses) */
  const marcas = useMemo(() => {
    const total = inversionistas.length
    const resultado: Record<string, MarcaMes> = {}
    if (!total) return resultado
    const hasta = mesActual()
    for (let i = 1; i <= 12; i++) {
      const m = `${anio}-${String(i).padStart(2, '0')}`
      const pagadas = inversionistas.filter((p) => p.cuotasDelAnio[m]).length
      if (pagadas === 0 && m > hasta) continue
      resultado[m] = pagadas >= total ? 'completo' : pagadas > 0 ? 'parcial' : 'vacio'
    }
    return resultado
  }, [inversionistas, anio])

  async function ejecutar(fn: () => Promise<unknown>) {
    setGuardando(true)
    setSaveError(null)
    try {
      await fn()
      await cuotas.reload()
      return true
    } catch (err) {
      const msg = mensajeError(err, 'No se pudo guardar')
      setSaveError(msg.includes('cuotas_un_pago_por_mes') ? 'Este miembro ya tiene registrada la cuota de ese mes' : msg)
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
    registrar: (input: CuotaInput) => ejecutar(() => inversionistasService.registrar(input)),
    actualizar: (id: string, input: Partial<CuotaInput>) => ejecutar(() => inversionistasService.actualizar(id, input)),
    anular: (id: string) => ejecutar(() => inversionistasService.anular(id)),
  }
}
