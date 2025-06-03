import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabaseClient"

export async function GET() {
  try {
    const supabase = getSupabaseServer()

    // First get all clients
    const { data: clients, error: clientsError } = await supabase.from("clients").select("id, company_name")

    if (clientsError) {
      console.error("Error fetching clients:", clientsError)
      return NextResponse.json({ clients: [], error: clientsError.message }, { status: 500 })
    }

    // For each client, count their live leads
    const clientsWithLeadCounts = await Promise.all(
      clients.map(async (client) => {
        const { count, error } = await supabase
          .from("live_leads")
          .select("*", { count: "exact", head: true })
          .eq("client_id", client.id)

        if (error) {
          console.error(`Error counting leads for client ${client.id}:`, error)
          return { ...client, lead_count: 0 }
        }

        return { ...client, lead_count: count || 0 }
      }),
    )

    // Sort by lead count and take top 5
    const topClients = clientsWithLeadCounts.sort((a, b) => b.lead_count - a.lead_count).slice(0, 5)

    return NextResponse.json({ clients: topClients })
  } catch (error) {
    console.error("Error in top clients API:", error)
    return NextResponse.json({ clients: [], error: "Internal server error" }, { status: 500 })
  }
}
