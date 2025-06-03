"use client"

import { useState } from "react"
import { getSupabaseClient } from "@/lib/supabaseClient"

export default function SeedPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; message: string } | null>(null)
  const supabase = getSupabaseClient()

  async function handleSeed() {
    setLoading(true)
    setResult(null)

    try {
      // Create tables
      await createTables()

      // Seed data
      await seedData()

      setResult({ success: true, message: "Database seeded successfully!" })
    } catch (error) {
      console.error("Error seeding database:", error)
      setResult({ success: false, message: `Error: ${error instanceof Error ? error.message : String(error)}` })
    } finally {
      setLoading(false)
    }
  }

  async function createTables() {
    // Create users table
    await supabase.rpc("create_users_table")

    // Create clients table
    await supabase.rpc("create_clients_table")

    // Create marketing_channels table
    await supabase.rpc("create_marketing_channels_table")

    // Create sales_tools table
    await supabase.rpc("create_sales_tools_table")

    // Create lead_batches table
    await supabase.rpc("create_lead_batches_table")

    // Create leads table
    await supabase.rpc("create_leads_table")

    // Create invoices table
    await supabase.rpc("create_invoices_table")
  }

  async function seedData() {
    // Create demo users
    const { data: adminUser, error: adminError } = await supabase.auth.signUp({
      email: "admin@driveleadz.com",
      password: "password123",
    })

    if (adminError) throw adminError

    const { data: clientUser, error: clientError } = await supabase.auth.signUp({
      email: "client@example.com",
      password: "password123",
    })

    if (clientError) throw clientError

    // Insert users into users table
    await supabase.from("users").insert([
      {
        id: adminUser.user?.id,
        email: "admin@driveleadz.com",
        name: "Admin User",
        role: "admin",
      },
      {
        id: clientUser.user?.id,
        email: "client@example.com",
        name: "Client User",
        role: "client",
      },
    ])

    // Insert sample clients
    const { data: clients, error: clientsError } = await supabase
      .from("clients")
      .insert([
        {
          client_number: "000342",
          company_name: "Fake Lead Co, LLC",
          contact_name: "John Smith",
          email: "john@fakeleadco.com",
          status: "Active",
          phone: "555-123-4567",
          address: "123 Main St, Anytown, USA",
          industry: "Automotive",
          sales_vertical: "MCA Business Funding",
          years_active: "5 years",
          sales_strategy: "Outbound",
          sales_reps: "10-15 reps",
          preferred_industries: ["Healthcare", "Construction", "Food Service"],
          restricted_industries: ["Trucking", "Automotive Sales", "Law Firms"],
          products: ["New Cars", "Used Cars", "Service"],
          notes: "Client is interested in expanding their digital marketing efforts.",
          user_id: clientUser.user?.id,
        },
        {
          client_number: "000492",
          company_name: "Random Broker Shop, Inc.",
          contact_name: "Jane Doe",
          email: "jane@randombroker.com",
          status: "Inactive",
          phone: "555-987-6543",
          address: "456 Oak Ave, Somewhere, USA",
          industry: "Automotive",
          sales_vertical: "Auto Financing",
          years_active: "10 years",
          sales_strategy: "Inbound",
          sales_reps: "5-10 reps",
          preferred_industries: ["Luxury", "SUV", "Electric Vehicles"],
          restricted_industries: ["Commercial", "Heavy Machinery"],
          products: ["New Cars", "Used Cars", "Parts"],
          notes: "Looking to improve their follow-up process with leads.",
        },
      ])
      .select("id")

    if (clientsError) throw clientsError

    // Add marketing channels for clients
    await supabase.from("marketing_channels").insert([
      {
        client_id: clients[0].id,
        social_media_ads: true,
        paid_ads: false,
        seo: true,
        automated_sales_sequences: true,
        sms_marketing: false,
        content_marketing: true,
        ai_sales_agents: false,
        cold_email: true,
      },
      {
        client_id: clients[1].id,
        social_media_ads: false,
        paid_ads: true,
        seo: true,
        automated_sales_sequences: false,
        sms_marketing: true,
        content_marketing: false,
        ai_sales_agents: true,
        cold_email: false,
      },
    ])

    // Add sales tools for clients
    await supabase.from("sales_tools").insert([
      {
        client_id: clients[0].id,
        sales_collateral: true,
        automated_outreach: true,
        interactive_calculators: false,
        email_templates: true,
        cold_calling_scripts: false,
        sales_process: true,
        crm_system: true,
      },
      {
        client_id: clients[1].id,
        sales_collateral: false,
        automated_outreach: true,
        interactive_calculators: true,
        email_templates: true,
        cold_calling_scripts: true,
        sales_process: false,
        crm_system: true,
      },
    ])

    // Add lead batches
    const { data: batches, error: batchesError } = await supabase
      .from("lead_batches")
      .insert([
        {
          batch_id: "001729",
          file_name: "Real-Time Intent Leads: Business Funding",
          client_id: clients[0].id,
          upload_date: new Date().toISOString().split("T")[0],
        },
        {
          batch_id: "001728",
          file_name: "Real-Time Intent Leads: Business Loans",
          client_id: clients[0].id,
          upload_date: new Date().toISOString().split("T")[0],
        },
      ])
      .select("id")

    if (batchesError) throw batchesError

    // Add sample leads for each batch
    await supabase.from("leads").insert([
      {
        batch_id: batches[0].id,
        company: "Company 1 for Batch 001729",
        owner: "Owner 1",
        mobile: "555-555-5555",
        email: "lead1@example.com",
        industry: "Construction",
        company_phone: "800-555-1234",
        address: "123 Business St",
        city: "Businessville",
        state: "CA",
        zip_code: "90210",
      },
      {
        batch_id: batches[0].id,
        company: "Company 2 for Batch 001729",
        owner: "Owner 2",
        mobile: "555-555-5556",
        email: "lead2@example.com",
        industry: "Healthcare",
        company_phone: "800-555-1235",
        address: "124 Business St",
        city: "Businessville",
        state: "CA",
        zip_code: "90210",
      },
      {
        batch_id: batches[1].id,
        company: "Company 1 for Batch 001728",
        owner: "Owner 3",
        mobile: "555-555-5557",
        email: "lead3@example.com",
        industry: "Retail",
        company_phone: "800-555-1236",
        address: "125 Business St",
        city: "Businessville",
        state: "CA",
        zip_code: "90210",
      },
    ])

    // Add invoices
    await supabase.from("invoices").insert([
      {
        invoice_number: "INV-2023-001",
        client_id: clients[0].id,
        date_issued: "2023-01-15",
        amount: 2500,
        status: "Paid",
        payment_method: "Credit Card",
        date_paid: "2023-01-15",
        lead_type: "Automotive Buyers",
        quantity: 500,
        unit_price: 5,
        order_description: "Real-Time Intent Leads #001913",
      },
      {
        invoice_number: "INV-2023-012",
        client_id: clients[0].id,
        date_issued: "2023-03-22",
        amount: 1800,
        status: "Paid",
        payment_method: "Bank Transfer",
        date_paid: "2023-03-23",
        lead_type: "Service Customers",
        quantity: 300,
        unit_price: 6,
        order_description: "Real-Time Intent Leads #001913",
      },
    ])
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Seed Database</h1>

      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded mb-6">
        <p className="text-yellow-800">
          Warning: This will seed your database with sample data. Only use this in development or if you want to reset
          your database.
        </p>
      </div>

      <button
        onClick={handleSeed}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Seeding..." : "Seed Database"}
      </button>

      {result && (
        <div className={`mt-4 p-4 rounded ${result.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
          {result.message}
        </div>
      )}
    </div>
  )
}
