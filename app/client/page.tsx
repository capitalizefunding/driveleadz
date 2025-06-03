"use client"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import { getSupabaseClient } from "@/lib/supabaseClient"

export default function ClientDashboard() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({
    recentLeadCount: 0,
    totalLeadCount: 0,
    latestUploadDate: null,
    recentActivity: [],
  })
  const router = useRouter()

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
        fetchRealData(parsedUser)
      } catch (e) {
        console.error("Error parsing stored user:", e)
        setError(`Error parsing user data: ${e.message}`)
        setLoading(false)
      }
    } else {
      setLoading(false)
    }
  }, [])

  const fetchRealData = async (userData) => {
    if (!userData) {
      console.error("fetchRealData called with null or undefined userData")
      setLoading(false)
      return
    }

    try {
      const supabase = getSupabaseClient()
      let clientId = null

      // Method 1: Try to get client ID from localStorage
      if (userData.clientId) {
        clientId = userData.clientId
      }

      // Method 2: Try to get client ID from the clients table
      if (!clientId && userData.id) {
        const { data: clientData, error: clientError } = await supabase
          .from("clients")
          .select("id")
          .eq("user_id", userData.id)
          .limit(1)

        if (clientError) {
          console.error("Error fetching client by user_id:", clientError)
        } else if (clientData && clientData.length > 0) {
          clientId = clientData[0].id
        }
      }

      // Method 3: Try to get client ID from the email in clients table
      if (!clientId && userData.email) {
        const { data: clientData, error: clientError } = await supabase
          .from("clients")
          .select("id")
          .eq("email", userData.email)
          .limit(1)

        if (clientError) {
          console.error("Error fetching client by email:", clientError)
        } else if (clientData && clientData.length > 0) {
          clientId = clientData[0].id
        }
      }

      // If we still don't have a client ID, use default values
      if (!clientId) {
        console.log("Could not determine client ID, using default data")
        setStats({
          recentLeadCount: 0,
          totalLeadCount: 0,
          latestUploadDate: null,
          recentActivity: [],
        })
        setLoading(false)
        return
      }

      // Now fetch the real data from live_leads table
      const { data: liveLeads, error: liveLeadsError } = await supabase
        .from("live_leads")
        .select("*")
        .eq("client_id", clientId)
        .order("created_at", { ascending: false })

      if (liveLeadsError) {
        console.error("Error fetching live leads:", liveLeadsError)
        setStats({
          recentLeadCount: 0,
          totalLeadCount: 0,
          latestUploadDate: null,
          recentActivity: [],
        })
        setLoading(false)
        return
      }

      // If no leads, use default values
      if (!liveLeads || liveLeads.length === 0) {
        console.log("No live leads found for client")
        setStats({
          recentLeadCount: 0,
          totalLeadCount: 0,
          latestUploadDate: null,
          recentActivity: [],
        })
        setLoading(false)
        return
      }

      // Process the real data
      const latestUploadDate = new Date(liveLeads[0].created_at)
      const totalLeadCount = liveLeads.length

      // Get recent lead count (last 30 days)
      const thirtyDaysAgo = new Date()
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30)

      const recentLeads = liveLeads.filter((lead) => new Date(lead.created_at) >= thirtyDaysAgo)
      const recentLeadCount = recentLeads.length

      // Get recent activity (last 3 leads)
      const recentActivity = liveLeads.slice(0, 3).map((lead, index) => ({
        id: lead.id,
        leadId: `L${String(index + 1).padStart(3, "0")}`,
        name: lead.company_name || "Unnamed Lead",
        date: new Date(lead.created_at),
        message: `Lead #L${String(index + 1).padStart(3, "0")}: ${lead.company_name || "Unnamed Lead"}`,
      }))

      // Update the stats with real data
      setStats({
        recentLeadCount,
        totalLeadCount,
        latestUploadDate,
        recentActivity,
      })
    } catch (error) {
      console.error("Error fetching real data:", error)
      setError(`Error fetching real data: ${error.message}`)
      setStats({
        recentLeadCount: 0,
        totalLeadCount: 0,
        latestUploadDate: null,
        recentActivity: [],
      })
    } finally {
      setLoading(false)
    }
  }

  // Format date as MM/DD
  const formatDate = (date) => {
    if (!date) return "N/A"
    return `${date.getMonth() + 1}/${date.getDate()}`
  }

  // Format time difference
  const formatTimeAgo = (date) => {
    if (!date) return "N/A"
    const now = new Date()
    const diffInHours = Math.floor((now - date) / (1000 * 60 * 60))

    if (diffInHours < 1) return "Just now"
    if (diffInHours < 24) return `${diffInHours} hour${diffInHours > 1 ? "s" : ""} ago`

    const diffInDays = Math.floor(diffInHours / 24)
    if (diffInDays === 1) return "Yesterday"
    if (diffInDays < 7) return `${diffInDays} days ago`

    return date.toLocaleDateString()
  }

  if (loading) {
    return <div className="flex items-center justify-center min-h-screen">Loading...</div>
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-[#05E0E9]">Home</h1>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-6">
          <p className="font-bold">Error</p>
          <p>{error}</p>
          <button
            className="mt-2 bg-red-200 hover:bg-red-300 text-red-800 font-bold py-1 px-2 rounded"
            onClick={() => window.location.reload()}
          >
            Refresh Page
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-sidebar p-6 rounded-lg shadow">
          <h2 className="text-lg font-bold mb-2">Recent Leadz</h2>
          <p className="text-3xl font-bold text-[#05E0E9]">{stats.recentLeadCount}</p>
          <p className="text-sm text-gray-600 mt-2">Lead lists available</p>
        </div>

        <div className="bg-sidebar p-6 rounded-lg shadow">
          <h2 className="text-lg font-bold mb-2">Total Leads</h2>
          <p className="text-3xl font-bold text-[#05E0E9]">{stats.totalLeadCount.toLocaleString()}</p>
          <p className="text-sm text-gray-600 mt-2">Individual leads</p>
        </div>

        <div className="bg-sidebar p-6 rounded-lg shadow">
          <h2 className="text-lg font-bold mb-2">Latest Upload</h2>
          <p className="text-3xl font-bold text-[#05E0E9]">{formatDate(stats.latestUploadDate)}</p>
          <p className="text-sm text-gray-600 mt-2">Last upload date</p>
        </div>
      </div>

      <div className="mt-8">
        <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
        <div className="bg-sidebar p-6 rounded-lg shadow">
          {stats.recentActivity.length > 0 ? (
            <ul className="space-y-4">
              {stats.recentActivity.map((activity, index) => (
                <li
                  key={activity.id}
                  className={index < stats.recentActivity.length - 1 ? "pb-4 border-b border-gray-200" : ""}
                >
                  <p className="font-bold">New Lead Available</p>
                  <p className="text-sm">{activity.message}</p>
                  <p className="text-xs text-gray-600">{formatTimeAgo(activity.date)}</p>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-center py-4">No recent activity</p>
          )}
        </div>
      </div>
    </div>
  )
}
