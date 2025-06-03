"use client"

import { useState, useEffect } from "react"
import { getRevenueData, getRevenueStats } from "@/app/actions/revenue"

interface RevenueData {
  totalSales: number
  totalRevenue: number
  paidInvoices: number
  paidRevenue: number
  topClients: Array<{ name: string; revenue: number }>
  revenueByLeadType: Array<{ type: string; revenue: number }>
  monthlyRevenueData: Array<{ month: string; revenue: number }>
  unpaidInvoices: number
  unpaidRevenue: number
}

interface RevenueStats {
  paid: { count: number; amount: number }
  unpaid: { count: number; amount: number }
  overdue: { count: number; amount: number }
}

export default function RevenuePage() {
  const [revenueData, setRevenueData] = useState<RevenueData | null>(null)
  const [revenueStats, setRevenueStats] = useState<RevenueStats | null>(null)
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [loading, setLoading] = useState(true)

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount)
  }

  const formatMonth = (monthKey: string) => {
    const [year, month] = monthKey.split("-")
    const date = new Date(Number.parseInt(year), Number.parseInt(month) - 1)
    return date.toLocaleDateString("en-US", { month: "short", year: "numeric" })
  }

  const loadData = async () => {
    setLoading(true)
    try {
      const [data, stats] = await Promise.all([
        getRevenueData(startDate || undefined, endDate || undefined),
        getRevenueStats(startDate || undefined, endDate || undefined),
      ])
      setRevenueData(data)
      setRevenueStats(stats)
    } catch (error) {
      console.error("Error loading revenue data:", error)
    } finally {
      setLoading(false)
    }
  }

  const handleApplyDateRange = () => {
    loadData()
  }

  const handleResetDateRange = () => {
    setStartDate("")
    setEndDate("")
    // Load all-time data
    getRevenueData().then(setRevenueData)
    getRevenueStats().then(setRevenueStats)
  }

  useEffect(() => {
    loadData()
  }, [])

  if (loading || !revenueData || !revenueStats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-lg">Loading revenue data...</div>
      </div>
    )
  }

  const dateRangeText =
    startDate && endDate
      ? `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`
      : "All Time"

  return (
    <div>
      <h1 className="text-2xl font-bold mb-6 text-[#05E0E9]">Revenue</h1>

      {/* Date Range Filter */}
      <div className="bg-sidebar p-6 rounded-lg shadow mb-8">
        <h2 className="text-lg font-bold mb-4">Date Range Filter</h2>
        <div className="flex flex-wrap items-center gap-4">
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">From:</label>
            <input
              type="date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#05E0E9]"
            />
          </div>
          <div className="flex items-center gap-2">
            <label className="text-sm font-medium">To:</label>
            <input
              type="date"
              value={endDate}
              onChange={(e) => setEndDate(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-[#05E0E9]"
            />
          </div>
          <button
            onClick={handleApplyDateRange}
            className="px-4 py-2 bg-[#05E0E9] text-white rounded-md hover:bg-[#04C7CF] transition-colors"
          >
            Apply Range
          </button>
          <button
            onClick={handleResetDateRange}
            className="px-4 py-2 bg-gray-500 text-white rounded-md hover:bg-gray-600 transition-colors"
          >
            Reset to All Time
          </button>
        </div>
        <div className="mt-3 text-sm text-gray-600">
          Currently showing: <span className="font-medium">{dateRangeText}</span>
        </div>
      </div>

      {/* Main Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-sidebar p-6 rounded-lg shadow">
          <h2 className="text-lg font-bold mb-2">Total Sales</h2>
          <p className="text-3xl font-bold text-[#05E0E9]">{revenueData.totalSales}</p>
          <p className="text-sm text-gray-600 mt-2">{dateRangeText} invoices</p>
        </div>

        <div className="bg-sidebar p-6 rounded-lg shadow">
          <h2 className="text-lg font-bold mb-2">Total Revenue</h2>
          <p className="text-3xl font-bold text-[#05E0E9]">{formatCurrency(revenueData.totalRevenue)}</p>
          <p className="text-sm text-gray-600 mt-2">{dateRangeText} revenue</p>
        </div>

        <div className="bg-sidebar p-6 rounded-lg shadow">
          <h2 className="text-lg font-bold mb-2">Paid Invoices</h2>
          <p className="text-3xl font-bold text-[#05E0E9]">{revenueData.paidInvoices}</p>
          <p className="text-sm text-gray-600 mt-2">Successfully collected</p>
        </div>

        <div className="bg-sidebar p-6 rounded-lg shadow">
          <h2 className="text-lg font-bold mb-2">Paid Revenue</h2>
          <p className="text-3xl font-bold text-[#05E0E9]">{formatCurrency(revenueData.paidRevenue)}</p>
          <p className="text-sm text-gray-600 mt-2">Revenue collected</p>
        </div>
      </div>

      {/* Invoice Status Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-sidebar p-6 rounded-lg shadow">
          <h2 className="text-lg font-bold mb-2 text-green-600">Paid</h2>
          <p className="text-2xl font-bold">{revenueStats.paid.count} invoices</p>
          <p className="text-lg font-semibold text-green-600">{formatCurrency(revenueStats.paid.amount)}</p>
        </div>

        <div className="bg-sidebar p-6 rounded-lg shadow">
          <h2 className="text-lg font-bold mb-2 text-yellow-600">Unpaid</h2>
          <p className="text-2xl font-bold">{revenueStats.unpaid.count} invoices</p>
          <p className="text-lg font-semibold text-yellow-600">{formatCurrency(revenueStats.unpaid.amount)}</p>
        </div>

        <div className="bg-sidebar p-6 rounded-lg shadow">
          <h2 className="text-lg font-bold mb-2 text-red-600">Overdue</h2>
          <p className="text-2xl font-bold">{revenueStats.overdue.count} invoices</p>
          <p className="text-lg font-semibold text-red-600">{formatCurrency(revenueStats.overdue.amount)}</p>
        </div>
      </div>

      {/* Detailed Analytics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Top Clients by Revenue */}
        <div className="bg-sidebar p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Top Clients by Revenue</h2>
          {revenueData.topClients.length > 0 ? (
            <div className="space-y-3">
              {revenueData.topClients.map((client, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 border-b border-gray-200 last:border-b-0"
                >
                  <div className="flex items-center">
                    <span className="w-6 h-6 bg-[#05E0E9] text-white rounded-full flex items-center justify-center text-sm font-bold mr-3">
                      {index + 1}
                    </span>
                    <span className="font-medium">{client.name}</span>
                  </div>
                  <span className="font-bold text-[#05E0E9]">{formatCurrency(client.revenue)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No paid invoices in this date range</p>
          )}
        </div>

        {/* Revenue by Lead Type */}
        <div className="bg-sidebar p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">Revenue by Lead Type</h2>
          {revenueData.revenueByLeadType.length > 0 ? (
            <div className="space-y-3">
              {revenueData.revenueByLeadType.map((item, index) => (
                <div
                  key={index}
                  className="flex justify-between items-center p-3 border-b border-gray-200 last:border-b-0"
                >
                  <span className="font-medium">{item.type}</span>
                  <span className="font-bold text-[#05E0E9]">{formatCurrency(item.revenue)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-gray-500 italic">No lead type data available for this date range</p>
          )}
        </div>
      </div>

      {/* Monthly Revenue Trend */}
      {revenueData.monthlyRevenueData.length > 0 && (
        <div className="bg-sidebar p-6 rounded-lg shadow">
          <h2 className="text-xl font-bold mb-4">
            Monthly Revenue Trend {startDate && endDate ? `(${dateRangeText})` : "(Last 6 Months)"}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
            {revenueData.monthlyRevenueData.map((month, index) => (
              <div key={index} className="text-center p-4 border border-gray-200 rounded-lg">
                <p className="text-sm font-medium text-gray-600">{formatMonth(month.month)}</p>
                <p className="text-lg font-bold text-[#05E0E9]">{formatCurrency(month.revenue)}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Summary Section */}
      <div className="bg-sidebar p-6 rounded-lg shadow mt-6">
        <h2 className="text-xl font-bold mb-4">Revenue Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h3 className="text-lg font-bold mb-3">Key Metrics</h3>
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span>Average Invoice Value:</span>
                <span className="font-bold">
                  {revenueData.totalSales > 0
                    ? formatCurrency(revenueData.totalRevenue / revenueData.totalSales)
                    : "$0"}
                </span>
              </li>
              <li className="flex justify-between">
                <span>Collection Rate:</span>
                <span className="font-bold">
                  {revenueData.totalSales > 0
                    ? Math.round((revenueData.paidInvoices / revenueData.totalSales) * 100)
                    : 0}
                  %
                </span>
              </li>
              <li className="flex justify-between">
                <span>Outstanding Amount:</span>
                <span className="font-bold text-yellow-600">{formatCurrency(revenueData.unpaidRevenue)}</span>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="text-lg font-bold mb-3">Quick Stats</h3>
            <ul className="space-y-2">
              <li className="flex justify-between">
                <span>Active Clients:</span>
                <span className="font-bold">{revenueData.topClients.length}</span>
              </li>
              <li className="flex justify-between">
                <span>Lead Types:</span>
                <span className="font-bold">{revenueData.revenueByLeadType.length}</span>
              </li>
              <li className="flex justify-between">
                <span>Unpaid Invoices:</span>
                <span className="font-bold text-red-600">{revenueData.unpaidInvoices}</span>
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
