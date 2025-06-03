import { NextResponse } from "next/server"
import { createClient } from "@supabase/supabase-js"

export async function GET(request: Request) {
  try {
    console.log("🔍 API route called")

    // Get the client_id from the query string
    const url = new URL(request.url)
    const clientId = url.searchParams.get("clientId")

    console.log("📊 client_id from query:", clientId)

    if (!clientId) {
      console.log("❌ No client ID provided")
      return NextResponse.json({ error: "Client ID is required" }, { status: 400 })
    }

    // Create a Supabase client with service role key to bypass RLS
    const supabaseUrl = process.env.SUPABASE_URL!
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

    console.log("🔑 Supabase URL exists:", !!supabaseUrl)
    console.log("🔑 Service key exists:", !!supabaseServiceKey)

    const supabase = createClient(supabaseUrl, supabaseServiceKey)
    console.log("✅ Supabase client created with service role key")

    // First, let's try with the hardcoded client_id to test
    console.log("🔍 Testing with hardcoded client_id first...")
    const { data: testData, error: testError } = await supabase
      .from("invoices")
      .select("*")
      .eq("client_id", "48c08382-a8d4-407e-99be-f0bb98e4ce88")

    console.log("📊 Hardcoded test result:", { testData, testError })

    // Now try with the actual client_id from params
    console.log("🔍 Querying invoices for client_id from params:", clientId)
    const { data, error, count } = await supabase
      .from("invoices")
      .select("*", { count: "exact" })
      .eq("client_id", clientId)
      .order("date_issued", { ascending: false })

    console.log("📊 Query result with params:", { data, error, count })

    if (error) {
      console.error("❌ Error fetching invoices:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    console.log("✅ Returning data:", data?.length, "invoices")
    return NextResponse.json({ data, count })
  } catch (error) {
    console.error("❌ Unexpected error:", error)
    return NextResponse.json({ error: "An unexpected error occurred" }, { status: 500 })
  }
}
