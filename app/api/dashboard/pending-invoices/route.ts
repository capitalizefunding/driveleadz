import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabaseClient"

export async function GET() {
  try {
    const supabase = getSupabaseServer()

    // Look for invoices with no value in the status column (null or empty)
    const { data, error } = await supabase
      .from("invoices")
      .select("*")
      .is("status", null)
      .order("created_at", { ascending: false })
      .limit(5)

    if (error) {
      console.error("Error fetching pending invoices:", error)
      return NextResponse.json({ invoices: [], error: error.message }, { status: 500 })
    }

    console.log("Found pending invoices (null status):", data?.length || 0)

    return NextResponse.json({ invoices: data || [] })
  } catch (error) {
    console.error("Error in pending invoices API:", error)
    return NextResponse.json({ invoices: [], error: "Internal server error" }, { status: 500 })
  }
}
