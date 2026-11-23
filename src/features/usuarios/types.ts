import type { Enums, Tables } from '../../types/database'

export type Usuario = Tables<'usuarios'>
export type RolUsuario = Enums<'rol_usuario'>

export interface NuevoUsuarioInput {
  nombre: string
  email: string
  password: string
  telefono: string | null
  rol: RolUsuario
}

export interface DatosUsuario {
  nombre: string
  telefono: string | null
}

export const ROLES: Record<RolUsuario, { label: string; descripcion: string }> = {
  administrador: {
    label: 'Administrador',
    descripcion: 'Crea usuarios, cambia roles y puede eliminar cualquier registro.',
  },
  colaborador: {
    label: 'Colaborador',
    descripcion: 'Registra contactos, hace llamadas y da seguimiento.',
  },
}

export const OPCIONES_ROL = (Object.keys(ROLES) as RolUsuario[]).map((value) => ({
  value,
  label: ROLES[value].label,
}))
