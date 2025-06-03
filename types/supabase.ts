export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[]

export interface Database {
  public: {
    Tables: {
      clients: {
        Row: {
          id: string
          client_number: string
          company_name: string
          contact_name: string
          email: string
          status: "Active" | "Inactive"
          phone: string | null
          address: string | null
          industry: string | null
          sales_vertical: string | null
          years_active: string | null
          sales_strategy: string | null
          sales_reps: string | null
          preferred_industries: string[] | null
          restricted_industries: string[] | null
          products: string[] | null
          notes: string | null
          user_id: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          client_number: string
          company_name: string
          contact_name: string
          email: string
          status: "Active" | "Inactive"
          phone?: string | null
          address?: string | null
          industry?: string | null
          sales_vertical?: string | null
          years_active?: string | null
          sales_strategy?: string | null
          sales_reps?: string | null
          preferred_industries?: string[] | null
          restricted_industries?: string[] | null
          products?: string[] | null
          notes?: string | null
          user_id?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          client_number?: string
          company_name?: string
          contact_name?: string
          email?: string
          status?: "Active" | "Inactive"
          phone?: string | null
          address?: string | null
          industry?: string | null
          sales_vertical?: string | null
          years_active?: string | null
          sales_strategy?: string | null
          sales_reps?: string | null
          preferred_industries?: string[] | null
          restricted_industries?: string[] | null
          products?: string[] | null
          notes?: string | null
          user_id?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      invoices: {
        Row: {
          id: string
          invoice_number: string
          client_id: string
          date_issued: string
          amount: number
          status: "Paid" | "Unpaid" | "Overdue"
          payment_method: string | null
          date_paid: string | null
          lead_type: string | null
          quantity: number | null
          unit_price: number | null
          order_description: string | null
          created_at: string
          updated_at: string | null
        }
        Insert: {
          id?: string
          invoice_number: string
          client_id: string
          date_issued: string
          amount: number
          status: "Paid" | "Unpaid" | "Overdue"
          payment_method?: string | null
          date_paid?: string | null
          lead_type?: string | null
          quantity?: number | null
          unit_price?: number | null
          order_description?: string | null
          created_at?: string
          updated_at?: string | null
        }
        Update: {
          id?: string
          invoice_number?: string
          client_id?: string
          date_issued?: string
          amount?: number
          status?: "Paid" | "Unpaid" | "Overdue"
          payment_method?: string | null
          date_paid?: string | null
          lead_type?: string | null
          quantity?: number | null
          unit_price?: number | null
          order_description?: string | null
          created_at?: string
          updated_at?: string | null
        }
      }
      lead_batches: {
        Row: {
          id: string
          batch_id: string
          file_name: string
          client_id: string
          upload_date: string
          created_at: string
        }
        Insert: {
          id?: string
          batch_id: string
          file_name: string
          client_id: string
          upload_date: string
          created_at?: string
        }
        Update: {
          id?: string
          batch_id?: string
          file_name?: string
          client_id?: string
          upload_date?: string
          created_at?: string
        }
      }
      leads: {
        Row: {
          id: string
          batch_id: string
          company: string
          owner: string
          mobile: string | null
          email: string | null
          industry: string | null
          company_phone: string | null
          address: string | null
          city: string | null
          state: string | null
          zip_code: string | null
          annual_revenue: string | null
          employees: string | null
          naics_code: string | null
          sic_code: string | null
          website: string | null
          company_linkedin: string | null
          job_title: string | null
          work_phone: string | null
          personal_linkedin: string | null
          company_email: string | null
          personal_email: string | null
          created_at: string
        }
        Insert: {
          id?: string
          batch_id: string
          company: string
          owner: string
          mobile?: string | null
          email?: string | null
          industry?: string | null
          company_phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          annual_revenue?: string | null
          employees?: string | null
          naics_code?: string | null
          sic_code?: string | null
          website?: string | null
          company_linkedin?: string | null
          job_title?: string | null
          work_phone?: string | null
          personal_linkedin?: string | null
          company_email?: string | null
          personal_email?: string | null
          created_at?: string
        }
        Update: {
          id?: string
          batch_id?: string
          company?: string
          owner?: string
          mobile?: string | null
          email?: string | null
          industry?: string | null
          company_phone?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          zip_code?: string | null
          annual_revenue?: string | null
          employees?: string | null
          naics_code?: string | null
          sic_code?: string | null
          website?: string | null
          company_linkedin?: string | null
          job_title?: string | null
          work_phone?: string | null
          personal_linkedin?: string | null
          company_email?: string | null
          personal_email?: string | null
          created_at?: string
        }
      }
      marketing_channels: {
        Row: {
          id: string
          client_id: string
          social_media_ads: boolean
          paid_ads: boolean
          seo: boolean
          automated_sales_sequences: boolean
          sms_marketing: boolean
          content_marketing: boolean
          ai_sales_agents: boolean
          cold_email: boolean
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          social_media_ads?: boolean
          paid_ads?: boolean
          seo?: boolean
          automated_sales_sequences?: boolean
          sms_marketing?: boolean
          content_marketing?: boolean
          ai_sales_agents?: boolean
          cold_email?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          social_media_ads?: boolean
          paid_ads?: boolean
          seo?: boolean
          automated_sales_sequences?: boolean
          sms_marketing?: boolean
          content_marketing?: boolean
          ai_sales_agents?: boolean
          cold_email?: boolean
          created_at?: string
        }
      }
      sales_tools: {
        Row: {
          id: string
          client_id: string
          sales_collateral: boolean
          automated_outreach: boolean
          interactive_calculators: boolean
          email_templates: boolean
          cold_calling_scripts: boolean
          sales_process: boolean
          crm_system: boolean
          created_at: string
        }
        Insert: {
          id?: string
          client_id: string
          sales_collateral?: boolean
          automated_outreach?: boolean
          interactive_calculators?: boolean
          email_templates?: boolean
          cold_calling_scripts?: boolean
          sales_process?: boolean
          crm_system?: boolean
          created_at?: string
        }
        Update: {
          id?: string
          client_id?: string
          sales_collateral?: boolean
          automated_outreach?: boolean
          interactive_calculators?: boolean
          email_templates?: boolean
          cold_calling_scripts?: boolean
          sales_process?: boolean
          crm_system?: boolean
          created_at?: string
        }
      }
      users: {
        Row: {
          id: string
          email: string
          name: string
          role: "admin" | "client"
          created_at: string
        }
        Insert: {
          id: string
          email: string
          name: string
          role: "admin" | "client"
          created_at?: string
        }
        Update: {
          id?: string
          email?: string
          name?: string
          role?: "admin" | "client"
          created_at?: string
        }
      }
    }
  }
}
