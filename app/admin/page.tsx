"use client"

import type React from "react"

import { useState, useEffect } from "react"

export default function AdminDashboard() {
  const [stats, setStats] = useState({
    clientCount: 0,
    liveLeadCount: 0,
    revenue: 0,
  })
  const [pendingInvoices, setPendingInvoices] = useState([])
  const [topClients, setTopClients] = useState([])
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    async function fetchDashboardData() {
      setIsLoading(true)
      try {
        const clientsResponse = await fetch("/api/dashboard/clients-count")
        const clientsData = await clientsResponse.json()

        const leadsResponse = await fetch("/api/dashboard/live-leads-count")
        const leadsData = await leadsResponse.json()

        const revenueResponse = await fetch("/api/dashboard/revenue")
        const revenueData = await revenueResponse.json()

        const pendingInvoicesResponse = await fetch("/api/dashboard/pending-invoices")
        const pendingInvoicesData = await pendingInvoicesResponse.json()

        const topClientsResponse = await fetch("/api/dashboard/top-clients")
        const topClientsData = await topClientsResponse.json()

        setStats({
          clientCount: clientsData.count || 0,
          liveLeadCount: leadsData.count || 0,
          revenue: revenueData.total || 0,
        })

        setPendingInvoices(pendingInvoicesData.invoices || [])
        setTopClients(topClientsData.clients || [])
      } catch (error) {
        console.error("Error fetching dashboard data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
  }, [])

  const formatDate = (dateString) => {
    if (!dateString) return "No date"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
  }

  return (
    <div style={{ width: "100%", fontFamily: "Arial, sans-serif" }}>
      {/* Title */}
      <h1
        style={{
          fontSize: "32px",
          fontWeight: "bold",
          marginBottom: "32px",
          color: "#05E0E9",
        }}
      >
        Home
      </h1>

      {/* Stats Cards */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))",
          gap: "24px",
          marginBottom: "32px",
        }}
      >
        <StatsCard title="Active Clients" value={stats.clientCount.toString()} subtitle="Clients with Active status" />
        <StatsCard title="Total Leads" value={stats.liveLeadCount.toLocaleString()} subtitle="Live leads" />
        <StatsCard
          title="Collected Revenue"
          value={`$${stats.revenue.toLocaleString(undefined, {
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          })}`}
          subtitle="From paid invoices"
        />
      </div>

      {/* Two Column Layout */}
      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fit, minmax(400px, 1fr))",
          gap: "32px",
        }}
      >
        {/* Pending Invoices */}
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <h2 style={{ fontSize: "24px", fontWeight: "bold", color: "#000000" }}>Pending Invoices</h2>
            <a
              href="/admin/invoices"
              style={{
                fontSize: "14px",
                color: "#05E0E9",
                textDecoration: "none",
              }}
              onMouseOver={(e) => (e.currentTarget.style.textDecoration = "underline")}
              onMouseOut={(e) => (e.currentTarget.style.textDecoration = "none")}
            >
              View All
            </a>
          </div>
          <ContentCard>
            {isLoading ? (
              <div style={{ textAlign: "center", padding: "32px", color: "#000000" }}>Loading...</div>
            ) : pendingInvoices.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {pendingInvoices.map((invoice, index) => (
                  <div
                    key={invoice.id}
                    style={{
                      paddingBottom: index < pendingInvoices.length - 1 ? "16px" : "0",
                      borderBottom: index < pendingInvoices.length - 1 ? "1px solid #d1d5db" : "none",
                    }}
                  >
                    <div style={{ fontWeight: "bold", color: "#000000", marginBottom: "4px" }}>
                      Invoice #{invoice.invoice_number}
                    </div>
                    <div style={{ fontSize: "14px", color: "#000000", marginBottom: "8px" }}>
                      {invoice.client_name || "Unknown Client"}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <div style={{ fontSize: "12px", color: "#6b7280" }}>
                        Created: {formatDate(invoice.created_at)}
                      </div>
                      <div style={{ fontSize: "12px", color: "#6b7280" }}>
                        ${Number(invoice.amount || 0).toFixed(2)}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "32px", color: "#000000" }}>No pending invoices</div>
            )}
          </ContentCard>
        </div>

        {/* Top Clients */}
        <div>
          <div
            style={{
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: "16px",
            }}
          >
            <h2 style={{ fontSize: "24px", fontWeight: "bold", color: "#000000" }}>Top Clients</h2>
            <a
              href="/admin/clients"
              style={{
                fontSize: "14px",
                color: "#05E0E9",
                textDecoration: "none",
              }}
              onMouseOver={(e) => (e.currentTarget.style.textDecoration = "underline")}
              onMouseOut={(e) => (e.currentTarget.style.textDecoration = "none")}
            >
              View All
            </a>
          </div>
          <ContentCard>
            {isLoading ? (
              <div style={{ textAlign: "center", padding: "32px", color: "#000000" }}>Loading...</div>
            ) : topClients.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
                {topClients.map((client, index) => (
                  <div
                    key={client.id}
                    style={{
                      paddingBottom: index < topClients.length - 1 ? "16px" : "0",
                      borderBottom: index < topClients.length - 1 ? "1px solid #d1d5db" : "none",
                    }}
                  >
                    <div style={{ fontWeight: "bold", color: "#000000", marginBottom: "8px" }}>
                      {client.company_name}
                    </div>
                    <div style={{ display: "flex", justifyContent: "space-between" }}>
                      <div style={{ fontSize: "12px", color: "#6b7280" }}>Total Leads: {client.lead_count}</div>
                      <a
                        href={`/admin/clients/${client.id}`}
                        style={{
                          fontSize: "12px",
                          color: "#05E0E9",
                          textDecoration: "none",
                        }}
                        onMouseOver={(e) => (e.currentTarget.style.textDecoration = "underline")}
                        onMouseOut={(e) => (e.currentTarget.style.textDecoration = "none")}
                      >
                        View Details
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div style={{ textAlign: "center", padding: "32px", color: "#000000" }}>No clients found</div>
            )}
          </ContentCard>
        </div>
      </div>
    </div>
  )
}

function StatsCard({ title, value, subtitle }: { title: string; value: string; subtitle: string }) {
  return (
    <div
      style={{
        backgroundColor: "#E9EDF2",
        padding: "24px",
        borderRadius: "8px",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
      }}
    >
      <h3 style={{ fontSize: "18px", fontWeight: "bold", marginBottom: "8px", color: "#000000" }}>{title}</h3>
      <div style={{ fontSize: "36px", fontWeight: "bold", color: "#05E0E9", marginBottom: "8px" }}>{value}</div>
      <div style={{ fontSize: "14px", color: "#6b7280" }}>{subtitle}</div>
    </div>
  )
}

function ContentCard({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        backgroundColor: "#E9EDF2",
        padding: "24px",
        borderRadius: "8px",
        boxShadow: "0 1px 3px 0 rgba(0, 0, 0, 0.1)",
      }}
    >
      {children}
    </div>
  )
}
