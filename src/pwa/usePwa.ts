import { useSyncExternalStore } from 'react'
import { pwaStore } from './pwa'

export function usePwa() {
  return useSyncExternalStore(pwaStore.suscribir, pwaStore.obtener, pwaStore.obtener)
}
