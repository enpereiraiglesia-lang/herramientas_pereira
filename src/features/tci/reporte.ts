import { fechaLarga } from '../../components/ui/calendario/fechas'
import { METRICAS, avanceGeneral, porcentaje, totales, type GrupoCompleto, type Salida, type Totales } from './types'

interface Opciones {
  detalle: boolean
}

function lineasTotales(t: Totales) {
  return METRICAS.map((m) => {
    const { meta, logro } = t[m.clave]
    return `${m.emoji} ${m.label}: *${logro}*${meta ? ` / ${meta} (${porcentaje(logro, meta)}%)` : ''}`
  })
}

function bloqueGrupo(g: GrupoCompleto, { detalle }: Opciones) {
  const t = totales(g.integrantes)
  const avance = avanceGeneral(t)
  const lineas = [
    `*👥 ${g.nombre}*${avance != null ? ` — ${avance}%` : ''}`,
    `Líder: ${g.lider?.nombre ?? 'sin asignar'}${g.zona ? ` · Zona: ${g.zona}` : ''}`,
    `Integrantes: ${g.integrantes.length} · Fotos: ${g.fotos.length}`,
    ...lineasTotales(t),
  ]
  if (detalle && g.integrantes.length) {
    lineas.push('', '_Detalle por integrante (logro/meta):_')
    for (const i of g.integrantes) {
      const datos = METRICAS.map((m) => `${m.corto} ${i[`logro_${m.clave}`]}/${i[`meta_${m.clave}`]}`).join(' · ')
      lineas.push(`• ${i.miembro?.nombre ?? 'Integrante'}: ${datos}`)
    }
  }
  return lineas.join('\n')
}

/** Reporte en texto con formato de WhatsApp (*negrita*, _cursiva_) */
export function armarReporte(salida: Salida, grupos: GrupoCompleto[], opciones: Opciones) {
  const todos = grupos.flatMap((g) => g.integrantes)
  const t = totales(todos)
  const avance = avanceGeneral(t)
  const fotos = grupos.reduce((s, g) => s + g.fotos.length, 0)

  const encabezado = [
    `*📋 REPORTE ${salida.nombre.toUpperCase()}*`,
    `📅 ${fechaLarga(salida.fecha)}`,
    salida.lugar ? `📍 ${salida.lugar}` : null,
  ].filter(Boolean)

  const resumen =
    grupos.length > 1
      ? [
          '',
          `*📊 RESUMEN GENERAL*${avance != null ? ` — ${avance}%` : ''}`,
          `Grupos: ${grupos.length} · Integrantes: ${todos.length} · Fotos: ${fotos}`,
          ...lineasTotales(t),
        ]
      : []

  const bloques = grupos.map((g) => bloqueGrupo(g, opciones))

  return [...encabezado, ...resumen, '', bloques.join('\n\n━━━━━━━━━━\n\n'), '', '_¡Gloria a Dios por cada vida alcanzada!_ 🙌']
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
}
