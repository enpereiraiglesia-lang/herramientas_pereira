import {
  Footprints,
  HandCoins,
  House,
  IdCard,
  LayoutDashboard,
  PhoneCall,
  SquareKanban,
  UserCheck,
  UserPlus,
  Users,
  Zap,
  type LucideIcon,
} from 'lucide-react'

interface DefinicionModulo {
  label: string
  descripcion: string
  ruta: string | null
  icono: LucideIcon
  /** Sección del menú lateral donde aparece (null = no aparece en el menú) */
  seccion: 'principal' | 'herramientas' | null
  /** Si el usuario también tiene este módulo, aparece como submenú dentro de él */
  padre?: string
  /** Nombre de la propia ruta cuando el módulo tiene submenú (ej. "Salidas") */
  etiquetaSubmenu?: string
}

/** Catálogo de módulos que el administrador puede habilitar a cada colaborador.
 *  Debe coincidir con la restricción "usuarios_modulos_validos" en Supabase. */
export const MODULOS = {
  inicio: {
    label: 'Inicio',
    descripcion: 'Panel con resumen y llamadas pendientes',
    ruta: '/',
    icono: LayoutDashboard,
    seccion: 'principal',
  },
  contactos: {
    label: 'Contactos',
    descripcion: 'Ver la lista y el detalle de contactos',
    ruta: '/contactos',
    icono: Users,
    seccion: 'principal',
    padre: 'tci',
  },
  seguimiento: {
    label: 'Seguimiento',
    descripcion: 'Tablero por fases y comentarios',
    ruta: '/seguimiento',
    icono: SquareKanban,
    seccion: 'principal',
  },
  registrar_contacto: {
    label: 'Registrar contactos',
    descripcion: 'Agregar personas nuevas',
    ruta: '/contactos/nuevo',
    icono: UserPlus,
    seccion: null, // se accede desde los botones "Nuevo contacto"
  },
  llamadas: {
    label: 'Llamadas',
    descripcion: 'Registrar llamadas y ver el historial',
    ruta: null,
    icono: PhoneCall,
    seccion: null,
  },
  asignar: {
    label: 'Asignar responsables',
    descripcion: 'Elegir quién llama a cada contacto',
    ruta: null,
    icono: UserCheck,
    seccion: null,
  },
  miembros: {
    label: 'Miembros',
    descripcion: 'Directorio de miembros de la iglesia',
    ruta: '/miembros',
    icono: IdCard,
    seccion: 'principal',
  },
  inversionistas: {
    label: 'Inversionistas del Reino',
    descripcion: 'Cuotas mensuales de los inversionistas',
    ruta: '/inversionistas',
    icono: HandCoins,
    seccion: 'principal',
  },
  tci: {
    label: 'Salidas TCI',
    descripcion: 'Grupos temporales, metas, fotos y reportes',
    ruta: '/tci',
    icono: Footprints,
    seccion: 'principal',
    etiquetaSubmenu: 'Salidas',
  },
  grupos_familiares: {
    label: 'Grupos familiares',
    descripcion: 'Crear y administrar grupos familiares',
    ruta: '/grupos-familiares',
    icono: House,
    seccion: 'herramientas',
  },
  camaras: {
    label: 'Cámaras de energización',
    descripcion: 'Crear y administrar cámaras de oración',
    ruta: '/camaras',
    icono: Zap,
    seccion: 'herramientas',
  },
} satisfies Record<string, DefinicionModulo>

export type Modulo = keyof typeof MODULOS

export const LISTA_MODULOS = Object.keys(MODULOS) as Modulo[]

/** Módulo padre en el menú (si lo tiene) */
export function padreDe(modulo: Modulo): Modulo | null {
  const def: DefinicionModulo = MODULOS[modulo]
  return (def.padre as Modulo | undefined) ?? null
}

/** Primera ruta a la que el usuario tiene acceso (para redirigir tras el login) */
export function primeraRutaPermitida(puede: (m: Modulo) => boolean): string | null {
  const modulo = LISTA_MODULOS.find((m) => MODULOS[m].ruta && puede(m))
  return modulo ? MODULOS[modulo].ruta : null
}
