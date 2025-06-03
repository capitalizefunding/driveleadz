"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

export default function ClientLayout({
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
      if (parsedUser.role !== "client") {
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
      <ClientSidebar />
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

function ClientSidebar() {
  const [expanded, setExpanded] = useState(false)
  const router = useRouter()

  const navItems = [
    { name: "Home", path: "/client" },
    { name: "Leadz", path: "/client/leadz" },
    { name: "Invoices", path: "/client/invoices" },
    { name: "Marketing", path: "/client/marketing", comingSoon: true },
    { name: "Data", path: "/client/data", comingSoon: true },
  ]

  const bottomItems = [
    { name: "Settings", path: "/client/settings" },
    { name: "Support", path: "/client/support" },
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
          justifyContent: "center",
          padding: "24px 0 32px",
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
      </div>

      {/* Navigation */}
      <nav style={{ flex: 1, padding: "0 16px" }}>
        {navItems.map((item) => {
          const isActive = currentPath === item.path || (item.path !== "/client" && currentPath.startsWith(item.path))

          if (item.comingSoon) {
            return (
              <div
                key={item.name}
                style={{
                  display: "flex",
                  alignItems: "center",
                  height: "56px",
                  padding: "0 12px",
                  color: "#000000",
                  justifyContent: expanded ? "flex-start" : "center",
                }}
              >
                <img
                  src={`/images/${item.name.toLowerCase()}-inactive.png`}
                  alt={item.name}
                  style={{ width: "24px", height: "24px" }}
                />
                {expanded && (
                  <div style={{ marginLeft: "12px", display: "flex", alignItems: "center" }}>
                    <span>{item.name}</span>
                    <div
                      style={{
                        marginLeft: "8px",
                        fontSize: "10px",
                        color: "#05E0E9",
                        fontWeight: "bold",
                        lineHeight: "1.1",
                      }}
                    >
                      <div>Coming</div>
                      <div>Soon!</div>
                    </div>
                  </div>
                )}
              </div>
            )
          }

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
        {bottomItems.map((item) => {
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
