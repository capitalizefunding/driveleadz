import { redirect } from "next/navigation"

export default function Home() {
  redirect("/login")

  // This won't be shown due to the redirect, but is needed for TypeScript
  return null
}
