"use client"

export default function TestPage() {
  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundColor: "#ffffff",
        fontFamily: "Arial, sans-serif",
        padding: "20px",
      }}
    >
      <h1 style={{ color: "#05E0E9", fontSize: "32px", marginBottom: "20px" }}>TEST PAGE - Does this look right?</h1>

      <div
        style={{
          backgroundColor: "#E9EDF2",
          padding: "20px",
          borderRadius: "8px",
          marginBottom: "20px",
        }}
      >
        <h2 style={{ color: "#000000", fontSize: "18px" }}>Test Card</h2>
        <p style={{ color: "#000000" }}>
          If this card has a gray background and proper spacing, the basic styling works.
        </p>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "20px" }}>
        <div style={{ backgroundColor: "#E9EDF2", padding: "20px", borderRadius: "8px" }}>
          <h3 style={{ color: "#000000" }}>Card 1</h3>
          <p style={{ color: "#05E0E9", fontSize: "24px", fontWeight: "bold" }}>123</p>
        </div>
        <div style={{ backgroundColor: "#E9EDF2", padding: "20px", borderRadius: "8px" }}>
          <h3 style={{ color: "#000000" }}>Card 2</h3>
          <p style={{ color: "#05E0E9", fontSize: "24px", fontWeight: "bold" }}>456</p>
        </div>
        <div style={{ backgroundColor: "#E9EDF2", padding: "20px", borderRadius: "8px" }}>
          <h3 style={{ color: "#000000" }}>Card 3</h3>
          <p style={{ color: "#05E0E9", fontSize: "24px", fontWeight: "bold" }}>789</p>
        </div>
      </div>
    </div>
  )
}
