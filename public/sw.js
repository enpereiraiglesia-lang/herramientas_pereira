/* Service worker de Gestión Integral de Herramientas
 * - Páginas: red primero; sin conexión se muestra la app guardada.
 * - Archivos de la app (/assets, con hash): caché primero.
 * - Íconos, fuentes y demás: se muestran desde caché y se actualizan en segundo plano.
 * - Los datos (Supabase) nunca se guardan en caché: siempre van a la red.
 */
const VERSION = 'gih-v2'
const CACHE_APP = `${VERSION}-app`
const CACHE_RECURSOS = `${VERSION}-recursos`
const PRECARGA = ['/', '/manifest.webmanifest', '/favicon.svg', '/icons/icon-192.png', '/icons/icon-512.png']

self.addEventListener('install', (event) => {
  event.waitUntil(caches.open(CACHE_APP).then((c) => c.addAll(PRECARGA)))
})

self.addEventListener('activate', (event) => {
  event.waitUntil(
    (async () => {
      const claves = await caches.keys()
      await Promise.all(claves.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)))
      await self.clients.claim()
    })()
  )
})

// La app pide activar la nueva versión cuando el usuario toca "Actualizar"
self.addEventListener('message', (event) => {
  if (event.data === 'ACTIVAR') self.skipWaiting()
})

const FUENTES = ['https://fonts.googleapis.com', 'https://fonts.gstatic.com']

self.addEventListener('fetch', (event) => {
  const { request } = event
  if (request.method !== 'GET') return
  const url = new URL(request.url)
  const mismoOrigen = url.origin === self.location.origin

  // Navegación (abrir la app o cambiar de ruta): red primero, respaldo la app guardada
  if (request.mode === 'navigate') {
    event.respondWith(
      fetch(request)
        .then((resp) => {
          const copia = resp.clone()
          caches.open(CACHE_APP).then((c) => c.put('/', copia))
          return resp
        })
        .catch(async () => (await caches.match('/')) || Response.error())
    )
    return
  }

  // Archivos compilados con hash: no cambian nunca
  if (mismoOrigen && url.pathname.startsWith('/assets/')) {
    event.respondWith(
      caches.match(request).then(
        (enCache) =>
          enCache ||
          fetch(request).then((resp) => {
            if (resp.ok) {
              const copia = resp.clone()
              caches.open(CACHE_APP).then((c) => c.put(request, copia))
            }
            return resp
          })
      )
    )
    return
  }

  // Íconos, manifest y fuentes de Google: caché y actualización en segundo plano
  if (mismoOrigen || FUENTES.includes(url.origin)) {
    event.respondWith(
      caches.open(CACHE_RECURSOS).then(async (cache) => {
        const enCache = await cache.match(request)
        const red = fetch(request)
          .then((resp) => {
            if (resp.ok || resp.type === 'opaque') cache.put(request, resp.clone())
            return resp
          })
          .catch(() => enCache)
        return enCache || red
      })
    )
  }
  // Todo lo demás (Supabase, WhatsApp, etc.) va directo a la red
})
