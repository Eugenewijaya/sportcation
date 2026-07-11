"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { deleteSlotAction } from "../../actions/slot-actions"
import { Trash2, Loader2 } from "lucide-react"

export function DeleteSlotButton({ id, description }: { id: string, description: string }) {
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    if (!confirm(`Yakin ingin menghapus slot jadwal ${description}?`)) return
    
    setIsPending(true)
    const result = await deleteSlotAction(id)
    
    if (result?.error) {
      alert(result.error)
      setIsPending(false)
    } else {
      router.refresh()
    }
  }

  return (
    <button 
      onClick={handleDelete}
      disabled={isPending}
      className="text-red-600 font-semibold hover:underline flex items-center gap-1 disabled:opacity-50"
      title="Hapus Slot"
    >
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      Hapus
    </button>
  )
}
