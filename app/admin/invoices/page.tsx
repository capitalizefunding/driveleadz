"use client"

import type React from "react"
import { useState, useEffect, useRef } from "react"
import Image from "next/image"
import Modal from "@/components/modal"
import Pagination from "@/components/pagination"
import { createInvoice, getClients, updateInvoice } from "@/app/actions/invoices"
import InvoiceTemplate from "@/components/invoice-template"
import { useRouter } from "next/navigation"

export default function InvoicesPage() {
  const [currentPage, setCurrentPage] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [clientFilter, setClientFilter] = useState<string | null>(null)
  const [statusFilter, setStatusFilter] = useState<string | null>(null)
  const [dateRangeFilter, setDateRangeFilter] = useState({
    startDate: "",
    endDate: "",
  })
  const [amountFilter, setAmountFilter] = useState({
    min: "",
    max: "",
  })
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null)
  const [isViewModalOpen, setIsViewModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [invoices, setInvoices] = useState([])
  const [totalCount, setTotalCount] = useState(0)
  const [totalPages, setTotalPages] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [isNewInvoiceModalOpen, setIsNewInvoiceModalOpen] = useState(false)
  const [clients, setClients] = useState([])
  const [newInvoice, setNewInvoice] = useState({
    clientId: "",
    dateIssued: new Date().toISOString().split("T")[0],
    status: "Unpaid" as "Paid" | "Unpaid" | "Overdue",
    paymentMethod: "",
    datePaid: "",
    leadType: "",
    quantity: "1",
    unitPrice: "",
    orderDescription: "",
  })
  const [editInvoice, setEditInvoice] = useState({
    id: "",
    clientId: "",
    dateIssued: "",
    status: "Unpaid" as "Paid" | "Unpaid" | "Overdue",
    paymentMethod: "",
    datePaid: "",
    leadType: "",
    quantity: "1",
    unitPrice: "",
    orderDescription: "",
    amountPaid: "0",
  })
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [errorMessage, setErrorMessage] = useState("")
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false)
  const invoiceTemplateRef = useRef<HTMLDivElement>(null)
  const router = useRouter()

  useEffect(() => {
    async function initializeAndFetch() {
      await fetchInvoices()
      await fetchClients()
    }

    initializeAndFetch()
  }, [currentPage, searchTerm, clientFilter, dateRangeFilter, amountFilter, statusFilter])

  async function fetchInvoices() {
    setIsLoading(true)

    try {
      console.log("🔍 Fetching invoices via API...")

      // Build query parameters
      const params = new URLSearchParams({
        page: currentPage.toString(),
        searchTerm: searchTerm,
      })

      if (clientFilter) params.append("clientFilter", clientFilter)
      if (statusFilter) params.append("statusFilter", statusFilter)
      if (dateRangeFilter.startDate) params.append("startDate", dateRangeFilter.startDate)
      if (dateRangeFilter.endDate) params.append("endDate", dateRangeFilter.endDate)
      if (amountFilter.min) params.append("minAmount", amountFilter.min)
      if (amountFilter.max) params.append("maxAmount", amountFilter.max)

      const response = await fetch(`/api/admin/invoices?${params}`)

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const result = await response.json()
      console.log("📊 API response:", result)

      // Transform the data to match the expected format
      const formattedInvoices = result.invoices.map((invoice) => ({
        id: invoice.id,
        invoiceNumber: invoice.invoice_number,
        clientName: invoice.clients?.company_name || "Unknown Client",
        dateIssued: invoice.date_issued,
        amount: Number.parseFloat(invoice.amount) || 0,
        amountPaid: Number.parseFloat(invoice.amount_paid) || 0,
        status: invoice.status || "Unpaid",
        paymentMethod: invoice.payment_method,
        datePaid: invoice.date_paid,
        leadType: invoice.lead_type,
        quantity: invoice.quantity,
        unitPrice: Number.parseFloat(invoice.unit_price) || 0,
        orderDescription: invoice.order_description || "No description",
        clients: invoice.clients,
        clientId: invoice.client_id,
      }))

      setInvoices(formattedInvoices)
      setTotalCount(result.totalCount)
      setTotalPages(result.totalPages)
      console.log("✅ Invoices loaded:", formattedInvoices.length)
    } catch (error) {
      console.error("❌ Error in fetchInvoices:", error)
      setInvoices([])
      setTotalCount(0)
      setTotalPages(0)
    } finally {
      setIsLoading(false)
    }
  }

  async function fetchClients() {
    try {
      const clientsData = await getClients()
      setClients(clientsData)
    } catch (error) {
      console.error("❌ Error fetching clients:", error)
    }
  }

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  const resetFilters = () => {
    setClientFilter(null)
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

  const handleViewInvoice = (invoice: any) => {
    setSelectedInvoice(invoice)
    setIsViewModalOpen(true)
  }

  const handleEditInvoice = (invoice: any) => {
    setEditInvoice({
      id: invoice.id,
      clientId: invoice.clientId,
      dateIssued: invoice.dateIssued,
      status: invoice.status,
      paymentMethod: invoice.paymentMethod || "",
      datePaid: invoice.datePaid || "",
      leadType: invoice.leadType || "",
      quantity: invoice.quantity?.toString() || "1",
      unitPrice: invoice.unitPrice?.toString() || "",
      orderDescription: invoice.orderDescription || "",
      amountPaid: invoice.amountPaid?.toString() || "0",
    })
    setIsEditModalOpen(true)
  }

  const handleDownloadInvoice = async (invoice: any) => {
    localStorage.setItem("downloadInvoice", JSON.stringify(invoice))
    router.push("/admin/invoices/download")
  }

  const exportInvoices = () => {
    alert("Exporting invoices to CSV...")
  }

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setNewInvoice((prev) => ({ ...prev, [name]: value }))
  }

  const handleEditInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target
    setEditInvoice((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmitInvoice = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage("")

    if (!newInvoice.clientId) {
      setErrorMessage("Client is required.")
      setIsSubmitting(false)
      return
    }

    if (!newInvoice.dateIssued) {
      setErrorMessage("Date Issued is required.")
      setIsSubmitting(false)
      return
    }

    if (newInvoice.status === "Paid" && !newInvoice.datePaid) {
      setErrorMessage("Date Paid is required when the status is Paid.")
      setIsSubmitting(false)
      return
    }

    if (!newInvoice.quantity) {
      setErrorMessage("Quantity is required.")
      setIsSubmitting(false)
      return
    }

    if (!newInvoice.unitPrice) {
      setErrorMessage("Unit Price is required.")
      setIsSubmitting(false)
      return
    }

    try {
      const formData = new FormData()
      Object.entries(newInvoice).forEach(([key, value]) => {
        formData.append(key, value.toString())
      })

      await createInvoice(formData)

      setNewInvoice({
        clientId: "",
        dateIssued: new Date().toISOString().split("T")[0],
        status: "Unpaid" as "Paid" | "Unpaid" | "Overdue",
        paymentMethod: "",
        datePaid: "",
        leadType: "",
        quantity: "1",
        unitPrice: "",
        orderDescription: "",
      })
      setIsNewInvoiceModalOpen(false)

      // Refresh the invoices list
      await fetchInvoices()
    } catch (error) {
      console.error("Error creating invoice:", error)
      setErrorMessage("Failed to create invoice. Please ensure all fields are valid.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const handleUpdateInvoice = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)
    setErrorMessage("")

    if (!editInvoice.clientId) {
      setErrorMessage("Client is required.")
      setIsSubmitting(false)
      return
    }

    if (!editInvoice.dateIssued) {
      setErrorMessage("Date Issued is required.")
      setIsSubmitting(false)
      return
    }

    if (editInvoice.status === "Paid" && !editInvoice.datePaid) {
      setErrorMessage("Date Paid is required when the status is Paid.")
      setIsSubmitting(false)
      return
    }

    if (!editInvoice.quantity) {
      setErrorMessage("Quantity is required.")
      setIsSubmitting(false)
      return
    }

    if (!editInvoice.unitPrice) {
      setErrorMessage("Unit Price is required.")
      setIsSubmitting(false)
      return
    }

    const totalAmount = Number(editInvoice.quantity) * Number(editInvoice.unitPrice)
    const amountPaid = Number(editInvoice.amountPaid)

    if (amountPaid > totalAmount) {
      setErrorMessage("Amount paid cannot be greater than the total amount.")
      setIsSubmitting(false)
      return
    }

    try {
      const formData = new FormData()
      Object.entries(editInvoice).forEach(([key, value]) => {
        formData.append(key, value.toString())
      })

      await updateInvoice(editInvoice.id, formData)

      setIsEditModalOpen(false)

      // Refresh the invoices list
      await fetchInvoices()
    } catch (error) {
      console.error("Error updating invoice:", error)
      setErrorMessage("Failed to update invoice. Please ensure all fields are valid.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#05E0E9] mb-6">Invoices</h1>

      {/* Search and New Invoice */}
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

        <div className="flex space-x-4">
          <button
            onClick={() => setIsNewInvoiceModalOpen(true)}
            className="bg-[#05E0E9] text-black py-2 px-6 rounded-full"
          >
            New Invoice
          </button>
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
            <div className="w-[25%] text-[16px] font-bold text-[#05E0E9]">Client</div>
            <div className="w-[35%] text-[16px] font-bold text-[#05E0E9]">Order Description</div>
            <div className="w-[20%] text-[16px] font-bold text-[#05E0E9]">Amount</div>
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
                    <div className="w-[20%]">{invoice.dateIssued}</div>
                    <div className="w-[25%]">{invoice.clientName}</div>
                    <div className="w-[35%]">{invoice.orderDescription}</div>
                    <div className="w-[20%] font-medium">${invoice.amount.toLocaleString()}</div>
                  </div>
                  <div className="w-[40%] flex justify-end space-x-4">
                    <button onClick={() => handleViewInvoice(invoice)} className="flex items-center text-[14px]">
                      <Image src="/images/view-icon.png" alt="View" width={20} height={20} className="mr-1" />
                      <span className="text-black">View</span>
                    </button>
                    <button onClick={() => handleEditInvoice(invoice)} className="flex items-center text-[14px]">
                      <Image src="/images/edit-icon-new.png" alt="Edit" width={20} height={20} className="mr-1" />
                      <span className="text-black">Edit</span>
                    </button>
                    <button
                      onClick={() => handleDownloadInvoice(invoice)}
                      className="flex items-center text-[14px]"
                      disabled={isGeneratingPdf}
                    >
                      <Image src="/images/download-icon.png" alt="Download" width={20} height={20} className="mr-1" />
                      <span className="text-black">{isGeneratingPdf ? "Generating..." : "Download"}</span>
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
            <label className="modal-form-label">Client</label>
            <select
              value={clientFilter || ""}
              onChange={(e) => setClientFilter(e.target.value || null)}
              className="modal-form-select"
            >
              <option value="">All Clients</option>
              {clients.map((client) => (
                <option key={client.id} value={client.company_name}>
                  {client.company_name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="modal-form-label">Status</label>
            <select
              value={statusFilter || ""}
              onChange={(e) => setStatusFilter(e.target.value || null)}
              className="modal-form-select"
            >
              <option value="">All Statuses</option>
              <option value="Paid">Paid</option>
              <option value="Unpaid">Unpaid</option>
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

      {/* New Invoice Modal */}
      <Modal
        isOpen={isNewInvoiceModalOpen}
        onClose={() => setIsNewInvoiceModalOpen(false)}
        title="Create New Invoice"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleSubmitInvoice} className="space-y-4">
          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="modal-form-label">Client</label>
              <select
                name="clientId"
                value={newInvoice.clientId}
                onChange={handleInputChange}
                required
                className="modal-form-select"
              >
                <option value="" disabled>
                  Select a Client
                </option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.company_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="modal-form-label">Date Issued</label>
              <input
                type="date"
                name="dateIssued"
                value={newInvoice.dateIssued}
                onChange={handleInputChange}
                required
                className="modal-form-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="modal-form-label">Status</label>
              <select
                name="status"
                value={newInvoice.status}
                onChange={handleInputChange}
                required
                className="modal-form-select"
              >
                <option value="Unpaid">Unpaid</option>
                <option value="Paid">Paid</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>

            <div>
              <label className="modal-form-label">Payment Method</label>
              <select
                name="paymentMethod"
                value={newInvoice.paymentMethod}
                onChange={handleInputChange}
                className="modal-form-select"
              >
                <option value="">Select Payment Method</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Check">Check</option>
                <option value="Cash">Cash</option>
              </select>
            </div>

            {newInvoice.status === "Paid" && (
              <div>
                <label className="modal-form-label">Date Paid</label>
                <input
                  type="date"
                  name="datePaid"
                  value={newInvoice.datePaid}
                  onChange={handleInputChange}
                  className="modal-form-input"
                />
              </div>
            )}
          </div>

          <div>
            <label className="modal-form-label">Lead Type</label>
            <select
              name="leadType"
              value={newInvoice.leadType}
              onChange={handleInputChange}
              className="modal-form-select"
            >
              <option value="">Select Lead Type</option>
              <option value="Intent Leads">Intent Leads</option>
              <option value="Live Leads">Live Leads</option>
              <option value="Submission Leads">Submission Leads</option>
              <option value="Aged Leads">Aged Leads</option>
              <option value="Custom Leads">Custom Leads</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="modal-form-label">Quantity</label>
              <input
                type="number"
                name="quantity"
                value={newInvoice.quantity}
                onChange={handleInputChange}
                required
                min="1"
                className="modal-form-input"
              />
            </div>

            <div>
              <label className="modal-form-label">Unit Price ($)</label>
              <input
                type="number"
                name="unitPrice"
                value={newInvoice.unitPrice}
                onChange={handleInputChange}
                required
                min="0.01"
                step="0.01"
                className="modal-form-input"
              />
            </div>
          </div>

          <div>
            <label className="modal-form-label">Order Description</label>
            <textarea
              name="orderDescription"
              value={newInvoice.orderDescription}
              onChange={handleInputChange}
              className="modal-form-textarea h-24"
              placeholder="Enter a description of the order..."
            ></textarea>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button
              type="button"
              onClick={() => setIsNewInvoiceModalOpen(false)}
              className="modal-btn-secondary font-normal"
            >
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="modal-btn-primary font-normal">
              {isSubmitting ? "Creating..." : "Create Invoice"}
            </button>
          </div>
        </form>
      </Modal>

      {/* Edit Invoice Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Invoice"
        maxWidth="max-w-2xl"
      >
        <form onSubmit={handleUpdateInvoice} className="space-y-4">
          {errorMessage && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <span className="block sm:inline">{errorMessage}</span>
            </div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="modal-form-label">Client</label>
              <select
                name="clientId"
                value={editInvoice.clientId}
                onChange={handleEditInputChange}
                required
                className="modal-form-select"
              >
                <option value="" disabled>
                  Select a Client
                </option>
                {clients.map((client) => (
                  <option key={client.id} value={client.id}>
                    {client.company_name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="modal-form-label">Date Issued</label>
              <input
                type="date"
                name="dateIssued"
                value={editInvoice.dateIssued}
                onChange={handleEditInputChange}
                required
                className="modal-form-input"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="modal-form-label">Status</label>
              <select
                name="status"
                value={editInvoice.status}
                onChange={handleEditInputChange}
                required
                className="modal-form-select"
              >
                <option value="Unpaid">Unpaid</option>
                <option value="Paid">Paid</option>
                <option value="Overdue">Overdue</option>
              </select>
            </div>

            <div>
              <label className="modal-form-label">Payment Method</label>
              <select
                name="paymentMethod"
                value={editInvoice.paymentMethod}
                onChange={handleEditInputChange}
                className="modal-form-select"
              >
                <option value="">Select Payment Method</option>
                <option value="Credit Card">Credit Card</option>
                <option value="Bank Transfer">Bank Transfer</option>
                <option value="Check">Check</option>
                <option value="Cash">Cash</option>
              </select>
            </div>

            {editInvoice.status === "Paid" && (
              <div>
                <label className="modal-form-label">Date Paid</label>
                <input
                  type="date"
                  name="datePaid"
                  value={editInvoice.datePaid}
                  onChange={handleEditInputChange}
                  className="modal-form-input"
                />
              </div>
            )}
          </div>

          <div>
            <label className="modal-form-label">Lead Type</label>
            <select
              name="leadType"
              value={editInvoice.leadType}
              onChange={handleEditInputChange}
              className="modal-form-select"
            >
              <option value="">Select Lead Type</option>
              <option value="Intent Leads">Intent Leads</option>
              <option value="Live Leads">Live Leads</option>
              <option value="Submission Leads">Submission Leads</option>
              <option value="Aged Leads">Aged Leads</option>
              <option value="Custom Leads">Custom Leads</option>
            </select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="modal-form-label">Quantity</label>
              <input
                type="number"
                name="quantity"
                value={editInvoice.quantity}
                onChange={handleEditInputChange}
                required
                min="1"
                className="modal-form-input"
              />
            </div>

            <div>
              <label className="modal-form-label">Unit Price ($)</label>
              <input
                type="number"
                name="unitPrice"
                value={editInvoice.unitPrice}
                onChange={handleEditInputChange}
                required
                min="0.01"
                step="0.01"
                className="modal-form-input"
              />
            </div>

            <div>
              <label className="modal-form-label">Amount Paid ($)</label>
              <input
                type="number"
                name="amountPaid"
                value={editInvoice.amountPaid}
                onChange={handleEditInputChange}
                min="0"
                step="0.01"
                className="modal-form-input"
                placeholder="0.00"
              />
            </div>
          </div>

          <div>
            <label className="modal-form-label">Order Description</label>
            <textarea
              name="orderDescription"
              value={editInvoice.orderDescription}
              onChange={handleEditInputChange}
              className="modal-form-textarea h-24"
              placeholder="Enter a description of the order..."
            ></textarea>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <button type="button" onClick={() => setIsEditModalOpen(false)} className="modal-btn-secondary font-normal">
              Cancel
            </button>
            <button type="submit" disabled={isSubmitting} className="modal-btn-primary font-normal">
              {isSubmitting ? "Updating..." : "Update Invoice"}
            </button>
          </div>
        </form>
      </Modal>

      {/* View Invoice Modal */}
      {selectedInvoice && (
        <Modal
          isOpen={isViewModalOpen}
          onClose={() => setIsViewModalOpen(false)}
          title={`Invoice ${selectedInvoice.invoiceNumber}`}
          maxWidth="max-w-4xl"
        >
          <InvoiceTemplate
            invoice={{
              id: selectedInvoice.id,
              invoice_number: selectedInvoice.invoiceNumber,
              date_issued: selectedInvoice.dateIssued,
              amount: selectedInvoice.amount,
              amount_paid: selectedInvoice.amountPaid,
              status: selectedInvoice.status,
              payment_method: selectedInvoice.paymentMethod,
              date_paid: selectedInvoice.datePaid,
              lead_type: selectedInvoice.leadType,
              quantity: selectedInvoice.quantity,
              unit_price: selectedInvoice.unitPrice,
              order_description: selectedInvoice.orderDescription,
              clients: {
                id: selectedInvoice.clients?.id || "",
                company_name: selectedInvoice.clientName,
              },
            }}
          />

          <div className="flex justify-end mt-6">
            <button
              onClick={() => handleDownloadInvoice(selectedInvoice)}
              disabled={isGeneratingPdf}
              className="px-4 py-2 rounded flex items-center text-[#05E0E9]"
            >
              <Image src="/images/download-icon.png" alt="Download" width={20} height={20} className="mr-2" />
              {isGeneratingPdf ? "Generating PDF..." : "Download PDF"}
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
