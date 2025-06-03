"use server"

import { getSupabaseServer } from "@/lib/supabaseClient"

export async function getClients() {
  const supabase = getSupabaseServer()

  const { data, error } = await supabase.from("clients").select("*").order("company_name")

  if (error) {
    console.error("Error fetching clients:", error)
    return { clients: [], error: error.message }
  }

  return { clients: data, error: null }
}

export async function getClientById(id: string) {
  const supabase = getSupabaseServer()

  const { data, error } = await supabase
    .from("clients")
    .select(`
      *,
      marketing_channels(*),
      sales_tools(*),
      invoices(*),
      lead_batches(*)
    `)
    .eq("id", id)
    .single()

  if (error) {
    console.error(`Error fetching client with ID ${id}:`, error)
    return { client: null, error: error.message }
  }

  return { client: data, error: null }
}

export async function createClient(clientData: any) {
  const supabase = getSupabaseServer()

  // Insert client
  const { data: client, error: clientError } = await supabase.from("clients").insert(clientData).select().single()

  if (clientError) {
    console.error("Error creating client:", clientError)
    return { success: false, error: clientError.message }
  }

  // Create default marketing channels
  const { error: marketingError } = await supabase.from("marketing_channels").insert({
    client_id: client.id,
    social_media_ads: false,
    paid_ads: false,
    seo: false,
    automated_sales_sequences: false,
    sms_marketing: false,
    content_marketing: false,
    ai_sales_agents: false,
    cold_email: false,
  })

  if (marketingError) {
    console.error("Error creating marketing channels:", marketingError)
  }

  // Create default sales tools
  const { error: salesToolsError } = await supabase.from("sales_tools").insert({
    client_id: client.id,
    sales_collateral: false,
    automated_outreach: false,
    interactive_calculators: false,
    email_templates: false,
    cold_calling_scripts: false,
    sales_process: false,
    crm_system: false,
  })

  if (salesToolsError) {
    console.error("Error creating sales tools:", salesToolsError)
  }

  return { success: true, client, error: null }
}
