"use server"

import { getSupabaseServer } from "@/lib/supabaseClient"

export async function seedDatabase() {
  const supabase = getSupabaseServer()

  // Create admin user
  const { data: adminUser, error: adminError } = await supabase.auth.admin.createUser({
    email: "admin@driveleadz.com",
    password: "password123",
    email_confirm: true,
  })

  if (adminError) {
    console.error("Error creating admin user:", adminError)
    throw new Error("Failed to create admin user")
  }

  // Create client user
  const { data: clientUser, error: clientError } = await supabase.auth.admin.createUser({
    email: "client@example.com",
    password: "password123",
    email_confirm: true,
  })

  if (clientError) {
    console.error("Error creating client user:", clientError)
    throw new Error("Failed to create client user")
  }

  // Add users to users table
  const { error: usersError } = await supabase.from("users").insert([
    {
      id: adminUser.user.id,
      email: "admin@driveleadz.com",
      name: "Admin User",
      role: "admin",
    },
    {
      id: clientUser.user.id,
      email: "client@example.com",
      name: "Client User",
      role: "client",
    },
  ])

  if (usersError) {
    console.error("Error inserting users:", usersError)
    throw new Error("Failed to insert users")
  }

  // Add sample clients
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
        user_id: clientUser.user.id,
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

  if (clientsError) {
    console.error("Error inserting clients:", clientsError)
    throw new Error("Failed to insert clients")
  }

  // Add marketing channels for clients
  const marketingChannels = clients.map((client) => ({
    client_id: client.id,
    social_media_ads: Math.random() > 0.5,
    paid_ads: Math.random() > 0.5,
    seo: Math.random() > 0.5,
    automated_sales_sequences: Math.random() > 0.5,
    sms_marketing: Math.random() > 0.5,
    content_marketing: Math.random() > 0.5,
    ai_sales_agents: Math.random() > 0.5,
    cold_email: Math.random() > 0.5,
  }))

  const { error: marketingError } = await supabase.from("marketing_channels").insert(marketingChannels)

  if (marketingError) {
    console.error("Error inserting marketing channels:", marketingError)
    throw new Error("Failed to insert marketing channels")
  }

  // Add sales tools for clients
  const salesTools = clients.map((client) => ({
    client_id: client.id,
    sales_collateral: Math.random() > 0.5,
    automated_outreach: Math.random() > 0.5,
    interactive_calculators: Math.random() > 0.5,
    email_templates: Math.random() > 0.5,
    cold_calling_scripts: Math.random() > 0.5,
    sales_process: Math.random() > 0.5,
    crm_system: Math.random() > 0.5,
  }))

  const { error: toolsError } = await supabase.from("sales_tools").insert(salesTools)

  if (toolsError) {
    console.error("Error inserting sales tools:", toolsError)
    throw new Error("Failed to insert sales tools")
  }

  // Add lead batches
  const { data: batches, error: batchesError } = await supabase
    .from("lead_batches")
    .insert([
      {
        batch_id: "001729",
        file_name: "Real-Time Intent Leads: Business Funding",
        client_id: clients[0].id,
        upload_date: "2025-05-01",
      },
      {
        batch_id: "001728",
        file_name: "Real-Time Intent Leads: Business Loans",
        client_id: clients[0].id,
        upload_date: "2025-05-01",
      },
      {
        batch_id: "001361",
        file_name: "Real-Time Intent Leads: Business Loans",
        client_id: clients[0].id,
        upload_date: "2025-04-21",
      },
    ])
    .select("id, batch_id")

  if (batchesError) {
    console.error("Error inserting lead batches:", batchesError)
    throw new Error("Failed to insert lead batches")
  }

  // Add sample leads for each batch
  for (const batch of batches) {
    const leads = Array.from({ length: 10 }, (_, i) => ({
      batch_id: batch.id,
      company: `Company ${i + 1} for Batch ${batch.batch_id}`,
      owner: `Owner ${i + 1}`,
      mobile: "555-555-5555",
      email: `lead${i + 1}@example.com`,
      industry: ["Construction", "Healthcare", "Retail", "Technology"][Math.floor(Math.random() * 4)],
      company_phone: "800-555-1234",
      address: "123 Business St",
      city: "Businessville",
      state: "CA",
      zip_code: "90210",
      annual_revenue: `$${Math.floor(Math.random() * 10000000)}`,
      employees: `${Math.floor(Math.random() * 100)}`,
      naics_code: "12345",
      sic_code: "54321",
      website: "https://example.com",
      company_linkedin: "https://linkedin.com/company/example",
      job_title: "CEO",
      work_phone: "555-123-4567",
      personal_linkedin: "https://linkedin.com/in/example",
      company_email: "info@example.com",
      personal_email: "personal@example.com",
    }))

    const { error: leadsError } = await supabase.from("leads").insert(leads)

    if (leadsError) {
      console.error("Error inserting leads:", leadsError)
      throw new Error("Failed to insert leads")
    }
  }

  // Add invoices
  const { error: invoicesError } = await supabase.from("invoices").insert([
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
    {
      invoice_number: "INV-2023-018",
      client_id: clients[1].id,
      date_issued: "2023-04-10",
      amount: 3000,
      status: "Paid",
      payment_method: "Credit Card",
      date_paid: "2023-04-10",
      lead_type: "Automotive Buyers",
      quantity: 600,
      unit_price: 5,
      order_description: "Real-Time Intent Leads #001913",
    },
  ])

  if (invoicesError) {
    console.error("Error inserting invoices:", invoicesError)
    throw new Error("Failed to insert invoices")
  }

  return {
    success: true,
    message: "Database seeded successfully",
  }
}
