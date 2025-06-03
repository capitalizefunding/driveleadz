"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Image from "next/image"
import { getSupabaseClient } from "@/lib/supabaseClient"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = getSupabaseClient()

  // Check if user is already logged in
  useEffect(() => {
    const checkUser = async () => {
      try {
        const { data } = await supabase.auth.getSession()
        if (data.session) {
          const user = localStorage.getItem("user")
          if (user) {
            const userData = JSON.parse(user)
            router.push(userData.role === "admin" ? "/admin" : "/client")
          }
        }
      } catch (error) {
        console.error("Error checking session:", error)
      }
    }
    checkUser()
  }, [router, supabase])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setIsLoading(true)

    try {
      // First try demo credentials
      if (
        (email === "admin@driveleadz.com" && password === "password123") ||
        (email === "client@example.com" && password === "password123")
      ) {
        console.log("Using demo credentials")
        const isAdmin = email === "admin@driveleadz.com"
        const user = {
          id: isAdmin ? "admin-demo" : "client-demo",
          email,
          role: isAdmin ? "admin" : "client",
          name: isAdmin ? "Admin User" : "Client User",
        }

        localStorage.setItem("user", JSON.stringify(user))
        router.push(isAdmin ? "/admin" : "/client")
        return
      }

      // If not demo, try Supabase Auth
      console.log("Attempting Supabase login with:", email)
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (authError) {
        console.error("Supabase auth error:", authError)
        throw new Error(authError.message)
      }

      if (!data.user) {
        console.error("No user returned from Supabase")
        throw new Error("Login failed")
      }

      console.log("Supabase login successful, fetching user data")

      // Get user details from our users table
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .eq("id", data.user.id)
        .limit(1)

      if (userError) {
        console.error("Error fetching user data:", userError)
        throw new Error(`Error fetching user data: ${userError.message}`)
      }

      if (!userData || userData.length === 0) {
        console.log("No user found in users table, creating default user object")

        // If we can't find the user in our table, try to get their email from auth
        const user = {
          id: data.user.id,
          email: data.user.email,
          role: "client", // Default role
          name: data.user.email?.split("@")[0] || "User",
        }

        localStorage.setItem("user", JSON.stringify(user))
        router.push("/client") // Default to client view
        return
      }

      console.log("User data fetched successfully:", userData[0])

      // Store user in localStorage
      localStorage.setItem("user", JSON.stringify(userData[0]))

      // Redirect based on role
      router.push(userData[0].role === "admin" ? "/admin" : "/client")
    } catch (err: any) {
      console.error("Login error:", err)
      setError(err.message || "Invalid email or password")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <div className="flex justify-center mb-6">
          <Image src="/images/logo-expanded.png" alt="DriveLeadz Logo" width={200} height={60} />
        </div>

        <h1 className="text-2xl font-bold text-center mb-6">Login to DriveLeadz</h1>

        {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="email" className="block text-sm font-bold mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded"
              placeholder="Enter your email"
              required
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-bold mb-2">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full p-3 border border-gray-300 rounded"
              placeholder="Enter your password"
              required
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <input
                id="remember"
                type="checkbox"
                className="h-4 w-4 text-[#05E0E9] focus:ring-[#05E0E9] border-gray-300 rounded"
              />
              <label htmlFor="remember" className="ml-2 block text-sm text-gray-700">
                Remember me
              </label>
            </div>
            <a href="#" className="text-sm text-[#05E0E9] hover:underline">
              Forgot password?
            </a>
          </div>

          <button
            type="submit"
            className="w-full bg-[#05E0E9] text-black font-bold py-3 px-4 rounded-[28px] hover:bg-opacity-90 transition"
            disabled={isLoading}
          >
            {isLoading ? "Logging in..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  )
}
