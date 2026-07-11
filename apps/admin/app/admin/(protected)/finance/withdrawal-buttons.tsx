"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { processWithdrawalAction } from "@/app/actions/finance-actions"
import { CheckCircle, XCircle, Loader2 } from "lucide-react"

export function WithdrawalButtons({ id, currentStatus }: { id: string, currentStatus: string }) {
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  async function handleProcess(action: "completed" | "rejected") {
    if (!confirm(`Proses penarikan ini sebagai ${action}?`)) return
    
    setIsPending(true)
    const result = await processWithdrawalAction(id, action)
    
    if (result?.error) {
      alert(result.error)
    }
    
    setIsPending(false)
    router.refresh()
  }

  // Only show buttons if pending or processing
  if (currentStatus !== "pending" && currentStatus !== "processing") {
    return null
  }

  return (
    <div className="flex gap-2">
      <button 
        onClick={() => handleProcess("completed")}
        disabled={isPending}
        className="flex items-center gap-1 text-sm bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded hover:bg-emerald-100 font-medium"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
        Selesai
      </button>
      <button 
        onClick={() => handleProcess("rejected")}
        disabled={isPending}
        className="flex items-center gap-1 text-sm bg-red-50 text-red-700 px-3 py-1.5 rounded hover:bg-red-100 font-medium"
      >
        {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <XCircle className="h-4 w-4" />}
        Tolak
      </button>
    </div>
  )
}
