import { useEffect, useRef, useState } from 'react'
import { Camera, Check, ImagePlus, RefreshCw, Trash2, X } from 'lucide-react'
import { comprimirImagen } from '../imagen'

interface Props {
  onListo: (fotos: Blob[]) => void
  onCerrar: () => void
  /** Si no hay acceso a la cámara, abre la cámara/galería nativa */
  onUsarNativa: () => void
  onGaleria: () => void
}

interface Captura {
  blob: Blob
  url: string
}

/** Cámara dentro de la aplicación: permite tomar varias fotos seguidas */
export function CamaraModal({ onListo, onCerrar, onUsarNativa, onGaleria }: Props) {
  const video = useRef<HTMLVideoElement>(null)
  const [modo, setModo] = useState<'environment' | 'user'>('environment')
  const [error, setError] = useState<string | null>(null)
  const [listo, setListo] = useState(false)
  const [capturas, setCapturas] = useState<Captura[]>([])
  const [destello, setDestello] = useState(false)
  const [hayVarias, setHayVarias] = useState(false)
  const [soportada] = useState(() => Boolean(navigator.mediaDevices?.getUserMedia))
  const errorVisible = soportada ? error : 'Este navegador no permite abrir la cámara desde la aplicación.'

  function cambiarCamara() {
    setListo(false)
    setError(null)
    setModo((m) => (m === 'environment' ? 'user' : 'environment'))
  }

  useEffect(() => {
    let stream: MediaStream | null = null
    let cancelado = false
    if (!soportada) return
    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: { ideal: modo }, width: { ideal: 1920 }, height: { ideal: 1080 } }, audio: false })
      .then(async (s) => {
        if (cancelado) return s.getTracks().forEach((t) => t.stop())
        stream = s
        if (video.current) {
          video.current.srcObject = s
          await video.current.play().catch(() => {})
        }
        setListo(true)
        const dispositivos = await navigator.mediaDevices.enumerateDevices().catch(() => [])
        setHayVarias(dispositivos.filter((d) => d.kind === 'videoinput').length > 1)
      })
      .catch((err: DOMException) => {
        setError(
          err.name === 'NotAllowedError'
            ? 'No diste permiso para usar la cámara. Actívalo en la configuración del navegador.'
            : 'No se pudo abrir la cámara.'
        )
      })

    return () => {
      cancelado = true
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [modo, soportada])

  // Bloquea el scroll y cierra con Escape
  useEffect(() => {
    const tecla = (e: KeyboardEvent) => e.key === 'Escape' && onCerrar()
    document.addEventListener('keydown', tecla)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', tecla)
      document.body.style.overflow = ''
    }
  }, [onCerrar])

  // Libera las vistas previas
  const capturasRef = useRef(capturas)
  useEffect(() => {
    capturasRef.current = capturas
  }, [capturas])
  useEffect(() => () => capturasRef.current.forEach((c) => URL.revokeObjectURL(c.url)), [])

  async function tomar() {
    const v = video.current
    if (!v || !v.videoWidth) return
    const canvas = document.createElement('canvas')
    canvas.width = v.videoWidth
    canvas.height = v.videoHeight
    canvas.getContext('2d')?.drawImage(v, 0, 0)
    setDestello(true)
    setTimeout(() => setDestello(false), 150)
    navigator.vibrate?.(30)
    const blob = await comprimirImagen(canvas)
    setCapturas((c) => [...c, { blob, url: URL.createObjectURL(blob) }])
  }

  function quitar(i: number) {
    setCapturas((c) => {
      URL.revokeObjectURL(c[i].url)
      return c.filter((_, j) => j !== i)
    })
  }

  return (
    <div className="fixed inset-0 z-[60] flex flex-col bg-black text-white" role="dialog" aria-modal="true" aria-label="Cámara">
      <header className="flex items-center justify-between px-3 pt-[max(0.75rem,env(safe-area-inset-top))] pb-2">
        <button type="button" onClick={onCerrar} aria-label="Cerrar cámara" className="flex h-11 w-11 items-center justify-center rounded-full bg-white/10 hover:bg-white/20">
          <X className="h-5 w-5" />
        </button>
        <span className="text-sm font-medium text-white/80">
          {capturas.length ? `${capturas.length} foto${capturas.length === 1 ? '' : 's'}` : 'Toma las fotos del grupo'}
        </span>
        <button
          type="button"
          disabled={!capturas.length}
          onClick={() => onListo(capturas.map((c) => c.blob))}
          className="flex min-h-11 items-center gap-1.5 rounded-full bg-emerald-500 px-4 text-sm font-semibold disabled:bg-white/10 disabled:text-white/40"
        >
          <Check className="h-4 w-4" />
          Subir
        </button>
      </header>

      <div className="relative flex flex-1 items-center justify-center overflow-hidden">
        <video
          ref={video}
          playsInline
          muted
          className={`h-full w-full object-contain ${modo === 'user' ? '-scale-x-100' : ''}`}
        />
        {!listo && !errorVisible && <p className="absolute text-sm text-white/70">Abriendo cámara…</p>}
        {errorVisible && (
          <div className="absolute inset-x-6 flex flex-col items-center gap-4 text-center">
            <Camera className="h-10 w-10 text-white/50" />
            <p className="text-sm text-white/80">{errorVisible}</p>
            <button
              type="button"
              onClick={onUsarNativa}
              className="flex min-h-11 items-center gap-2 rounded-lg bg-white px-4 text-sm font-semibold text-navy-900"
            >
              <ImagePlus className="h-4 w-4" />
              Usar la cámara del teléfono
            </button>
          </div>
        )}
        <div className={`pointer-events-none absolute inset-0 bg-white transition-opacity duration-150 ${destello ? 'opacity-70' : 'opacity-0'}`} />
      </div>

      {capturas.length > 0 && (
        <div className="flex gap-2 overflow-x-auto px-3 py-2">
          {capturas.map((c, i) => (
            <div key={c.url} className="relative shrink-0">
              <img src={c.url} alt={`Foto ${i + 1}`} className="h-16 w-16 rounded-lg object-cover ring-2 ring-white/30" />
              <button
                type="button"
                onClick={() => quitar(i)}
                aria-label={`Descartar foto ${i + 1}`}
                className="absolute -top-1.5 -right-1.5 flex h-6 w-6 items-center justify-center rounded-full bg-rose-600"
              >
                <Trash2 className="h-3 w-3" />
              </button>
            </div>
          ))}
        </div>
      )}

      <footer className="grid grid-cols-3 items-center px-6 pt-3 pb-[max(1.5rem,env(safe-area-inset-bottom))]">
        <button
          type="button"
          onClick={onGaleria}
          aria-label="Elegir de la galería"
          className="flex h-12 w-12 items-center justify-center justify-self-start rounded-full bg-white/10 hover:bg-white/20"
        >
          <ImagePlus className="h-5 w-5" />
        </button>
        <button
          type="button"
          onClick={tomar}
          disabled={!listo}
          aria-label="Tomar foto"
          className="flex h-20 w-20 items-center justify-center justify-self-center rounded-full border-4 border-white transition-transform active:scale-90 disabled:opacity-40"
        >
          <span className="h-16 w-16 rounded-full bg-white" />
        </button>
        {hayVarias ? (
          <button
            type="button"
            onClick={cambiarCamara}
            aria-label="Cambiar de cámara"
            className="flex h-12 w-12 items-center justify-center justify-self-end rounded-full bg-white/10 hover:bg-white/20"
          >
            <RefreshCw className="h-5 w-5" />
          </button>
        ) : (
          <span />
        )}
      </footer>
    </div>
  )
}
