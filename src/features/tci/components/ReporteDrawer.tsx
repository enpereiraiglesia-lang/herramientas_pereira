import { useMemo, useState } from 'react'
import { Check, Copy, Images, Loader2, MessageCircle } from 'lucide-react'
import { Alert } from '../../../components/ui/Alert'
import { Drawer } from '../../../components/ui/Drawer'
import { Select } from '../../../components/ui/Select'
import { armarReporte } from '../reporte'
import { tciService } from '../services/tciService'
import type { GrupoCompleto, Salida } from '../types'

const MAX_FOTOS = 10

interface Props {
  abierto: boolean
  salida: Salida
  grupos: GrupoCompleto[]
  onCerrar: () => void
}

function puedeCompartirArchivos() {
  try {
    return typeof navigator.canShare === 'function' && navigator.canShare({ files: [new File([''], 'x.jpg', { type: 'image/jpeg' })] })
  } catch {
    return false
  }
}

/** Convierte *negrita* y _cursiva_ de WhatsApp para la vista previa */
function VistaPrevia({ texto }: { texto: string }) {
  const partes = texto.split(/(\*[^*\n]+\*|_[^_\n]+_)/g)
  return (
    <>
      {partes.map((p, i) =>
        p.startsWith('*') && p.endsWith('*') && p.length > 2 ? (
          <strong key={i}>{p.slice(1, -1)}</strong>
        ) : p.startsWith('_') && p.endsWith('_') && p.length > 2 ? (
          <em key={i}>{p.slice(1, -1)}</em>
        ) : (
          <span key={i}>{p}</span>
        )
      )}
    </>
  )
}

/** Vista previa del reporte (meta inicial vs. alcanzado) y envío por WhatsApp */
export function ReporteDrawer({ abierto, salida, grupos, onCerrar }: Props) {
  const [alcance, setAlcance] = useState('todos')
  const [conIntegrantes, setConIntegrantes] = useState(true)
  const [copiado, setCopiado] = useState(false)
  const [compartiendo, setCompartiendo] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [conArchivos] = useState(puedeCompartirArchivos)

  const elegidos = alcance === 'todos' ? grupos : grupos.filter((g) => g.id === alcance)
  const texto = useMemo(() => armarReporte(salida, elegidos, { integrantes: conIntegrantes }), [salida, elegidos, conIntegrantes])
  const totalFotos = elegidos.reduce((s, g) => s + g.fotos.length, 0)

  async function copiar() {
    try {
      await navigator.clipboard.writeText(texto)
      setCopiado(true)
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      setError('No se pudo copiar. Selecciona el texto y cópialo manualmente.')
    }
  }

  async function compartirConFotos() {
    setError(null)
    setCompartiendo(true)
    try {
      const fotos = await tciService.conUrls(elegidos.flatMap((g) => g.fotos).slice(0, MAX_FOTOS))
      const archivos = await Promise.all(
        fotos
          .filter((f) => f.url)
          .map(async (f, i) => {
            const blob = await fetch(f.url as string).then((r) => r.blob())
            return new File([blob], `foto-${i + 1}.jpg`, { type: 'image/jpeg' })
          })
      )
      // Algunas apps ignoran el texto al compartir fotos: también se deja copiado
      await navigator.clipboard?.writeText(texto).catch(() => {})
      await navigator.share({ text: texto, files: archivos })
    } catch (err) {
      if ((err as DOMException)?.name !== 'AbortError') setError('No se pudieron compartir las fotos. Envía solo el reporte.')
    } finally {
      setCompartiendo(false)
    }
  }

  return (
    <Drawer abierto={abierto} titulo="Reporte de la salida" subtitulo={salida.nombre} onCerrar={onCerrar}>
      <div className="flex flex-col gap-4">
        {grupos.length > 1 && (
          <Select
            label="¿Qué incluir?"
            name="alcance"
            value={alcance}
            onChange={(e) => setAlcance(e.target.value)}
            options={[
              { value: 'todos', label: `Toda la salida (${grupos.length} equipos)` },
              ...grupos.map((g) => ({ value: g.id, label: g.nombre })),
            ]}
          />
        )}

        <label className="flex min-h-11 cursor-pointer items-center gap-3 text-sm text-slate-700">
          <input
            type="checkbox"
            checked={conIntegrantes}
            onChange={(e) => setConIntegrantes(e.target.checked)}
            className="h-5 w-5 rounded border-slate-300 text-primary-600 focus:ring-primary-600"
          />
          Incluir los nombres de los integrantes
        </label>

        {/* Vista previa estilo chat */}
        <div className="rounded-xl bg-[#efeae2] p-3 sm:p-4">
          <div className="ml-auto max-w-[95%] rounded-lg rounded-tr-none bg-[#d9fdd3] px-3 py-2 text-[13px] leading-relaxed whitespace-pre-wrap text-slate-800 shadow-sm">
            <VistaPrevia texto={texto} />
          </div>
        </div>

        {error && <Alert>{error}</Alert>}

        {/* Envío */}
        <div className="sticky bottom-0 -mx-4 flex flex-col gap-2 border-t border-slate-200 bg-white px-4 pt-3 pb-1 sm:-mx-6 sm:px-6">
          {/* WhatsApp se abre y ahí se elige el contacto o grupo */}
          <a
            href={`https://wa.me/?text=${encodeURIComponent(texto)}`}
            target="_blank"
            rel="noreferrer"
            className="inline-flex min-h-12 items-center justify-center gap-2 rounded-lg bg-emerald-600 px-4 text-sm font-semibold text-white shadow-sm hover:bg-emerald-700"
          >
            <MessageCircle className="h-4 w-4" />
            Enviar por WhatsApp
          </a>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={copiar}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50"
            >
              {copiado ? <Check className="h-4 w-4 text-emerald-600" /> : <Copy className="h-4 w-4" />}
              {copiado ? 'Copiado' : 'Copiar texto'}
            </button>
            <button
              type="button"
              onClick={compartirConFotos}
              disabled={!conArchivos || !totalFotos || compartiendo}
              title={!conArchivos ? 'Disponible desde el celular' : !totalFotos ? 'No hay fotos' : undefined}
              className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-white px-3 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {compartiendo ? <Loader2 className="h-4 w-4 animate-spin" /> : <Images className="h-4 w-4" />}
              Con fotos ({Math.min(totalFotos, MAX_FOTOS)})
            </button>
          </div>
        </div>
      </div>
    </Drawer>
  )
}
