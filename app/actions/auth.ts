"use server"

import { getSupabaseServer } from "@/lib/supabaseClient"
import { redirect } from "next/navigation"

export async function signIn(formData: FormData) {
  const email = formData.get("email") as string
  const password = formData.get("password") as string

  const supabase = getSupabaseServer()

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  })

  if (error) {
    return { error: error.message }
  }

  // Check if the user is an admin
  const { data: user } = await supabase.auth.getUser()
  if (!user?.user?.id) {
    return { error: "User not found" }
  }

  // Check if the user is an admin
  const { data: adminData, error: adminError } = await supabase
    .from("admins")
    .select("*")
    .eq("user_id", user.user.id)
    .single()

  if (adminData) {
    // User is an admin, redirect to admin dashboard
    redirect("/admin")
  } else {
    // User is a client, redirect to client dashboard
    redirect("/client")
  }
}

export async function signOut() {
  const supabase = getSupabaseServer()
  await supabase.auth.signOut()
  redirect("/login")
}

export async function getUserFromSession() {
  const supabase = getSupabaseServer()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    console.error("Error getting user from session:", error)
    return null
  }

  // Check if the user is an admin
  const { data: adminData } = await supabase.from("admins").select("*").eq("user_id", user.id).single()

  if (adminData) {
    return {
      id: user.id,
      email: user.email,
      role: "admin",
    }
  }

  // If not admin, return as client
  return {
    id: user.id,
    email: user.email,
    role: "client",
  }
}

export async function isAuthenticated() {
  const supabase = getSupabaseServer()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return !!user
}

export async function isAdmin() {
  const user = await getUserFromSession()
  return user?.role === "admin"
}
