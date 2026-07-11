import type { ReactNode } from "react"
import { requirePageRole } from "@/lib/auth-access"

import { getServerSession } from "@/lib/auth-access"

export default async function AdminLayout({ children }: { children: ReactNode }) {
  const { headers } = await import("next/headers");
  const rawHeaders = await headers();
  const session = await getServerSession();
  
  if (!session) {
    return (
      <div style={{ padding: 20, color: "white", background: "black" }}>
        <h1>DEBUG INFO</h1>
        <pre>{JSON.stringify(Object.fromEntries(rawHeaders.entries()), null, 2)}</pre>
      </div>
    )
  }

  await requirePageRole(["admin"], "/admin")
  return children
}
