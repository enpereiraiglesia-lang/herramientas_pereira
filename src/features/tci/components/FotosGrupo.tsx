import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { Camera, ChevronLeft, ChevronRight, Download, ImagePlus, Images, Loader2, Trash2, X } from 'lucide-react'
import { Alert } from '../../../components/ui/Alert'
import { Spinner } from '../../../components/ui/Spinner'
import { comprimirImagen } from '../imagen'
import type { FotoConUrl } from '../types'
import { CamaraModal } from './CamaraModal'

interface Props {
  fotos: FotoConUrl[]
  cargando: boolean
  subiendo: boolean
  error: string | null
  onSubir: (archivos: Blob[]) => Promise<boolean>
  onEliminar: (foto: FotoConUrl) => Promise<boolean>
}

function Visor({
  fotos,
  indice,
  onCambiar,
  onCerrar,
  onEliminar,
}: {
  fotos: FotoConUrl[]
  indice: number
  onCambiar: (i: number) => void
  onCerrar: () => void
  onEliminar: (f: FotoConUrl) => void
}) {
  const foto = fotos[indice]
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onCerrar()
      if (e.key === 'ArrowLeft' && indice > 0) onCambiar(indice - 1)
      if (e.key === 'ArrowRight' && indice < fotos.length - 1) onCambiar(indice + 1)
    }
    document.addEventListener('keydown', tecla)
    return () => document.removeEventListener('keydown', tecla)
  }, [indice, fotos.length, onCambiar, onCerrar])

  if (!foto) return null
  const flecha = 'absolute top-1/2 flex h-12 w-12 -translate-y-1/2 items-center justify-center rounded-full bg-white/10 text-white hover:bg-white/20'

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black/95" role="dialog" aria-modal="true" aria-label="Foto">
      <header className="flex items-center justify-between gap-2 p-3 text-white">
        <span className="text-sm text-white/70 tabular-nums">
          {indice + 1} / {fotos.length}
        </span>
        <div className="flex gap-1">
          {foto.url && (
            <a href={foto.url} download target="_blank" rel="noreferrer" aria-label="Descargar" className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/10">
              <Download className="h-5 w-5" />
            </a>
          )}
          <button type="button" onClick={() => onEliminar(foto)} aria-label="Eliminar foto" className="flex h-11 w-11 items-center justify-center rounded-full text-rose-400 hover:bg-white/10">
            <Trash2 className="h-5 w-5" />
          </button>
          <button type="button" onClick={onCerrar} aria-label="Cerrar" className="flex h-11 w-11 items-center justify-center rounded-full hover:bg-white/10">
            <X className="h-5 w-5" />
          </button>
        </div>
      </header>
      <div className="relative flex flex-1 items-center justify-center p-2">
        {foto.url && <img src={foto.url} alt="" className="max-h-full max-w-full object-contain" />}
        {indice > 0 && (
          <button type="button" onClick={() => onCambiar(indice - 1)} aria-label="Anterior" className={`${flecha} left-2`}>
            <ChevronLeft className="h-6 w-6" />
          </button>
        )}
        {indice < fotos.length - 1 && (
          <button type="button" onClick={() => onCambiar(indice + 1)} aria-label="Siguiente" className={`${flecha} right-2`}>
            <ChevronRight className="h-6 w-6" />
          </button>
        )}
      </div>
    </div>
  )
}

