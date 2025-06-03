import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabaseClient"

export async function GET() {
  try {
    const supabase = getSupabaseServer()

    // Sum only the amount_paid column
    const { data, error } = await supabase.from("invoices").select("amount_paid")

    if (error) {
      console.error("Error fetching collected revenue:", error)
      return NextResponse.json({ total: 0, error: error.message }, { status: 500 })
    }

    // Sum all amount_paid values
    const total = data?.reduce((sum, invoice) => sum + (Number(invoice.amount_paid) || 0), 0) || 0

    return NextResponse.json({ total })
  } catch (error) {
    console.error("Error in collected revenue API:", error)
    return NextResponse.json({ total: 0, error: "Internal server error" }, { status: 500 })
  }
}
