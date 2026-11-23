import { useCallback } from 'react'
import { useAuth } from '../../auth/hooks/useAuth'
import type { Modulo } from '../modulos'

/** ¿El usuario actual puede ver/usar un módulo? El administrador siempre puede. */
export function usePermisos() {
  const { perfil, esAdmin, esLiderTci } = useAuth()
  const modulos = perfil?.modulos

  /** Módulo asignado explícitamente (o administrador) */
  const tieneModulo = useCallback(
    (modulo: Modulo) => esAdmin || (modulos?.includes(modulo) ?? false),
    [esAdmin, modulos]
  )

  /** Acceso al módulo: los líderes de grupos TCI también entran a "Salidas TCI" */
  const puede = useCallback(
    (modulo: Modulo) => tieneModulo(modulo) || (modulo === 'tci' && esLiderTci),
    [tieneModulo, esLiderTci]
  )

  return { puede, tieneModulo, esAdmin, esLiderTci }
}
