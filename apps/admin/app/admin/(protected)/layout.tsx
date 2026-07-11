import type { ReactNode } from "react"
import { requirePageRole } from "@/lib/auth-access"

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const { headers } = await import("next/headers");
  console.log("SERVER HEADERS:", Object.fromEntries((await headers()).entries()));
  await requirePageRole(["admin"], "/admin")
  return children
}
