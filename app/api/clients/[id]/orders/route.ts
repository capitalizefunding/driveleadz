import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabaseClient"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = getSupabaseServer()
    const clientId = params.id

    console.log("Fetching orders for client:", clientId)

    // Fetch invoices for this client
    const { data: invoices, error } = await supabase
      .from("invoices")
      .select("*")
      .eq("client_id", clientId)
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching client invoices:", error)
      return NextResponse.json({ orders: [], error: error.message }, { status: 500 })
    }

    console.log(`Found ${invoices?.length || 0} invoices for client ${clientId}`)

    // Transform invoices into order format
    const orders = (invoices || []).map((invoice) => {
      // Determine category based on lead_type or description
      const isLeadService =
        invoice.lead_type || (invoice.order_description && invoice.order_description.toLowerCase().includes("lead"))

      const category = isLeadService ? "Lead Services" : "Marketing Services"

      // Format amount
      const amount = invoice.amount ? `$${Number(invoice.amount).toFixed(2)}` : "-"

      // Format date
      const date = invoice.date_issued || invoice.created_at

      return {
        id: invoice.id,
        date: date,
        description: invoice.order_description || `Invoice #${invoice.invoice_number}`,
        category: category,
        invoiceNumber: invoice.invoice_number,
        amount: amount,
      }
    })

    console.log(`Returning ${orders.length} orders for client`)
    return NextResponse.json({ orders })
  } catch (error) {
    console.error("Error in client orders API:", error)
    return NextResponse.json({ orders: [], error: "Internal server error" }, { status: 500 })
  }
}
