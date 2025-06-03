"use server"

import { getSupabaseServer } from "@/lib/supabaseClient"

export async function seedDatabase() {
  const supabase = getSupabaseServer()

  try {
    // Create admin user in Supabase Auth
    // Note: This is just for demonstration. In a real app, you'd create users through the Supabase dashboard
    // or use the Supabase Admin API with proper security measures.
    const { data: adminUser, error: adminError } = await supabase.auth.admin.createUser({
      email: "admin@driveleadz.com",
      password: "adminpassword123",
      email_confirm: true,
    })

    if (adminError) {
      console.error("Error creating admin user:", adminError)
      return { success: false, error: adminError.message }
    }

    // Create client user
    const { data: clientUser, error: clientError } = await supabase.auth.admin.createUser({
      email: "client@example.com",
      password: "clientpassword123",
      email_confirm: true,
    })

    if (clientError) {
      console.error("Error creating client user:", clientError)
      return { success: false, error: clientError.message }
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
      return { success: false, error: usersError.message }
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
      .select()

    if (clientsError) {
      console.error("Error inserting clients:", clientsError)
      return { success: false, error: clientsError.message }
    }

    // Add marketing channels for clients
    const { error: marketingError } = await supabase.from("marketing_channels").insert([
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

    if (marketingError) {
      console.error("Error inserting marketing channels:", marketingError)
      return { success: false, error: marketingError.message }
    }

    // Add sales tools for clients
    const { error: salesToolsError } = await supabase.from("sales_tools").insert([
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

    if (salesToolsError) {
      console.error("Error inserting sales tools:", salesToolsError)
      return { success: false, error: salesToolsError.message }
    }

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
      .select()

    if (batchesError) {
      console.error("Error inserting lead batches:", batchesError)
      return { success: false, error: batchesError.message }
    }

    // Add sample leads for each batch
    const { error: leadsError } = await supabase.from("leads").insert([
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

    if (leadsError) {
      console.error("Error inserting leads:", leadsError)
      return { success: false, error: leadsError.message }
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
    ])

    if (invoicesError) {
      console.error("Error inserting invoices:", invoicesError)
      return { success: false, error: invoicesError.message }
    }

    return { success: true, error: null }
  } catch (error) {
    console.error("Error seeding database:", error)
    return { success: false, error: String(error) }
  }
}
