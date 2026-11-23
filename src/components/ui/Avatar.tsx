function iniciales(nombre: string) {
  return nombre
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0]?.toUpperCase())
    .join('')
}

const tamanos = {
  sm: 'h-8 w-8 text-xs',
  md: 'h-10 w-10 text-sm',
}

export function Avatar({ nombre, size = 'md' }: { nombre: string; size?: keyof typeof tamanos }) {
  return (
    <span
      aria-hidden
      className={`flex shrink-0 items-center justify-center rounded-full bg-primary-100 font-semibold text-primary-800 ${tamanos[size]}`}
    >
      {iniciales(nombre) || '?'}
    </span>
  )
}
