"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { createClientComponentClient } from "@supabase/auth-helpers-nextjs"
import type { Database } from "@/types/supabase"

type Client = Database["public"]["Tables"]["clients"]["Row"]

export default function ClientPage({ params }: { params: { id: string } }) {
  const router = useRouter()
  const [client, setClient] = useState<Client | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClientComponentClient<Database>()

  useEffect(() => {
    async function fetchClient() {
      setLoading(true)

      const { data, error } = await supabase.from("clients").select("*").eq("id", params.id).single()

      if (error) {
        setError(`Error fetching client: ${error.message}`)
      } else if (data) {
        setClient(data)
      }

      setLoading(false)
    }

    fetchClient()
  }, [params.id, supabase])

  if (loading) {
    return <div className="flex justify-center p-8">Loading client data...</div>
  }

  if (error) {
    return <div className="text-red-500 p-4">Error: {error}</div>
  }

  if (!client) {
    return <div className="p-4">Client not found.</div>
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-[#05E0E9]">Client: {client.company_name}</h1>
        <div className="flex space-x-4">
          <button
            onClick={() => router.push("/admin/clients")}
            className="bg-gray-200 text-black font-bold py-2 px-6 rounded-full"
          >
            Back to Clients
          </button>
          <Link
            href={`/admin/clients/${client.id}/edit`}
            className="bg-[#05E0E9] text-black font-bold py-2 px-6 rounded-full"
          >
            Edit Client
          </Link>
        </div>
      </div>

      <div className="bg-white p-6 rounded-lg shadow-md">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-[#05E0E9] mb-4">Company Information</h2>
              <div className="space-y-3">
                <div>
                  <span className="font-bold">Client Number:</span> {client.client_number}
                </div>
                <div>
                  <span className="font-bold">Company Name:</span> {client.company_name}
                </div>
                <div>
                  <span className="font-bold">Industry:</span> {client.industry || "N/A"}
                </div>
                <div>
                  <span className="font-bold">Address:</span> {client.address || "N/A"}
                </div>
                <div>
                  <span className="font-bold">Status:</span> {client.status}
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#05E0E9] mb-4">Contact Information</h2>
              <div className="space-y-3">
                <div>
                  <span className="font-bold">Contact Name:</span> {client.contact_name}
                </div>
                <div>
                  <span className="font-bold">Email:</span> {client.email}
                </div>
                <div>
                  <span className="font-bold">Phone:</span> {client.phone || "N/A"}
                </div>
              </div>
            </div>
          </div>

          <div>
            <div className="mb-6">
              <h2 className="text-xl font-bold text-[#05E0E9] mb-4">Sales Information</h2>
              <div className="space-y-3">
                <div>
                  <span className="font-bold">Sales Vertical:</span> {client.sales_vertical || "N/A"}
                </div>
                <div>
                  <span className="font-bold">Years Active:</span> {client.years_active || "N/A"}
                </div>
                <div>
                  <span className="font-bold">Sales Strategy:</span> {client.sales_strategy || "N/A"}
                </div>
                <div>
                  <span className="font-bold">Sales Reps:</span> {client.sales_reps || "N/A"}
                </div>
              </div>
            </div>

            <div>
              <h2 className="text-xl font-bold text-[#05E0E9] mb-4">Additional Information</h2>

              <div className="mb-4">
                <span className="font-bold">Preferred Industries:</span>
                <div className="mt-1">
                  {client.preferred_industries && client.preferred_industries.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {client.preferred_industries.map((industry, index) => (
                        <span key={index} className="bg-gray-100 px-2 py-1 rounded text-sm">
                          {industry}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-500">None specified</span>
                  )}
                </div>
              </div>

              <div className="mb-4">
                <span className="font-bold">Restricted Industries:</span>
                <div className="mt-1">
                  {client.restricted_industries && client.restricted_industries.length > 0 ? (
                    <div className="flex flex-wrap gap-2">
                      {client.restricted_industries.map((industry, index) => (
                        <span key={index} className="bg-gray-100 px-2 py-1 rounded text-sm">
                          {industry}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-gray-500">None specified</span>
                  )}
                </div>
              </div>

              <div>
                <span className="font-bold">Notes:</span>
                <p className="mt-1 p-2 bg-gray-50 rounded">{client.notes || "No notes available."}</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
