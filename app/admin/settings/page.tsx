"use client"

import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { getSupabaseClient } from "@/lib/supabaseClient"

export default function SettingsPage() {
  const [activeTab, setActiveTab] = useState("general")
  const [users, setUsers] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [saveLoading, setSaveLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState<string | null>(null)

  const [generalSettings, setGeneralSettings] = useState({
    companyName: "DriveLeadz",
    adminEmail: "admin@driveleadz.com",
    supportEmail: "admin@driveleadz.com",
    supportPhone: "(732) 387-7027",
  })

  const [invoiceSettings, setInvoiceSettings] = useState({
    invoicePrefix: "INV",
    invoiceStartNumber: "1001",
    companyAddress: "830 Morris Turnpike, Short Hills, NJ 07078",
    companyPhone: "(732) 387-7027",
    taxRate: "0",
    paymentTerms: "Due on receipt",
  })

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    newClientNotification: true,
    newInvoiceNotification: true,
    paymentReceivedNotification: true,
  })

  useEffect(() => {
    if (activeTab === "users") {
      fetchUsers()
    }

    // Load settings from localStorage on initial load
    const loadedGeneralSettings = localStorage.getItem("generalSettings")
    const loadedInvoiceSettings = localStorage.getItem("invoiceSettings")
    const loadedNotificationSettings = localStorage.getItem("notificationSettings")

    if (loadedGeneralSettings) {
      setGeneralSettings(JSON.parse(loadedGeneralSettings))
    }

    if (loadedInvoiceSettings) {
      setInvoiceSettings(JSON.parse(loadedInvoiceSettings))
    }

    if (loadedNotificationSettings) {
      setNotificationSettings(JSON.parse(loadedNotificationSettings))
    }
  }, [activeTab])

  // Clear success message after 3 seconds
  useEffect(() => {
    if (saveSuccess) {
      const timer = setTimeout(() => {
        setSaveSuccess(null)
      }, 3000)

      return () => clearTimeout(timer)
    }
  }, [saveSuccess])

  const fetchUsers = async () => {
    try {
      setLoading(true)
      setError(null)

      const supabase = getSupabaseClient()

      // Fetch users
      const { data: userData, error: userError } = await supabase
        .from("users")
        .select("*")
        .order("created_at", { ascending: false })

      if (userError) {
        throw userError
      }

      // Fetch clients for mapping
      const { data: clientData, error: clientError } = await supabase
        .from("clients")
        .select("id, company_name, user_id")

      if (clientError) {
        throw clientError
      }

      // Map clients to users
      const usersWithClients = userData.map((user) => {
        const associatedClient = clientData.find((client) => client.user_id === user.id)
        return {
          ...user,
          client: associatedClient || null,
        }
      })

      setUsers(usersWithClients || [])
    } catch (error: any) {
      console.error("Error fetching data:", error)
      setError(error.message || "Failed to fetch data")
    } finally {
      setLoading(false)
    }
  }

  const handleGeneralSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setGeneralSettings({
      ...generalSettings,
      [name]: value,
    })
  }

  const handleInvoiceSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target
    setInvoiceSettings({
      ...invoiceSettings,
      [name]: value,
    })
  }

  const handleNotificationSettingsChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target
    setNotificationSettings({
      ...notificationSettings,
      [name]: checked,
    })
  }

  const handleGeneralSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveLoading(true)

    try {
      // Save to localStorage for persistence
      localStorage.setItem("generalSettings", JSON.stringify(generalSettings))

      // In a real app, you would save to the database here
      // For now, we'll simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      setSaveSuccess("General settings saved successfully!")
    } catch (error) {
      console.error("Error saving settings:", error)
      setError("Failed to save settings")
    } finally {
      setSaveLoading(false)
    }
  }

  const handleInvoiceSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveLoading(true)

    try {
      // Save to localStorage for persistence
      localStorage.setItem("invoiceSettings", JSON.stringify(invoiceSettings))

      // In a real app, you would save to the database here
      // For now, we'll simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      setSaveSuccess("Invoice settings saved successfully!")
    } catch (error) {
      console.error("Error saving settings:", error)
      setError("Failed to save settings")
    } finally {
      setSaveLoading(false)
    }
  }

  const handleNotificationSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaveLoading(true)

    try {
      // Save to localStorage for persistence
      localStorage.setItem("notificationSettings", JSON.stringify(notificationSettings))

      // In a real app, you would save to the database here
      // For now, we'll simulate a delay
      await new Promise((resolve) => setTimeout(resolve, 500))

      setSaveSuccess("Notification settings saved successfully!")
    } catch (error) {
      console.error("Error saving settings:", error)
      setError("Failed to save settings")
    } finally {
      setSaveLoading(false)
    }
  }

  return (
    <div className="font-vectora">
      <h1 className="text-2xl font-bold mb-6 text-[#05E0E9]">Settings</h1>

      {/* Success Message */}
      {saveSuccess && (
        <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded relative mb-4">
          <span className="block sm:inline">{saveSuccess}</span>
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative mb-4">
          <span className="block sm:inline">{error}</span>
          <button className="absolute top-0 bottom-0 right-0 px-4 py-3" onClick={() => setError(null)}>
            <span className="text-xl">&times;</span>
          </button>
        </div>
      )}

      {/* Tabs */}
      <div className="flex border-b mb-6">
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "general" ? "border-b-2 border-[#05E0E9] text-[#05E0E9]" : "text-gray-500"
          }`}
          onClick={() => setActiveTab("general")}
        >
          General
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "invoice" ? "border-b-2 border-[#05E0E9] text-[#05E0E9]" : "text-gray-500"
          }`}
          onClick={() => setActiveTab("invoice")}
        >
          Invoice
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "notification" ? "border-b-2 border-[#05E0E9] text-[#05E0E9]" : "text-gray-500"
          }`}
          onClick={() => setActiveTab("notification")}
        >
          Notifications
        </button>
        <button
          className={`px-4 py-2 font-medium ${
            activeTab === "users" ? "border-b-2 border-[#05E0E9] text-[#05E0E9]" : "text-gray-500"
          }`}
          onClick={() => setActiveTab("users")}
        >
          Users
        </button>
      </div>

      <div className="space-y-8">
        {/* General Settings */}
        {activeTab === "general" && (
          <div className="bg-sidebar p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">General Settings</h2>
            <form onSubmit={handleGeneralSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Company Name</label>
                  <input
                    type="text"
                    name="companyName"
                    value={generalSettings.companyName}
                    onChange={handleGeneralSettingsChange}
                    className="w-full p-2 rounded bg-sidebar"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Admin Email</label>
                  <input
                    type="email"
                    name="adminEmail"
                    value={generalSettings.adminEmail}
                    onChange={handleGeneralSettingsChange}
                    className="w-full p-2 rounded bg-sidebar"
                  />
                </div>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Support Email</label>
                  <input
                    type="email"
                    name="supportEmail"
                    value={generalSettings.supportEmail}
                    onChange={handleGeneralSettingsChange}
                    className="w-full p-2 rounded bg-sidebar"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Support Phone</label>
                  <input
                    type="text"
                    name="supportPhone"
                    value={generalSettings.supportPhone}
                    onChange={handleGeneralSettingsChange}
                    className="w-full p-2 rounded bg-sidebar"
                  />
                </div>
              </div>
              <div className="flex justify-end">
                <button
                  type="submit"
                  className="upload-button px-4 py-2 rounded-[28px] flex items-center"
                  disabled={saveLoading}
                >
                  {saveLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Invoice Settings */}
        {activeTab === "invoice" && (
          <div className="bg-sidebar p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Invoice Settings</h2>
            <form onSubmit={handleInvoiceSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Invoice Prefix</label>
                  <input
                    type="text"
                    name="invoicePrefix"
                    value={invoiceSettings.invoicePrefix}
                    onChange={handleInvoiceSettingsChange}
                    className="w-full p-2 rounded bg-sidebar"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Invoice Start Number</label>
                  <input
                    type="text"
                    name="invoiceStartNumber"
                    value={invoiceSettings.invoiceStartNumber}
                    onChange={handleInvoiceSettingsChange}
                    className="w-full p-2 rounded bg-sidebar"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Company Address</label>
                <input
                  type="text"
                  name="companyAddress"
                  value={invoiceSettings.companyAddress}
                  onChange={handleInvoiceSettingsChange}
                  className="w-full p-2 rounded bg-sidebar"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold mb-2">Company Phone</label>
                  <input
                    type="text"
                    name="companyPhone"
                    value={invoiceSettings.companyPhone}
                    onChange={handleInvoiceSettingsChange}
                    className="w-full p-2 rounded bg-sidebar"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold mb-2">Tax Rate (%)</label>
                  <input
                    type="text"
                    name="taxRate"
                    value={invoiceSettings.taxRate}
                    onChange={handleInvoiceSettingsChange}
                    className="w-full p-2 rounded bg-sidebar"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Payment Terms</label>
                <input
                  type="text"
                  name="paymentTerms"
                  value={invoiceSettings.paymentTerms}
                  onChange={handleInvoiceSettingsChange}
                  className="w-full p-2 rounded bg-sidebar"
                />
              </div>
              <div className="flex justify-end">
                <button type="submit" className="upload-button px-4 py-2 rounded-[28px]" disabled={saveLoading}>
                  {saveLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Notification Settings */}
        {activeTab === "notification" && (
          <div className="bg-sidebar p-6 rounded-lg shadow">
            <h2 className="text-xl font-bold mb-4">Notification Settings</h2>
            <form onSubmit={handleNotificationSubmit} className="space-y-4">
              <div>
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id="emailNotifications"
                    name="emailNotifications"
                    checked={notificationSettings.emailNotifications}
                    onChange={handleNotificationSettingsChange}
                    className="mr-2 h-4 w-4 accent-[#05E0E9]"
                  />
                  <label htmlFor="emailNotifications" className="text-sm font-bold">
                    Enable Email Notifications
                  </label>
                </div>
                <p className="text-sm text-gray-600 ml-6">Master toggle for all email notifications</p>
              </div>

              <div className="ml-6 space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="newClientNotification"
                    name="newClientNotification"
                    checked={notificationSettings.newClientNotification}
                    onChange={handleNotificationSettingsChange}
                    disabled={!notificationSettings.emailNotifications}
                    className="mr-2 h-4 w-4 accent-[#05E0E9]"
                  />
                  <label htmlFor="newClientNotification" className="text-sm">
                    New Client Registration
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="newInvoiceNotification"
                    name="newInvoiceNotification"
                    checked={notificationSettings.newInvoiceNotification}
                    onChange={handleNotificationSettingsChange}
                    disabled={!notificationSettings.emailNotifications}
                    className="mr-2 h-4 w-4 accent-[#05E0E9]"
                  />
                  <label htmlFor="newInvoiceNotification" className="text-sm">
                    New Invoice Created
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="paymentReceivedNotification"
                    name="paymentReceivedNotification"
                    checked={notificationSettings.paymentReceivedNotification}
                    onChange={handleNotificationSettingsChange}
                    disabled={!notificationSettings.emailNotifications}
                    className="mr-2 h-4 w-4 accent-[#05E0E9]"
                  />
                  <label htmlFor="paymentReceivedNotification" className="text-sm">
                    Payment Received
                  </label>
                </div>
              </div>

              <div className="flex justify-end">
                <button type="submit" className="upload-button px-4 py-2 rounded-[28px]" disabled={saveLoading}>
                  {saveLoading ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Users Settings */}
        {activeTab === "users" && (
          <div className="bg-sidebar p-6 rounded-lg shadow">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold">User Management</h2>
              <Link href="/admin/users/new" className="upload-button px-4 py-2 rounded-[28px]">
                Add New User
              </Link>
            </div>

            {loading ? (
              <div className="text-center py-8">Loading users...</div>
            ) : error ? (
              <div className="bg-red-50 text-red-600 p-4 rounded mb-4">{error}</div>
            ) : (
              <>
                {/* Table Header */}
                <div className="grid grid-cols-12 py-2 mb-1">
                  <div className="col-span-3 text-[16px] font-bold text-[#05E0E9]">Name</div>
                  <div className="col-span-3 text-[16px] font-bold text-[#05E0E9]">Email</div>
                  <div className="col-span-2 text-[16px] font-bold text-[#05E0E9]">Role</div>
                  <div className="col-span-2 text-[16px] font-bold text-[#05E0E9]">Client</div>
                  <div className="col-span-2 text-[16px] font-bold text-[#05E0E9]"></div>
                </div>

                {/* Table Body */}
                {users.length > 0 ? (
                  users.map((user) => (
                    <div key={user.id} className="grid grid-cols-12 bg-sidebar py-3 px-4 mb-1">
                      <div className="col-span-3 font-medium">{user.name}</div>
                      <div className="col-span-3">{user.email}</div>
                      <div className="col-span-2 capitalize">{user.role}</div>
                      <div className="col-span-2">
                        {user.client?.company_name || (user.role === "admin" ? "N/A" : "No client")}
                      </div>
                      <div className="col-span-2 flex justify-end space-x-2">
                        <Link href={`/admin/users/${user.id}/edit`} className="text-black flex items-center">
                          <Image src="/images/edit-icon-new.png" alt="Edit" width={20} height={20} className="mr-1" />
                          Edit
                        </Link>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="bg-sidebar p-6 text-center">
                    <p className="text-gray-500">No users found</p>
                  </div>
                )}

                {users.length > 0 && (
                  <div className="mt-4 text-right">
                    <Link href="/admin/users" className="text-[#05E0E9] font-bold">
                      View All Users
                    </Link>
                  </div>
                )}
              </>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
