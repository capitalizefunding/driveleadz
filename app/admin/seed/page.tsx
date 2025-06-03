"use client"

import { useState } from "react"
import { seedDatabase } from "@/scripts/seed-database"

export default function SeedPage() {
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{ success: boolean; error: string | null } | null>(null)

  async function handleSeed() {
    setLoading(true)
    const result = await seedDatabase()
    setResult(result)
    setLoading(false)
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Seed Database</h1>

      <div className="bg-yellow-50 border border-yellow-200 p-4 rounded mb-6">
        <p className="text-yellow-800">
          Warning: This will seed your database with sample data. Only use this in development or if you want to reset
          your database.
        </p>
      </div>

      <button
        onClick={handleSeed}
        disabled={loading}
        className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded disabled:opacity-50"
      >
        {loading ? "Seeding..." : "Seed Database"}
      </button>

      {result && (
        <div className={`mt-4 p-4 rounded ${result.success ? "bg-green-50 text-green-800" : "bg-red-50 text-red-800"}`}>
          {result.success ? "Database seeded successfully!" : `Error: ${result.error}`}
        </div>
      )}
    </div>
  )
}
