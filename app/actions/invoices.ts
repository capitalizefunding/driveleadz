"use server"

import { createClient } from "@supabase/supabase-js"

const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

export async function getInvoicesForClient(clientId: string) {
  try {
    const { data, error } = await supabase
      .from("invoices")
      .select(`
        id,
        invoice_number,
        client_name,
        amount,
        amount_paid,
        date_created,
        due_date,
        status,
        client_id
      `)
      .eq("client_id", clientId)
      .order("date_created", { ascending: false })

    if (error) {
      console.error("Error fetching client invoices:", error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error("Error in getInvoicesForClient:", error)
    throw error
  }
}

export async function getInvoices() {
  try {
    const { data, error } = await supabase
      .from("invoices")
      .select(`
        id,
        invoice_number,
        client_name,
        amount,
        amount_paid,
        date_created,
        due_date,
        status,
        client_id
      `)
      .order("date_created", { ascending: false })

    if (error) {
      console.error("Error fetching invoices:", error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error("Error in getInvoices:", error)
    throw error
  }
}

export async function updateInvoice(id: string, formData: FormData) {
  try {
    console.log("🔄 Updating invoice:", id)

    const updates = {
      client_id: formData.get("clientId"),
      date_issued: formData.get("dateIssued"),
      status: formData.get("status"),
      payment_method: formData.get("paymentMethod") || null,
      date_paid: formData.get("datePaid") || null,
      lead_type: formData.get("leadType") || null,
      quantity: Number.parseInt(formData.get("quantity") as string),
      unit_price: Number.parseFloat(formData.get("unitPrice") as string),
      amount:
        Number.parseInt(formData.get("quantity") as string) * Number.parseFloat(formData.get("unitPrice") as string),
      amount_paid: Number.parseFloat(formData.get("amountPaid") as string) || 0,
      order_description: formData.get("orderDescription") || null,
      updated_at: new Date().toISOString(),
    }

    console.log("📝 Update data:", updates)

    const { data, error } = await supabase.from("invoices").update(updates).eq("id", id).select().single()

    if (error) {
      console.error("❌ Error updating invoice:", error)
      throw error
    }

    console.log("✅ Invoice updated successfully:", data)
    return data
  } catch (error) {
    console.error("❌ Error in updateInvoice:", error)
    throw error
  }
}

export async function deleteInvoice(id: string) {
  try {
    const { error } = await supabase.from("invoices").delete().eq("id", id)

    if (error) {
      console.error("Error deleting invoice:", error)
      throw error
    }

    return { success: true }
  } catch (error) {
    console.error("Error in deleteInvoice:", error)
    throw error
  }
}

export async function createInvoice(formData: FormData) {
  try {
    console.log("🆕 Creating new invoice...")

    // Generate invoice number
    const invoiceNumber = `INV-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`

    const invoiceData = {
      invoice_number: invoiceNumber,
      client_id: formData.get("clientId"),
      date_issued: formData.get("dateIssued"),
      amount:
        Number.parseInt(formData.get("quantity") as string) * Number.parseFloat(formData.get("unitPrice") as string),
      amount_paid: 0, // Default to 0 for new invoices
      status: formData.get("status") || "Unpaid",
      payment_method: formData.get("paymentMethod") || null,
      date_paid: formData.get("datePaid") || null,
      lead_type: formData.get("leadType") || null,
      quantity: Number.parseInt(formData.get("quantity") as string),
      unit_price: Number.parseFloat(formData.get("unitPrice") as string),
      order_description: formData.get("orderDescription") || null,
      created_at: new Date().toISOString(),
    }

    console.log("📝 Invoice data:", invoiceData)

    const { data, error } = await supabase.from("invoices").insert([invoiceData]).select().single()

    if (error) {
      console.error("❌ Error creating invoice:", error)
      throw error
    }

    console.log("✅ Invoice created successfully:", data)
    return data
  } catch (error) {
    console.error("❌ Error in createInvoice:", error)
    throw error
  }
}

export async function getClients() {
  try {
    const { data, error } = await supabase.from("clients").select("id, company_name").order("company_name")

    if (error) {
      console.error("Error fetching clients:", error)
      throw error
    }

    return data || []
  } catch (error) {
    console.error("Error in getClients:", error)
    throw error
  }
}
