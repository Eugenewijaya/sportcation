"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { updateMerchantStatusAction } from "@/app/actions/moderation-actions"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

export function MerchantModerationButtons({ id, currentStatus }: { id: string, currentStatus: string }) {
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  async function handleUpdate(status: "verified" | "suspended") {
    if (!confirm(`Ubah status menjadi ${status}?`)) return
    
    setIsPending(true)
    const result = await updateMerchantStatusAction(id, status)
    
    if (result?.error) {
      alert(result.error)
    }
    
    setIsPending(false)
    router.refresh()
  }

  return (
    <div className="flex gap-2">
      {currentStatus !== "verified" && (
        <button 
          onClick={() => handleUpdate("verified")}
          disabled={isPending}
          className="flex items-center gap-1 text-sm bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded hover:bg-emerald-100 font-medium"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
          Verifikasi
        </button>
      )}
      {currentStatus !== "suspended" && (
        <button 
          onClick={() => handleUpdate("suspended")}
          disabled={isPending}
          className="flex items-center gap-1 text-sm bg-red-50 text-red-700 px-3 py-1.5 rounded hover:bg-red-100 font-medium"
        >
          {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
          Suspend
        </button>
      )}
    </div>
  )
}
