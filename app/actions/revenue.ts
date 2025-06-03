"use server"

import { getSupabaseServer } from "@/lib/supabaseClient"

export async function getRevenueData(startDate?: string, endDate?: string) {
  const supabase = getSupabaseServer()

  try {
    // Build the query with optional date filtering
    let query = supabase.from("invoices").select(`
        *,
        clients (
          id,
          company_name
        )
      `)

    // Add date filtering if provided
    if (startDate && endDate) {
      query = query.gte("created_at", startDate).lte("created_at", endDate)
    }

    const { data: invoices, error: invoicesError } = await query

    if (invoicesError) {
      console.error("Error fetching invoices:", invoicesError)
      throw new Error("Failed to fetch revenue data")
    }

    // Safely handle null/undefined invoices
    const safeInvoices = invoices || []

    // Calculate totals
    const totalSales = safeInvoices.length
    const totalRevenue = safeInvoices.reduce((sum, invoice) => sum + (invoice.amount || 0), 0)
    const paidInvoices = safeInvoices.filter((invoice) => invoice.status?.toLowerCase() === "paid").length
    const paidRevenue = safeInvoices
      .filter((invoice) => invoice.status?.toLowerCase() === "paid")
      .reduce((sum, invoice) => sum + (invoice.amount || 0), 0)

    // Calculate top clients by revenue
    const clientRevenue = new Map()
    safeInvoices.forEach((invoice) => {
      if (invoice.clients?.company_name && invoice.status?.toLowerCase() === "paid") {
        const clientName = invoice.clients.company_name
        const currentRevenue = clientRevenue.get(clientName) || 0
        clientRevenue.set(clientName, currentRevenue + (invoice.amount || 0))
      }
    })

    const topClients = Array.from(clientRevenue.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([name, revenue]) => ({ name, revenue }))

    // Calculate revenue by lead type
    const leadTypeRevenue = new Map()
    safeInvoices.forEach((invoice) => {
      if (invoice.status?.toLowerCase() === "paid" && invoice.lead_type) {
        const leadType = invoice.lead_type
        const currentRevenue = leadTypeRevenue.get(leadType) || 0
        leadTypeRevenue.set(leadType, currentRevenue + (invoice.amount || 0))
      }
    })

    const revenueByLeadType = Array.from(leadTypeRevenue.entries())
      .sort((a, b) => b[1] - a[1])
      .map(([type, revenue]) => ({ type, revenue }))

    // Calculate monthly revenue for the date range or last 6 months
    const monthlyRevenue = new Map()
    let dateThreshold = new Date()

    if (startDate) {
      dateThreshold = new Date(startDate)
    } else {
      dateThreshold.setMonth(dateThreshold.getMonth() - 6)
    }

    safeInvoices.forEach((invoice) => {
      if (invoice.status?.toLowerCase() === "paid" && invoice.date_paid) {
        const paidDate = new Date(invoice.date_paid)
        if (paidDate >= dateThreshold) {
          const monthKey = `${paidDate.getFullYear()}-${String(paidDate.getMonth() + 1).padStart(2, "0")}`
          const currentRevenue = monthlyRevenue.get(monthKey) || 0
          monthlyRevenue.set(monthKey, currentRevenue + (invoice.amount || 0))
        }
      }
    })

    const monthlyRevenueData = Array.from(monthlyRevenue.entries())
      .sort((a, b) => a[0].localeCompare(b[0]))
      .map(([month, revenue]) => ({ month, revenue }))

    return {
      totalSales,
      totalRevenue,
      paidInvoices,
      paidRevenue,
      topClients,
      revenueByLeadType,
      monthlyRevenueData,
      unpaidInvoices: totalSales - paidInvoices,
      unpaidRevenue: totalRevenue - paidRevenue,
    }
  } catch (error) {
    console.error("Error in getRevenueData:", error)
    throw error
  }
}

export async function getRevenueStats(startDate?: string, endDate?: string) {
  const supabase = getSupabaseServer()

  try {
    // Build the query with optional date filtering
    let query = supabase.from("invoices").select("status, amount, created_at")

    // Add date filtering if provided
    if (startDate && endDate) {
      query = query.gte("created_at", startDate).lte("created_at", endDate)
    }

    const { data: invoiceStats, error: statsError } = await query

    if (statsError) {
      console.error("Error fetching invoice stats:", statsError)
      throw new Error("Failed to fetch revenue stats")
    }

    const stats = {
      paid: { count: 0, amount: 0 },
      unpaid: { count: 0, amount: 0 },
      overdue: { count: 0, amount: 0 },
    }

    invoiceStats?.forEach((invoice) => {
      const status = invoice.status?.toLowerCase() || "unpaid" // Default to 'unpaid' if status is null
      if (stats[status]) {
        stats[status].count++
        stats[status].amount += invoice.amount || 0
      } else {
        // If status doesn't match our expected values, treat as unpaid
        stats.unpaid.count++
        stats.unpaid.amount += invoice.amount || 0
      }
    })

    return stats
  } catch (error) {
    console.error("Error in getRevenueStats:", error)
    throw error
  }
}
