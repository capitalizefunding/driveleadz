"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { getSupabaseClient } from "@/lib/supabaseClient"

export default function ClientLeadzPage() {
  // State for lead batches (existing functionality)
  const [leadBatches, setLeadBatches] = useState([])
  const [isLoadingBatches, setIsLoadingBatches] = useState(true)
  const [batchCurrentPage, setBatchCurrentPage] = useState(1)
  const [batchTotalPages, setBatchTotalPages] = useState(1)
  const [batchTotalItems, setBatchTotalItems] = useState(0)
  const [batchError, setBatchError] = useState("")

  // State for live leads (new functionality)
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

  const itemsPerPage = 10

  useEffect(() => {
    fetchLeadBatches()
    fetchLiveLeads()
  }, [batchCurrentPage, liveLeadCurrentPage, searchTerm])

  const fetchLeadBatches = async () => {
    setIsLoadingBatches(true)
    setBatchError("")
    try {
      const supabase = getSupabaseClient()

      // For now, fetch all lead batches without filtering by client
      // This is a temporary solution until we establish the proper client-user relationship
      let query = supabase
        .from("lead_batches")
        .select(
          `
          id, 
          batch_id, 
          file_name, 
          upload_date
        `,
          { count: "exact" },
        )
        .order("upload_date", { ascending: false })

      // Apply search filter if provided
      if (searchTerm) {
        query = query.or(`batch_id.ilike.%${searchTerm}%,file_name.ilike.%${searchTerm}%`)
      }

      // Calculate pagination
      const from = (batchCurrentPage - 1) * itemsPerPage
      const to = from + itemsPerPage - 1

      // Execute the query with pagination
      const { data, error, count } = await query.range(from, to)

      if (error) {
        console.error("Database query error:", error)
        setBatchError("Error fetching lead batches. Please try again later.")
        return
      }

      // Format data for display
      const formattedBatches =
        data?.map((batch) => ({
          id: batch.id,
          batchId: batch.batch_id,
          name: batch.file_name || "Real-Time Intent Leads: Business Loans",
          date: new Date(batch.upload_date).toLocaleDateString("en-US", {
            month: "2-digit",
            day: "2-digit",
            year: "numeric",
          }),
        })) || []

      setLeadBatches(formattedBatches)
      setBatchTotalItems(count || 0)
      setBatchTotalPages(count ? Math.ceil(count / itemsPerPage) : 1)
    } catch (error) {
      console.error("Error fetching lead batches:", error)
      setBatchError("An unexpected error occurred. Please try again later.")
    } finally {
      setIsLoadingBatches(false)
    }
  }

  const fetchLiveLeads = async () => {
    setIsLoadingLiveLeads(true)
    setLiveLeadError("")
    try {
      // For now, we'll generate mock data since the live_leads table doesn't exist yet
      // This will be replaced with actual database queries when the table is created

      // Simulate a delay to mimic a real API call
      await new Promise((resolve) => setTimeout(resolve, 500))

      // Generate mock live leads data
      const mockLiveLeads = [
        {
          id: "1",
          date: "2025-05-22",
          company: "Fake Company 1",
          owner: "Fake Owner",
          industry: "Construction",
          monthlyRevenue: "$100,000.00",
          email: "owner@fakecompany1.com",
          phone: "(555) 123-4567",
          address: "123 Business St, New York, NY 10001",
          website: "www.fakecompany1.com",
          employees: "45",
          notes: "Looking for funding to expand operations.",
        },
        {
          id: "2",
          date: "2025-05-22",
          company: "Fake Company 2",
          owner: "Joe Smith",
          industry: "Education",
          monthlyRevenue: "$75,000.00",
          email: "joe@fakecompany2.com",
          phone: "(555) 234-5678",
          address: "456 Learning Ave, Boston, MA 02108",
          website: "www.fakecompany2.com",
          employees: "28",
          notes: "Interested in equipment financing.",
        },
        {
          id: "3",
          date: "2025-05-22",
          company: "Fake Company 3",
          owner: "Bob Allen",
          industry: "Healthcare",
          monthlyRevenue: "$35,000.00",
          email: "bob@fakecompany3.com",
          phone: "(555) 345-6789",
          address: "789 Medical Dr, Chicago, IL 60601",
          website: "www.fakecompany3.com",
          employees: "12",
          notes: "Looking to open a second location.",
        },
        {
          id: "4",
          date: "2025-05-22",
          company: "Fake Company 4",
          owner: "Richard White",
          industry: "Roofing",
          monthlyRevenue: "$250,000.00",
          email: "richard@fakecompany4.com",
          phone: "(555) 456-7890",
          address: "101 Roof Rd, Dallas, TX 75201",
          website: "www.fakecompany4.com",
          employees: "75",
          notes: "Needs new equipment and vehicles.",
        },
        {
          id: "5",
          date: "2025-05-22",
          company: "Fake Company 5",
          owner: "Lisa Lead",
          industry: "Healthcare",
          monthlyRevenue: "$50,000.00",
          email: "lisa@fakecompany5.com",
          phone: "(555) 567-8901",
          address: "202 Health Blvd, Los Angeles, CA 90001",
          website: "www.fakecompany5.com",
          employees: "22",
          notes: "Expanding services and staff.",
        },
      ]

      // Format dates to match the mockup (MM-DD-YYYY)
      mockLiveLeads.forEach((lead) => {
        const date = new Date(lead.date)
        lead.date = `${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(
          2,
          "0",
        )}-${date.getFullYear()}`
      })

      // Filter mock data based on search term
      if (searchTerm) {
        const filteredMockLeads = mockLiveLeads.filter(
          (lead) =>
            lead.company.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.owner.toLowerCase().includes(searchTerm.toLowerCase()) ||
            lead.industry.toLowerCase().includes(searchTerm.toLowerCase()),
        )
        setLiveLeads(filteredMockLeads)
        setLiveLeadTotalItems(filteredMockLeads.length)
        setLiveLeadTotalPages(Math.ceil(filteredMockLeads.length / itemsPerPage))
      } else {
        setLiveLeads(mockLiveLeads)
        setLiveLeadTotalItems(mockLiveLeads.length)
        setLiveLeadTotalPages(Math.ceil(mockLiveLeads.length / itemsPerPage))
      }
    } catch (error) {
      console.error("Error fetching live leads:", error)
      setLiveLeadError("An unexpected error occurred. Please try again later.")
    } finally {
      setIsLoadingLiveLeads(false)
    }
  }

  const handleBatchPageChange = (pageNumber) => {
    setBatchCurrentPage(pageNumber)
  }

  const handleLiveLeadPageChange = (pageNumber) => {
    setLiveLeadCurrentPage(pageNumber)
  }

  const handleInfoClick = (lead) => {
    setSelectedLead(lead)
    setIsInfoModalOpen(true)
  }

  return (
    <div>
      {/* Top Section with Title, Search, Filter, and Export */}
      <div className="flex justify-between items-start mb-14">
        <h1 className="text-2xl font-bold text-[#05E0E9]">Leadz</h1>

        <div className="flex flex-col items-end">
          <div className="relative mb-6">
            <input
              type="text"
              placeholder="Search leads"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 pr-4 py-2 rounded-full border border-gray-300 w-[250px]"
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

          <div className="flex items-center space-x-8">
            <button className="flex items-center text-black">
              <Image src="/images/filter-icon-new.png" alt="Filter" width={20} height={20} className="mr-2" />
              Filter
            </button>

            <button className="flex items-center text-black">
              <Image src="/images/export-icon-new.png" alt="Export" width={20} height={20} className="mr-2" />
              Export
            </button>
          </div>
        </div>
      </div>

      {/* Live Leads Section */}
      <div className="mb-14">
        <h2 className="text-2xl font-bold text-black mb-6">Live Leads</h2>

        {isLoadingLiveLeads ? (
          <div className="text-center py-6">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : liveLeadError ? (
          <div className="text-center py-6">
            <p className="text-red-500">{liveLeadError}</p>
          </div>
        ) : liveLeads.length > 0 ? (
          <>
            {/* Live Leads Table */}
            <div className="mb-6">
              {/* Table Header - NO BORDERS */}
              <div className="flex mb-4">
                <div className="w-[15%] text-[#05E0E9] font-bold">Date</div>
                <div className="w-[25%] text-[#05E0E9] font-bold">Company</div>
                <div className="w-[20%] text-[#05E0E9] font-bold">Owner</div>
                <div className="w-[20%] text-[#05E0E9] font-bold">Monthly Revenue</div>
                <div className="w-[20%] text-[#05E0E9] font-bold">Industry</div>
              </div>

              {/* Table Body - ONLY BOTTOM BORDERS */}
              <div>
                {liveLeads.map((lead, index) => (
                  <div
                    key={lead.id}
                    className="flex py-3"
                    style={{
                      borderBottom: index < liveLeads.length - 1 ? "1px solid #e5e7eb" : "none",
                    }}
                  >
                    <div className="w-[15%]">{lead.date}</div>
                    <div className="w-[25%] truncate">{lead.company}</div>
                    <div className="w-[20%] truncate">{lead.owner}</div>
                    <div className="w-[20%] truncate">{lead.monthlyRevenue}</div>
                    <div className="w-[20%] flex justify-between items-center">
                      <span className="truncate">{lead.industry}</span>
                      <button
                        onClick={() => handleInfoClick(lead)}
                        className="w-6 h-6 min-w-[24px] rounded-full bg-[#05E0E9] flex items-center justify-center cursor-pointer"
                        aria-label="View lead details"
                      >
                        <Image
                          src="/images/info-icon.png"
                          alt="Info"
                          width={14}
                          height={14}
                          className="object-contain"
                        />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Live Leads Pagination */}
            <div className="flex justify-between items-center mt-6">
              <div>
                <span className="text-[#05E0E9] font-bold">{liveLeadTotalItems}</span>
                <span className="text-black"> total leadz</span>
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
                      liveLeadCurrentPage === page ? "text-[#05E0E9] font-bold" : "text-black font-normal"
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
          <div className="text-center py-6">
            <p className="text-gray-500">No live leads available</p>
          </div>
        )}
      </div>

      {/* Lead Lists Section */}
      <div>
        <h2 className="text-2xl font-bold text-black mb-6">Lead Lists</h2>

        {isLoadingBatches ? (
          <div className="text-center py-6">
            <p className="text-gray-500">Loading...</p>
          </div>
        ) : batchError ? (
          <div className="text-center py-6">
            <p className="text-red-500">{batchError}</p>
          </div>
        ) : leadBatches.length > 0 ? (
          <div>
            {/* Lead Lists Table */}
            <div className="mb-6">
              {/* Table Header - NO BORDERS */}
              <div className="flex mb-4">
                <div className="w-[20%] text-[#05E0E9] font-bold">Date</div>
                <div className="w-[20%] text-[#05E0E9] font-bold">List ID</div>
                <div className="w-[40%] text-[#05E0E9] font-bold">List Name</div>
                <div className="w-[20%] text-[#05E0E9] font-bold"></div>
              </div>

              {/* Table Body - ONLY BOTTOM BORDERS */}
              <div>
                {leadBatches.map((batch, index) => (
                  <div
                    key={batch.id}
                    className="flex py-3"
                    style={{
                      borderBottom: index < leadBatches.length - 1 ? "1px solid #e5e7eb" : "none",
                    }}
                  >
                    <div className="w-[20%]">{batch.date}</div>
                    <div className="w-[20%]">#{batch.batchId}</div>
                    <div className="w-[40%] truncate">{batch.name}</div>
                    <div className="w-[20%] flex items-center justify-end space-x-4">
                      <Link href={`/client/leadz/${batch.batchId}`} className="flex items-center text-black">
                        <Image src="/images/view-icon-new.png" alt="View" width={20} height={20} className="mr-1" />
                        View
                      </Link>
                      <button className="flex items-center text-black">
                        <Image
                          src="/images/download-icon-new.png"
                          alt="Download"
                          width={20}
                          height={20}
                          className="mr-1"
                        />
                        Download
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Lead Batches Pagination */}
            <div className="flex justify-between items-center mt-6">
              <div>
                <span className="text-[#05E0E9] font-bold">{batchTotalItems}</span>
                <span className="text-black"> total lists</span>
              </div>
              <div className="flex items-center space-x-2">
                <button
                  onClick={() => handleBatchPageChange(Math.max(1, batchCurrentPage - 1))}
                  disabled={batchCurrentPage === 1}
                  className="text-[#05E0E9]"
                >
                  <Image src="/images/pagination-left.png" alt="Previous" width={20} height={20} />
                </button>
                {Array.from({ length: Math.min(batchTotalPages, 5) }, (_, i) => i + 1).map((page) => (
                  <span
                    key={page}
                    className={`cursor-pointer mx-1 ${
                      batchCurrentPage === page ? "text-[#05E0E9] font-bold" : "text-black font-normal"
                    }`}
                    onClick={() => handleBatchPageChange(page)}
                  >
                    {page}
                  </span>
                ))}
                <button
                  onClick={() => handleBatchPageChange(Math.min(batchTotalPages, batchCurrentPage + 1))}
                  disabled={batchCurrentPage === batchTotalPages}
                  className="text-[#05E0E9]"
                >
                  <Image src="/images/pagination-right.png" alt="Next" width={20} height={20} />
                </button>
              </div>
            </div>
          </div>
        ) : (
          <div className="text-center py-6">
            <p className="text-gray-500">No lead lists found</p>
          </div>
        )}
      </div>

      {/* Lead Info Modal */}
      {isInfoModalOpen && selectedLead && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-gray-100 rounded-lg w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="flex justify-between items-center px-4 pt-4 pb-1 bg-gray-100 rounded-t-lg">
              <h2 className="text-xl font-bold text-[#05E0E9]">Lead Information</h2>
              <button onClick={() => setIsInfoModalOpen(false)} className="text-gray-500 hover:text-gray-700">
                ✕
              </button>
            </div>

            {/* Modal Content */}
            <div className="px-4 pt-1 pb-4">
              {/* Company Information */}
              <div className="mb-4">
                <h3 className="text-[#05E0E9] font-bold mb-2">Company Information</h3>

                <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-2">
                  <div>
                    <div className="text-black font-bold">Company Name</div>
                    <div className="text-gray-800">{selectedLead.company || "N/A"}</div>
                  </div>
                  <div>
                    <div className="text-black font-bold">Monthly Revenue</div>
                    <div className="text-gray-800">{selectedLead.monthlyRevenue || "N/A"}</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-2">
                  <div>
                    <div className="text-black font-bold">Industry</div>
                    <div className="text-gray-800">{selectedLead.industry || "N/A"}</div>
                  </div>
                  <div>
                    <div className="text-black font-bold">Employees</div>
                    <div className="text-gray-800">{selectedLead.employees || "N/A"}</div>
                  </div>
                </div>

                <div className="mb-2">
                  <div className="text-black font-bold">Address</div>
                  <div className="text-gray-800">{selectedLead.address || "N/A"}</div>
                </div>

                <div className="mb-2">
                  <div className="text-black font-bold">Website</div>
                  <div className="text-gray-800">{selectedLead.website || "N/A"}</div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="mb-4">
                <h3 className="text-[#05E0E9] font-bold mb-2">Contact Information</h3>

                <div className="grid grid-cols-2 gap-x-6 gap-y-2 mb-2">
                  <div>
                    <div className="text-black font-bold">Owner Name</div>
                    <div className="text-gray-800">{selectedLead.owner || "N/A"}</div>
                  </div>
                  <div>
                    <div className="text-black font-bold">Phone</div>
                    <div className="text-gray-800">{selectedLead.phone || "N/A"}</div>
                  </div>
                </div>

                <div className="mb-2">
                  <div className="text-black font-bold">Email</div>
                  <div className="text-gray-800">{selectedLead.email || "N/A"}</div>
                </div>
              </div>

              {/* Additional Information */}
              <div>
                <h3 className="text-[#05E0E9] font-bold mb-2">Additional Information</h3>

                <div className="mb-2">
                  <div className="text-black font-bold">Notes</div>
                  <div className="text-gray-800">{selectedLead.notes || "N/A"}</div>
                </div>

                <div className="mb-2">
                  <div className="text-black font-bold">Date Added</div>
                  <div className="text-gray-800">{selectedLead.date || "N/A"}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
