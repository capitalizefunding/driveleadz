"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import Modal from "@/components/modal"
import { getLiveLeads, createLiveLead, updateLiveLead, deleteLiveLead } from "@/app/actions/live-leads"
// Add any missing imports if needed

export default function AdminLeadzPage() {
  // Live Leads State
  const [liveLeads, setLiveLeads] = useState([])
  const [liveLeadsCurrentPage, setLiveLeadsCurrentPage] = useState(1)
  const [liveLeadsSearchTerm, setLiveLeadsSearchTerm] = useState("")
  const [liveLeadsTotalPages, setLiveLeadsTotalPages] = useState(1)
  const [liveLeadsTotalItems, setLiveLeadsTotalItems] = useState(0)
  const [selectedLiveLeadClientId, setSelectedLiveLeadClientId] = useState("")
  const [isLiveLeadsLoading, setIsLiveLeadsLoading] = useState(false)
  const [liveLeadsError, setLiveLeadsError] = useState("")
  const [clients, setClients] = useState([])
  const [isLoadingClients, setIsLoadingClients] = useState(false)

  // Lead Type Selection Modal State
  const [isLeadTypeModalOpen, setIsLeadTypeModalOpen] = useState(false)
  const [selectedLeadType, setSelectedLeadType] = useState("")

  // Live Leads Modal State
  const [isAddLiveLeadModalOpen, setIsAddLiveLeadModalOpen] = useState(false)
  const [isEditLiveLeadModalOpen, setIsEditLiveLeadModalOpen] = useState(false)
  const [isDeleteLiveLeadModalOpen, setIsDeleteLiveLeadModalOpen] = useState(false)
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)
  const [selectedLiveLead, setSelectedLiveLead] = useState(null)
  const [liveLeadFormData, setLiveLeadFormData] = useState({
    company_name: "",
    owner_name: "",
    phone: "",
    mobile: "",
    email: "",
    address: "",
    city: "",
    state: "",
    zip_code: "",
    industry: "",
    monthly_revenue: "",
    date: new Date().toISOString().split("T")[0],
    lead_type: "",
    client_id: "",
    // Additional fields for Submission Leads
    inception_date: "",
    federal_tax_id: "",
    date_of_birth: "",
    social_security: "",
  })

  // Filter Modal State
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    industry: "",
    minRevenue: "",
    maxRevenue: "",
    clientId: "",
  })
  const [filteredLeads, setFilteredLeads] = useState([])
  const [isFiltering, setIsFiltering] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    fetchClients()
    fetchLiveLeads()
  }, [liveLeadsCurrentPage, liveLeadsSearchTerm, selectedLiveLeadClientId])

  const fetchClients = async () => {
    setIsLoadingClients(true)
    try {
      console.log("🔍 Frontend: Starting fetchClients function...")

      const response = await fetch("/api/clients")
      console.log("📡 Frontend: API response status:", response.status)
      console.log("📡 Frontend: API response ok:", response.ok)

      if (!response.ok) {
        const errorText = await response.text()
        console.error("❌ Frontend: API response not ok:", errorText)
        setLiveLeadsError(`API error: ${response.status} - ${errorText}`)
        setClients([])
        return []
      }

      const clientsData = await response.json()
      console.log("📊 Frontend: API response data:")
      console.log("- Data:", clientsData)
      console.log("- Data type:", typeof clientsData)
      console.log("- Is array:", Array.isArray(clientsData))
      console.log("- Data length:", clientsData?.length)

      // Check if it's an error response
      if (clientsData.error) {
        console.error("❌ Frontend: API returned error:", clientsData.error)
        setLiveLeadsError(`API error: ${clientsData.error}`)
        setClients([])
        return []
      }

      if (!Array.isArray(clientsData)) {
        console.error("❌ Frontend: API did not return an array:", clientsData)
        setLiveLeadsError("API returned invalid data format")
        setClients([])
        return []
      }

      if (clientsData.length === 0) {
        console.warn("⚠️ Frontend: API returned empty array")
        setLiveLeadsError("No clients found in database")
        setClients([])
        return []
      }

      console.log(`✅ Frontend: Successfully received ${clientsData.length} clients:`)
      clientsData.forEach((client, index) => {
        console.log(`  ${index + 1}. ${client.company_name} (ID: ${client.id})`)
      })

      setClients(clientsData)
      setLiveLeadsError("") // Clear any previous errors
      return clientsData
    } catch (error) {
      console.error("💥 Frontend: Exception in fetchClients:", error)
      console.error("💥 Frontend: Error stack:", error.stack)
      setLiveLeadsError(`Exception: ${error.message}`)
      setClients([])
      return []
    } finally {
      setIsLoadingClients(false)
    }
  }

  const fetchLiveLeads = async () => {
    setIsLiveLeadsLoading(true)
    setLiveLeadsError("")
    try {
      const result = await getLiveLeads(liveLeadsCurrentPage, liveLeadsSearchTerm, selectedLiveLeadClientId || null)

      // Format dates for display
      const formattedLeads = result.liveLeads.map((lead) => ({
        ...lead,
        formattedDate: new Date(lead.date).toLocaleDateString("en-CA"), // YYYY-MM-DD format
        formattedRevenue:
          typeof lead.monthly_revenue === "number"
            ? `$${lead.monthly_revenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : lead.monthly_revenue || "N/A",
      }))

      setLiveLeads(formattedLeads)
      setLiveLeadsTotalPages(result.totalPages)
      setLiveLeadsTotalItems(result.totalCount)

      // If we were filtering before, apply the filters to the new data
      if (isFiltering) {
        applyFiltersToData(filters, formattedLeads)
      }
    } catch (err) {
      console.error("Error fetching live leads:", err)
      setLiveLeadsError(`Failed to load live leads: ${err.message}`)
    } finally {
      setIsLiveLeadsLoading(false)
    }
  }

  const handleLiveLeadsPageChange = (pageNumber: number) => {
    setLiveLeadsCurrentPage(pageNumber)
  }

  const handleInfoClick = (lead) => {
    setSelectedLiveLead(lead)
    setIsInfoModalOpen(true)
  }

  const handleFilterChange = (e) => {
    const { name, value } = e.target
    setFilters({
      ...filters,
      [name]: value,
    })
  }

  // Helper function to apply filters to data
  const applyFiltersToData = (filterCriteria, dataToFilter) => {
    const filtered = dataToFilter.filter((lead) => {
      let passesFilter = true

      // Date range filter
      if (filterCriteria.dateFrom && filterCriteria.dateTo) {
        const leadDate = new Date(lead.date)
        const fromDate = new Date(filterCriteria.dateFrom)
        const toDate = new Date(filterCriteria.dateTo)
        toDate.setHours(23, 59, 59, 999) // Set to end of day

        if (leadDate < fromDate || leadDate > toDate) {
          passesFilter = false
        }
      } else if (filterCriteria.dateFrom) {
        const leadDate = new Date(lead.date)
        const fromDate = new Date(filterCriteria.dateFrom)

        if (leadDate < fromDate) {
          passesFilter = false
        }
      } else if (filterCriteria.dateTo) {
        const leadDate = new Date(lead.date)
        const toDate = new Date(filterCriteria.dateTo)
        toDate.setHours(23, 59, 59, 999) // Set to end of day

        if (leadDate > toDate) {
          passesFilter = false
        }
      }

      // Industry filter
      if (filterCriteria.industry && passesFilter) {
        if (!lead.industry || !lead.industry.toLowerCase().includes(filterCriteria.industry.toLowerCase())) {
          passesFilter = false
        }
      }

      // Revenue range filter
      if (filterCriteria.minRevenue && passesFilter) {
        const revenue = Number.parseFloat(lead.formattedRevenue?.replace(/[^0-9.-]+/g, ""))
        if (isNaN(revenue) || revenue < Number.parseFloat(filterCriteria.minRevenue)) {
          passesFilter = false
        }
      }

      if (filterCriteria.maxRevenue && passesFilter) {
        const revenue = Number.parseFloat(lead.formattedRevenue?.replace(/[^0-9.-]+/g, ""))
        if (isNaN(revenue) || revenue > Number.parseFloat(filterCriteria.maxRevenue)) {
          passesFilter = false
        }
      }

      // Client filter
      if (filterCriteria.clientId && passesFilter) {
        if (lead.client_id !== filterCriteria.clientId) {
          passesFilter = false
        }
      }

      return passesFilter
    })

    setFilteredLeads(filtered)
    return filtered
  }

  const applyFilters = () => {
    setIsFiltering(true)
    applyFiltersToData(filters, liveLeads)
    setIsFilterModalOpen(false)
  }

  const clearFilters = () => {
    setFilters({
      dateFrom: "",
      dateTo: "",
      industry: "",
      minRevenue: "",
      maxRevenue: "",
      clientId: "",
    })
    setIsFiltering(false)
    setFilteredLeads([])
  }

  const exportToCSV = () => {
    setIsExporting(true)
    try {
      // Determine which leads to export (filtered or all)
      const leadsToExport = isFiltering ? filteredLeads : liveLeads

      if (leadsToExport.length === 0) {
        alert("No leads to export")
        return
      }

      // Convert leads to CSV format
      const headers = [
        "Date",
        "Company",
        "Owner",
        "Mobile",
        "Email",
        "Phone",
        "Industry",
        "Monthly Revenue",
        "Address",
        "City",
        "State",
        "Zip",
        "Lead Type",
      ]

      const csvRows = [
        headers.join(","), // Header row
        ...leadsToExport.map((lead) =>
          [
            lead.formattedDate,
            `"${lead.company_name || ""}"`,
            `"${lead.owner_name || ""}"`,
            `"${lead.mobile || ""}"`,
            `"${lead.email || ""}"`,
            `"${lead.phone || ""}"`,
            `"${lead.industry || ""}"`,
            lead.formattedRevenue,
            `"${lead.address || ""}"`,
            `"${lead.city || ""}"`,
            `"${lead.state || ""}"`,
            `"${lead.zip_code || ""}"`,
            `"${lead.lead_type || ""}"`,
          ].join(","),
        ),
      ]

      const csvContent = csvRows.join("\n")

      // Create a blob and download link
      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" })
      const url = URL.createObjectURL(blob)
      const link = document.createElement("a")
      link.setAttribute("href", url)
      link.setAttribute("download", `live_leads_export_${new Date().toISOString().split("T")[0]}.csv`)
      link.style.visibility = "hidden"
      document.body.appendChild(link)
      link.click()
      document.body.removeChild(link)
    } catch (error) {
      console.error("Error exporting leads:", error)
      alert("Error exporting leads. Please try again.")
    } finally {
      setIsExporting(false)
    }
  }

  // Live Leads Functions
  const handleLiveLeadInputChange = (e) => {
    const { name, value } = e.target
    setLiveLeadFormData({
      ...liveLeadFormData,
      [name]: name === "monthly_revenue" ? Number.parseFloat(value) || "" : value,
    })
  }

  const handleAddLiveLeadSubmit = async (e) => {
    e.preventDefault()
    try {
      await createLiveLead(liveLeadFormData)
      setIsAddLiveLeadModalOpen(false)
      resetLiveLeadForm()
      fetchLiveLeads()
    } catch (err) {
      console.error("Error adding live lead:", err)
      setLiveLeadsError(`Failed to add live lead: ${err.message}`)
    }
  }

  const handleEditLiveLeadSubmit = async (e) => {
    e.preventDefault()
    try {
      await updateLiveLead(selectedLiveLead.id, liveLeadFormData)
      setIsEditLiveLeadModalOpen(false)
      resetLiveLeadForm()
      fetchLiveLeads()
    } catch (err) {
      console.error("Error updating live lead:", err)
      setLiveLeadsError(`Failed to update live lead: ${err.message}`)
    }
  }

  const handleDeleteLiveLeadConfirm = async () => {
    try {
      await deleteLiveLead(selectedLiveLead.id)
      setIsDeleteLiveLeadModalOpen(false)
      fetchLiveLeads()
    } catch (err) {
      console.error("Error deleting live lead:", err)
      setLiveLeadsError(`Failed to delete live lead: ${err.message}`)
    }
  }

  const openEditLiveLeadModal = (lead) => {
    setSelectedLiveLead(lead)
    setLiveLeadFormData({
      company_name: lead.company_name || "",
      owner_name: lead.owner_name || "",
      phone: lead.phone || "",
      mobile: lead.mobile || "",
      email: lead.email || "",
      address: lead.address || "",
      city: lead.city || "",
      state: lead.state || "",
      zip_code: lead.zip_code || "",
      industry: lead.industry || "",
      monthly_revenue: lead.monthly_revenue || "",
      date: lead.date ? new Date(lead.date).toISOString().split("T")[0] : "",
      lead_type: lead.lead_type || "",
      client_id: lead.client_id || "",
      inception_date: lead.inception_date || "",
      federal_tax_id: lead.federal_tax_id || "",
      date_of_birth: lead.date_of_birth || "",
      social_security: lead.social_security || "",
    })
    setIsEditLiveLeadModalOpen(true)
  }

  const openDeleteLiveLeadModal = (lead) => {
    setSelectedLiveLead(lead)
    setIsDeleteLiveLeadModalOpen(true)
  }

  const resetLiveLeadForm = () => {
    setLiveLeadFormData({
      company_name: "",
      owner_name: "",
      phone: "",
      mobile: "",
      email: "",
      address: "",
      city: "",
      state: "",
      zip_code: "",
      industry: "",
      monthly_revenue: "",
      date: new Date().toISOString().split("T")[0],
      lead_type: "",
      client_id: "",
      inception_date: "",
      federal_tax_id: "",
      date_of_birth: "",
      social_security: "",
    })
    setSelectedLiveLead(null)
  }

  const handleRefresh = () => {
    fetchLiveLeads()
  }

  const openLeadTypeModal = () => {
    setSelectedLeadType("")
    setIsLeadTypeModalOpen(true)
  }

  const handleLeadTypeSelect = () => {
    if (!selectedLeadType) {
      return
    }

    // Close the lead type modal
    setIsLeadTypeModalOpen(false)

    // Set the lead type in the form data
    setLiveLeadFormData({
      ...liveLeadFormData,
      lead_type: selectedLeadType,
    })

    // Fetch clients if needed
    if (clients.length === 0 && !isLoadingClients) {
      fetchClients()
    }

    // Open the add lead modal
    setIsAddLiveLeadModalOpen(true)
  }

  return (
    <div className="p-8">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-[#05E0E9]">Leadz</h1>
        <button onClick={openLeadTypeModal} className="bg-[#05E0E9] text-black px-6 py-3 rounded-full">
          Add New Lead
        </button>
      </div>

      {/* Search and Filter Section */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative max-w-[360px]">
          <input
            type="text"
            placeholder="Search leads"
            value={liveLeadsSearchTerm}
            onChange={(e) => setLiveLeadsSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-full border border-gray-300 w-[300px]"
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

        <div className="flex items-center space-x-4">
          <button
            className="flex items-center px-4 py-1 hover:text-[#05E0E9]"
            onClick={() => setIsFilterModalOpen(true)}
          >
            <Image src="/images/filter-icon-new.png" alt="Filter" width={20} height={20} className="mr-2" />
            <span>Filter</span>
            {isFiltering && <span className="ml-1 text-xs bg-[#05E0E9] text-white px-1 rounded">Active</span>}
          </button>

          <button
            className="flex items-center px-4 py-1 hover:text-[#05E0E9]"
            onClick={exportToCSV}
            disabled={isExporting}
          >
            <Image src="/images/export-icon-new.png" alt="Export" width={20} height={20} className="mr-2" />
            <span>{isExporting ? "Exporting..." : "Export"}</span>
          </button>
        </div>
      </div>

      {liveLeadsError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{liveLeadsError}</div>
      )}

      {isLiveLeadsLoading ? (
        <div className="text-center py-10">
          <p className="text-gray-500">Loading live leads...</p>
        </div>
      ) : liveLeads.length > 0 ? (
        <>
          {/* Live Leads Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr>
                  <th className="text-left text-[#05E0E9] pb-2">Date</th>
                  <th className="text-left text-[#05E0E9] pb-2">Company</th>
                  <th className="text-left text-[#05E0E9] pb-2">Owner</th>
                  <th className="text-left text-[#05E0E9] pb-2">Mobile</th>
                  <th className="text-left text-[#05E0E9] pb-2">Email</th>
                  <th className="text-left text-[#05E0E9] pb-2"></th>
                </tr>
              </thead>
              <tbody>
                {(isFiltering ? filteredLeads : liveLeads).map((lead, index) => (
                  <tr key={lead.id}>
                    <td className="py-3">{lead.formattedDate}</td>
                    <td className="py-3 truncate">{lead.company_name}</td>
                    <td className="py-3 truncate">{lead.owner_name}</td>
                    <td className="py-3">{lead.mobile || "N/A"}</td>
                    <td className="py-3 truncate">{lead.email || "N/A"}</td>
                    <td className="py-3">
                      <button
                        onClick={() => handleInfoClick(lead)}
                        className="flex items-center px-4 py-1 hover:text-[#05E0E9]"
                      >
                        <Image src="/images/view-icon-new.png" alt="View" width={20} height={20} className="mr-2" />
                        <span>View</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Empty state when no leads match filters */}
          {isFiltering && filteredLeads.length === 0 && (
            <div className="text-center py-6">
              <p className="text-gray-500">No leads match the current filters</p>
              <button onClick={clearFilters} className="mt-2 text-sm text-[#05E0E9] underline">
                Clear filters
              </button>
            </div>
          )}

          {/* Live Leads Pagination */}
          <div className="flex justify-between items-center mt-8">
            <div>
              <span className="text-[#05E0E9] font-bold">
                {isFiltering ? filteredLeads.length : liveLeadsTotalItems}
              </span>
              <span className="text-black"> total leadz</span>
              {isFiltering && (
                <button onClick={clearFilters} className="ml-2 text-sm text-[#05E0E9] underline">
                  Clear filters
                </button>
              )}
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handleLiveLeadsPageChange(Math.max(1, liveLeadsCurrentPage - 1))}
                disabled={liveLeadsCurrentPage === 1}
                className="text-[#05E0E9]"
              >
                <Image src="/images/pagination-left.png" alt="Previous" width={20} height={20} />
              </button>
              {Array.from({ length: Math.min(liveLeadsTotalPages, 5) }, (_, i) => i + 1).map((page) => (
                <span
                  key={page}
                  className={`cursor-pointer mx-1 ${
                    liveLeadsCurrentPage === page ? "text-[#05E0E9] font-bold" : "text-black"
                  }`}
                  onClick={() => handleLiveLeadsPageChange(page)}
                >
                  {page}
                </span>
              ))}
              <button
                onClick={() => handleLiveLeadsPageChange(Math.min(liveLeadsTotalPages, liveLeadsCurrentPage + 1))}
                disabled={liveLeadsCurrentPage === liveLeadsTotalPages}
                className="text-[#05E0E9]"
              >
                <Image src="/images/pagination-right.png" alt="Next" width={20} height={20} />
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500">No live leads found</p>
        </div>
      )}

      {/* Lead Type Selection Modal */}
      <Modal
        isOpen={isLeadTypeModalOpen}
        onClose={() => setIsLeadTypeModalOpen(false)}
        title="Select Lead Type"
        maxWidth="max-w-sm"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-bold mb-2">Lead Type*</label>
            <select
              value={selectedLeadType}
              onChange={(e) => setSelectedLeadType(e.target.value)}
              className="w-full p-2 rounded border border-gray-300 bg-[#E9EDF2]"
              required
            >
              <option value="">Select Lead Type</option>
              <option value="Live Lead">Live Lead</option>
              <option value="Submission Lead">Submission Lead</option>
            </select>
          </div>

          <div className="flex justify-end mt-4">
            <button
              onClick={handleLeadTypeSelect}
              disabled={!selectedLeadType}
              className={`px-4 py-2 rounded-full ${
                selectedLeadType ? "bg-[#05E0E9] text-black" : "bg-gray-300 text-gray-500 cursor-not-allowed"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </Modal>

      {/* Lead Info Modal */}
      {isInfoModalOpen && selectedLiveLead && (
        <Modal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title="Lead Details">
          <div>
            {/* Company Information */}
            <div className="mb-4">
              <h3 className="text-[#05E0E9] font-bold mb-2">Company Information</h3>

              <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-2">
                <div>
                  <div className="text-black font-bold">Company Name</div>
                  <div className="text-gray-800">{selectedLiveLead.company_name || "N/A"}</div>
                </div>
                <div>
                  <div className="text-black font-bold">Monthly Revenue</div>
                  <div className="text-gray-800">{selectedLiveLead.formattedRevenue || "N/A"}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-2">
                <div>
                  <div className="text-black font-bold">Industry</div>
                  <div className="text-gray-800">{selectedLiveLead.industry || "N/A"}</div>
                </div>
                <div>
                  <div className="text-black font-bold">Phone</div>
                  <div className="text-gray-800">{selectedLiveLead.phone || "N/A"}</div>
                </div>
              </div>

              <div className="mb-2">
                <div className="text-black font-bold">Address</div>
                <div className="text-gray-800">
                  {selectedLiveLead.address ? (
                    <>
                      {selectedLiveLead.address}
                      {selectedLiveLead.city && selectedLiveLead.state && selectedLiveLead.zip_code
                        ? `, ${selectedLiveLead.city}, ${selectedLiveLead.state} ${selectedLiveLead.zip_code}`
                        : ""}
                    </>
                  ) : (
                    "N/A"
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="mb-4">
              <h3 className="text-[#05E0E9] font-bold mb-2">Contact Information</h3>

              <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-2">
                <div>
                  <div className="text-black font-bold">Owner Name</div>
                  <div className="text-gray-800">{selectedLiveLead.owner_name || "N/A"}</div>
                </div>
                <div>
                  <div className="text-black font-bold">Mobile</div>
                  <div className="text-gray-800">{selectedLiveLead.mobile || "N/A"}</div>
                </div>
              </div>

              <div className="mb-2">
                <div className="text-black font-bold">Email</div>
                <div className="text-gray-800">{selectedLiveLead.email || "N/A"}</div>
              </div>
            </div>

            {/* Submission Lead Specific Information */}
            {selectedLiveLead.lead_type === "Submission Lead" && (
              <div className="mb-4">
                <h3 className="text-[#05E0E9] font-bold mb-2">Submission Information</h3>

                <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-2">
                  <div>
                    <div className="text-black font-bold">Inception Date</div>
                    <div className="text-gray-800">
                      {selectedLiveLead.inception_date
                        ? new Date(selectedLiveLead.inception_date).toLocaleDateString()
                        : "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-black font-bold">Federal Tax ID</div>
                    <div className="text-gray-800">{selectedLiveLead.federal_tax_id || "N/A"}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-2">
                  <div>
                    <div className="text-black font-bold">Date of Birth</div>
                    <div className="text-gray-800">
                      {selectedLiveLead.date_of_birth
                        ? new Date(selectedLiveLead.date_of_birth).toLocaleDateString()
                        : "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-black font-bold">Social Security</div>
                    <div className="text-gray-800">
                      {selectedLiveLead.social_security
                        ? `xxx-xx-${selectedLiveLead.social_security.slice(-4)}`
                        : "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Admin Information */}
            <div className="mb-4">
              <h3 className="text-[#05E0E9] font-bold mb-2">Admin Information</h3>

              <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-2">
                <div>
                  <div className="text-black font-bold">Lead Type</div>
                  <select
                    value={selectedLiveLead.lead_type || ""}
                    onChange={(e) => {
                      // Update the lead type in the selected lead
                      setSelectedLiveLead({
                        ...selectedLiveLead,
                        lead_type: e.target.value,
                      })
                      // Also update it in the database
                      updateLiveLead(selectedLiveLead.id, {
                        ...selectedLiveLead,
                        lead_type: e.target.value,
                      }).then(() => {
                        fetchLiveLeads() // Refresh the leads list
                      })
                    }}
                    className="w-full p-2 rounded border border-gray-300 bg-[#E9EDF2] text-gray-800"
                  >
                    <option value="">Select Lead Type</option>
                    <option value="Live Lead">Live Lead</option>
                    <option value="Submission Lead">Submission Lead</option>
                  </select>
                </div>
                <div>
                  <div className="text-black font-bold">Date Added</div>
                  <div className="text-gray-800">{selectedLiveLead.formattedDate || "N/A"}</div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => {
                  setIsInfoModalOpen(false)
                  openEditLiveLeadModal(selectedLiveLead)
                }}
                className="px-4 py-2 bg-[#05E0E9] text-black rounded-full"
              >
                Edit Lead
              </button>
              <button
                onClick={() => {
                  setIsInfoModalOpen(false)
                  openDeleteLiveLeadModal(selectedLiveLead)
                }}
                className="px-4 py-2 bg-red-500 text-white rounded-full"
              >
                Delete Lead
              </button>
            </div>
          </div>
        </Modal>
      )}

      {/* Filter Modal */}
      <Modal
        isOpen={isFilterModalOpen}
        onClose={() => setIsFilterModalOpen(false)}
        title="Filter Leads"
        maxWidth="max-w-md"
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date Range</label>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <input
                  type="date"
                  name="dateFrom"
                  value={filters.dateFrom}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded bg-[#E9EDF2]"
                  placeholder="mm/dd/yyyy"
                />
              </div>
              <div>
                <input
                  type="date"
                  name="dateTo"
                  value={filters.dateTo}
                  onChange={handleFilterChange}
                  className="w-full p-2 border border-gray-300 rounded bg-[#E9EDF2]"
                  placeholder="mm/dd/yyyy"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Industry</label>
            <input
              type="text"
              name="industry"
              value={filters.industry}
              onChange={handleFilterChange}
              placeholder="Enter industry"
              className="w-full p-2 border border-gray-300 rounded bg-[#E9EDF2]"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Monthly Revenue Range</label>
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2">$</span>
                <input
                  type="number"
                  name="minRevenue"
                  value={filters.minRevenue}
                  onChange={handleFilterChange}
                  placeholder="Minimum"
                  className="w-full p-2 pl-6 border border-gray-300 rounded bg-[#E9EDF2]"
                />
              </div>
              <div className="relative">
                <span className="absolute left-3 top-1/2 transform -translate-y-1/2">$</span>
                <input
                  type="number"
                  name="maxRevenue"
                  value={filters.maxRevenue}
                  onChange={handleFilterChange}
                  placeholder="Maximum"
                  className="w-full p-2 pl-6 border border-gray-300 rounded bg-[#E9EDF2]"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Client</label>
            <select
              name="clientId"
              value={filters.clientId}
              onChange={handleFilterChange}
              className="w-full p-2 border border-gray-300 rounded bg-[#E9EDF2]"
            >
              <option value="">All Clients</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.company_name}
                </option>
              ))}
            </select>
          </div>

          <div className="flex justify-end space-x-2 mt-4">
            <button type="button" onClick={clearFilters} className="px-4 py-2 text-gray-700">
              Reset
            </button>
            <button type="button" onClick={applyFilters} className="px-4 py-2 bg-[#05E0E9] text-black rounded">
              Apply Filters
            </button>
          </div>
        </div>
      </Modal>

      {/* Add Live Lead Modal */}
      {isAddLiveLeadModalOpen && (
        <Modal
          isOpen={isAddLiveLeadModalOpen}
          onClose={() => setIsAddLiveLeadModalOpen(false)}
          title={`Add New ${liveLeadFormData.lead_type}`}
        >
          <form onSubmit={handleAddLiveLeadSubmit}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-bold mb-2">Company*</label>
                <input
                  type="text"
                  name="company_name"
                  value={liveLeadFormData.company_name}
                  onChange={handleLiveLeadInputChange}
                  required
                  className="w-full p-2 rounded border border-gray-300 bg-[#E9EDF2]"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Owner*</label>
                <input
                  type="text"
                  name="owner_name"
                  value={liveLeadFormData.owner_name}
                  onChange={handleLiveLeadInputChange}
                  required
                  className="w-full p-2 rounded border border-gray-300 bg-[#E9EDF2]"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={liveLeadFormData.phone}
                  onChange={handleLiveLeadInputChange}
                  className="w-full p-2 rounded border border-gray-300 bg-[#E9EDF2]"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Mobile</label>
                <input
                  type="text"
                  name="mobile"
                  value={liveLeadFormData.mobile}
                  onChange={handleLiveLeadInputChange}
                  className="w-full p-2 rounded border border-gray-300 bg-[#E9EDF2]"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={liveLeadFormData.email}
                  onChange={handleLiveLeadInputChange}
                  className="w-full p-2 rounded border border-gray-300 bg-[#E9EDF2]"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Industry</label>
                <input
                  type="text"
                  name="industry"
                  value={liveLeadFormData.industry}
                  onChange={handleLiveLeadInputChange}
                  className="w-full p-2 rounded border border-gray-300 bg-[#E9EDF2]"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Monthly Revenue</label>
                <input
                  type="number"
                  name="monthly_revenue"
                  value={liveLeadFormData.monthly_revenue}
                  onChange={handleLiveLeadInputChange}
                  step="0.01"
                  className="w-full p-2 rounded border border-gray-300 bg-[#E9EDF2]"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Address</label>
                <input
                  type="text"
                  name="address"
                  value={liveLeadFormData.address}
                  onChange={handleLiveLeadInputChange}
                  className="w-full p-2 rounded border border-gray-300 bg-[#E9EDF2]"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">City</label>
                <input
                  type="text"
                  name="city"
                  value={liveLeadFormData.city}
                  onChange={handleLiveLeadInputChange}
                  className="w-full p-2 rounded border border-gray-300 bg-[#E9EDF2]"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">State</label>
                <input
                  type="text"
                  name="state"
                  value={liveLeadFormData.state}
                  onChange={handleLiveLeadInputChange}
                  className="w-full p-2 rounded border border-gray-300 bg-[#E9EDF2]"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Zip Code</label>
                <input
                  type="text"
                  name="zip_code"
                  value={liveLeadFormData.zip_code}
                  onChange={handleLiveLeadInputChange}
                  className="w-full p-2 rounded border border-gray-300 bg-[#E9EDF2]"
                />
              </div>

              {/* Submission Lead specific fields */}
              {liveLeadFormData.lead_type === "Submission Lead" && (
                <>
                  <div>
                    <label className="block text-sm font-bold mb-2">Inception Date</label>
                    <input
                      type="date"
                      name="inception_date"
                      value={liveLeadFormData.inception_date}
                      onChange={handleLiveLeadInputChange}
                      className="w-full p-2 rounded border border-gray-300 bg-[#E9EDF2]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Federal Tax ID</label>
                    <input
                      type="text"
                      name="federal_tax_id"
                      value={liveLeadFormData.federal_tax_id}
                      onChange={handleLiveLeadInputChange}
                      className="w-full p-2 rounded border border-gray-300 bg-[#E9EDF2]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Date of Birth</label>
                    <input
                      type="date"
                      name="date_of_birth"
                      value={liveLeadFormData.date_of_birth}
                      onChange={handleLiveLeadInputChange}
                      className="w-full p-2 rounded border border-gray-300 bg-[#E9EDF2]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Social Security</label>
                    <input
                      type="text"
                      name="social_security"
                      value={liveLeadFormData.social_security}
                      onChange={handleLiveLeadInputChange}
                      className="w-full p-2 rounded border border-gray-300 bg-[#E9EDF2]"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-bold mb-2">Date*</label>
                <input
                  type="date"
                  name="date"
                  value={liveLeadFormData.date}
                  onChange={handleLiveLeadInputChange}
                  required
                  className="w-full p-2 rounded border border-gray-300 bg-[#E9EDF2]"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Lead Type*</label>
                <input
                  type="text"
                  name="lead_type"
                  value={liveLeadFormData.lead_type}
                  readOnly
                  className="w-full p-2 rounded border border-gray-300 bg-[#E9EDF2] text-gray-500"
                />
              </div>
            </div>

            <h3 className="text-lg font-bold text-[#05E0E9] mb-2">Client Assignment</h3>
            <div className="mb-6">
              <div>
                <label className="block text-sm font-bold mb-2">Client*</label>
                {isLoadingClients ? (
                  <div className="w-full p-2 text-gray-500 bg-[#E9EDF2] border border-gray-300 rounded">
                    Loading clients...
                  </div>
                ) : clients.length === 0 ? (
                  <div className="w-full p-2 text-red-500 bg-[#E9EDF2] border border-gray-300 rounded">
                    No clients found
                  </div>
                ) : (
                  <select
                    name="client_id"
                    value={liveLeadFormData.client_id}
                    onChange={handleLiveLeadInputChange}
                    required
                    className="w-full p-2 rounded border border-gray-300 bg-[#E9EDF2]"
                  >
                    <option value="">Select Client ({clients.length} available)</option>
                    {clients.map((client) => (
                      <option key={client.id} value={client.id}>
                        {client.company_name}
                      </option>
                    ))}
                  </select>
                )}
                {clients.length === 0 && !isLoadingClients && (
                  <p className="text-sm text-red-500 mt-1">No clients available. Please add clients first.</p>
                )}
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsAddLiveLeadModalOpen(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-full"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-[#05E0E9] text-black rounded-full"
                disabled={clients.length === 0}
              >
                Add Lead
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Live Lead Modal */}
      {isEditLiveLeadModalOpen && selectedLiveLead && (
        <Modal
          isOpen={isEditLiveLeadModalOpen}
          onClose={() => setIsEditLiveLeadModalOpen(false)}
          title={`Edit ${liveLeadFormData.lead_type}`}
        >
          <form onSubmit={handleEditLiveLeadSubmit}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-bold mb-2">Company*</label>
                <input
                  type="text"
                  name="company_name"
                  value={liveLeadFormData.company_name}
                  onChange={handleLiveLeadInputChange}
                  required
                  className="w-full p-2 rounded border border-gray-300 bg-[#E9EDF2]"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Owner*</label>
                <input
                  type="text"
                  name="owner_name"
                  value={liveLeadFormData.owner_name}
                  onChange={handleLiveLeadInputChange}
                  required
                  className="w-full p-2 rounded border border-gray-300 bg-[#E9EDF2]"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={liveLeadFormData.phone}
                  onChange={handleLiveLeadInputChange}
                  className="w-full p-2 rounded border border-gray-300 bg-[#E9EDF2]"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Mobile</label>
                <input
                  type="text"
                  name="mobile"
                  value={liveLeadFormData.mobile}
                  onChange={handleLiveLeadInputChange}
                  className="w-full p-2 rounded border border-gray-300 bg-[#E9EDF2]"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Email</label>
                <input
                  type="email"
                  name="email"
                  value={liveLeadFormData.email}
                  onChange={handleLiveLeadInputChange}
                  className="w-full p-2 rounded border border-gray-300 bg-[#E9EDF2]"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Industry</label>
                <input
                  type="text"
                  name="industry"
                  value={liveLeadFormData.industry}
                  onChange={handleLiveLeadInputChange}
                  className="w-full p-2 rounded border border-gray-300 bg-[#E9EDF2]"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Monthly Revenue</label>
                <input
                  type="number"
                  name="monthly_revenue"
                  value={liveLeadFormData.monthly_revenue}
                  onChange={handleLiveLeadInputChange}
                  step="0.01"
                  className="w-full p-2 rounded border border-gray-300 bg-[#E9EDF2]"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Address</label>
                <input
                  type="text"
                  name="address"
                  value={liveLeadFormData.address}
                  onChange={handleLiveLeadInputChange}
                  className="w-full p-2 rounded border border-gray-300 bg-[#E9EDF2]"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">City</label>
                <input
                  type="text"
                  name="city"
                  value={liveLeadFormData.city}
                  onChange={handleLiveLeadInputChange}
                  className="w-full p-2 rounded border border-gray-300 bg-[#E9EDF2]"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">State</label>
                <input
                  type="text"
                  name="state"
                  value={liveLeadFormData.state}
                  onChange={handleLiveLeadInputChange}
                  className="w-full p-2 rounded border border-gray-300 bg-[#E9EDF2]"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Zip Code</label>
                <input
                  type="text"
                  name="zip_code"
                  value={liveLeadFormData.zip_code}
                  onChange={handleLiveLeadInputChange}
                  className="w-full p-2 rounded border border-gray-300 bg-[#E9EDF2]"
                />
              </div>

              {/* Submission Lead specific fields */}
              {liveLeadFormData.lead_type === "Submission Lead" && (
                <>
                  <div>
                    <label className="block text-sm font-bold mb-2">Inception Date</label>
                    <input
                      type="date"
                      name="inception_date"
                      value={liveLeadFormData.inception_date}
                      onChange={handleLiveLeadInputChange}
                      className="w-full p-2 rounded border border-gray-300 bg-[#E9EDF2]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Federal Tax ID</label>
                    <input
                      type="text"
                      name="federal_tax_id"
                      value={liveLeadFormData.federal_tax_id}
                      onChange={handleLiveLeadInputChange}
                      className="w-full p-2 rounded border border-gray-300 bg-[#E9EDF2]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Date of Birth</label>
                    <input
                      type="date"
                      name="date_of_birth"
                      value={liveLeadFormData.date_of_birth}
                      onChange={handleLiveLeadInputChange}
                      className="w-full p-2 rounded border border-gray-300 bg-[#E9EDF2]"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-bold mb-2">Social Security</label>
                    <input
                      type="text"
                      name="social_security"
                      value={liveLeadFormData.social_security}
                      onChange={handleLiveLeadInputChange}
                      className="w-full p-2 rounded border border-gray-300 bg-[#E9EDF2]"
                    />
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-bold mb-2">Date*</label>
                <input
                  type="date"
                  name="date"
                  value={liveLeadFormData.date}
                  onChange={handleLiveLeadInputChange}
                  required
                  className="w-full p-2 rounded border border-gray-300 bg-[#E9EDF2]"
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Lead Type*</label>
                <select
                  name="lead_type"
                  value={liveLeadFormData.lead_type}
                  onChange={handleLiveLeadInputChange}
                  className="w-full p-2 rounded border border-gray-300 bg-[#E9EDF2]"
                >
                  <option value="Live Lead">Live Lead</option>
                  <option value="Submission Lead">Submission Lead</option>
                </select>
              </div>
            </div>

            <h3 className="text-lg font-bold text-[#05E0E9] mb-2">Client Assignment</h3>
            <div className="mb-6">
              <div>
                <label className="block text-sm font-bold mb-2">Client*</label>
                <select
                  name="client_id"
                  value={liveLeadFormData.client_id}
                  onChange={handleLiveLeadInputChange}
                  required
                  className="w-full p-2 rounded border border-gray-300 bg-[#E9EDF2]"
                >
                  <option value="">Select Client</option>
                  {clients.map((client) => (
                    <option key={client.id} value={client.id}>
                      {client.company_name}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div className="flex justify-end space-x-2">
              <button
                type="button"
                onClick={() => setIsEditLiveLeadModalOpen(false)}
                className="px-4 py-2 bg-gray-300 text-gray-700 rounded-full"
              >
                Cancel
              </button>
              <button type="submit" className="px-4 py-2 bg-[#05E0E9] text-black rounded-full">
                Update Lead
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Live Lead Modal */}
      {isDeleteLiveLeadModalOpen && selectedLiveLead && (
        <Modal
          isOpen={isDeleteLiveLeadModalOpen}
          onClose={() => setIsDeleteLiveLeadModalOpen(false)}
          title="Delete Lead"
        >
          <p className="mb-4">
            Are you sure you want to delete the lead for <strong>{selectedLiveLead.company_name}</strong>? This action
            cannot be undone.
          </p>
          <div className="flex justify-end space-x-2">
            <button
              type="button"
              onClick={() => setIsDeleteLiveLeadModalOpen(false)}
              className="px-4 py-2 bg-gray-300 text-gray-700 rounded-full"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteLiveLeadConfirm}
              className="px-4 py-2 bg-red-500 text-white rounded-full"
            >
              Delete
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
