"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const router = useRouter()

  useEffect(() => {
    const storedUser = localStorage.getItem("user")
    if (!storedUser) {
      router.push("/login")
      return
    }

    try {
      const parsedUser = JSON.parse(storedUser)
      if (parsedUser.role !== "admin") {
        router.push("/login")
        return
      }
      setUser(parsedUser)
    } catch (e) {
      router.push("/login")
      return
    }

    setLoading(false)
  }, [router])

  if (loading) {
    return (
      <div
        style={{
          height: "100vh",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          fontFamily: "Vectora LT Std, Arial, sans-serif",
        }}
      >
        Loading...
      </div>
    )
  }

  if (!user) {
    return null
  }

  return (
    <div
      style={{
        height: "100vh",
        display: "flex",
        fontFamily: "Vectora LT Std, Arial, sans-serif",
        backgroundColor: "#ffffff",
      }}
    >
      <AdminSidebar />
      <main
        style={{
          flex: 1,
          marginLeft: "80px",
          padding: "32px",
          overflow: "auto",
        }}
      >
        {children}
      </main>
    </div>
  )
}

function AdminSidebar() {
  const [expanded, setExpanded] = useState(false)
  const router = useRouter()

  const navItems = [
    { name: "Home", path: "/admin" },
    { name: "Clients", path: "/admin/clients" },
    { name: "Leadz", path: "/admin/leadz" },
    { name: "Invoices", path: "/admin/invoices" },
    { name: "Revenue", path: "/admin/revenue" },
  ]

  const currentPath = typeof window !== "undefined" ? window.location.pathname : ""

  return (
    <div
      style={{
        position: "fixed",
        left: 0,
        top: 0,
        height: "100vh",
        width: expanded ? "250px" : "80px",
        backgroundColor: "#E9EDF2",
        zIndex: 10,
        display: "flex",
        flexDirection: "column",
        transition: "width 0.3s ease",
      }}
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
    >
      {/* Logo */}
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          padding: "24px 0",
        }}
      >
        <img
          src={expanded ? "/images/logo-expanded.png" : "/images/logo-collapsed.png"}
          alt="Logo"
          style={{
            width: expanded ? "180px" : "40px",
            height: expanded ? "60px" : "40px",
            transition: "all 0.3s ease",
          }}
        />
        {expanded && (
          <div
            style={{
              fontSize: "14px",
              fontWeight: "bold",
              marginTop: "8px",
            }}
          >
            ADMIN
          </div>
        )}
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "0 16px" }}>
        {navItems.map((item) => {
          const isActive = currentPath === item.path
          return (
            <a
              key={item.name}
              href={item.path}
              style={{
                display: "flex",
                alignItems: "center",
                height: "56px",
                padding: "0 12px",
                textDecoration: "none",
                color: isActive ? "#05E0E9" : "#000000",
                fontWeight: isActive ? "bold" : "normal",
                justifyContent: expanded ? "flex-start" : "center",
              }}
            >
              <img
                src={`/images/${item.name.toLowerCase()}-${isActive ? "active" : "inactive"}.png`}
                alt={item.name}
                style={{ width: "24px", height: "24px" }}
              />
              {expanded && <span style={{ marginLeft: "12px" }}>{item.name}</span>}
            </a>
          )
        })}
      </nav>

      {/* Bottom */}
      <div style={{ padding: "0 16px 32px" }}>
        <a
          href="/admin/settings"
          style={{
            display: "flex",
            alignItems: "center",
            height: "56px",
            padding: "0 12px",
            textDecoration: "none",
            color: "#000000",
            justifyContent: expanded ? "flex-start" : "center",
          }}
        >
          <img src="/images/settings-inactive.png" alt="Settings" style={{ width: "24px", height: "24px" }} />
          {expanded && <span style={{ marginLeft: "12px" }}>Settings</span>}
        </a>

        <button
          onClick={() => {
            localStorage.removeItem("user")
            router.push("/login")
          }}
          style={{
            display: "flex",
            alignItems: "center",
            height: "56px",
            padding: "0 12px",
            background: "none",
            border: "none",
            cursor: "pointer",
            color: "#000000",
            width: "100%",
            justifyContent: expanded ? "flex-start" : "center",
          }}
        >
          <img src="/images/logout-icon.png" alt="Logout" style={{ width: "24px", height: "24px" }} />
          {expanded && <span style={{ marginLeft: "12px" }}>Logout</span>}
        </button>
      </div>
    </div>
  )
}
