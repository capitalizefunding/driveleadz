import { NextResponse } from "next/server"
import { getSupabaseServer } from "@/lib/supabaseClient"

export async function GET() {
  try {
    const supabase = getSupabaseServer()

    const { count, error } = await supabase.from("live_leads").select("*", { count: "exact", head: true })

    if (error) {
      console.error("Error fetching live leads count:", error)
      return NextResponse.json({ count: 0, error: error.message }, { status: 500 })
    }

    return NextResponse.json({ count: count || 0 })
  } catch (error) {
    console.error("Error in live leads count API:", error)
    return NextResponse.json({ count: 0, error: "Internal server error" }, { status: 500 })
  }
}
