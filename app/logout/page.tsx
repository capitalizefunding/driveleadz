"use client"

import { useEffect } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabaseClient"

export default function LogoutPage() {
  const router = useRouter()
  const supabase = getSupabaseClient()

  useEffect(() => {
    const logout = async () => {
      try {
        // Clear Supabase session
        await supabase.auth.signOut()

        // Clear localStorage
        localStorage.removeItem("user")

        // Redirect to login
        router.push("/login")
      } catch (error) {
        console.error("Error during logout:", error)

        // Ensure localStorage is cleared even if Supabase fails
        localStorage.removeItem("user")
        router.push("/login")
      }
    }

    logout()
  }, [router, supabase])

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Logging out...</p>
    </div>
  )
}
