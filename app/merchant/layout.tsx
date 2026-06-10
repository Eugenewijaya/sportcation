import type { ReactNode } from "react"
import { requirePageRole } from "@/lib/auth-access"

export default async function MerchantLayout({ children }: { children: ReactNode }) {
  await requirePageRole(["merchant_owner", "merchant_staff"], "/merchant")
  return children
}
