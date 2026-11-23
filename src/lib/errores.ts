/** Convierte errores de Supabase/PostgREST en un mensaje legible en español */
export function mensajeError(err: unknown, porDefecto = 'Ocurrió un error'): string {
  if (!err || typeof err !== 'object') return porDefecto
  const { code, message } = err as { code?: string; message?: string }

  if (code === '42501') {
    return message?.includes('row-level security')
      ? 'No tienes permiso para realizar esta acción (política de seguridad).'
      : 'La base de datos no tiene permisos configurados para esta tabla. Ejecuta la migración de permisos.'
  }
  if (code === '23503') return 'Tu usuario no está registrado en la tabla de usuarios. Contacta al administrador.'
  if (code === 'PGRST301' || code === '401') return 'Tu sesión expiró. Vuelve a iniciar sesión.'

  return message || porDefecto
}
