import type { ReactNode } from "react"
import { requirePageRole } from "@/lib/auth-access"

export default async function CustomerAppLayout({ children }: { children: ReactNode }) {
  await requirePageRole(["customer", "merchant_owner", "merchant_staff", "admin"], "/app")
  return children
}
