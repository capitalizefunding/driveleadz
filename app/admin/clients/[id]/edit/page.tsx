"use client"

import type React from "react"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"

type Client = Database["public"]["Tables"]["clients"]["Row"]

export default function EditClientPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    company_name: "",
    contact_name: "",
    email: "",
    phone: "",
    address: "",
    industry: "",
    status: "Active",
    client_number: "",
    sales_vertical: "",
    years_active: "",
    sales_strategy: "",
    sales_reps: "",
    preferred_industries: [] as string[],
    restricted_industries: [] as string[],
    products: [] as string[],
    notes: "",
  })

  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    async function fetchClient() {
      setLoading(true)

      const { data, error } = await supabase.from("clients").select("*").eq("id", params.id).single()

      if (error) {
        setError(`Error fetching client: ${error.message}`)
      } else if (data) {
        setClient(data)
        setFormData({
          company_name: data.company_name || "",
          contact_name: data.contact_name || "",
          email: data.email || "",
          phone: data.phone || "",
          address: data.address || "",
          industry: data.industry || "",
          status: data.status || "Active",
          client_number: data.client_number || "",
          sales_vertical: data.sales_vertical || "",
          years_active: data.years_active || "",
          sales_strategy: data.sales_strategy || "",
          sales_reps: data.sales_reps || "",
          preferred_industries: data.preferred_industries || [],
          restricted_industries: data.restricted_industries || [],
          products: data.products || [],
          notes: data.notes || "",
        })
      }

      setLoading(false)
    }

    fetchClient()
  }, [params.id, supabase])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)

    try {
      const { error } = await supabase.from("clients").update(formData).eq("id", params.id)

      if (error) throw error

      router.push("/admin/clients")
    } catch (error: any) {
      setError(`Error updating client: ${error.message}`)
      setSaving(false)
    }
  }

  if (loading) {
    return <div className="flex justify-center p-8">Loading client data...</div>
  }

  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#05E0E9]">Edit Client: {client?.company_name}</h1>
        <button
          onClick={() => router.push("/admin/clients")}
          className="flex items-center bg-gray-200 text-black font-bold py-2 px-6 rounded-full"
        >
          Back to Clients
        </button>
      </div>

      <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h2 className="text-xl font-bold text-[#05E0E9] mb-4">Company Information</h2>

            <div className="mb-4">
              <label className="block text-sm font-bold mb-2" htmlFor="company_name">
                Company Name
              </label>
              <input
                type="text"
                id="company_name"
                name="company_name"
                value={formData.company_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-bold mb-2" htmlFor="industry">
                Industry
              </label>
              <input
                type="text"
                id="industry"
                name="industry"
                value={formData.industry}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-bold mb-2" htmlFor="address">
                Address
              </label>
              <input
                type="text"
                id="address"
                name="address"
                value={formData.address}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-bold mb-2" htmlFor="client_number">
                Client Number
              </label>
              <input
                type="text"
                id="client_number"
                name="client_number"
                value={formData.client_number}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-bold mb-2" htmlFor="status">
                Status
              </label>
              <select
                id="status"
                name="status"
                value={formData.status}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              >
                <option value="Active">Active</option>
                <option value="Inactive">Inactive</option>
              </select>
            </div>
          </div>

          <div>
            <h2 className="text-xl font-bold text-[#05E0E9] mb-4">Contact Information</h2>

            <div className="mb-4">
              <label className="block text-sm font-bold mb-2" htmlFor="contact_name">
                Contact Name
              </label>
              <input
                type="text"
                id="contact_name"
                name="contact_name"
                value={formData.contact_name}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-bold mb-2" htmlFor="email">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
                required
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-bold mb-2" htmlFor="phone">
                Phone
              </label>
              <input
                type="text"
                id="phone"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <h2 className="text-xl font-bold text-[#05E0E9] mb-4">Sales Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="mb-4">
              <label className="block text-sm font-bold mb-2" htmlFor="sales_vertical">
                Sales Vertical
              </label>
              <input
                type="text"
                id="sales_vertical"
                name="sales_vertical"
                value={formData.sales_vertical}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-bold mb-2" htmlFor="years_active">
                Years Active
              </label>
              <input
                type="text"
                id="years_active"
                name="years_active"
                value={formData.years_active}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-bold mb-2" htmlFor="sales_strategy">
                Sales Strategy
              </label>
              <input
                type="text"
                id="sales_strategy"
                name="sales_strategy"
                value={formData.sales_strategy}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>

            <div className="mb-4">
              <label className="block text-sm font-bold mb-2" htmlFor="sales_reps">
                Sales Reps
              </label>
              <input
                type="text"
                id="sales_reps"
                name="sales_reps"
                value={formData.sales_reps}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>

        <div className="mt-6">
          <label className="block text-sm font-bold mb-2" htmlFor="notes">
            Notes
          </label>
          <textarea
            id="notes"
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            className="w-full px-3 py-2 border border-gray-300 rounded-md"
            rows={4}
          />
        </div>

        <div className="mt-8 flex justify-end">
          <button
            type="button"
            onClick={() => router.push("/admin/clients")}
            className="mr-4 px-6 py-2 border border-gray-300 rounded-full"
          >
            Cancel
          </button>
          <button type="submit" disabled={saving} className="bg-[#05E0E9] text-black font-bold py-2 px-6 rounded-full">
            {saving ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  )
}
