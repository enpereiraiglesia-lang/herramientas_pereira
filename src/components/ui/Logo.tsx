import { Church } from 'lucide-react'
import { NOMBRE_APP } from '../../lib/marca'

interface Props {
  tono?: 'claro' | 'oscuro'
  subtitulo?: boolean
}

/** Marca de la aplicación. "oscuro" = sobre fondo azul marino */
export function Logo({ tono = 'claro', subtitulo = true }: Props) {
  const oscuro = tono === 'oscuro'
  return (
    <span className="flex items-center gap-3">
      <span
        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl ${
          oscuro ? 'bg-primary-500 text-white' : 'bg-primary-600 text-white'
        }`}
      >
        <Church className="h-5 w-5" strokeWidth={2} />
      </span>
      {/* El nombre va en dos líneas para que quepa en el menú y en el celular */}
      <span className="flex flex-col leading-tight" aria-label={NOMBRE_APP}>
        <span className={`text-[15px] font-semibold ${oscuro ? 'text-white' : 'text-navy-900'}`}>Gestión Integral</span>
        <span className={`text-[13px] font-medium ${oscuro ? 'text-primary-200' : 'text-primary-700'}`}>de Herramientas</span>
        {subtitulo && (
          <span className={`mt-0.5 text-[11px] ${oscuro ? 'text-navy-300' : 'text-slate-500'}`}>Seguimiento evangelístico</span>
        )}
      </span>
    </span>
  )
}
