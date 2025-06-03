import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: Request) {
  try {
    console.log("🔍 Admin invoices API route called")

    // Get query parameters
    const url = new URL(request.url)
    const page = Number.parseInt(url.searchParams.get("page") || "1")
    const searchTerm = url.searchParams.get("searchTerm") || ""
    const clientFilter = url.searchParams.get("clientFilter") || ""
    const statusFilter = url.searchParams.get("statusFilter") || ""
    const startDate = url.searchParams.get("startDate") || ""
    const endDate = url.searchParams.get("endDate") || ""
    const minAmount = url.searchParams.get("minAmount") || ""
    const maxAmount = url.searchParams.get("maxAmount") || ""

    console.log("📊 Query params:", {
      page,
      searchTerm,
      clientFilter,
      statusFilter,
      startDate,
      endDate,
      minAmount,
      maxAmount,
    })

    // Create a Supabase client with service role key to bypass RLS
    const supabaseUrl = process.env.SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    console.log("✅ Supabase client created with service role key")

    // Build the query
    let query = supabase.from("invoices").select(
      `
        *,
        clients (
          id,
          company_name
        )
      `,
      { count: "exact" },
    )

    // Apply filters
    if (searchTerm) {
      query = query.or(`invoice_number.ilike.%${searchTerm}%,order_description.ilike.%${searchTerm}%`)
    }

    if (clientFilter) {
      query = query.eq("clients.company_name", clientFilter)
    }

    if (statusFilter) {
      query = query.eq("status", statusFilter)
    }

    if (startDate) {
      query = query.gte("date_issued", startDate)
    }

    if (endDate) {
      query = query.lte("date_issued", endDate)
    }

    if (minAmount) {
      const minAmountFloat = Number.parseFloat(minAmount)
      if (!isNaN(minAmountFloat)) {
        query = query.gte("amount", minAmountFloat)
      }
    }

    if (maxAmount) {
      const maxAmountFloat = Number.parseFloat(maxAmount)
      if (!isNaN(maxAmountFloat)) {
        query = query.lte("amount", maxAmountFloat)
      }
    }

    // Apply pagination
    const itemsPerPage = 10
    const from = (page - 1) * itemsPerPage
    const to = from + itemsPerPage - 1

    query = query.order("date_issued", { ascending: false }).range(from, to)

    console.log("🔍 Executing query...")
    const { data, error, count } = await query

    console.log("📊 Query result:", { dataLength: data?.length, error, count })

    if (error) {
      console.error("❌ Error fetching invoices:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    const totalPages = Math.ceil((count || 0) / itemsPerPage)

    console.log("✅ Returning data:", data?.length, "invoices")
    return NextResponse.json({
      invoices: data || [],
      totalCount: count || 0,
      totalPages,
    })
  } catch (error) {
    console.error("❌ Unexpected error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
