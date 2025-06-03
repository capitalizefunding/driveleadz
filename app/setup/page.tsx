"use client"

import { useState } from "react"
import { getSupabaseClient } from "@/lib/supabaseClient"

export default function SetupPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const supabase = getSupabaseClient()

  async function handleSetup() {
    setLoading(true)
    setResult(null)

    try {
      // Create stored procedures for table creation
      await createStoredProcedures()

      setResult({ success: true, message: "Database setup completed successfully!" })
    } catch (error) {
      console.error("Error setting up database:", error)
      setResult({ success: false, message: `Error: ${error instanceof Error ? error.message : String(error)}` })
    } finally {
      setLoading(false)
    }
  }

  async function createStoredProcedures() {
    // Create users table procedure
    await supabase.rpc("exec_sql", {
      sql_string: `
        CREATE OR REPLACE FUNCTION create_users_table()
        RETURNS void AS $$
        BEGIN
          CREATE TABLE IF NOT EXISTS users (
            id UUID PRIMARY KEY REFERENCES auth.users(id),
            email TEXT NOT NULL UNIQUE,
            name TEXT NOT NULL,
            role TEXT NOT NULL CHECK (role IN ('admin', 'client')),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        END;
        $$ LANGUAGE plpgsql;
      `,
    })

    // Create clients table procedure
    await supabase.rpc("exec_sql", {
      sql_string: `
        CREATE OR REPLACE FUNCTION create_clients_table()
        RETURNS void AS $$
        BEGIN
          CREATE TABLE IF NOT EXISTS clients (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            client_number TEXT NOT NULL UNIQUE,
            company_name TEXT NOT NULL,
            contact_name TEXT NOT NULL,
            email TEXT NOT NULL,
            status TEXT NOT NULL CHECK (status IN ('Active', 'Inactive')),
            phone TEXT,
            address TEXT,
            industry TEXT,
            sales_vertical TEXT,
            years_active TEXT,
            sales_strategy TEXT,
            sales_reps TEXT,
            preferred_industries TEXT[],
            restricted_industries TEXT[],
            products TEXT[],
            notes TEXT,
            user_id UUID REFERENCES auth.users(id),
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        END;
        $$ LANGUAGE plpgsql;
      `,
    })

    // Create marketing_channels table procedure
    await supabase.rpc("exec_sql", {
      sql_string: `
        CREATE OR REPLACE FUNCTION create_marketing_channels_table()
        RETURNS void AS $$
        BEGIN
          CREATE TABLE IF NOT EXISTS marketing_channels (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
            social_media_ads BOOLEAN DEFAULT FALSE,
            paid_ads BOOLEAN DEFAULT FALSE,
            seo BOOLEAN DEFAULT FALSE,
            automated_sales_sequences BOOLEAN DEFAULT FALSE,
            sms_marketing BOOLEAN DEFAULT FALSE,
            content_marketing BOOLEAN DEFAULT FALSE,
            ai_sales_agents BOOLEAN DEFAULT FALSE,
            cold_email BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        END;
        $$ LANGUAGE plpgsql;
      `,
    })

    // Create sales_tools table procedure
    await supabase.rpc("exec_sql", {
      sql_string: `
        CREATE OR REPLACE FUNCTION create_sales_tools_table()
        RETURNS void AS $$
        BEGIN
          CREATE TABLE IF NOT EXISTS sales_tools (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
            sales_collateral BOOLEAN DEFAULT FALSE,
            automated_outreach BOOLEAN DEFAULT FALSE,
            interactive_calculators BOOLEAN DEFAULT FALSE,
            email_templates BOOLEAN DEFAULT FALSE,
            cold_calling_scripts BOOLEAN DEFAULT FALSE,
            sales_process BOOLEAN DEFAULT FALSE,
            crm_system BOOLEAN DEFAULT FALSE,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        END;
        $$ LANGUAGE plpgsql;
      `,
    })

    // Create lead_batches table procedure
    await supabase.rpc("exec_sql", {
      sql_string: `
        CREATE OR REPLACE FUNCTION create_lead_batches_table()
        RETURNS void AS $$
        BEGIN
          CREATE TABLE IF NOT EXISTS lead_batches (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            batch_id TEXT NOT NULL UNIQUE,
            file_name TEXT NOT NULL,
            client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
            upload_date DATE NOT NULL,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        END;
        $$ LANGUAGE plpgsql;
      `,
    })

    // Create leads table procedure
    await supabase.rpc("exec_sql", {
      sql_string: `
        CREATE OR REPLACE FUNCTION create_leads_table()
        RETURNS void AS $$
        BEGIN
          CREATE TABLE IF NOT EXISTS leads (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            batch_id UUID NOT NULL REFERENCES lead_batches(id) ON DELETE CASCADE,
            company TEXT NOT NULL,
            owner TEXT NOT NULL,
            mobile TEXT,
            email TEXT,
            industry TEXT,
            company_phone TEXT,
            address TEXT,
            city TEXT,
            state TEXT,
            zip_code TEXT,
            annual_revenue TEXT,
            employees TEXT,
            naics_code TEXT,
            sic_code TEXT,
            website TEXT,
            company_linkedin TEXT,
            job_title TEXT,
            work_phone TEXT,
            personal_linkedin TEXT,
            company_email TEXT,
            personal_email TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        END;
        $$ LANGUAGE plpgsql;
      `,
    })

    // Create invoices table procedure
    await supabase.rpc("exec_sql", {
      sql_string: `
        CREATE OR REPLACE FUNCTION create_invoices_table()
        RETURNS void AS $$
        BEGIN
          CREATE TABLE IF NOT EXISTS invoices (
            id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
            invoice_number TEXT NOT NULL UNIQUE,
            client_id UUID NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
            date_issued DATE NOT NULL,
            amount DECIMAL(10, 2) NOT NULL,
            status TEXT NOT NULL CHECK (status IN ('Paid', 'Unpaid', 'Overdue')),
            payment_method TEXT,
            date_paid DATE,
            lead_type TEXT,
            quantity INTEGER,
            unit_price DECIMAL(10, 2),
            order_description TEXT,
            created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
          );
        END;
        $$ LANGUAGE plpgsql;
      `,
    })

    // Create exec_sql function if it doesn't exist
    await supabase.rpc("exec_sql", {
      sql_string: `
        CREATE OR REPLACE FUNCTION exec_sql(sql_string text)
        RETURNS void AS $$
        BEGIN
          EXECUTE sql_string;
        END;
        $$ LANGUAGE plpgsql SECURITY DEFINER;
      `,
    })
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Setup Database</h1>

      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded mb-6">
        <p className="text-yellow-800">
          This will create the necessary stored procedures in your Supabase database. Run this once before seeding the
          database.
        </p>
      </div>

      <button
        onClick={handleSetup}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Setting up..." : "Setup Database"}
      </button>

      {result && (
        <div className={`mt-4 p-4 rounded ${result.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
          {result.message}
        </div>
      )}
    </div>
  )
}
