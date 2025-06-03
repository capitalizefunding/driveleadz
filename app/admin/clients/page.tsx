"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Image from "next/image"
import Link from "next/link"
import Modal from "@/components/modal"
import Pagination from "@/components/pagination"

export default function ClientsPage() {
  const [clients, setClients] = useState<any[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState("")
  const [currentPage, setCurrentPage] = useState(1)
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false)
  const [filters, setFilters] = useState({
    industry: "",
    state: "",
    status: "",
  })
  const [activeFilters, setActiveFilters] = useState<string[]>([])
  const [error, setError] = useState<string | null>(null)

  const [selectedClient, setSelectedClient] = useState<any>(null)
  const [isContactInfoModalOpen, setIsContactInfoModalOpen] = useState(false)
  const [isProfileModalOpen, setIsProfileModalOpen] = useState(false)
  const [isOrderHistoryModalOpen, setIsOrderHistoryModalOpen] = useState(false)
  const [clientOrders, setClientOrders] = useState<any[]>([])
  const [isLoadingOrders, setIsLoadingOrders] = useState(false)

  const itemsPerPage = 10

  useEffect(() => {
    async function fetchClients() {
      setIsLoading(true)
      setError(null)

      try {
        const response = await fetch("/api/clients")

        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }

        const data = await response.json()
        console.log("Fetched clients:", data)
        setClients(data || [])
      } catch (error) {
        console.error("Error fetching clients:", error)
        setError("Failed to load clients. Please try again later.")
        setClients([])
      } finally {
        setIsLoading(false)
      }
    }

    fetchClients()
  }, [])

  // Filter clients based on search term and filters
  const filteredClients = clients.filter((client) => {
    if (
      searchTerm &&
      !client.company_name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !client.contact_name?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !client.email?.toLowerCase().includes(searchTerm.toLowerCase()) &&
      !client.client_number?.toLowerCase().includes(searchTerm.toLowerCase())
    ) {
      return false
    }

    if (filters.industry && client.industry !== filters.industry) {
      return false
    }

    if (filters.state && client.state !== filters.state) {
      return false
    }

    if (filters.status && client.status !== filters.status) {
      return false
    }

    return true
  })

  const indexOfLastClient = currentPage * itemsPerPage
  const indexOfFirstClient = indexOfLastClient - itemsPerPage
  const currentClients = filteredClients.slice(indexOfFirstClient, indexOfLastClient)
  const totalPages = Math.ceil(filteredClients.length / itemsPerPage)

  const handlePageChange = (pageNumber: number) => {
    setCurrentPage(pageNumber)
  }

  const openFilterModal = () => {
    setIsFilterModalOpen(true)
  }

  const closeFilterModal = () => {
    setIsFilterModalOpen(false)
  }

  const handleFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target
    setFilters((prev) => ({
      ...prev,
      [name]: value,
    }))
  }

  const applyFiltersAndClose = () => {
    const active = []

    if (filters.industry) {
      active.push(`Industry: ${filters.industry}`)
    }

    if (filters.state) {
      active.push(`State: ${filters.state}`)
    }

    if (filters.status) {
      active.push(`Status: ${filters.status}`)
    }

    setActiveFilters(active)
    setCurrentPage(1)
    closeFilterModal()
  }

  const clearFilters = () => {
    setFilters({
      industry: "",
      state: "",
      status: "",
    })
    setActiveFilters([])
    setCurrentPage(1)
  }

  const industries = [...new Set(clients.map((client) => client.industry).filter(Boolean))].sort()
  const states = [...new Set(clients.map((client) => client.state).filter(Boolean))].sort()

  const openContactInfoModal = (client: any) => {
    setSelectedClient(client)
    setIsContactInfoModalOpen(true)
  }

  const openProfileModal = (client: any) => {
    setSelectedClient(client)
    setIsProfileModalOpen(true)
  }

  const openOrderHistoryModal = async (client: any) => {
    setSelectedClient(client)
    setIsOrderHistoryModalOpen(true)
    setIsLoadingOrders(true)

    try {
      const response = await fetch(`/api/clients/${client.id}/orders`)
      const data = await response.json()
      setClientOrders(data.orders || [])
    } catch (error) {
      console.error("Error fetching client orders:", error)
      setClientOrders([])
    } finally {
      setIsLoadingOrders(false)
    }
  }

  const closeAllModals = () => {
    setIsContactInfoModalOpen(false)
    setIsProfileModalOpen(false)
    setIsOrderHistoryModalOpen(false)
    setSelectedClient(null)
    setClientOrders([])
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-[#05E0E9] mb-6">Clients</h1>

      {/* Search and Add Client button */}
      <div className="flex justify-between items-start mb-6">
        <div className="relative">
          <input
            type="text"
            placeholder="Search clients"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10 pr-4 py-2 rounded-full border border-gray-300 w-[400px]"
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

        <div className="flex flex-col items-end space-y-4">
          <Link
            href="/admin/clients/new"
            className="flex items-center px-6 py-2 bg-[#05E0E9] text-black rounded-[28px] hover:bg-opacity-80"
          >
            <span>Add Client</span>
          </Link>

          <div className="flex items-center space-x-4">
            <button className="flex items-center px-4 py-2 hover:text-[#05E0E9]" onClick={openFilterModal}>
              <Image src="/images/filter-icon-new.png" alt="Filter" width={20} height={20} className="mr-2" />
              <span>Filter</span>
            </button>

            <button className="flex items-center px-4 py-2 hover:text-[#05E0E9]">
              <Image src="/images/export-icon-new.png" alt="Export" width={20} height={20} className="mr-2" />
              <span>Export</span>
            </button>
          </div>
        </div>
      </div>

      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          <p>{error}</p>
        </div>
      )}

      {/* Active Filters */}
      {activeFilters.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center">
          <span className="mr-2 font-semibold">Active Filters:</span>
          {activeFilters.map((filter, index) => (
            <span key={index} className="bg-sidebar rounded-full px-3 py-1 text-sm mr-2 mb-2">
              {filter}
            </span>
          ))}
          <button onClick={clearFilters} className="text-[#05E0E9] text-sm hover:underline ml-2">
            Clear All
          </button>
        </div>
      )}

      {/* Table */}
      <div className="bg-white rounded-lg overflow-hidden">
        {/* Table Header */}
        <div className="px-6 py-3">
          <div className="flex items-center">
            <div className="w-[15%] text-base font-bold text-[#05E0E9]">Client ID</div>
            <div className="w-[15%] text-base font-bold text-[#05E0E9]">Status</div>
            <div className="w-[30%] text-base font-bold text-[#05E0E9]">Company Name</div>
            <div className="flex-grow"></div>
          </div>
        </div>

        {isLoading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#05E0E9] mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading clients...</p>
          </div>
        ) : clients && clients.length > 0 ? (
          <div>
            {currentClients.map((client) => (
              <div key={client.id} className="px-6 py-4">
                <div className="flex items-center">
                  <div className="w-[15%] text-base">{client.client_number || `CL-${client.id}`}</div>
                  <div className="w-[15%] text-base">{client.status || "Active"}</div>
                  <div className="w-[30%] text-base">{client.company_name}</div>
                  <div className="flex-grow flex justify-end items-center space-x-6">
                    <button onClick={() => openContactInfoModal(client)} className="flex items-center hover:opacity-80">
                      <Image
                        src="/images/contact-info-icon-correct.png"
                        alt=""
                        width={24}
                        height={24}
                        className="mr-1"
                      />
                      <span className="text-sm text-black">Contact Info</span>
                    </button>
                    <button onClick={() => openProfileModal(client)} className="flex items-center hover:opacity-80">
                      <Image src="/images/profile-icon-correct.png" alt="" width={24} height={24} className="mr-1" />
                      <span className="text-sm text-black">Profile</span>
                    </button>
                    <button
                      onClick={() => openOrderHistoryModal(client)}
                      className="flex items-center hover:opacity-80"
                    >
                      <Image
                        src="/images/order-history-icon-correct.png"
                        alt=""
                        width={24}
                        height={24}
                        className="mr-1"
                      />
                      <span className="text-sm text-black">Order History</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="p-8 text-center text-gray-500">No clients found.</div>
        )}

        {/* Pagination Footer */}
        <div className="px-6 py-3">
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filteredClients.length}
            itemName="clients"
            onPageChange={handlePageChange}
          />
        </div>
      </div>

      {/* Filter Modal */}
      <Modal isOpen={isFilterModalOpen} onClose={closeFilterModal} title="Filter Clients" maxWidth="max-w-sm">
        <div className="space-y-4">
          <div>
            <label className="modal-form-label">Industry</label>
            <select
              name="industry"
              value={filters.industry}
              onChange={handleFilterChange}
              className="modal-form-select"
            >
              <option value="">All Industries</option>
              {industries.map((industry, index) => (
                <option key={index} value={industry}>
                  {industry}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="modal-form-label">State</label>
            <select name="state" value={filters.state} onChange={handleFilterChange} className="modal-form-select">
              <option value="">All States</option>
              {states.map((state, index) => (
                <option key={index} value={state}>
                  {state}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="modal-form-label">Status</label>
            <select name="status" value={filters.status} onChange={handleFilterChange} className="modal-form-select">
              <option value="">All Statuses</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="pending">Pending</option>
            </select>
          </div>

          <div className="flex justify-end space-x-4 pt-4">
            <button onClick={clearFilters} className="modal-btn-secondary">
              Clear All
            </button>
            <button onClick={applyFiltersAndClose} className="modal-btn-primary">
              Apply Filters
            </button>
          </div>
        </div>
      </Modal>

      {/* Contact Info Modal */}
      <Modal
        isOpen={isContactInfoModalOpen}
        onClose={closeAllModals}
        title="Contact Information"
        maxWidth="max-w-2xl"
        titleStyle={{ fontSize: "20px", fontWeight: "700", color: "#05e0e9", fontFamily: "Vectora LT Std" }}
      >
        {selectedClient && (
          <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
            {/* Row 1 - Company Name and Contact */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
              <div>
                <label className="modal-form-label">Company Name</label>
                <div className="modal-form-value">{selectedClient.company_name || "N/A"}</div>
              </div>
              <div>
                <label className="modal-form-label">Contact</label>
                <div className="modal-form-value">{selectedClient.contact_name || "N/A"}</div>
              </div>
            </div>

            {/* Row 2 - Address */}
            <div>
              <label className="modal-form-label">Address</label>
              <div className="modal-form-value">{selectedClient.address || "N/A"}</div>
            </div>

            {/* Row 3 - Phone and Email */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
              <div>
                <label className="modal-form-label">Phone</label>
                <div className="modal-form-value">{selectedClient.phone || "N/A"}</div>
              </div>
              <div>
                <label className="modal-form-label">Email</label>
                <div className="modal-form-value">{selectedClient.email || "N/A"}</div>
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Profile Modal */}
      <Modal isOpen={isProfileModalOpen} onClose={closeAllModals} title="Client Profile" maxWidth="max-w-2xl">
        {selectedClient && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Client Information Section */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "24px" }}>
              <div>
                <label style={{ fontFamily: "Vectora LT Std", fontSize: "15px", fontWeight: "700", color: "#000000" }}>
                  Client No.
                </label>
                <div className="modal-form-value">{selectedClient.client_number || `CL-${selectedClient.id}`}</div>
              </div>
              <div>
                <label style={{ fontFamily: "Vectora LT Std", fontSize: "15px", fontWeight: "700", color: "#000000" }}>
                  Client Name
                </label>
                <div className="modal-form-value">{selectedClient.company_name || "N/A"}</div>
              </div>
              <div>
                <label style={{ fontFamily: "Vectora LT Std", fontSize: "15px", fontWeight: "700", color: "#000000" }}>
                  Client Status
                </label>
                <div className="modal-form-value">{selectedClient.status || "Active"}</div>
              </div>
            </div>

            {/* Sales Process Section */}
            <div>
              <h3
                style={{
                  fontFamily: "Vectora LT Std",
                  fontSize: "18px",
                  fontWeight: "700",
                  color: "#05e0e9",
                  marginBottom: "12px",
                }}
              >
                Sales Process
              </h3>

              {/* Row 1 - 4 columns */}
              <div
                style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", gap: "24px", marginBottom: "12px" }}
              >
                <div>
                  <label
                    style={{ fontFamily: "Vectora LT Std", fontSize: "15px", fontWeight: "700", color: "#000000" }}
                  >
                    Sales Vertical
                  </label>
                  <div className="modal-form-value">{selectedClient.sales_vertical || "N/A"}</div>
                </div>
                <div>
                  <label
                    style={{ fontFamily: "Vectora LT Std", fontSize: "15px", fontWeight: "700", color: "#000000" }}
                  >
                    Years Active
                  </label>
                  <div className="modal-form-value">{selectedClient.years_active || "N/A"}</div>
                </div>
                <div>
                  <label
                    style={{ fontFamily: "Vectora LT Std", fontSize: "15px", fontWeight: "700", color: "#000000" }}
                  >
                    Sales Strategy
                  </label>
                  <div className="modal-form-value">{selectedClient.sales_strategy || "N/A"}</div>
                </div>
                <div>
                  <label
                    style={{ fontFamily: "Vectora LT Std", fontSize: "15px", fontWeight: "700", color: "#000000" }}
                  >
                    # of Sales Reps
                  </label>
                  <div className="modal-form-value">{selectedClient.sales_reps || "N/A"}</div>
                </div>
              </div>

              {/* Row 2 - 2 columns */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "24px" }}>
                <div>
                  <label
                    style={{ fontFamily: "Vectora LT Std", fontSize: "15px", fontWeight: "700", color: "#000000" }}
                  >
                    Preferred Industries
                  </label>
                  <div className="modal-form-value">{selectedClient.preferred_industries || "N/A"}</div>
                </div>
                <div>
                  <label
                    style={{ fontFamily: "Vectora LT Std", fontSize: "15px", fontWeight: "700", color: "#000000" }}
                  >
                    Restricted Industries
                  </label>
                  <div className="modal-form-value">{selectedClient.restricted_industries || "N/A"}</div>
                </div>
              </div>
            </div>

            {/* Edit Button */}
            <div style={{ display: "flex", justifyContent: "flex-end", marginTop: "24px" }}>
              <Link
                href={`/admin/clients/${selectedClient.id}/edit`}
                className="px-6 py-2 bg-[#05E0E9] text-black rounded-[28px] hover:bg-opacity-80"
                style={{ fontFamily: "Vectora LT Std", fontSize: "16px", fontWeight: "400" }}
                onClick={closeAllModals}
              >
                Edit
              </Link>
            </div>
          </div>
        )}
      </Modal>

      {/* Order History Modal */}
      <Modal
        isOpen={isOrderHistoryModalOpen}
        onClose={closeAllModals}
        title="Order History"
        maxWidth="max-w-2xl"
        titleStyle={{ fontSize: "20px", fontWeight: "700", color: "#05e0e9", fontFamily: "Vectora LT Std" }}
      >
        {selectedClient && (
          <div style={{ display: "flex", flexDirection: "column", gap: "24px" }}>
            {/* Client Information Section */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "24px" }}>
              <div>
                <label style={{ fontFamily: "Vectora LT Std", fontSize: "15px", fontWeight: "700", color: "#000000" }}>
                  Client No.
                </label>
                <div className="modal-form-value">{selectedClient.client_number || `CL-${selectedClient.id}`}</div>
              </div>
              <div>
                <label style={{ fontFamily: "Vectora LT Std", fontSize: "15px", fontWeight: "700", color: "#000000" }}>
                  Client Name
                </label>
                <div className="modal-form-value">{selectedClient.company_name || "N/A"}</div>
              </div>
              <div>
                <label style={{ fontFamily: "Vectora LT Std", fontSize: "15px", fontWeight: "700", color: "#000000" }}>
                  Client Status
                </label>
                <div className="modal-form-value">{selectedClient.status || "Active"}</div>
              </div>
            </div>

            {/* Blank Row */}
            <div style={{ height: "3px" }}></div>

            {/* Orders List */}
            {isLoadingOrders ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#05E0E9] mx-auto"></div>
                <p className="mt-4 text-gray-600">Loading orders...</p>
              </div>
            ) : clientOrders.length > 0 ? (
              <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
                {clientOrders.map((order, index) => (
                  <div
                    key={order.id || index}
                    style={{
                      display: "grid",
                      gridTemplateColumns: "120px 1fr 80px",
                      gap: "16px",
                      alignItems: "center",
                    }}
                  >
                    <div
                      style={{ fontFamily: "Vectora LT Std", fontSize: "15px", fontWeight: "400", color: "#000000" }}
                    >
                      {order.date && order.date !== "N/A" ? order.date : "N/A"}
                    </div>
                    <div
                      style={{ fontFamily: "Vectora LT Std", fontSize: "15px", fontWeight: "400", color: "#000000" }}
                    >
                      {order.description || "N/A"}
                    </div>
                    <Link
                      href={`/admin/invoices?client=${selectedClient.id}&order=${order.id}`}
                      className="flex items-center text-[#05E0E9] hover:opacity-80"
                      style={{ fontFamily: "Vectora LT Std", fontSize: "14px", fontWeight: "400" }}
                    >
                      <Image src="/images/view-icon-new.png" alt="" width={16} height={16} className="mr-1" />
                      View
                    </Link>
                  </div>
                ))}

                {/* End of transactions line */}
                <div
                  style={{
                    textAlign: "center",
                    marginTop: "16px",
                    fontFamily: "Vectora LT Std",
                    fontSize: "14px",
                    fontWeight: "400",
                    color: "#666666",
                  }}
                >
                  —— end of sales transactions ——
                </div>
              </div>
            ) : (
              <div className="p-8 text-center text-gray-500">No orders found for this client.</div>
            )}
          </div>
        )}
      </Modal>
    </div>
  )
}
