import { getSupabaseServer } from "@/lib/supabaseClient"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    console.log("🔍 API: Starting client fetch...")
    console.log("🔧 API: Environment check:")
    console.log("- SUPABASE_URL:", process.env.SUPABASE_URL ? "✅ Set" : "❌ Missing")
    console.log("- SUPABASE_SERVICE_ROLE_KEY:", process.env.SUPABASE_SERVICE_ROLE_KEY ? "✅ Set" : "❌ Missing")

    const supabase = getSupabaseServer()
    console.log("📡 API: Supabase client created")

    // First, let's test the connection
    console.log("🧪 API: Testing connection...")
    const { data: testData, error: testError } = await supabase
      .from("clients")
      .select("count", { count: "exact", head: true })

    console.log("🧪 API: Connection test result:", { testData, testError })

    if (testError) {
      console.error("❌ API: Connection test failed:", testError)
      return NextResponse.json({ error: `Connection failed: ${testError.message}` }, { status: 500 })
    }

    // Now get the actual data
    console.log("📊 API: Fetching clients...")
    const { data, error } = await supabase.from("clients").select("*").order("company_name")

    console.log("📊 API: Query result:")
    console.log("- Data:", data)
    console.log("- Error:", error)
    console.log("- Data type:", typeof data)
    console.log("- Data length:", data?.length)

    if (error) {
      console.error("❌ API: Supabase error:", error)
      return NextResponse.json({ error: `Query failed: ${error.message}` }, { status: 500 })
    }

    if (!data) {
      console.warn("⚠️ API: Query returned null")
      return NextResponse.json({ error: "Query returned null" }, { status: 500 })
    }

    console.log(`✅ API: Successfully returning ${data.length} clients`)

    // Log first client for debugging
    if (data.length > 0) {
      console.log("📋 API: First client sample:", data[0])
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("💥 API: Exception:", error)
    console.error("💥 API: Error stack:", error.stack)
    return NextResponse.json({ error: `Exception: ${error.message}` }, { status: 500 })
  }
}
