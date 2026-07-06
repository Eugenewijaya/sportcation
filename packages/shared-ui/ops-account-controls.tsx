"use client"

import { useRouter } from "next/navigation"
import { LoaderCircle, LogOut } from "lucide-react"
import { useState } from "react"
import { authClient } from "@/lib/auth-client"

export function OpsAccountControls({ compact = false }: { compact?: boolean }) {
  const router = useRouter()
  const { data: session, isPending } = authClient.useSession()
  const [signingOut, setSigningOut] = useState(false)

  async function signOut() {
    setSigningOut(true)
    await authClient.signOut()
    router.push("/login")
    router.refresh()
  }

  if (compact) {
    return (
      <button
        type="button"
        onClick={() => void signOut()}
        disabled={signingOut}
        title="Logout"
        className="grid h-10 w-10 place-items-center rounded-full bg-[#071413] text-white disabled:opacity-60"
      >
        {signingOut ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
      </button>
    )
  }

  return (
    <div className="rounded-2xl bg-[#f3f6f6] p-4">
      <p className="truncate text-sm font-black">{isPending ? "Loading session..." : session?.user.name}</p>
      <p className="mt-1 truncate text-xs font-semibold text-[#7c8488]">{session?.user.email}</p>
      <button
        type="button"
        onClick={() => void signOut()}
        disabled={signingOut}
        className="mt-4 inline-flex h-10 w-full items-center justify-center gap-2 rounded-xl bg-[#071413] text-xs font-black uppercase tracking-[0.12em] text-white disabled:opacity-60"
      >
        {signingOut ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <LogOut className="h-4 w-4" />}
        Logout
      </button>
    </div>
  )
}
