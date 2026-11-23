/** Registro del service worker y estado de la PWA (instalación y actualizaciones) */

interface BeforeInstallPromptEvent extends Event {
  prompt: () => Promise<void>
  userChoice: Promise<{ outcome: 'accepted' | 'dismissed' }>
}

export interface EstadoPwa {
  /** Hay una versión nueva esperando para activarse */
  actualizacion: boolean
  /** El navegador ofrece instalar (Android / Chrome / Edge) */
  instalable: boolean
  /** Ya se abre como app (pantalla de inicio) */
  enModoApp: boolean
  /** iPhone / iPad en Safari: se instala desde "Compartir → Agregar a inicio" */
  esIOS: boolean
}

let swEsperando: ServiceWorker | null = null
let eventoInstalar: BeforeInstallPromptEvent | null = null

function detectarModoApp() {
  return (
    window.matchMedia('(display-mode: standalone)').matches ||
    (navigator as Navigator & { standalone?: boolean }).standalone === true
  )
}

function detectarIOS() {
  const ua = navigator.userAgent
  // iPadOS se presenta como Mac con pantalla táctil
  return /iPad|iPhone|iPod/.test(ua) || (ua.includes('Macintosh') && navigator.maxTouchPoints > 1)
}

let estado: EstadoPwa = {
  actualizacion: false,
  instalable: false,
  enModoApp: typeof window !== 'undefined' && detectarModoApp(),
  esIOS: typeof window !== 'undefined' && detectarIOS(),
}

const oyentes = new Set<() => void>()

function cambiar(parcial: Partial<EstadoPwa>) {
  estado = { ...estado, ...parcial }
  oyentes.forEach((o) => o())
}

export const pwaStore = {
  suscribir(oyente: () => void) {
    oyentes.add(oyente)
    return () => oyentes.delete(oyente)
  },
  obtener: () => estado,
}

/** Activa la versión nueva y recarga la app */
export function aplicarActualizacion() {
  if (!swEsperando) return window.location.reload()
  swEsperando.postMessage('ACTIVAR')
}

/** Muestra el diálogo de instalación del navegador (Android / escritorio) */
export async function instalarApp() {
  if (!eventoInstalar) return false
  await eventoInstalar.prompt()
  const { outcome } = await eventoInstalar.userChoice
  eventoInstalar = null
  cambiar({ instalable: false })
  return outcome === 'accepted'
}

export function registrarPwa() {
  window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault() // mostramos nuestro propio botón
    eventoInstalar = e as BeforeInstallPromptEvent
    cambiar({ instalable: true })
  })
  window.addEventListener('appinstalled', () => {
    eventoInstalar = null
    cambiar({ instalable: false, enModoApp: true })
  })
  window.matchMedia('(display-mode: standalone)').addEventListener('change', () => cambiar({ enModoApp: detectarModoApp() }))

  // En desarrollo no se registra para no guardar en caché los cambios en caliente
  if (!import.meta.env.PROD || !('serviceWorker' in navigator)) return

  window.addEventListener('load', async () => {
    try {
      const registro = await navigator.serviceWorker.register('/sw.js')

      const avisar = (sw: ServiceWorker | null) => {
        if (sw && navigator.serviceWorker.controller) {
          swEsperando = sw
          cambiar({ actualizacion: true })
        }
      }
      avisar(registro.waiting)
      registro.addEventListener('updatefound', () => {
        const nuevo = registro.installing
        nuevo?.addEventListener('statechange', () => {
          if (nuevo.state === 'installed') avisar(nuevo)
        })
      })

      // Busca versiones nuevas al volver a la app y cada hora
      document.addEventListener('visibilitychange', () => {
        if (document.visibilityState === 'visible') void registro.update()
      })
      setInterval(() => void registro.update(), 60 * 60 * 1000)

      // Cuando la versión nueva toma el control, se recarga una sola vez
      let recargando = false
      navigator.serviceWorker.addEventListener('controllerchange', () => {
        if (recargando) return
        recargando = true
        window.location.reload()
      })
    } catch {
      /* sin service worker la app sigue funcionando en línea */
    }
  })
}
