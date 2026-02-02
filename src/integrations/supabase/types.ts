export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      audit_logs: {
        Row: {
          action: string
          created_at: string
          entity_id: string | null
          entity_type: string | null
          id: string
          ip_address: string | null
          new_data: Json | null
          old_data: Json | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          action: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          action?: string
          created_at?: string
          entity_id?: string | null
          entity_type?: string | null
          id?: string
          ip_address?: string | null
          new_data?: Json | null
          old_data?: Json | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      beneficiaries: {
        Row: {
          address: string | null
          birth_date: string | null
          created_at: string
          description: string | null
          dni: string | null
          email: string | null
          height: number | null
          id: string
          is_primary: boolean | null
          percentage: number | null
          phone: string | null
          price: number | null
          relationship: string | null
          sales_request_id: string | null
          updated_at: string
          weight: number | null
        }
        Insert: {
          address?: string | null
          birth_date?: string | null
          created_at?: string
          description?: string | null
          dni?: string | null
          email?: string | null
          height?: number | null
          id?: string
          is_primary?: boolean | null
          percentage?: number | null
          phone?: string | null
          price?: number | null
          relationship?: string | null
          sales_request_id?: string | null
          updated_at?: string
          weight?: number | null
        }
        Update: {
          address?: string | null
          birth_date?: string | null
          created_at?: string
          description?: string | null
          dni?: string | null
          email?: string | null
          height?: number | null
          id?: string
          is_primary?: boolean | null
          percentage?: number | null
          phone?: string | null
          price?: number | null
          relationship?: string | null
          sales_request_id?: string | null
          updated_at?: string
          weight?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "beneficiaries_sales_request_id_fkey"
            columns: ["sales_request_id"]
            isOneToOne: false
            referencedRelation: "sales_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      company_types: {
        Row: {
          code: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          name: string
        }
        Insert: {
          code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name: string
        }
        Update: {
          code?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
        }
        Relationships: []
      }
      document_events: {
        Row: {
          document_id: string | null
          event_data: Json | null
          event_type: Database["public"]["Enums"]["document_event_type"]
          id: string
          ip_address: string | null
          signature_request_id: string | null
          signer_id: string | null
          timestamp: string
          user_agent: string | null
        }
        Insert: {
          document_id?: string | null
          event_data?: Json | null
          event_type: Database["public"]["Enums"]["document_event_type"]
          id?: string
          ip_address?: string | null
          signature_request_id?: string | null
          signer_id?: string | null
          timestamp?: string
          user_agent?: string | null
        }
        Update: {
          document_id?: string | null
          event_data?: Json | null
          event_type?: Database["public"]["Enums"]["document_event_type"]
          id?: string
          ip_address?: string | null
          signature_request_id?: string | null
          signer_id?: string | null
          timestamp?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "document_events_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_events_signature_request_id_fkey"
            columns: ["signature_request_id"]
            isOneToOne: false
            referencedRelation: "signature_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "document_events_signer_id_fkey"
            columns: ["signer_id"]
            isOneToOne: false
            referencedRelation: "signers"
            referencedColumns: ["id"]
          },
        ]
      }
      document_templates: {
        Row: {
          content: string | null
          created_at: string
          created_by: string | null
          description: string | null
          fields: Json | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          name: string
          type: Database["public"]["Enums"]["template_type"] | null
          updated_at: string
          version: number | null
        }
        Insert: {
          content?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          fields?: Json | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name: string
          type?: Database["public"]["Enums"]["template_type"] | null
          updated_at?: string
          version?: number | null
        }
        Update: {
          content?: string | null
          created_at?: string
          created_by?: string | null
          description?: string | null
          fields?: Json | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name?: string
          type?: Database["public"]["Enums"]["template_type"] | null
          updated_at?: string
          version?: number | null
        }
        Relationships: []
      }
      documents: {
        Row: {
          client_email: string | null
          client_name: string
          client_phone: string | null
          completed_at: string | null
          content: string | null
          created_at: string
          created_by: string | null
          document_number: string | null
          document_url: string | null
          expires_at: string | null
          id: string
          metadata: Json | null
          opened_at: string | null
          pdf_template_id: string | null
          policy_type: string | null
          sales_request_id: string | null
          sent_at: string | null
          shareable_link: string | null
          signature_url: string | null
          signed_at: string | null
          signed_pdf_url: string | null
          status: Database["public"]["Enums"]["document_status"] | null
          template_id: string | null
          template_type: Database["public"]["Enums"]["template_type"] | null
          updated_at: string
        }
        Insert: {
          client_email?: string | null
          client_name: string
          client_phone?: string | null
          completed_at?: string | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          document_number?: string | null
          document_url?: string | null
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          opened_at?: string | null
          pdf_template_id?: string | null
          policy_type?: string | null
          sales_request_id?: string | null
          sent_at?: string | null
          shareable_link?: string | null
          signature_url?: string | null
          signed_at?: string | null
          signed_pdf_url?: string | null
          status?: Database["public"]["Enums"]["document_status"] | null
          template_id?: string | null
          template_type?: Database["public"]["Enums"]["template_type"] | null
          updated_at?: string
        }
        Update: {
          client_email?: string | null
          client_name?: string
          client_phone?: string | null
          completed_at?: string | null
          content?: string | null
          created_at?: string
          created_by?: string | null
          document_number?: string | null
          document_url?: string | null
          expires_at?: string | null
          id?: string
          metadata?: Json | null
          opened_at?: string | null
          pdf_template_id?: string | null
          policy_type?: string | null
          sales_request_id?: string | null
          sent_at?: string | null
          shareable_link?: string | null
          signature_url?: string | null
          signed_at?: string | null
          signed_pdf_url?: string | null
          status?: Database["public"]["Enums"]["document_status"] | null
          template_id?: string | null
          template_type?: Database["public"]["Enums"]["template_type"] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "documents_pdf_template_id_fkey"
            columns: ["pdf_template_id"]
            isOneToOne: false
            referencedRelation: "pdf_templates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_sales_request_id_fkey"
            columns: ["sales_request_id"]
            isOneToOne: false
            referencedRelation: "sales_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "document_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      health_declarations: {
        Row: {
          additional_notes: string | null
          answers: Json | null
          created_at: string
          id: string
          is_complete: boolean | null
          medical_review_notes: string | null
          requires_medical_review: boolean | null
          reviewed_at: string | null
          reviewed_by: string | null
          sales_request_id: string | null
          updated_at: string
        }
        Insert: {
          additional_notes?: string | null
          answers?: Json | null
          created_at?: string
          id?: string
          is_complete?: boolean | null
          medical_review_notes?: string | null
          requires_medical_review?: boolean | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sales_request_id?: string | null
          updated_at?: string
        }
        Update: {
          additional_notes?: string | null
          answers?: Json | null
          created_at?: string
          id?: string
          is_complete?: boolean | null
          medical_review_notes?: string | null
          requires_medical_review?: boolean | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          sales_request_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "health_declarations_sales_request_id_fkey"
            columns: ["sales_request_id"]
            isOneToOne: true
            referencedRelation: "sales_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      health_questions: {
        Row: {
          category: string | null
          created_at: string
          help_text: string | null
          id: string
          is_active: boolean | null
          is_required: boolean | null
          options: Json | null
          question: string
          question_type: string | null
          sort_order: number | null
        }
        Insert: {
          category?: string | null
          created_at?: string
          help_text?: string | null
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          options?: Json | null
          question: string
          question_type?: string | null
          sort_order?: number | null
        }
        Update: {
          category?: string | null
          created_at?: string
          help_text?: string | null
          id?: string
          is_active?: boolean | null
          is_required?: boolean | null
          options?: Json | null
          question?: string
          question_type?: string | null
          sort_order?: number | null
        }
        Relationships: []
      }
      insurance_plans: {
        Row: {
          annual_premium: number | null
          benefits: Json | null
          coverage_amount: number | null
          coverage_details: Json | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean | null
          monthly_premium: number | null
          name: string
          requirements: Json | null
          sort_order: number | null
          updated_at: string
        }
        Insert: {
          annual_premium?: number | null
          benefits?: Json | null
          coverage_amount?: number | null
          coverage_details?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          monthly_premium?: number | null
          name: string
          requirements?: Json | null
          sort_order?: number | null
          updated_at?: string
        }
        Update: {
          annual_premium?: number | null
          benefits?: Json | null
          coverage_amount?: number | null
          coverage_details?: Json | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean | null
          monthly_premium?: number | null
          name?: string
          requirements?: Json | null
          sort_order?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      notification_logs: {
        Row: {
          created_at: string
          delivered_at: string | null
          document_id: string | null
          error_message: string | null
          failed_at: string | null
          id: string
          message_content: string | null
          notification_type: Database["public"]["Enums"]["notification_type"]
          recipient: string | null
          sent_at: string | null
          signature_request_id: string | null
          signer_id: string | null
          status: Database["public"]["Enums"]["notification_status"] | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          delivered_at?: string | null
          document_id?: string | null
          error_message?: string | null
          failed_at?: string | null
          id?: string
          message_content?: string | null
          notification_type: Database["public"]["Enums"]["notification_type"]
          recipient?: string | null
          sent_at?: string | null
          signature_request_id?: string | null
          signer_id?: string | null
          status?: Database["public"]["Enums"]["notification_status"] | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          delivered_at?: string | null
          document_id?: string | null
          error_message?: string | null
          failed_at?: string | null
          id?: string
          message_content?: string | null
          notification_type?: Database["public"]["Enums"]["notification_type"]
          recipient?: string | null
          sent_at?: string | null
          signature_request_id?: string | null
          signer_id?: string | null
          status?: Database["public"]["Enums"]["notification_status"] | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notification_logs_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_logs_signature_request_id_fkey"
            columns: ["signature_request_id"]
            isOneToOne: false
            referencedRelation: "signature_requests"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "notification_logs_signer_id_fkey"
            columns: ["signer_id"]
            isOneToOne: false
            referencedRelation: "signers"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          action_text: string | null
          action_url: string | null
          category: string | null
          created_at: string
          details: string | null
          id: string
          is_read: boolean | null
          message: string
          read_at: string | null
          title: string
          type: string | null
          user_id: string | null
        }
        Insert: {
          action_text?: string | null
          action_url?: string | null
          category?: string | null
          created_at?: string
          details?: string | null
          id?: string
          is_read?: boolean | null
          message: string
          read_at?: string | null
          title: string
          type?: string | null
          user_id?: string | null
        }
        Update: {
          action_text?: string | null
          action_url?: string | null
          category?: string | null
          created_at?: string
          details?: string | null
          id?: string
          is_read?: boolean | null
          message?: string
          read_at?: string | null
          title?: string
          type?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      pdf_templates: {
        Row: {
          created_at: string
          created_by: string | null
          fields: Json | null
          file_name: string | null
          file_size: number | null
          file_url: string | null
          id: string
          is_active: boolean | null
          metadata: Json | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          fields?: Json | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          fields?: Json | null
          file_name?: string | null
          file_size?: number | null
          file_url?: string | null
          id?: string
          is_active?: boolean | null
          metadata?: Json | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          company: string | null
          created_at: string
          email: string | null
          full_name: string | null
          id: string
          is_active: boolean | null
          last_login_at: string | null
          phone: string | null
          role: string | null
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id: string
          is_active?: boolean | null
          last_login_at?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          company?: string | null
          created_at?: string
          email?: string | null
          full_name?: string | null
          id?: string
          is_active?: boolean | null
          last_login_at?: string | null
          phone?: string | null
          role?: string | null
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      sales_requests: {
        Row: {
          agent_notes: string | null
          assigned_to: string | null
          client_address: string | null
          client_birth_date: string | null
          client_dni: string | null
          client_email: string | null
          client_income: number | null
          client_marital_status: string | null
          client_name: string
          client_occupation: string | null
          client_phone: string | null
          completed_at: string | null
          coverage_amount: number | null
          created_at: string
          created_by: string | null
          id: string
          insurance_plan_id: string | null
          medical_exams_required: boolean | null
          monthly_premium: number | null
          notes: string | null
          policy_type: string | null
          priority_level: Database["public"]["Enums"]["priority_level"] | null
          request_number: string | null
          source: string | null
          status: Database["public"]["Enums"]["sales_status"] | null
          template_id: string | null
          updated_at: string
        }
        Insert: {
          agent_notes?: string | null
          assigned_to?: string | null
          client_address?: string | null
          client_birth_date?: string | null
          client_dni?: string | null
          client_email?: string | null
          client_income?: number | null
          client_marital_status?: string | null
          client_name: string
          client_occupation?: string | null
          client_phone?: string | null
          completed_at?: string | null
          coverage_amount?: number | null
          created_at?: string
          created_by?: string | null
          id?: string
          insurance_plan_id?: string | null
          medical_exams_required?: boolean | null
          monthly_premium?: number | null
          notes?: string | null
          policy_type?: string | null
          priority_level?: Database["public"]["Enums"]["priority_level"] | null
          request_number?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["sales_status"] | null
          template_id?: string | null
          updated_at?: string
        }
        Update: {
          agent_notes?: string | null
          assigned_to?: string | null
          client_address?: string | null
          client_birth_date?: string | null
          client_dni?: string | null
          client_email?: string | null
          client_income?: number | null
          client_marital_status?: string | null
          client_name?: string
          client_occupation?: string | null
          client_phone?: string | null
          completed_at?: string | null
          coverage_amount?: number | null
          created_at?: string
          created_by?: string | null
          id?: string
          insurance_plan_id?: string | null
          medical_exams_required?: boolean | null
          monthly_premium?: number | null
          notes?: string | null
          policy_type?: string | null
          priority_level?: Database["public"]["Enums"]["priority_level"] | null
          request_number?: string | null
          source?: string | null
          status?: Database["public"]["Enums"]["sales_status"] | null
          template_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "sales_requests_insurance_plan_id_fkey"
            columns: ["insurance_plan_id"]
            isOneToOne: false
            referencedRelation: "insurance_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "sales_requests_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "document_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      signature_fields: {
        Row: {
          created_at: string
          document_id: string | null
          field_type: string | null
          height: number | null
          id: string
          is_filled: boolean | null
          is_required: boolean | null
          label: string | null
          page_number: number | null
          signer_id: string | null
          value: string | null
          width: number | null
          x_position: number | null
          y_position: number | null
        }
        Insert: {
          created_at?: string
          document_id?: string | null
          field_type?: string | null
          height?: number | null
          id?: string
          is_filled?: boolean | null
          is_required?: boolean | null
          label?: string | null
          page_number?: number | null
          signer_id?: string | null
          value?: string | null
          width?: number | null
          x_position?: number | null
          y_position?: number | null
        }
        Update: {
          created_at?: string
          document_id?: string | null
          field_type?: string | null
          height?: number | null
          id?: string
          is_filled?: boolean | null
          is_required?: boolean | null
          label?: string | null
          page_number?: number | null
          signer_id?: string | null
          value?: string | null
          width?: number | null
          x_position?: number | null
          y_position?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "signature_fields_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "signature_fields_signer_id_fkey"
            columns: ["signer_id"]
            isOneToOne: false
            referencedRelation: "signers"
            referencedColumns: ["id"]
          },
        ]
      }
      signature_requests: {
        Row: {
          completed_at: string | null
          created_at: string
          created_by: string | null
          document_id: string | null
          expires_at: string | null
          id: string
          message: string | null
          status: Database["public"]["Enums"]["document_status"] | null
          title: string
          updated_at: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          document_id?: string | null
          expires_at?: string | null
          id?: string
          message?: string | null
          status?: Database["public"]["Enums"]["document_status"] | null
          title: string
          updated_at?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          created_by?: string | null
          document_id?: string | null
          expires_at?: string | null
          id?: string
          message?: string | null
          status?: Database["public"]["Enums"]["document_status"] | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "signature_requests_document_id_fkey"
            columns: ["document_id"]
            isOneToOne: false
            referencedRelation: "documents"
            referencedColumns: ["id"]
          },
        ]
      }
      signers: {
        Row: {
          access_attempts: number | null
          access_token: string | null
          created_at: string
          declined_at: string | null
          device_info: Json | null
          email: string
          expires_at: string | null
          id: string
          ip_address: string | null
          is_expired: boolean | null
          max_attempts: number | null
          name: string
          phone: string | null
          reminded_at: string | null
          role: string | null
          signature_data: string | null
          signature_request_id: string | null
          signature_type: string | null
          signed_at: string | null
          signing_order: number | null
          status: Database["public"]["Enums"]["signer_status"] | null
          updated_at: string
          user_agent: string | null
        }
        Insert: {
          access_attempts?: number | null
          access_token?: string | null
          created_at?: string
          declined_at?: string | null
          device_info?: Json | null
          email: string
          expires_at?: string | null
          id?: string
          ip_address?: string | null
          is_expired?: boolean | null
          max_attempts?: number | null
          name: string
          phone?: string | null
          reminded_at?: string | null
          role?: string | null
          signature_data?: string | null
          signature_request_id?: string | null
          signature_type?: string | null
          signed_at?: string | null
          signing_order?: number | null
          status?: Database["public"]["Enums"]["signer_status"] | null
          updated_at?: string
          user_agent?: string | null
        }
        Update: {
          access_attempts?: number | null
          access_token?: string | null
          created_at?: string
          declined_at?: string | null
          device_info?: Json | null
          email?: string
          expires_at?: string | null
          id?: string
          ip_address?: string | null
          is_expired?: boolean | null
          max_attempts?: number | null
          name?: string
          phone?: string | null
          reminded_at?: string | null
          role?: string | null
          signature_data?: string | null
          signature_request_id?: string | null
          signature_type?: string | null
          signed_at?: string | null
          signing_order?: number | null
          status?: Database["public"]["Enums"]["signer_status"] | null
          updated_at?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "signers_signature_request_id_fkey"
            columns: ["signature_request_id"]
            isOneToOne: false
            referencedRelation: "signature_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      system_config: {
        Row: {
          category: string | null
          description: string | null
          id: string
          is_public: boolean | null
          key: string
          updated_at: string
          updated_by: string | null
          value: Json | null
        }
        Insert: {
          category?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json | null
        }
        Update: {
          category?: string | null
          description?: string | null
          id?: string
          is_public?: boolean | null
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json | null
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_request_number: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_access_attempts: {
        Args: { token_value: string }
        Returns: undefined
      }
      is_token_valid: { Args: { token_value: string }; Returns: boolean }
    }
    Enums: {
      app_role: "admin" | "agent" | "supervisor" | "user"
      document_event_type:
        | "created"
        | "sent"
        | "opened"
        | "signed"
        | "declined"
        | "expired"
        | "reminded"
        | "completed"
      document_status:
        | "draft"
        | "pending"
        | "sent"
        | "opened"
        | "signed"
        | "completed"
        | "rejected"
        | "expired"
      notification_status:
        | "pending"
        | "sent"
        | "delivered"
        | "failed"
        | "bounced"
      notification_type: "email" | "sms" | "whatsapp" | "push"
      priority_level: "low" | "medium" | "high" | "urgent"
      sales_status:
        | "draft"
        | "pending_health_declaration"
        | "pending_signature"
        | "completed"
        | "rejected"
        | "cancelled"
      signer_status:
        | "pending"
        | "sent"
        | "opened"
        | "signed"
        | "declined"
        | "expired"
      template_type: "contrato" | "anexo" | "declaracion" | "poliza" | "otro"
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
    Enums: {
      app_role: ["admin", "agent", "supervisor", "user"],
      document_event_type: [
        "created",
        "sent",
        "opened",
        "signed",
        "declined",
        "expired",
        "reminded",
        "completed",
      ],
      document_status: [
        "draft",
        "pending",
        "sent",
        "opened",
        "signed",
        "completed",
        "rejected",
        "expired",
      ],
      notification_status: [
        "pending",
        "sent",
        "delivered",
        "failed",
        "bounced",
      ],
      notification_type: ["email", "sms", "whatsapp", "push"],
      priority_level: ["low", "medium", "high", "urgent"],
      sales_status: [
        "draft",
        "pending_health_declaration",
        "pending_signature",
        "completed",
        "rejected",
        "cancelled",
      ],
      signer_status: [
        "pending",
        "sent",
        "opened",
        "signed",
        "declined",
        "expired",
      ],
      template_type: ["contrato", "anexo", "declaracion", "poliza", "otro"],
    },
  },
} as const
