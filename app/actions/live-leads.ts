"use server"

import { getSupabaseServer } from "@/lib/supabaseClient"
import { revalidatePath } from "next/cache"

// Get all live leads with pagination
export async function getLiveLeads(page = 1, searchTerm = "", clientId = null, pageSize = 10) {
  try {
    const supabase = getSupabaseServer()
    const offset = (page - 1) * pageSize

    // Start building the query
    let query = supabase.from("live_leads").select("*", { count: "exact" })

    // Add search filter if provided
    if (searchTerm) {
      query = query.or(
        `company_name.ilike.%${searchTerm}%,owner_name.ilike.%${searchTerm}%,email.ilike.%${searchTerm}%,phone.ilike.%${searchTerm}%,mobile.ilike.%${searchTerm}%`,
      )
    }

    // Add client filter if provided
    if (clientId) {
      query = query.eq("client_id", clientId)
    }

    // Execute the query with pagination
    const {
      data: liveLeads,
      error,
      count,
    } = await query.order("date", { ascending: false }).range(offset, offset + pageSize - 1)

    if (error) {
      console.error("Error fetching live leads:", error)
      throw new Error(`Failed to fetch live leads: ${error.message}`)
    }

    // Calculate total pages
    const totalPages = Math.ceil((count || 0) / pageSize)

    return {
      liveLeads: liveLeads || [],
      totalCount: count || 0,
      totalPages,
      currentPage: page,
    }
  } catch (error) {
    console.error("Exception in getLiveLeads:", error)
    throw new Error(`Failed to fetch live leads: ${error.message}`)
  }
}

// Create a new live lead
export async function createLiveLead(leadData) {
  try {
    const supabase = getSupabaseServer()

    // Format the data
    const formattedData = {
      ...leadData,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase.from("live_leads").insert([formattedData]).select()

    if (error) {
      console.error("Error creating live lead:", error)
      throw new Error(`Failed to create live lead: ${error.message}`)
    }

    revalidatePath("/admin/leadz")
    return data[0]
  } catch (error) {
    console.error("Exception in createLiveLead:", error)
    throw new Error(`Failed to create live lead: ${error.message}`)
  }
}

// Update an existing live lead
export async function updateLiveLead(id, leadData) {
  try {
    const supabase = getSupabaseServer()

    // Format the data
    const formattedData = {
      ...leadData,
      updated_at: new Date().toISOString(),
    }

    const { data, error } = await supabase.from("live_leads").update(formattedData).eq("id", id).select()

    if (error) {
      console.error("Error updating live lead:", error)
      throw new Error(`Failed to update live lead: ${error.message}`)
    }

    revalidatePath("/admin/leadz")
    return data[0]
  } catch (error) {
    console.error("Exception in updateLiveLead:", error)
    throw new Error(`Failed to update live lead: ${error.message}`)
  }
}

// Delete a live lead
export async function deleteLiveLead(id) {
  try {
    const supabase = getSupabaseServer()

    const { error } = await supabase.from("live_leads").delete().eq("id", id)

    if (error) {
      console.error("Error deleting live lead:", error)
      throw new Error(`Failed to delete live lead: ${error.message}`)
    }

    revalidatePath("/admin/leadz")
    return { success: true }
  } catch (error) {
    console.error("Exception in deleteLiveLead:", error)
    throw new Error(`Failed to delete live lead: ${error.message}`)
  }
}
