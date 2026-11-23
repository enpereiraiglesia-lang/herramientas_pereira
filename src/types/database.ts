// Tipos de la base de datos.
// Regenerar con: npx supabase gen types typescript --project-id <id> > src/types/database.ts

export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export type Database = {
  public: {
    Tables: {
      usuarios: {
        Row: {
          id: string
          nombre: string
          telefono: string | null
          email: string | null
          modulos: string[]
          rol: Database['public']['Enums']['rol_usuario']
          created_at: string
        }
        Insert: {
          id: string
          nombre: string
          telefono?: string | null
          email?: string | null
          modulos?: string[]
          rol?: Database['public']['Enums']['rol_usuario']
          created_at?: string
        }
        Update: {
          id?: string
          nombre?: string
          telefono?: string | null
          email?: string | null
          modulos?: string[]
          rol?: Database['public']['Enums']['rol_usuario']
          created_at?: string
        }
        Relationships: []
      }
      contactos: {
        Row: {
          id: string
          created_at: string
          nombre: string
          telefono: string | null
          direccion: string | null
          observaciones: string | null
          lugar_contacto: string | null
          fecha_contacto: string
          estado: Database['public']['Enums']['estado_contacto']
          asignado_a: string | null
          registrado_por: string | null
          ultima_llamada_at: string | null
          proxima_llamada: string | null
          fase: string
          fase_actualizada_at: string
          grupo_familiar_id: string | null
          camara_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          nombre: string
          fase?: string
          fase_actualizada_at?: string
          grupo_familiar_id?: string | null
          camara_id?: string | null
          telefono?: string | null
          direccion?: string | null
          observaciones?: string | null
          lugar_contacto?: string | null
          fecha_contacto?: string
          estado?: Database['public']['Enums']['estado_contacto']
          asignado_a?: string | null
          registrado_por?: string | null
          ultima_llamada_at?: string | null
          proxima_llamada?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          nombre?: string
          fase?: string
          fase_actualizada_at?: string
          grupo_familiar_id?: string | null
          camara_id?: string | null
          telefono?: string | null
          direccion?: string | null
          observaciones?: string | null
          lugar_contacto?: string | null
          fecha_contacto?: string
          estado?: Database['public']['Enums']['estado_contacto']
          asignado_a?: string | null
          registrado_por?: string | null
          ultima_llamada_at?: string | null
          proxima_llamada?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'contactos_asignado_a_fkey'
            columns: ['asignado_a']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'contactos_registrado_por_fkey'
            columns: ['registrado_por']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'contactos_grupo_familiar_id_fkey'
            columns: ['grupo_familiar_id']
            isOneToOne: false
            referencedRelation: 'grupos'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'contactos_camara_id_fkey'
            columns: ['camara_id']
            isOneToOne: false
            referencedRelation: 'grupos'
            referencedColumns: ['id']
          },
        ]
      }
      fases_seguimiento: {
        Row: {
          clave: string
          nombre: string
          descripcion: string | null
          orden: number
          color: string
          created_at: string
        }
        Insert: {
          clave: string
          nombre: string
          descripcion?: string | null
          orden: number
          color?: string
          created_at?: string
        }
        Update: {
          clave?: string
          nombre?: string
          descripcion?: string | null
          orden?: number
          color?: string
          created_at?: string
        }
        Relationships: []
      }
      grupos: {
        Row: {
          id: string
          created_at: string
          tipo: 'grupo_familiar' | 'camara'
          nombre: string
          descripcion: string | null
          direccion: string | null
          dia_reunion: string | null
          hora_reunion: string | null
          lider_id: string | null
          responsable_id: string | null
          activo: boolean
          creado_por: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          tipo: 'grupo_familiar' | 'camara'
          nombre: string
          descripcion?: string | null
          direccion?: string | null
          dia_reunion?: string | null
          hora_reunion?: string | null
          lider_id?: string | null
          responsable_id?: string | null
          activo?: boolean
          creado_por?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          tipo?: 'grupo_familiar' | 'camara'
          nombre?: string
          descripcion?: string | null
          direccion?: string | null
          dia_reunion?: string | null
          hora_reunion?: string | null
          lider_id?: string | null
          responsable_id?: string | null
          activo?: boolean
          creado_por?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'grupos_lider_id_fkey'
            columns: ['lider_id']
            isOneToOne: false
            referencedRelation: 'miembros'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'grupos_responsable_id_fkey'
            columns: ['responsable_id']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
          },
        ]
      }
      seguimiento_comentarios: {
        Row: {
          id: string
          created_at: string
          contacto_id: string
          fase: string
          tipo: 'comentario' | 'cambio_fase'
          texto: string
          autor_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          contacto_id: string
          fase: string
          tipo?: 'comentario' | 'cambio_fase'
          texto: string
          autor_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          contacto_id?: string
          fase?: string
          tipo?: 'comentario' | 'cambio_fase'
          texto?: string
          autor_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'seguimiento_comentarios_contacto_id_fkey'
            columns: ['contacto_id']
            isOneToOne: false
            referencedRelation: 'contactos'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'seguimiento_comentarios_autor_id_fkey'
            columns: ['autor_id']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
          },
        ]
      }
      llamadas: {
        Row: {
          id: string
          created_at: string
          contacto_id: string
          llamado_por: string | null
          fecha_llamada: string
          resultado: Database['public']['Enums']['resultado_llamada']
          notas: string | null
          proxima_llamada: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          contacto_id: string
          llamado_por?: string | null
          fecha_llamada?: string
          resultado: Database['public']['Enums']['resultado_llamada']
          notas?: string | null
          proxima_llamada?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          contacto_id?: string
          llamado_por?: string | null
          fecha_llamada?: string
          resultado?: Database['public']['Enums']['resultado_llamada']
          notas?: string | null
          proxima_llamada?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'llamadas_contacto_id_fkey'
            columns: ['contacto_id']
            isOneToOne: false
            referencedRelation: 'contactos'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'llamadas_llamado_por_fkey'
            columns: ['llamado_por']
            isOneToOne: false
            referencedRelation: 'usuarios'
            referencedColumns: ['id']
          },
        ]
      }
      miembros: {
        Row: {
          id: string
          created_at: string
          nombre: string
          celular: string | null
          correo: string | null
          direccion: string | null
          inversionista_reino: boolean
          fue_ceppev: boolean
          fecha_ceppev: string | null
          creado_por: string | null
          grupo_familiar_id: string | null
          camara_id: string | null
          cuota_mensual: number | null
        }
        Insert: {
          id?: string
          created_at?: string
          nombre: string
          celular?: string | null
          correo?: string | null
          direccion?: string | null
          inversionista_reino?: boolean
          fue_ceppev?: boolean
          fecha_ceppev?: string | null
          creado_por?: string | null
          grupo_familiar_id?: string | null
          camara_id?: string | null
          cuota_mensual?: number | null
        }
        Update: {
          id?: string
          created_at?: string
          nombre?: string
          celular?: string | null
          correo?: string | null
          direccion?: string | null
          inversionista_reino?: boolean
          fue_ceppev?: boolean
          fecha_ceppev?: string | null
          creado_por?: string | null
          grupo_familiar_id?: string | null
          camara_id?: string | null
          cuota_mensual?: number | null
        }
        Relationships: [
          {
            foreignKeyName: 'miembros_grupo_familiar_id_fkey'
            columns: ['grupo_familiar_id']
            isOneToOne: false
            referencedRelation: 'grupos'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'miembros_camara_id_fkey'
            columns: ['camara_id']
            isOneToOne: false
            referencedRelation: 'grupos'
            referencedColumns: ['id']
          },
        ]
      }
      cuotas_inversionistas: {
        Row: {
          id: string
          created_at: string
          miembro_id: string
          periodo: string
          monto: number | null
          fecha_pago: string
          notas: string | null
          registrado_por: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          miembro_id: string
          periodo: string
          monto?: number | null
          fecha_pago?: string
          notas?: string | null
          registrado_por?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          miembro_id?: string
          periodo?: string
          monto?: number | null
          fecha_pago?: string
          notas?: string | null
          registrado_por?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'cuotas_inversionistas_miembro_id_fkey'
            columns: ['miembro_id']
            isOneToOne: false
            referencedRelation: 'miembros'
            referencedColumns: ['id']
          },
        ]
      }
      salidas_tci: {
        Row: {
          id: string
          created_at: string
          nombre: string
          fecha: string
          lugar: string | null
          notas: string | null
          creado_por: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          nombre: string
          fecha?: string
          lugar?: string | null
          notas?: string | null
          creado_por?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          nombre?: string
          fecha?: string
          lugar?: string | null
          notas?: string | null
          creado_por?: string | null
        }
        Relationships: []
      }
      tci_grupos: {
        Row: {
          id: string
          created_at: string
          salida_id: string
          nombre: string
          zona: string | null
          lider_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          salida_id: string
          nombre: string
          zona?: string | null
          lider_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          salida_id?: string
          nombre?: string
          zona?: string | null
          lider_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'tci_grupos_salida_id_fkey'
            columns: ['salida_id']
            isOneToOne: false
            referencedRelation: 'salidas_tci'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'tci_grupos_lider_id_fkey'
            columns: ['lider_id']
            isOneToOne: false
            referencedRelation: 'miembros'
            referencedColumns: ['id']
          },
        ]
      }
      tci_integrantes: {
        Row: {
          id: string
          created_at: string
          grupo_id: string
          miembro_id: string
          meta_kits: number
          meta_casas: number
          meta_referidos: number
          meta_contactos: number
          logro_kits: number
          logro_casas: number
          logro_referidos: number
          logro_contactos: number
        }
        Insert: {
          id?: string
          created_at?: string
          grupo_id: string
          miembro_id: string
          meta_kits?: number
          meta_casas?: number
          meta_referidos?: number
          meta_contactos?: number
          logro_kits?: number
          logro_casas?: number
          logro_referidos?: number
          logro_contactos?: number
        }
        Update: {
          id?: string
          created_at?: string
          grupo_id?: string
          miembro_id?: string
          meta_kits?: number
          meta_casas?: number
          meta_referidos?: number
          meta_contactos?: number
          logro_kits?: number
          logro_casas?: number
          logro_referidos?: number
          logro_contactos?: number
        }
        Relationships: [
          {
            foreignKeyName: 'tci_integrantes_grupo_id_fkey'
            columns: ['grupo_id']
            isOneToOne: false
            referencedRelation: 'tci_grupos'
            referencedColumns: ['id']
          },
          {
            foreignKeyName: 'tci_integrantes_miembro_id_fkey'
            columns: ['miembro_id']
            isOneToOne: false
            referencedRelation: 'miembros'
            referencedColumns: ['id']
          },
        ]
      }
      tci_fotos: {
        Row: {
          id: string
          created_at: string
          grupo_id: string
          ruta: string
          descripcion: string | null
          subido_por: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          grupo_id: string
          ruta: string
          descripcion?: string | null
          subido_por?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          grupo_id?: string
          ruta?: string
          descripcion?: string | null
          subido_por?: string | null
        }
        Relationships: [
          {
            foreignKeyName: 'tci_fotos_grupo_id_fkey'
            columns: ['grupo_id']
            isOneToOne: false
            referencedRelation: 'tci_grupos'
            referencedColumns: ['id']
          },
        ]
      }
    }
    Views: { [_ in never]: never }
    Functions: {
      es_admin: { Args: Record<PropertyKey, never>; Returns: boolean }
      miembros_para_lider: { Args: Record<PropertyKey, never>; Returns: { id: string; nombre: string }[] }
      miembros_para_tci: {
        Args: Record<PropertyKey, never>
        Returns: { id: string; nombre: string; tiene_usuario: boolean }[]
      }
      es_lider_tci: { Args: Record<PropertyKey, never>; Returns: boolean }
      miembros_para_grupo_familiar: {
        Args: Record<PropertyKey, never>
        Returns: { id: string; nombre: string; grupo_familiar_id: string | null; grupo_nombre: string | null }[]
      }
      asignar_miembros_grupo_familiar: { Args: { p_grupo: string; p_miembros: string[] }; Returns: undefined }
      quitar_miembro_grupo_familiar: { Args: { p_miembro: string }; Returns: undefined }
      vincular_contacto_grupo_familiar: { Args: { p_contacto: string; p_grupo: string | null }; Returns: undefined }
      miembros_para_grupo: {
        Args: { p_tipo: string }
        Returns: { id: string; nombre: string; grupo_id: string | null; grupo_nombre: string | null }[]
      }
      asignar_miembros_grupo: { Args: { p_grupo: string; p_miembros: string[] }; Returns: undefined }
      quitar_miembro_grupo: { Args: { p_grupo: string; p_miembro: string }; Returns: undefined }
      vincular_contacto_grupo: { Args: { p_contacto: string; p_grupo: string }; Returns: undefined }
      desvincular_contacto_grupo: { Args: { p_contacto: string; p_grupo: string }; Returns: undefined }
      definir_cuota_inversionista: { Args: { p_miembro: string; p_monto: number | null }; Returns: undefined }
    }
    Enums: {
      rol_usuario: 'administrador' | 'colaborador'
      estado_contacto: 'nuevo' | 'en_seguimiento' | 'sin_respuesta' | 'integrado' | 'no_interesado'
      resultado_llamada: 'contesto' | 'no_contesto' | 'volver_a_llamar' | 'numero_equivocado' | 'no_interesado'
    }
    CompositeTypes: { [_ in never]: never }
  }
}

type PublicSchema = Database['public']
export type Tables<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Row']
export type TablesInsert<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Insert']
export type TablesUpdate<T extends keyof PublicSchema['Tables']> = PublicSchema['Tables'][T]['Update']
export type Enums<T extends keyof PublicSchema['Enums']> = PublicSchema['Enums'][T]
