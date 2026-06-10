import type { ReactNode } from "react"
import { requirePageRole } from "@/lib/auth-access"

export default async function AdminLayout({ children }: { children: ReactNode }) {
  await requirePageRole(["admin"], "/admin")
  return children
}
