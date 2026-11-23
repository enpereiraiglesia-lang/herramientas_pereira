import { House, Zap, type LucideIcon } from 'lucide-react'
import type { Enums, Tables, TablesInsert } from '../../types/database'
import type { Modulo } from '../permisos/modulos'

export type Grupo = Tables<'grupos'>
export type TipoGrupo = Grupo['tipo']
export type GrupoInput = Omit<TablesInsert<'grupos'>, 'id' | 'created_at' | 'creado_por' | 'tipo'>

export interface PersonaMini {
  id: string
  nombre: string
}

export interface GrupoConRelaciones extends Grupo {
  lider: PersonaMini | null
  responsable: PersonaMini | null
  /** Contactos vinculados */
  contactos: { count: number }[]
  /** Miembros de la iglesia que pertenecen al grupo */
  integrantes?: { count: number }[]
}

export interface MiembroDeGrupo {
  id: string
  nombre: string
  celular: string | null
  correo: string | null
}

export interface ContactoDeGrupo {
  id: string
  nombre: string
  telefono: string | null
  estado: Enums<'estado_contacto'>
  fase: string
}

/** Opción para agregar: indica en qué grupo está hoy (si está en alguno) */
export interface OpcionMembresia {
  id: string
  nombre: string
  detalle: string | null
  grupoId: string | null
  grupoNombre: string | null
}

interface ConfigTipo {
  titulo: string
  singular: string
  descripcion: string
  modulo: Modulo
  icono: LucideIcon
  /** FK de contactos que apunta a este tipo de grupo */
  fkContactos: string
}

export const TIPOS_GRUPO: Record<TipoGrupo, ConfigTipo> = {
  grupo_familiar: {
    titulo: 'Grupos familiares',
    singular: 'Grupo familiar',
    descripcion: 'Grupos que se reúnen en casas para crecer en comunidad',
    modulo: 'grupos_familiares',
    icono: House,
    fkContactos: 'contactos_grupo_familiar_id_fkey',
  },
  camara: {
    titulo: 'Cámaras de energización',
    singular: 'Cámara de energización',
    descripcion: 'Espacios de oración e intercesión',
    modulo: 'camaras',
    icono: Zap,
    fkContactos: 'contactos_camara_id_fkey',
  },
}

export const DIAS_SEMANA = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'].map((d) => ({
  value: d,
  label: d,
}))
