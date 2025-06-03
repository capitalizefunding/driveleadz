"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Modal from "@/components/modal"
import Pagination from "@/components/pagination"
import { getSupabaseClient } from "@/lib/supabaseClient"

interface Invoice {
  id: string
  invoice_number: string
  date_issued: string
  amount: number
  amount_paid: number
  status: string | null
  payment_method: string | null
  date_paid: string | null
  lead_type: string | null
  quantity: number | null
  unit_price: number | null
  order_description: string | null
  client_id: string
  client_name: string
}

interface User {
  id: string
  email: string
  role: string
}

export default function ClientInvoicesPage() {
  const [invoices, setInvoices] = useState<Invoice[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<Invoice | null>(null)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [user, setUser] = useState<User | null>(null)
  const [clientId, setClientId] = useState<string | null>(null)
  const [clientName, setClientName] = useState<string | null>(null)
  const itemsPerPage = 10

  // Filter states
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [dateRangeFilter, setDateRangeFilter] = useState({
    startDate: "",
    endDate: "",
  })
  const [amountFilter, setAmountFilter] = useState({
    min: "",
    max: "",
  })

  useEffect(() => {
    // Get user from localStorage
    const storedUser = localStorage.getItem("user")
    if (storedUser) {
      try {
        const parsedUser = JSON.parse(storedUser)
        setUser(parsedUser)
        fetchClientId(parsedUser)
      } catch (e) {
        console.error("Error parsing stored user:", e)
      }
    }
  }, [])

  const fetchClientId = async (user: User) => {
    try {
      const supabase = getSupabaseClient()
      const { data: clientData, error: clientError } = await supabase
        .from("clients")
        .select("id, company_name, email")
        .ilike("email", user.email)
        .single()

      if (clientError) {
        console.error("Error fetching client data:", clientError)
        return
      }

      if (clientData?.id) {
        setClientId(clientData.id)
        setClientName(clientData.company_name)
        console.log("✅ Client found:", clientData)
      }
    } catch (error) {
      console.error("Error in fetchClientId:", error)
    }
  }

  useEffect(() => {
    if (clientId) {
      fetchInvoices()
    }
  }, [clientId, currentPage, searchTerm, statusFilter, dateRangeFilter, amountFilter])

  const fetchInvoices = async () => {
    if (!clientId) {
      console.log("❌ No clientId available")
      return
    }

    setIsLoading(true)

    try {
      const url = `/api/client/invoices?clientId=${clientId}`
      console.log("🔍 Fetching invoices from API:", url)

      const response = await fetch(url)
      console.log("📊 Response status:", response.status)
      console.log("📊 Response ok:", response.ok)

      const result = await response.json()
      console.log("📊 API response:", result)

      if (!response.ok) {
        throw new Error(result.error || "Failed to fetch invoices")
      }

      // Transform the data to include client name and convert string amounts to numbers
      const transformedInvoices = result.data.map((invoice: any) => ({
        ...invoice,
        amount: typeof invoice.amount === "string" ? Number.parseFloat(invoice.amount) : invoice.amount,
        amount_paid:
          typeof invoice.amount_paid === "string"
            ? Number.parseFloat(invoice.amount_paid || "0")
            : invoice.amount_paid || 0,
        unit_price:
          typeof invoice.unit_price === "string"
            ? Number.parseFloat(invoice.unit_price || "0")
            : invoice.unit_price || 0,
        client_name: clientName || "Client",
      }))

      console.log("✅ Transformed invoices:", transformedInvoices)
      console.log("📊 Setting state with:", transformedInvoices.length, "invoices")

      setInvoices(transformedInvoices)
      setTotalCount(result.count || 0)
      setTotalPages(result.count ? Math.ceil(result.count / itemsPerPage) : 1)
    } catch (error) {
      console.error("❌ Error in fetchInvoices:", error)
      setInvoices([])
    } finally {
      setIsLoading(false)
    }
  }

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  const handleViewInvoice = (invoice: Invoice) => {
    setSelectedInvoice(invoice)
    setIsViewModalOpen(true)
  }

  const resetFilters = () => {
    setStatusFilter(null)
    setDateRangeFilter({ startDate: "", endDate: "" })
    setAmountFilter({ min: "", max: "" })
    setCurrentPage(1)
    setIsFilterModalOpen(false)
  }

  const applyFilters = () => {
    setCurrentPage(1)
    setIsFilterModalOpen(false)
  }

  const exportInvoices = () => {
    // Create CSV content
    const headers = ["Invoice Number", "Date", "Description", "Amount", "Status"]
    const csvContent = [
      headers.join(","),
      ...invoices.map((invoice) =>
        [
          invoice.invoice_number,
          invoice.date_issued,
          invoice.order_description || "N/A",
          invoice.amount,
          invoice.status || "Pending",
        ].join(","),
      ),
    ].join("\n")

    // Create and download the file
    const blob = new Blob([csvContent], { type: "text/csv" })
    const url = window.URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url
    a.download = "my_invoices.csv"
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
    window.URL.revokeObjectURL(url)
  }

  const formatDate = (dateString: string | null) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    })
  }

  if (!user) {
    return (
      <div className="flex-1 p-8">
        <div className="flex justify-center items-center h-64">
          <div className="text-lg">Please log in to view invoices.</div>
        </div>
      </div>
    )
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#05E0E9] mb-6">Invoices</h1>

      {/* Search Section */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative w-full max-w-[360px]">
          <input
            type="text"
            placeholder="Search invoices"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-full border border-gray-300 w-full"
          />
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              className="h-5 w-5 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              />
            </svg>
          </div>
        </div>
      </div>

      {/* Invoice History Title */}
      <div className="mb-2">
        <h2 className="text-xl font-bold text-[#05E0E9]">Invoice History</h2>
      </div>

      {/* Filter/Export Buttons */}
      <div className="flex justify-end mb-1">
        <div className="flex space-x-4">
          <button
            className="flex items-center px-4 py-1 hover:text-[#05E0E9]"
            onClick={() => setIsFilterModalOpen(true)}
          >
            <Image src="/images/filter-icon-new.png" alt="Filter" width={20} height={20} className="mr-2" />
            <span>Filter</span>
          </button>

          <button className="flex items-center px-4 py-1 hover:text-[#05E0E9]" onClick={exportInvoices}>
            <Image src="/images/export-icon-new.png" alt="Export" width={20} height={20} className="mr-2" />
            <span>Export</span>
          </button>
        </div>
      </div>

      {/* Table-like header */}
      <div className="p-2 rounded-t-lg bg-white px-8">
        <div className="flex">
          <div className="w-[60%] flex">
            <div className="w-[20%] text-[16px] font-bold text-[#05E0E9]">Date</div>
            <div className="w-[35%] text-[16px] font-bold text-[#05E0E9]">Order Description</div>
            <div className="w-[20%] text-[16px] font-bold text-[#05E0E9]">Amount</div>
            <div className="w-[25%] text-[16px] font-bold text-[#05E0E9]">Status</div>
          </div>
        </div>
      </div>

      {/* Invoices List View */}
      <div className="rounded-b-lg overflow-hidden mb-6">
        {isLoading ? (
          <div className="bg-white p-6 text-center">
            <p className="text-gray-500">Loading invoices...</p>
          </div>
        ) : (
          <>
            {invoices.map((invoice) => (
              <div key={invoice.id} className="bg-white p-2 px-8">
                <div className="flex items-center">
                  <div className="w-[60%] flex">
                    <div className="w-[20%]">{formatDate(invoice.date_issued)}</div>
                    <div className="w-[35%]">{invoice.order_description || "N/A"}</div>
                    <div className="w-[20%] font-medium">${invoice.amount.toLocaleString()}</div>
                    <div className="w-[25%]">{invoice.status || "Pending"}</div>
                  </div>
                  <div className="w-[40%] flex justify-end space-x-4">
                    <button onClick={() => handleViewInvoice(invoice)} className="flex items-center text-[14px]">
                      <Image src="/images/view-icon.png" alt="View" width={20} height={20} className="mr-1" />
                      <span className="text-black">View</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}

            {invoices.length === 0 && (
              <div className="bg-white p-6 text-center">
                <p className="text-gray-500">No invoices found</p>
              </div>
            )}
          </>
        )}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        totalItems={totalCount}
        itemName="invoices"
        onPageChange={handlePageChange}
      />

      {/* Filter Modal */}
      <Modal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title="Filter Invoices"
        maxWidth="max-w-sm"
      >
        <div className="space-y-4">
          <div>
            <label className="modal-form-label">Status</label>
            <select
              value={statusFilter || ""}
              onChange={(e) => setStatusFilter(e.target.value || null)}
              className="modal-form-select"
            >
              <option value="">All Statuses</option>
              <option value="Pending">Pending</option>
              <option value="Paid">Paid</option>
              <option value="Overdue">Overdue</option>
            </select>
          </div>

          <div>
            <label className="modal-form-label">Date</label>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <input
                  type="date"
                  value={dateRangeFilter.startDate}
                  onChange={(e) => setDateRangeFilter({ ...dateRangeFilter, startDate: e.target.value })}
                  className="modal-form-input"
                  placeholder="mm/dd/yyyy"
                />
              </div>
              <div className="relative">
                <input
                  type="date"
                  value={dateRangeFilter.endDate}
                  onChange={(e) => setDateRangeFilter({ ...dateRangeFilter, endDate: e.target.value })}
                  className="modal-form-input"
                  placeholder="mm/dd/yyyy"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="modal-form-label">Amount</label>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={amountFilter.min}
                  onChange={(e) => setAmountFilter({ ...amountFilter, min: e.target.value })}
                  className="modal-form-input pl-8"
                  placeholder="Minimum"
                />
              </div>
              <div className="relative">
                <span className="absolute left-2 top-1/2 transform -translate-y-1/2 text-gray-500">$</span>
                <input
                  type="number"
                  value={amountFilter.max}
                  onChange={(e) => setAmountFilter({ ...amountFilter, max: e.target.value })}
                  className="modal-form-input pl-8"
                  placeholder="Maximum"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button onClick={resetFilters} className="modal-btn-secondary font-normal">
              Reset
            </button>
            <button onClick={applyFilters} className="modal-btn-primary font-normal">
              Apply Filters
            </button>
          </div>
        </div>
      </Modal>

      {/* View Invoice Modal */}
      {selectedInvoice && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title={`Invoice ${selectedInvoice.invoice_number}`}
          maxWidth="max-w-2xl"
        >
          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Invoice Number</p>
                <p className="font-medium">{selectedInvoice.invoice_number}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Date Issued</p>
                <p className="font-medium">{formatDate(selectedInvoice.date_issued)}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Amount</p>
                <p className="font-medium">${selectedInvoice.amount.toLocaleString()}</p>
              </div>
              <div>
                <p className="text-sm text-gray-500">Amount Paid</p>
                <p className="font-medium">${selectedInvoice.amount_paid?.toLocaleString() || "0.00"}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-gray-500">Status</p>
                <p
                  className={`font-medium ${
                    selectedInvoice.status === "Paid"
                      ? "text-green-600"
                      : selectedInvoice.status === "Overdue"
                        ? "text-red-600"
                        : "text-yellow-600"
                  }`}
                >
                  {selectedInvoice.status || "Pending"}
                </p>
              </div>
              {selectedInvoice.status === "Paid" && (
                <div>
                  <p className="text-sm text-gray-500">Date Paid</p>
                  <p className="font-medium">{formatDate(selectedInvoice.date_paid)}</p>
                </div>
              )}
            </div>

            {selectedInvoice.lead_type && (
              <div>
                <p className="text-sm text-gray-500">Lead Type</p>
                <p className="font-medium">{selectedInvoice.lead_type}</p>
              </div>
            )}

            {selectedInvoice.quantity && selectedInvoice.unit_price && (
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm text-gray-500">Quantity</p>
                  <p className="font-medium">{selectedInvoice.quantity}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-500">Unit Price</p>
                  <p className="font-medium">${selectedInvoice.unit_price.toLocaleString()}</p>
                </div>
              </div>
            )}

            {selectedInvoice.order_description && (
              <div>
                <p className="text-sm text-gray-500">Order Description</p>
                <p className="font-medium">{selectedInvoice.order_description}</p>
              </div>
            )}

            <div className="pt-4 flex justify-end">
              <button
                onClick={() => setIsViewModalOpen(false)}
                className="px-4 py-2 bg-[#05E0E9] text-black rounded-lg hover:bg-opacity-90"
              >
                Close
              </button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  )
}
