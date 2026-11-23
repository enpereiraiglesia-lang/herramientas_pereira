import { fechaLarga } from '../../components/ui/calendario/fechas'
import { METRICAS, avanceGeneral, porcentaje, totales, type GrupoCompleto, type Salida, type Totales } from './types'

interface Opciones {
  /** Incluir los nombres de los integrantes de cada equipo */
  integrantes: boolean
}

const SEPARADOR = '━━━━━━━━━━━━━━'

/** Una línea por métrica: "🌱 *Kits sembrados*: meta 50 → alcanzado *45* (90%) 🔸" */
function lineasMetricas(t: Totales) {
  return METRICAS.map((m) => {
    const { meta, logro } = t[m.clave]
    if (!meta) return `${m.emoji} *${m.label}*: alcanzado *${logro}* (sin meta)`
    const pct = porcentaje(logro, meta)
    return `${m.emoji} *${m.label}*: meta ${meta} → alcanzado *${logro}* (${pct}%) ${pct >= 100 ? '✅' : '🔸'}`
  })
}

function lineaCumplimiento(t: Totales) {
  const avance = avanceGeneral(t)
  return avance == null ? null : `📈 Cumplimiento: *${avance}%*`
}

function bloqueEquipo(g: GrupoCompleto, { integrantes }: Opciones) {
  const t = totales([g])
  const nombres = g.integrantes.map((i) => i.miembro?.nombre).filter(Boolean)
  return [
    `*👥 ${g.nombre.toUpperCase()}*`,
    `Líder: ${g.lider?.nombre ?? 'sin asignar'}${g.zona ? ` · Zona: ${g.zona}` : ''}`,
    `Integrantes: ${g.integrantes.length}${g.fotos.length ? ` · Fotos: ${g.fotos.length}` : ''}`,
    integrantes && nombres.length ? `_${nombres.join(', ')}_` : null,
    '',
    ...lineasMetricas(t),
    lineaCumplimiento(t),
  ]
    .filter((l) => l !== null)
    .join('\n')
}

/** Reporte con formato de WhatsApp (*negrita*, _cursiva_): meta inicial frente a lo alcanzado */
export function armarReporte(salida: Salida, grupos: GrupoCompleto[], opciones: Opciones) {
  const t = totales(grupos)
  const totalIntegrantes = grupos.reduce((s, g) => s + g.integrantes.length, 0)
  const fotos = grupos.reduce((s, g) => s + g.fotos.length, 0)

  const lineas: (string | null)[] = [
    `*📋 REPORTE ${salida.nombre.toUpperCase()}*`,
    `📅 ${fechaLarga(salida.fecha)}`,
    salida.lugar ? `📍 ${salida.lugar}` : null,
  ]

  if (grupos.length > 1) {
    lineas.push(
      '',
      `*📊 RESULTADO GENERAL*`,
      `Equipos: ${grupos.length} · Integrantes: ${totalIntegrantes}${fotos ? ` · Fotos: ${fotos}` : ''}`,
      '',
      ...lineasMetricas(t),
      lineaCumplimiento(t)
    )
  }

  for (const g of grupos) lineas.push('', SEPARADOR, '', bloqueEquipo(g, opciones))

  lineas.push('', SEPARADOR, '✅ meta cumplida · 🔸 en progreso', '', '_¡Gloria a Dios por cada vida alcanzada!_ 🙌')

  return lineas.filter((l) => l !== null).join('\n')
}