/** Galería del grupo: tomar fotos con la cámara, subir desde la galería, ver y eliminar */
export function FotosGrupo({ fotos, cargando, subiendo, error, onSubir, onEliminar }: Props) {
  const [camara, setCamara] = useState(false)
  const [visor, setVisor] = useState<number | null>(null)
  const [procesando, setProcesando] = useState(false)
  const galeria = useRef<HTMLInputElement>(null)
  const camaraNativa = useRef<HTMLInputElement>(null)

  async function desdeArchivos(e: ChangeEvent<HTMLInputElement>) {
    const archivos = [...(e.target.files ?? [])].filter((f) => f.type.startsWith('image/'))
    e.target.value = ''
    if (!archivos.length) return
    setProcesando(true)
    try {
      const listas = await Promise.all(archivos.map((a) => comprimirImagen(a).catch(() => a)))
      await onSubir(listas)
    } finally {
      setProcesando(false)
    }
  }

  async function eliminar(f: FotoConUrl) {
    if (!confirm('¿Eliminar esta foto?')) return
    if (await onEliminar(f)) setVisor((v) => (v == null ? null : fotos.length <= 1 ? null : Math.min(v, fotos.length - 2)))
  }

  const ocupado = subiendo || procesando

  return (
    <section className="rounded-xl border border-slate-200/80 bg-white shadow-xs">
      <header className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 px-4 py-3 sm:px-6">
        <h2 className="flex items-center gap-2 text-base font-semibold text-navy-900">
          <Images className="h-4 w-4 text-slate-400" />
          Fotos <span className="font-normal text-slate-400">({fotos.length})</span>
        </h2>
        {ocupado && (
          <span className="flex items-center gap-1.5 text-sm text-primary-700">
            <Loader2 className="h-4 w-4 animate-spin" />
            Subiendo fotos…
          </span>
        )}
      </header>

      <div className="flex flex-col gap-4 p-4 sm:p-6">
        {error && <Alert>{error}</Alert>}

        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setCamara(true)}
            disabled={ocupado}
            className="flex min-h-14 items-center justify-center gap-2 rounded-xl bg-primary-600 px-4 text-sm font-semibold text-white shadow-sm transition-colors hover:bg-primary-700 disabled:opacity-60"
          >
            <Camera className="h-5 w-5" />
            Tomar fotos
          </button>
          <button
            type="button"
            onClick={() => galeria.current?.click()}
            disabled={ocupado}
            className="flex min-h-14 items-center justify-center gap-2 rounded-xl bg-white px-4 text-sm font-semibold text-slate-700 shadow-sm ring-1 ring-inset ring-slate-300 transition-colors hover:bg-slate-50 disabled:opacity-60"
          >
            <ImagePlus className="h-5 w-5" />
            Subir de galería
          </button>
        </div>
        <input ref={galeria} type="file" accept="image/*" multiple hidden onChange={desdeArchivos} />
        <input ref={camaraNativa} type="file" accept="image/*" capture="environment" hidden onChange={desdeArchivos} />

        {cargando && fotos.length === 0 ? (
          <Spinner label="Cargando fotos..." />
        ) : fotos.length === 0 ? (
          <p className="rounded-lg border border-dashed border-slate-300 px-4 py-8 text-center text-sm text-slate-500">
            Aún no hay fotos. Toma fotos de la salida para incluirlas en el reporte.
          </p>
        ) : (
          <ul className="grid grid-cols-3 gap-1.5 sm:grid-cols-4 lg:grid-cols-6">
            {fotos.map((f, i) => (
              <li key={f.id}>
                <button
                  type="button"
                  onClick={() => setVisor(i)}
                  className="group relative block aspect-square w-full overflow-hidden rounded-lg bg-slate-100"
                  aria-label={`Ver foto ${i + 1}`}
                >
                  {f.url && (
                    <img src={f.url} alt="" loading="lazy" className="h-full w-full object-cover transition-transform group-hover:scale-105" />
                  )}
                </button>
              </li>
            ))}
          </ul>
        )}
      </div>

      {camara && (
        <CamaraModal
          onCerrar={() => setCamara(false)}
          onUsarNativa={() => {
            setCamara(false)
            camaraNativa.current?.click()
          }}
          onGaleria={() => {
            setCamara(false)
            galeria.current?.click()
          }}
          onListo={async (blobs) => {
            setCamara(false)
            await onSubir(blobs)
          }}
        />
      )}
      {visor != null && (
        <Visor fotos={fotos} indice={visor} onCambiar={setVisor} onCerrar={() => setVisor(null)} onEliminar={eliminar} />
      )}
    </section>
  )
}
