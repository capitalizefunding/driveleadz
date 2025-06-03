"use server"

import { getSupabaseServer } from "@/lib/supabaseClient"

export async function getDashboardStats() {
  const supabase = getSupabaseServer()

  try {
    // Get total clients
    const { count: totalClients, error: clientsError } = await supabase
      .from("clients")
      .select("*", { count: "exact", head: true })

    if (clientsError) {
      console.error("Error fetching clients count:", clientsError)
    }

    // Get total live leads
    const { count: totalLiveLeads, error: leadsError } = await supabase
      .from("live_leads")
      .select("*", { count: "exact", head: true })

    if (leadsError) {
      console.error("Error fetching live leads count:", leadsError)
    }

    // Get total invoices and revenue
    const { data: invoices, error: invoicesError } = await supabase.from("invoices").select("amount, status")

    if (invoicesError) {
      console.error("Error fetching invoices:", invoicesError)
    }

    const totalInvoices = invoices?.length || 0
    const totalRevenue = invoices?.reduce((sum, invoice) => sum + (invoice.amount || 0), 0) || 0
    const paidInvoices = invoices?.filter((invoice) => invoice.status?.toLowerCase() === "paid").length || 0

    // Get recent clients (last 5)
    const { data: recentClients, error: recentClientsError } = await supabase
      .from("clients")
      .select("id, company_name, contact_name, created_at, status")
      .order("created_at", { ascending: false })
      .limit(5)

    if (recentClientsError) {
      console.error("Error fetching recent clients:", recentClientsError)
    }

    // Get recent live leads (last 5)
    const { data: recentLeads, error: recentLeadsError } = await supabase
      .from("live_leads")
      .select(`
        id,
        company_name,
        owner_name,
        created_at,
        clients (
          company_name
        )
      `)
      .order("created_at", { ascending: false })
      .limit(5)

    if (recentLeadsError) {
      console.error("Error fetching recent leads:", recentLeadsError)
    }

    return {
      totalClients: totalClients || 0,
      totalLiveLeads: totalLiveLeads || 0,
      totalInvoices,
      totalRevenue,
      paidInvoices,
      recentClients: recentClients || [],
      recentLeads: recentLeads || [],
    }
  } catch (error) {
    console.error("Error in getDashboardStats:", error)
    return {
      totalClients: 0,
      totalLiveLeads: 0,
      totalInvoices: 0,
      totalRevenue: 0,
      paidInvoices: 0,
      recentClients: [],
      recentLeads: [],
    }
  }
}
