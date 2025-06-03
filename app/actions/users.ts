"use server"

import { getSupabaseServer } from "@/lib/supabaseClient"
import crypto from "crypto"

export async function createUser(formData: FormData) {
  try {
    const supabase = getSupabaseServer()

    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const password = formData.get("password") as string
    const role = formData.get("role") as string
    const clientId = formData.get("clientId") as string

    // Validate form
    if (!name || !email || !password) {
      return {
        success: false,
        message: "Please fill in all required fields",
      }
    }

    if (role === "client" && !clientId) {
      return {
        success: false,
        message: "Please select a client",
      }
    }

    // 1. Create user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        name,
        role,
      },
    })

    if (authError) {
      throw authError
    }

    if (!authData.user) {
      throw new Error("Failed to create user")
    }

    // Generate a placeholder password hash for our users table
    // This is just to satisfy the not-null constraint
    // The actual authentication is handled by Supabase Auth
    const passwordHash = crypto
      .createHash("sha256")
      .update(password + Date.now())
      .digest("hex")

    // 2. Create user record in users table
    const { error: userError } = await supabase.from("users").insert({
      id: authData.user.id,
      email,
      name,
      role,
      password_hash: passwordHash, // Add the password_hash field
    })

    if (userError) {
      throw userError
    }

    // 3. If client role, update client record with user_id
    if (role === "client" && clientId) {
      const { error: clientError } = await supabase
        .from("clients")
        .update({ user_id: authData.user.id })
        .eq("id", clientId)

      if (clientError) {
        throw clientError
      }
    }

    return {
      success: true,
      message: "User created successfully!",
      userId: authData.user.id,
    }
  } catch (error: any) {
    console.error("Error creating user:", error)
    return {
      success: false,
      message: error.message || "Failed to create user",
    }
  }
}

export async function updateUser(userId: string, formData: FormData) {
  try {
    const supabase = getSupabaseServer()

    const name = formData.get("name") as string
    const email = formData.get("email") as string
    const role = formData.get("role") as string
    const clientId = formData.get("clientId") as string

    // Validate form
    if (!name || !email) {
      return {
        success: false,
        message: "Please fill in all required fields",
      }
    }

    if (role === "client" && !clientId) {
      return {
        success: false,
        message: "Please select a client",
      }
    }

    // 1. Update user in users table
    const { error: userError } = await supabase
      .from("users")
      .update({
        name,
        email,
        role,
      })
      .eq("id", userId)

    if (userError) {
      throw userError
    }

    // 2. If client role, update client record with user_id
    if (role === "client" && clientId) {
      // First, remove this user from any other clients
      const { error: clearError } = await supabase.from("clients").update({ user_id: null }).eq("user_id", userId)

      if (clearError) {
        throw clearError
      }

      // Then, set the user for the selected client
      const { error: clientError } = await supabase.from("clients").update({ user_id: userId }).eq("id", clientId)

      if (clientError) {
        throw clientError
      }
    }

    return {
      success: true,
      message: "User updated successfully!",
    }
  } catch (error: any) {
    console.error("Error updating user:", error)
    return {
      success: false,
      message: error.message || "Failed to update user",
    }
  }
}
