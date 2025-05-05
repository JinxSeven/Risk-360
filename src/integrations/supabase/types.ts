export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      audit_trail: {
        Row: {
          action: string
          created_at: string | null
          entity_id: string
          entity_type: string
          id: number
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string | null
          entity_id: string
          entity_type: string
          id?: number
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string | null
          entity_id?: string
          entity_type?: string
          id?: number
          user_id?: string | null
        }
        Relationships: []
      }
      company: {
        Row: {
          created_at: string | null
          id: number
          industry: string | null
          location: string | null
          name: string
          size: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          industry?: string | null
          location?: string | null
          name: string
          size?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          industry?: string | null
          location?: string | null
          name?: string
          size?: string | null
        }
        Relationships: []
      }
      compliance_assignments: {
        Row: {
          assigned_to: string
          created_at: string | null
          id: number
          requirement_id: number
        }
        Insert: {
          assigned_to: string
          created_at?: string | null
          id?: number
          requirement_id: number
        }
        Update: {
          assigned_to?: string
          created_at?: string | null
          id?: number
          requirement_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "compliance_assignments_requirement_id_fkey"
            columns: ["requirement_id"]
            isOneToOne: false
            referencedRelation: "compliance_requirements"
            referencedColumns: ["id"]
          },
        ]
      }
      compliance_requirements: {
        Row: {
          category: string | null
          created_at: string | null
          created_by: string | null
          deadline: string | null
          description: string | null
          id: number
          priority: string | null
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          deadline?: string | null
          description?: string | null
          id?: number
          priority?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          created_at?: string | null
          created_by?: string | null
          deadline?: string | null
          description?: string | null
          id?: number
          priority?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string | null
          id: number
          message: string
          read: boolean | null
          title: string
          type: string
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: number
          message: string
          read?: boolean | null
          title: string
          type: string
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: number
          message?: string
          read?: boolean | null
          title?: string
          type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      policies: {
        Row: {
          category: string | null
          content: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          id: number
          status: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category?: string | null
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: number
          status?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string | null
          content?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          id?: number
          status?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      policy_assignments: {
        Row: {
          assigned_to: string
          created_at: string | null
          id: number
          policy_id: number
        }
        Insert: {
          assigned_to: string
          created_at?: string | null
          id?: number
          policy_id: number
        }
        Update: {
          assigned_to?: string
          created_at?: string | null
          id?: number
          policy_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "policy_assignments_policy_id_fkey"
            columns: ["policy_id"]
            isOneToOne: false
            referencedRelation: "policies"
            referencedColumns: ["id"]
          },
        ]
      }
      user_profiles: {
        Row: {
          created_at: string | null
          department: string | null
          id: number
          last_login: string | null
          name: string | null
          role: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          department?: string | null
          id?: number
          last_login?: string | null
          name?: string | null
          role?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          department?: string | null
          id?: number
          last_login?: string | null
          name?: string | null
          role?: string | null
          user_id?: string
        }
        Relationships: []
      }
      whistleblowing_notes: {
        Row: {
          created_at: string | null
          created_by: string | null
          id: number
          note: string
          report_id: number
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          id?: number
          note: string
          report_id: number
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          id?: number
          note?: string
          report_id?: number
        }
        Relationships: [
          {
            foreignKeyName: "whistleblowing_notes_report_id_fkey"
            columns: ["report_id"]
            isOneToOne: false
            referencedRelation: "whistleblowing_reports"
            referencedColumns: ["id"]
          },
        ]
      }
      whistleblowing_reports: {
        Row: {
          category: string | null
          created_at: string | null
          description: string | null
          id: number
          is_anonymous: boolean | null
          priority: string | null
          status: string | null
          submitted_by: string | null
          title: string
        }
        Insert: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
          is_anonymous?: boolean | null
          priority?: string | null
          status?: string | null
          submitted_by?: string | null
          title: string
        }
        Update: {
          category?: string | null
          created_at?: string | null
          description?: string | null
          id?: number
          is_anonymous?: boolean | null
          priority?: string | null
          status?: string | null
          submitted_by?: string | null
          title?: string
        }
        Relationships: []
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

type PublicSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  PublicTableNameOrOptions extends
    | keyof (PublicSchema["Tables"] & PublicSchema["Views"])
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
        Database[PublicTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? (Database[PublicTableNameOrOptions["schema"]]["Tables"] &
      Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] &
        PublicSchema["Views"])
    ? (PublicSchema["Tables"] &
        PublicSchema["Views"])[PublicTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  PublicTableNameOrOptions extends
    | keyof PublicSchema["Tables"]
    | { schema: keyof Database },
  TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
  ? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
    ? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  PublicEnumNameOrOptions extends
    | keyof PublicSchema["Enums"]
    | { schema: keyof Database },
  EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
    ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
  ? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
    ? PublicSchema["Enums"][PublicEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof PublicSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
    ? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never
