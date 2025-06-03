import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabaseClient"

export async function GET() {
  try {
    const supabase = getSupabaseServer()

    // Count only clients with "Active" status
    const { count, error } = await supabase
      .from("clients")
      .select("*", { count: "exact", head: true })
      .eq("status", "Active")

    if (error) {
      console.error("Error fetching active clients count:", error)
      return NextResponse.json({ count: 0, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ count: count || 0 })
  } catch (error) {
    console.error("Error in active clients count API:", error)
    return NextResponse.json({ count: 0, error: "Internal server error" }, { status: 500 })
  }
}
