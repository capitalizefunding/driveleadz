"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { getLiveLeads } from "@/app/actions/live-leads"
import Modal from "@/components/modal"

export default function ClientLeadzPage() {
  // State for live leads
  const [liveLeads, setLiveLeads] = useState([])
  const [isLoadingLiveLeads, setIsLoadingLiveLeads] = useState(true)
  const [liveLeadCurrentPage, setLiveLeadCurrentPage] = useState(1)
  const [liveLeadTotalPages, setLiveLeadTotalPages] = useState(1)
  const [liveLeadTotalItems, setLiveLeadTotalItems] = useState(0)
  const [liveLeadError, setLiveLeadError] = useState("")

  // State for lead info modal
  const [selectedLead, setSelectedLead] = useState(null)
  const [isInfoModalOpen, setIsInfoModalOpen] = useState(false)

  const [searchTerm, setSearchTerm] = useState("")

  // State for filter modal
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [filters, setFilters] = useState({
    dateFrom: "",
    dateTo: "",
    industry: "",
    minRevenue: "",
    maxRevenue: "",
  })
  const [filteredLeads, setFilteredLeads] = useState([])
  const [isFiltering, setIsFiltering] = useState(false)
  const [isExporting, setIsExporting] = useState(false)

  useEffect(() => {
    fetchLiveLeads()
  }, [liveLeadCurrentPage, searchTerm])

  const fetchLiveLeads = async () => {
    setIsLoadingLiveLeads(true)
    setLiveLeadError("")
    try {
      // Use the server action to fetch live leads (client-specific filtering will be handled server-side)
      const result = await getLiveLeads(liveLeadCurrentPage, searchTerm)

      // Format dates to match the admin view
      const formattedLeads = result.liveLeads.map((lead) => ({
        ...lead,
        formattedDate: new Date(lead.date).toLocaleDateString("en-CA"), // YYYY-MM-DD format
        // Format monthly revenue as currency
        formattedRevenue:
          typeof lead.monthly_revenue === "number"
            ? `$${lead.monthly_revenue.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`
            : lead.monthly_revenue || "N/A",
      }))

      setLiveLeads(formattedLeads)
      setLiveLeadTotalItems(result.totalCount)
      setLiveLeadTotalPages(result.totalPages)

      // If we were filtering before, apply the filters to the new data
      if (isFiltering) {
        applyFiltersToData(filters, formattedLeads)
      }
    } catch (error) {
      console.error("Error fetching live leads:", error)
      setLiveLeadError(`Error fetching live leads: ${error.message}`)
      setLiveLeads([])
      setLiveLeadTotalItems(0)
      setLiveLeadTotalPages(0)
    } finally {
      setIsLoadingLiveLeads(false)
    }
  }

  const handleLiveLeadPageChange = (pageNumber) => {
    setLiveLeadCurrentPage(pageNumber)
  }

  const handleInfoClick = (lead) => {
    setSelectedLead(lead)
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
            `"${lead.company_name || ""}"`, // Wrap in quotes to handle commas in names
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
      link.setAttribute("download", `leads_export_${new Date().toISOString().split("T")[0]}.csv`)
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

  return (
    <div className="p-8">
      {/* Header Section */}
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-bold text-[#05E0E9]">Leadz</h1>
      </div>

      {/* Search and Filter Section */}
      <div className="flex justify-between items-center mb-6">
        <div className="relative max-w-[360px]">
          <input
            type="text"
            placeholder="Search leads"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
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

      {liveLeadError && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{liveLeadError}</div>
      )}

      {isLoadingLiveLeads ? (
        <div className="text-center py-10">
          <p className="text-gray-500">Loading leads...</p>
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
                {isFiltering ? filteredLeads.length : liveLeadTotalItems}
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
                onClick={() => handleLiveLeadPageChange(Math.max(1, liveLeadCurrentPage - 1))}
                disabled={liveLeadCurrentPage === 1}
                className="text-[#05E0E9]"
              >
                <Image src="/images/pagination-left.png" alt="Previous" width={20} height={20} />
              </button>
              {Array.from({ length: Math.min(liveLeadTotalPages, 5) }, (_, i) => i + 1).map((page) => (
                <span
                  key={page}
                  className={`cursor-pointer mx-1 ${
                    liveLeadCurrentPage === page ? "text-[#05E0E9] font-bold" : "text-black"
                  }`}
                  onClick={() => handleLiveLeadPageChange(page)}
                >
                  {page}
                </span>
              ))}
              <button
                onClick={() => handleLiveLeadPageChange(Math.min(liveLeadTotalPages, liveLeadCurrentPage + 1))}
                disabled={liveLeadCurrentPage === liveLeadTotalPages}
                className="text-[#05E0E9]"
              >
                <Image src="/images/pagination-right.png" alt="Next" width={20} height={20} />
              </button>
            </div>
          </div>
        </>
      ) : (
        <div className="text-center py-10">
          <p className="text-gray-500">No leads available</p>
          <p className="text-sm text-gray-400 mt-1">Leads will appear here when they are added to the database</p>
        </div>
      )}

      {/* Lead Info Modal */}
      {isInfoModalOpen && selectedLead && (
        <Modal isOpen={isInfoModalOpen} onClose={() => setIsInfoModalOpen(false)} title="Lead Information">
          <div>
            {/* Company Information */}
            <div className="mb-4">
              <h3 className="text-[#05E0E9] font-bold mb-2">Company Information</h3>

              <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-2">
                <div>
                  <div className="text-black font-bold">Company Name</div>
                  <div className="text-gray-800">{selectedLead.company_name || "N/A"}</div>
                </div>
                <div>
                  <div className="text-black font-bold">Monthly Revenue</div>
                  <div className="text-gray-800">{selectedLead.formattedRevenue || "N/A"}</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-2">
                <div>
                  <div className="text-black font-bold">Industry</div>
                  <div className="text-gray-800">{selectedLead.industry || "N/A"}</div>
                </div>
                <div>
                  <div className="text-black font-bold">Phone</div>
                  <div className="text-gray-800">{selectedLead.phone || "N/A"}</div>
                </div>
              </div>

              <div className="mb-2">
                <div className="text-black font-bold">Address</div>
                <div className="text-gray-800">
                  {selectedLead.address ? (
                    <>
                      {selectedLead.address}
                      {selectedLead.city && selectedLead.state && selectedLead.zip_code
                        ? `, ${selectedLead.city}, ${selectedLead.state} ${selectedLead.zip_code}`
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
                  <div className="text-gray-800">{selectedLead.owner_name || "N/A"}</div>
                </div>
                <div>
                  <div className="text-black font-bold">Mobile</div>
                  <div className="text-gray-800">{selectedLead.mobile || "N/A"}</div>
                </div>
              </div>

              <div className="mb-2">
                <div className="text-black font-bold">Email</div>
                <div className="text-gray-800">{selectedLead.email || "N/A"}</div>
              </div>
            </div>

            {/* Submission Lead Specific Information */}
            {selectedLead.lead_type === "Submission Lead" && (
              <div className="mb-4">
                <h3 className="text-[#05E0E9] font-bold mb-2">Submission Information</h3>

                <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-2">
                  <div>
                    <div className="text-black font-bold">Inception Date</div>
                    <div className="text-gray-800">
                      {selectedLead.inception_date ? new Date(selectedLead.inception_date).toLocaleDateString() : "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-black font-bold">Federal Tax ID</div>
                    <div className="text-gray-800">{selectedLead.federal_tax_id || "N/A"}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-2">
                  <div>
                    <div className="text-black font-bold">Date of Birth</div>
                    <div className="text-gray-800">
                      {selectedLead.date_of_birth ? new Date(selectedLead.date_of_birth).toLocaleDateString() : "N/A"}
                    </div>
                  </div>
                  <div>
                    <div className="text-black font-bold">Social Security</div>
                    <div className="text-gray-800">
                      {selectedLead.social_security ? `xxx-xx-${selectedLead.social_security.slice(-4)}` : "N/A"}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Additional Information */}
            <div>
              <h3 className="text-[#05E0E9] font-bold mb-2">Additional Information</h3>

              <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-2">
                <div>
                  <div className="text-black font-bold">Lead Type</div>
                  <div className="text-gray-800">{selectedLead.lead_type || "N/A"}</div>
                </div>
                <div>
                  <div className="text-black font-bold">Date Added</div>
                  <div className="text-gray-800">{selectedLead.formattedDate || "N/A"}</div>
                </div>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* Filter Modal using our consistent Modal component */}
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
    </div>
  )
}
