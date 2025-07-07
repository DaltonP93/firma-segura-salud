export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      app_customization: {
        Row: {
          accent_color: string | null
          app_subtitle: string | null
          app_title: string | null
          background_image_url: string | null
          button_style: string | null
          card_shadow_style: string | null
          company_type_id: string | null
          created_at: string | null
          created_by: string | null
          custom_css: string | null
          font_family: string | null
          footer_text: string | null
          header_background_color: string | null
          id: string
          is_active: boolean | null
          logo_url: string | null
          primary_color: string | null
          secondary_color: string | null
          sidebar_background_color: string | null
          theme_name: string
          updated_at: string | null
          welcome_message: string | null
        }
        Insert: {
          accent_color?: string | null
          app_subtitle?: string | null
          app_title?: string | null
          background_image_url?: string | null
          button_style?: string | null
          card_shadow_style?: string | null
          company_type_id?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_css?: string | null
          font_family?: string | null
          footer_text?: string | null
          header_background_color?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          sidebar_background_color?: string | null
          theme_name?: string
          updated_at?: string | null
          welcome_message?: string | null
        }
        Update: {
          accent_color?: string | null
          app_subtitle?: string | null
          app_title?: string | null
          background_image_url?: string | null
          button_style?: string | null
          card_shadow_style?: string | null
          company_type_id?: string | null
          created_at?: string | null
          created_by?: string | null
          custom_css?: string | null
          font_family?: string | null
          footer_text?: string | null
          header_background_color?: string | null
          id?: string
          is_active?: boolean | null
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          sidebar_background_color?: string | null
          theme_name?: string
          updated_at?: string | null
          welcome_message?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "app_customization_company_type_id_fkey"
            columns: ["company_type_id"]
            isOneToOne: false
            referencedRelation: "company_types"
            referencedColumns: ["id"]
          },
        ]
      }
      company_types: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      digital_signatures: {
        Row: {
          document_id: string | null
          id: string
          ip_address: string | null
          signature_data: string | null
          signature_type: string | null
          signed_at: string | null
          signer_email: string
          signer_name: string
          user_agent: string | null
        }
        Insert: {
          document_id?: string | null
          id?: string
          ip_address?: string | null
          signature_data?: string | null
          signature_type?: string | null
          signed_at?: string | null
          signer_email: string
          signer_name: string
          user_agent?: string | null
        }
        Update: {
          document_id?: string | null
          id?: string
          ip_address?: string | null
          signature_data?: string | null
          signature_type?: string | null
          signed_at?: string | null
          signer_email?: string
          signer_name?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "digital_signatures_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_activity: {
        Row: {
          activity_type: string
          created_at: string | null
          created_by: string | null
          description: string | null
          document_id: string | null
          id: string
          metadata: Json | null
        }
        Insert: {
          activity_type: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          document_id?: string | null
          id?: string
          metadata?: Json | null
        }
        Update: {
          activity_type?: string
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          document_id?: string | null
          id?: string
          metadata?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "document_activity_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      document_templates: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          fields: Json | null
          id: string
          is_active: boolean | null
          name: string
          type: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          fields?: Json | null
          id?: string
          is_active?: boolean | null
          name: string
          type: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          fields?: Json | null
          id?: string
          is_active?: boolean | null
          name?: string
          type?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          client_email: string
          client_name: string
          client_phone: string | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          document_number: string
          document_url: string | null
          field_values: Json | null
          id: string
          opened_at: string | null
          policy_type: string | null
          sent_at: string | null
          shareable_link: string | null
          signature_url: string | null
          signed_at: string | null
          status: string | null
          template_id: string | null
          template_type: string | null
        }
        Insert: {
          client_email: string
          client_name: string
          client_phone?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          document_number: string
          document_url?: string | null
          field_values?: Json | null
          id?: string
          opened_at?: string | null
          policy_type?: string | null
          sent_at?: string | null
          shareable_link?: string | null
          signature_url?: string | null
          signed_at?: string | null
          status?: string | null
          template_id?: string | null
          template_type?: string | null
        }
        Update: {
          client_email?: string
          client_name?: string
          client_phone?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          document_number?: string
          document_url?: string | null
          field_values?: Json | null
          id?: string
          opened_at?: string | null
          policy_type?: string | null
          sent_at?: string | null
          shareable_link?: string | null
          signature_url?: string | null
          signed_at?: string | null
          status?: string | null
          template_id?: string | null
          template_type?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "documents_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "document_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      pdf_templates: {
        Row: {
          created_at: string | null
          created_by: string | null
          fields: Json | null
          file_name: string
          file_size: number | null
          file_url: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          fields?: Json | null
          file_name: string
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          fields?: Json | null
          file_name?: string
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          company: string | null
          created_at: string | null
          email: string | null
          full_name: string | null
          id: string
          phone: string | null
          profile_image_url: string | null
          role: string | null
          updated_at: string | null
          username: string | null
        }
        Insert: {
          company?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id: string
          phone?: string | null
          profile_image_url?: string | null
          role?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Update: {
          company?: string | null
          created_at?: string | null
          email?: string | null
          full_name?: string | null
          id?: string
          phone?: string | null
          profile_image_url?: string | null
          role?: string | null
          updated_at?: string | null
          username?: string | null
        }
        Relationships: []
      }
      section_customization: {
        Row: {
          app_customization_id: string | null
          background_color: string | null
          created_at: string | null
          custom_properties: Json | null
          icon_name: string | null
          id: string
          is_visible: boolean | null
          section_description: string | null
          section_key: string
          section_title: string | null
          sort_order: number | null
          text_color: string | null
          updated_at: string | null
        }
        Insert: {
          app_customization_id?: string | null
          background_color?: string | null
          created_at?: string | null
          custom_properties?: Json | null
          icon_name?: string | null
          id?: string
          is_visible?: boolean | null
          section_description?: string | null
          section_key: string
          section_title?: string | null
          sort_order?: number | null
          text_color?: string | null
          updated_at?: string | null
        }
        Update: {
          app_customization_id?: string | null
          background_color?: string | null
          created_at?: string | null
          custom_properties?: Json | null
          icon_name?: string | null
          id?: string
          is_visible?: boolean | null
          section_description?: string | null
          section_key?: string
          section_title?: string | null
          sort_order?: number | null
          text_color?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "section_customization_app_customization_id_fkey"
            columns: ["app_customization_id"]
            isOneToOne: false
            referencedRelation: "app_customization"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_document_number: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_current_user_role: {
        Args: Record<PropertyKey, never>
        Returns: string
      }
      get_user_by_username_or_email: {
        Args: { identifier: string }
        Returns: {
          user_id: string
          email: string
          username: string
          full_name: string
          role: string
        }[]
      }
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
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
