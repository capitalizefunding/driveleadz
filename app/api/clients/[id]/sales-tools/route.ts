import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs"
import { cookies } from "next/headers"
import { NextResponse } from "next/server"

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const clientId = params.id

  try {
    const supabase = createRouteHandlerClient({ cookies })

    // Check if user is authenticated
    const {
      data: { session },
    } = await supabase.auth.getSession()
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Fetch sales tools data
    const { data, error } = await supabase.from("sales_tools").select("*").eq("client_id", clientId).single()

    if (error) {
      console.error("Error fetching sales tools:", error)
      // If no data found, return empty object instead of error
      if (error.code === "PGRST116") {
        return NextResponse.json({})
      }
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data || {})
  } catch (error) {
    console.error("Error in sales tools route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
