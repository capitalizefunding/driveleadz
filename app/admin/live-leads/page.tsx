"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { getLiveLeads, createLiveLead, updateLiveLead, deleteLiveLead } from "@/app/actions/live-leads"
import { getSupabaseClient } from "@/lib/supabaseClient"
import Modal from "@/components/modal"

export default function AdminLiveLeadsPage() {
  const [liveLeads, setLiveLeads] = useState([])
  const [clients, setClients] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [totalPages, setTotalPages] = useState(1)
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedClientId, setSelectedClientId] = useState("")
  const [error, setError] = useState("")

  // Modal states
  const [isAddModalOpen, setIsAddModalOpen] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false)
  const [selectedLead, setSelectedLead] = useState(null)
  const [formData, setFormData] = useState({
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
    batch_date: new Date().toISOString().split("T")[0],
    lead_source: "",
    lead_vendor: "",
    lead_type: "",
    client_id: "",
  })

  useEffect(() => {
    fetchData()
  }, [currentPage, searchTerm, selectedClientId])

  const fetchData = async () => {
    setIsLoading(true)
    setError("")
    try {
      // Fetch clients for dropdown
      const supabase = getSupabaseClient()
      const { data: clientsData, error: clientsError } = await supabase
        .from("clients")
        .select("id, company_name")
        .order("company_name")

      if (clientsError) throw new Error(`Error fetching clients: ${clientsError.message}`)
      setClients(clientsData || [])

      // Fetch live leads
      const result = await getLiveLeads(currentPage, searchTerm, selectedClientId || null)
      setLiveLeads(result.liveLeads)
      setTotalPages(result.totalPages)
    } catch (err) {
      console.error("Error fetching data:", err)
      setError(`Failed to load data: ${err.message}`)
    } finally {
      setIsLoading(false)
    }
  }

  const handlePageChange = (page) => {
    setCurrentPage(page)
  }

  const handleInputChange = (e) => {
    const { name, value } = e.target
    setFormData({
      ...formData,
      [name]: name === "monthly_revenue" ? Number.parseFloat(value) || "" : value,
    })
  }

  const handleAddSubmit = async (e) => {
    e.preventDefault()
    try {
      await createLiveLead(formData)
      setIsAddModalOpen(false)
      resetForm()
      fetchData()
    } catch (err) {
      console.error("Error adding lead:", err)
      setError(`Failed to add lead: ${err.message}`)
    }
  }

  const handleEditSubmit = async (e) => {
    e.preventDefault()
    try {
      await updateLiveLead(selectedLead.id, formData)
      setIsEditModalOpen(false)
      resetForm()
      fetchData()
    } catch (err) {
      console.error("Error updating lead:", err)
      setError(`Failed to update lead: ${err.message}`)
    }
  }

  const handleDeleteConfirm = async () => {
    try {
      await deleteLiveLead(selectedLead.id)
      setIsDeleteModalOpen(false)
      fetchData()
    } catch (err) {
      console.error("Error deleting lead:", err)
      setError(`Failed to delete lead: ${err.message}`)
    }
  }

  const openEditModal = (lead) => {
    setSelectedLead(lead)
    setFormData({
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
      batch_date: lead.batch_date ? new Date(lead.batch_date).toISOString().split("T")[0] : "",
      lead_source: lead.lead_source || "",
      lead_vendor: lead.lead_vendor || "",
      lead_type: lead.lead_type || "",
      client_id: lead.client_id || "",
    })
    setIsEditModalOpen(true)
  }

  const openDeleteModal = (lead) => {
    setSelectedLead(lead)
    setIsDeleteModalOpen(true)
  }

  const resetForm = () => {
    setFormData({
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
      batch_date: new Date().toISOString().split("T")[0],
      lead_source: "",
      lead_vendor: "",
      lead_type: "",
      client_id: "",
    })
    setSelectedLead(null)
  }

  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return "N/A"
    const date = new Date(dateString)
    return date.toLocaleDateString("en-US", {
      month: "2-digit",
      day: "2-digit",
      year: "numeric",
    })
  }

  // Format currency for display
  const formatCurrency = (value) => {
    if (!value && value !== 0) return "N/A"
    return `$${Number.parseFloat(value).toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    })}`
  }

  return (
    <div className="px-1">
      <div className="flex justify-between items-start mb-8">
        <h1 className="text-2xl font-bold text-[#05E0E9]">Live Leads Management</h1>

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

          <div className="flex items-center space-x-4">
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="p-2 border border-gray-300 rounded"
            >
              <option value="">All Clients</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.company_name}
                </option>
              ))}
            </select>

            <button
              onClick={() => {
                resetForm()
                setIsAddModalOpen(true)
              }}
              className="bg-[#05E0E9] text-white px-4 py-2 rounded"
            >
              Add New Lead
            </button>
          </div>
        </div>
      </div>

      {error && <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">{error}</div>}

      {isLoading ? (
        <div className="text-center py-10">
          <p className="text-gray-500">Loading...</p>
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
                  <th className="text-left text-[#05E0E9] pb-2">Monthly Revenue</th>
                  <th className="text-left text-[#05E0E9] pb-2">Industry</th>
                  <th className="text-left text-[#05E0E9] pb-2">Client</th>
                  <th className="text-left text-[#05E0E9] pb-2">Actions</th>
                </tr>
              </thead>
              <tbody>
                {liveLeads.map((lead, index) => (
                  <tr
                    key={lead.id}
                    style={{
                      borderBottom: index < liveLeads.length - 1 ? "1px solid #e5e7eb" : "none",
                    }}
                  >
                    <td className="py-3">{formatDate(lead.date)}</td>
                    <td className="py-3">{lead.company_name}</td>
                    <td className="py-3">{lead.owner_name}</td>
                    <td className="py-3">{formatCurrency(lead.monthly_revenue)}</td>
                    <td className="py-3">{lead.industry || "N/A"}</td>
                    <td className="py-3">{clients.find((c) => c.id === lead.client_id)?.company_name || "N/A"}</td>
                    <td className="py-3">
                      <div className="flex space-x-2">
                        <button onClick={() => openEditModal(lead)} className="text-blue-500 hover:text-blue-700">
                          <Image src="/images/edit-icon-new.png" alt="Edit" width={20} height={20} />
                        </button>
                        <button onClick={() => openDeleteModal(lead)} className="text-red-500 hover:text-red-700">
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            className="h-5 w-5"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth={2}
                              d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                            />
                          </svg>
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex justify-between items-center mt-6">
            <div>
              <span className="text-[#05E0E9] font-bold">{liveLeads.length}</span>
              <span className="text-black"> leads shown</span>
            </div>
            <div className="flex items-center space-x-2">
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="text-[#05E0E9]"
              >
                <Image src="/images/pagination-left.png" alt="Previous" width={20} height={20} />
              </button>
              {Array.from({ length: Math.min(totalPages, 5) }, (_, i) => i + 1).map((page) => (
                <span
                  key={page}
                  className={`cursor-pointer mx-1 ${
                    currentPage === page ? "text-[#05E0E9] font-bold" : "text-black font-normal"
                  }`}
                  onClick={() => handlePageChange(page)}
                >
                  {page}
                </span>
              ))}
              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
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

      {/* Add Lead Modal */}
      {isAddModalOpen && (
        <Modal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} title="Add New Lead">
          <form onSubmit={handleAddSubmit}>
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="modal-form-label">Company Name*</label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleInputChange}
                  required
                  className="modal-form-input"
                />
              </div>
              <div>
                <label className="modal-form-label">Owner Name*</label>
                <input
                  type="text"
                  name="owner_name"
                  value={formData.owner_name}
                  onChange={handleInputChange}
                  required
                  className="modal-form-input"
                />
              </div>
              <div>
                <label className="modal-form-label">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="modal-form-input"
                />
              </div>
              <div>
                <label className="modal-form-label">Mobile</label>
                <input
                  type="text"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  className="modal-form-input"
                />
              </div>
              <div>
                <label className="modal-form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="modal-form-input"
                />
              </div>
              <div>
                <label className="modal-form-label">Industry</label>
                <input
                  type="text"
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  className="modal-form-input"
                />
              </div>
              <div>
                <label className="modal-form-label">Monthly Revenue</label>
                <input
                  type="number"
                  name="monthly_revenue"
                  value={formData.monthly_revenue}
                  onChange={handleInputChange}
                  step="0.01"
                  className="modal-form-input"
                />
              </div>
              <div>
                <label className="modal-form-label">Date*</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  className="modal-form-input"
                />
              </div>
              <div>
                <label className="modal-form-label">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="modal-form-input"
                />
              </div>
              <div>
                <label className="modal-form-label">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="modal-form-input"
                />
              </div>
              <div>
                <label className="modal-form-label">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="modal-form-input"
                />
              </div>
              <div>
                <label className="modal-form-label">Zip Code</label>
                <input
                  type="text"
                  name="zip_code"
                  value={formData.zip_code}
                  onChange={handleInputChange}
                  className="modal-form-input"
                />
              </div>
            </div>

            <h3 className="text-lg font-bold text-[#05E0E9] mb-2">Admin Fields</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="modal-form-label">Batch Date</label>
                <input
                  type="date"
                  name="batch_date"
                  value={formData.batch_date}
                  onChange={handleInputChange}
                  className="modal-form-input"
                />
              </div>
              <div>
                <label className="modal-form-label">Lead Source</label>
                <input
                  type="text"
                  name="lead_source"
                  value={formData.lead_source}
                  onChange={handleInputChange}
                  className="modal-form-input"
                />
              </div>
              <div>
                <label className="modal-form-label">Lead Vendor</label>
                <input
                  type="text"
                  name="lead_vendor"
                  value={formData.lead_vendor}
                  onChange={handleInputChange}
                  className="modal-form-input"
                />
              </div>
              <div>
                <label className="modal-form-label">Lead Type</label>
                <input
                  type="text"
                  name="lead_type"
                  value={formData.lead_type}
                  onChange={handleInputChange}
                  className="modal-form-input"
                />
              </div>
              <div>
                <label className="modal-form-label">Client*</label>
                <select
                  name="client_id"
                  value={formData.client_id}
                  onChange={handleInputChange}
                  required
                  className="modal-form-select"
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
              <button type="button" onClick={() => setIsAddModalOpen(false)} className="modal-btn-secondary">
                Cancel
              </button>
              <button type="submit" className="modal-btn-primary">
                Add Lead
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Edit Lead Modal */}
      {isEditModalOpen && selectedLead && (
        <Modal isOpen={isEditModalOpen} onClose={() => setIsEditModalOpen(false)} title="Edit Lead">
          <form onSubmit={handleEditSubmit}>
            {/* Same form fields as Add Modal */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="modal-form-label">Company Name*</label>
                <input
                  type="text"
                  name="company_name"
                  value={formData.company_name}
                  onChange={handleInputChange}
                  required
                  className="modal-form-input"
                />
              </div>
              <div>
                <label className="modal-form-label">Owner Name*</label>
                <input
                  type="text"
                  name="owner_name"
                  value={formData.owner_name}
                  onChange={handleInputChange}
                  required
                  className="modal-form-input"
                />
              </div>
              <div>
                <label className="modal-form-label">Phone</label>
                <input
                  type="text"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="modal-form-input"
                />
              </div>
              <div>
                <label className="modal-form-label">Mobile</label>
                <input
                  type="text"
                  name="mobile"
                  value={formData.mobile}
                  onChange={handleInputChange}
                  className="modal-form-input"
                />
              </div>
              <div>
                <label className="modal-form-label">Email</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="modal-form-input"
                />
              </div>
              <div>
                <label className="modal-form-label">Industry</label>
                <input
                  type="text"
                  name="industry"
                  value={formData.industry}
                  onChange={handleInputChange}
                  className="modal-form-input"
                />
              </div>
              <div>
                <label className="modal-form-label">Monthly Revenue</label>
                <input
                  type="number"
                  name="monthly_revenue"
                  value={formData.monthly_revenue}
                  onChange={handleInputChange}
                  step="0.01"
                  className="modal-form-input"
                />
              </div>
              <div>
                <label className="modal-form-label">Date*</label>
                <input
                  type="date"
                  name="date"
                  value={formData.date}
                  onChange={handleInputChange}
                  required
                  className="modal-form-input"
                />
              </div>
              <div>
                <label className="modal-form-label">Address</label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="modal-form-input"
                />
              </div>
              <div>
                <label className="modal-form-label">City</label>
                <input
                  type="text"
                  name="city"
                  value={formData.city}
                  onChange={handleInputChange}
                  className="modal-form-input"
                />
              </div>
              <div>
                <label className="modal-form-label">State</label>
                <input
                  type="text"
                  name="state"
                  value={formData.state}
                  onChange={handleInputChange}
                  className="modal-form-input"
                />
              </div>
              <div>
                <label className="modal-form-label">Zip Code</label>
                <input
                  type="text"
                  name="zip_code"
                  value={formData.zip_code}
                  onChange={handleInputChange}
                  className="modal-form-input"
                />
              </div>
            </div>

            <h3 className="text-lg font-bold text-[#05E0E9] mb-2">Admin Fields</h3>
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="modal-form-label">Batch Date</label>
                <input
                  type="date"
                  name="batch_date"
                  value={formData.batch_date}
                  onChange={handleInputChange}
                  className="modal-form-input"
                />
              </div>
              <div>
                <label className="modal-form-label">Lead Source</label>
                <input
                  type="text"
                  name="lead_source"
                  value={formData.lead_source}
                  onChange={handleInputChange}
                  className="modal-form-input"
                />
              </div>
              <div>
                <label className="modal-form-label">Lead Vendor</label>
                <input
                  type="text"
                  name="lead_vendor"
                  value={formData.lead_vendor}
                  onChange={handleInputChange}
                  className="modal-form-input"
                />
              </div>
              <div>
                <label className="modal-form-label">Lead Type</label>
                <input
                  type="text"
                  name="lead_type"
                  value={formData.lead_type}
                  onChange={handleInputChange}
                  className="modal-form-input"
                />
              </div>
              <div>
                <label className="modal-form-label">Client*</label>
                <select
                  name="client_id"
                  value={formData.client_id}
                  onChange={handleInputChange}
                  required
                  className="modal-form-select"
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
              <button type="button" onClick={() => setIsEditModalOpen(false)} className="modal-btn-secondary">
                Cancel
              </button>
              <button type="submit" className="modal-btn-primary">
                Update Lead
              </button>
            </div>
          </form>
        </Modal>
      )}

      {/* Delete Confirmation Modal */}
      {isDeleteModalOpen && selectedLead && (
        <Modal isOpen={isDeleteModalOpen} onClose={() => setIsDeleteModalOpen(false)} title="Confirm Delete">
          <p className="mb-6">
            Are you sure you want to delete the lead for <strong>{selectedLead.company_name}</strong>? This action
            cannot be undone.
          </p>

          <div className="flex justify-end space-x-2">
            <button type="button" onClick={() => setIsDeleteModalOpen(false)} className="modal-btn-secondary">
              Cancel
            </button>
            <button
              type="button"
              onClick={handleDeleteConfirm}
              className="px-4 py-2 bg-red-600 text-white rounded-full"
            >
              Delete
            </button>
          </div>
        </Modal>
      )}
    </div>
  )
}
