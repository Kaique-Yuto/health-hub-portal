export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      medicos: {
        Row: {
          id: string
          user_id: string
          nome: string
          crm: string
          email: string
          uf: string
          rqe: string | null
          endereco: string | null
          nome_clinica: string | null
          especialidade: string | null
          telefone: string | null
          created_at: string
          updated_at: string
        }
        Insert: {
          id?: string
          user_id: string
          nome: string
          crm: string
          uf: string
          rqe?: string | null
          created_at?: string
          updated_at?: string
        }
        Update: {
          id?: string
          user_id?: string
          nome?: string
          crm?: string
          uf?: string
          rqe?: string | null
          created_at?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "medicos_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      pacientes: {
        Row: {
          id: string
          medico_id: string
          nome: string
          cpf: string // PostgREST retorna bytea como string hexadecimal
          email: string | null
          created_at: string
        }
        Insert: {
          id?: string
          medico_id: string
          nome: string
          cpf: string // Deve ser enviado via RPC ou query com pgp_sym_encrypt
          email?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          medico_id?: string
          nome?: string
          cpf?: string
          email?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "pacientes_medico_id_fkey"
            columns: ["medico_id"]
            isOneToOne: false
            referencedRelation: "medicos"
            referencedColumns: ["id"]
          }
        ]
      }
      prescricoes: {
        Row: {
          id: string
          medico_id: string
          paciente_id: string
          conteudo_json: Json
          hash_assinatura: string | null
          status_dispensacao: string
          pdf_url: string | null
          created_at: string
        }
        Insert: {
          id?: string
          medico_id: string
          paciente_id: string
          conteudo_json?: Json
          hash_assinatura?: string | null
          status_dispensacao?: string
          pdf_url?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          medico_id?: string
          paciente_id?: string
          conteudo_json?: Json
          hash_assinatura?: string | null
          status_dispensacao?: string
          pdf_url?: string | null
          created_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "prescricoes_medico_id_fkey"
            columns: ["medico_id"]
            isOneToOne: false
            referencedRelation: "medicos"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "prescricoes_paciente_id_fkey"
            columns: ["paciente_id"]
            isOneToOne: false
            referencedRelation: "pacientes"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">
type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  T extends keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
> = (DefaultSchema["Tables"] & DefaultSchema["Views"])[T] extends { Row: infer R } ? R : never

export type TablesInsert<
  T extends keyof DefaultSchema["Tables"]
> = DefaultSchema["Tables"][T] extends { Insert: infer I } ? I : never

export type TablesUpdate<
  T extends keyof DefaultSchema["Tables"]
> = DefaultSchema["Tables"][T] extends { Update: infer U } ? U : never