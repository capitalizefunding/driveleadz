"use client"

import { useState, useEffect } from "react"

export default function ClientSettingsPage() {
  const [activeTab, setActiveTab] = useState("notifications")

  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    newLeadListNotification: true,
    weeklyReportNotification: true,
  })

  const [passwordData, setPasswordData] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  })

  const [notificationSaveStatus, setNotificationSaveStatus] = useState({
    loading: false,
    success: false,
    error: null,
  })

  const [passwordSaveStatus, setPasswordSaveStatus] = useState({
    loading: false,
    success: false,
    error: null,
  })

  // Load saved notification settings on component mount
  useEffect(() => {
    const savedSettings = localStorage.getItem("notificationSettings")
    if (savedSettings) {
      setNotificationSettings(JSON.parse(savedSettings))
    }
  }, [])

  const handleNotificationSettingsChange = (e) => {
    const { name, checked } = e.target
    setNotificationSettings({
      ...notificationSettings,
      [name]: checked,
    })
  }

  const handlePasswordChange = (e) => {
    const { name, value } = e.target
    setPasswordData({
      ...passwordData,
      [name]: value,
    })
  }

  const handleNotificationSubmit = (e) => {
    e.preventDefault()
    setNotificationSaveStatus({ loading: true, success: false, error: null })

    // Simulate API call
    setTimeout(() => {
      // Save to localStorage for persistence
      localStorage.setItem("notificationSettings", JSON.stringify(notificationSettings))
      setNotificationSaveStatus({ loading: false, success: true, error: null })

      // Reset success message after 3 seconds
      setTimeout(() => {
        setNotificationSaveStatus({ loading: false, success: false, error: null })
      }, 3000)
    }, 800)
  }

  const handlePasswordSubmit = (e) => {
    e.preventDefault()
    setPasswordSaveStatus({ loading: true, success: false, error: null })

    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordSaveStatus({
        loading: false,
        success: false,
        error: "New passwords do not match!",
      })
      return
    }

    if (passwordData.newPassword.length < 8) {
      setPasswordSaveStatus({
        loading: false,
        success: false,
        error: "Password must be at least 8 characters long",
      })
      return
    }

    // Simulate API call
    setTimeout(() => {
      setPasswordSaveStatus({ loading: false, success: true, error: null })
      setPasswordData({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      })

      // Reset success message after 3 seconds
      setTimeout(() => {
        setPasswordSaveStatus({ loading: false, success: false, error: null })
      }, 3000)
    }, 800)
  }

  return (
    <div className="font-vectora">
      <h1 className="text-2xl font-bold mb-6 text-[#05E0E9]">Settings</h1>

      <div>
        {/* Tabs */}
        <div className="border-b border-gray-700 mb-6">
          <div className="flex">
            <button
              onClick={() => setActiveTab("notifications")}
              className={`mr-8 py-2 text-sm font-medium ${
                activeTab === "notifications"
                  ? "text-[#05E0E9] border-b-2 border-[#05E0E9]"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              Notifications
            </button>
            <button
              onClick={() => setActiveTab("password")}
              className={`mr-8 py-2 text-sm font-medium ${
                activeTab === "password"
                  ? "text-[#05E0E9] border-b-2 border-[#05E0E9]"
                  : "text-gray-400 hover:text-gray-300"
              }`}
            >
              Change Password
            </button>
          </div>
        </div>

        {/* Notification Settings Panel */}
        {activeTab === "notifications" && (
          <div className="bg-[#F0F4F8] dark:bg-sidebar p-6 rounded-lg">
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
                <p className="text-sm text-gray-600 dark:text-gray-400 ml-6">
                  Master toggle for all email notifications
                </p>
              </div>

              <div className="ml-6 space-y-2">
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="newLeadListNotification"
                    name="newLeadListNotification"
                    checked={notificationSettings.newLeadListNotification}
                    onChange={handleNotificationSettingsChange}
                    disabled={!notificationSettings.emailNotifications}
                    className="mr-2 h-4 w-4 accent-[#05E0E9]"
                  />
                  <label htmlFor="newLeadListNotification" className="text-sm">
                    New Lead List Available
                  </label>
                </div>
                <div className="flex items-center">
                  <input
                    type="checkbox"
                    id="weeklyReportNotification"
                    name="weeklyReportNotification"
                    checked={notificationSettings.weeklyReportNotification}
                    onChange={handleNotificationSettingsChange}
                    disabled={!notificationSettings.emailNotifications}
                    className="mr-2 h-4 w-4 accent-[#05E0E9]"
                  />
                  <label htmlFor="weeklyReportNotification" className="text-sm">
                    Weekly Lead Summary Report
                  </label>
                </div>
              </div>

              <div className="flex justify-end mt-6">
                <button
                  type="submit"
                  className="bg-[#05E0E9] text-black px-4 py-2 rounded-full font-medium hover:bg-[#04c4cc] transition-colors flex items-center justify-center min-w-[120px]"
                  disabled={notificationSaveStatus.loading}
                >
                  {notificationSaveStatus.loading ? "Saving..." : "Save Changes"}
                </button>
              </div>

              {notificationSaveStatus.success && (
                <div className="mt-2 text-green-500 text-sm">Notification settings saved successfully!</div>
              )}

              {notificationSaveStatus.error && (
                <div className="mt-2 text-red-500 text-sm">{notificationSaveStatus.error}</div>
              )}
            </form>
          </div>
        )}

        {/* Change Password Panel */}
        {activeTab === "password" && (
          <div className="bg-[#F0F4F8] dark:bg-sidebar p-6 rounded-lg">
            <h2 className="text-xl font-bold mb-4">Change Password</h2>
            <form onSubmit={handlePasswordSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-bold mb-2">Current Password</label>
                <input
                  type="password"
                  name="currentPassword"
                  value={passwordData.currentPassword}
                  onChange={handlePasswordChange}
                  className="w-full p-2 rounded bg-white dark:bg-sidebar focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">New Password</label>
                <input
                  type="password"
                  name="newPassword"
                  value={passwordData.newPassword}
                  onChange={handlePasswordChange}
                  className="w-full p-2 rounded bg-white dark:bg-sidebar focus:outline-none"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-bold mb-2">Confirm New Password</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={passwordData.confirmPassword}
                  onChange={handlePasswordChange}
                  className="w-full p-2 rounded bg-white dark:bg-sidebar focus:outline-none"
                  required
                />
              </div>
              <div className="flex justify-end mt-6">
                <button
                  type="submit"
                  className="bg-[#05E0E9] text-black px-4 py-2 rounded-full font-medium hover:bg-[#04c4cc] transition-colors flex items-center justify-center min-w-[120px]"
                  disabled={passwordSaveStatus.loading}
                >
                  {passwordSaveStatus.loading ? "Updating..." : "Update Password"}
                </button>
              </div>

              {passwordSaveStatus.success && (
                <div className="mt-2 text-green-500 text-sm">Password updated successfully!</div>
              )}

              {passwordSaveStatus.error && <div className="mt-2 text-red-500 text-sm">{passwordSaveStatus.error}</div>}
            </form>
          </div>
        )}
      </div>
    </div>
  )
}
