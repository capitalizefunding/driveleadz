"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabaseClient"

export default function NewClientPage() {
  const router = useRouter()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState("")
  const [formData, setFormData] = useState({
    client_number: "",
    company_name: "",
    contact_name: "",
    email: "",
    status: "Active",
    phone: "",
    address: "",
    industry: "",
    sales_vertical: "",
    years_active: "",
    sales_strategy: "",
    sales_reps: "",
    preferred_industries: "",
    restricted_industries: "",
    products: "",
    notes: "",
  })

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setIsSubmitting(true)
    setError("")

    try {
      const supabase = getSupabaseClient()

      // Format array fields
      const formattedData = {
        ...formData,
        preferred_industries: formData.preferred_industries ? formData.preferred_industries.split(",") : [],
        restricted_industries: formData.restricted_industries ? formData.restricted_industries.split(",") : [],
        products: formData.products ? formData.products.split(",") : [],
      }

      // Insert client
      const { data: client, error: clientError } = await supabase
        .from("clients")
        .insert(formattedData)
        .select()
        .single()

      if (clientError) throw clientError

      // Create default marketing channels
      const { error: marketingError } = await supabase.from("marketing_channels").insert({
        client_id: client.id,
        social_media_ads: false,
        paid_ads: false,
        seo: false,
        automated_sales_sequences: false,
        sms_marketing: false,
        content_marketing: false,
        ai_sales_agents: false,
        cold_email: false,
      })

      if (marketingError) throw marketingError

      // Create default sales tools
      const { error: salesToolsError } = await supabase.from("sales_tools").insert({
        client_id: client.id,
        sales_collateral: false,
        automated_outreach: false,
        interactive_calculators: false,
        email_templates: false,
        cold_calling_scripts: false,
        sales_process: false,
        crm_system: false,
      })

      if (salesToolsError) throw salesToolsError

      // Redirect to clients page
      router.push("/admin/clients")
    } catch (error) {
      console.error("Error creating client:", error)
      setError(error.message || "An error occurred while creating the client")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-[#05E0E9]">Add New Client</h1>
        <button onClick={() => router.push("/admin/clients")} className="px-4 py-2 bg-gray-200 rounded-[28px]">
          Cancel
        </button>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-bold mb-2">Client Number *</label>
            <input
              type="text"
              name="client_number"
              value={formData.client_number}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Company Name *</label>
            <input
              type="text"
              name="company_name"
              value={formData.company_name}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Contact Name *</label>
            <input
              type="text"
              name="contact_name"
              value={formData.contact_name}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Email *</label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Status *</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            >
              <option value="Active">Active</option>
              <option value="Inactive">Inactive</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Phone</label>
            <input
              type="text"
              name="phone"
              value={formData.phone}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-bold mb-2">Address</label>
          <input
            type="text"
            name="address"
            value={formData.address}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-bold mb-2">Industry</label>
            <input
              type="text"
              name="industry"
              value={formData.industry}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Sales Vertical</label>
            <input
              type="text"
              name="sales_vertical"
              value={formData.sales_vertical}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Years Active</label>
            <input
              type="text"
              name="years_active"
              value={formData.years_active}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-bold mb-2">Sales Strategy</label>
            <input
              type="text"
              name="sales_strategy"
              value={formData.sales_strategy}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Sales Reps</label>
            <input
              type="text"
              name="sales_reps"
              value={formData.sales_reps}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
          <div>
            <label className="block text-sm font-bold mb-2">Preferred Industries (comma separated)</label>
            <input
              type="text"
              name="preferred_industries"
              value={formData.preferred_industries}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Healthcare, Construction, Food Service"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Restricted Industries (comma separated)</label>
            <input
              type="text"
              name="restricted_industries"
              value={formData.restricted_industries}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="Trucking, Automotive Sales, Law Firms"
            />
          </div>
          <div>
            <label className="block text-sm font-bold mb-2">Products (comma separated)</label>
            <input
              type="text"
              name="products"
              value={formData.products}
              onChange={handleChange}
              className="w-full p-2 border border-gray-300 rounded"
              placeholder="New Cars, Used Cars, Service"
            />
          </div>
        </div>

        <div className="mb-6">
          <label className="block text-sm font-bold mb-2">Notes</label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="w-full p-2 border border-gray-300 rounded"
            rows={4}
          ></textarea>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={isSubmitting}
            className="bg-[#05E0E9] text-black font-bold py-2 px-6 rounded-[28px] disabled:opacity-50"
          >
            {isSubmitting ? "Creating..." : "Create Client"}
          </button>
        </div>
      </form>
    </div>
  )
}
