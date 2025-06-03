import { createClient } from "@supabase/supabase-js"

// Create a singleton instance of the Supabase client for client-side usage
// This prevents multiple instances from being created
let supabaseClient: ReturnType<typeof createClient> | null = null

export const getSupabaseClient = () => {
  if (supabaseClient) return supabaseClient

  // Use the environment variables that are already available
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

  console.log("Supabase Client Configuration:")
  console.log("URL:", supabaseUrl)
  console.log("Anon Key:", supabaseAnonKey ? `${supabaseAnonKey.substring(0, 20)}...` : "NOT SET")

  supabaseClient = createClient(supabaseUrl, supabaseAnonKey)
  return supabaseClient
}

// Create a Supabase client for server-side usage
export const getSupabaseServer = () => {
  const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!

  console.log("Supabase Server Configuration:")
  console.log("URL:", supabaseUrl)
  console.log("Service Key:", supabaseServiceKey ? `${supabaseServiceKey.substring(0, 20)}...` : "NOT SET")

  return createClient(supabaseUrl, supabaseServiceKey)
}

// Test connection function
export const testSupabaseConnection = async () => {
  try {
    const supabase = getSupabaseClient()

    console.log("🔍 Testing Supabase connection...")

    // Test basic connection with users table
    const { data, error, count } = await supabase.from("users").select("*", { count: "exact" }).limit(5)

    if (error) {
      console.error("❌ Supabase connection test failed:", error)
      return { success: false, error: error.message }
    }

    console.log("✅ Supabase connection successful!")
    console.log("📊 Users found:", data)
    console.log("📊 Total count:", count)

    return { success: true, data, count }
  } catch (error) {
    console.error("❌ Supabase connection test error:", error)
    return { success: false, error: error.message }
  }
}
