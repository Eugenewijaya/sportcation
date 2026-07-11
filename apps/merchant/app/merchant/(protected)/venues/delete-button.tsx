"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { deleteVenueAction } from "../../actions/venue-actions"
import { Trash2, Loader2 } from "lucide-react"

export function DeleteVenueButton({ id, venueName }: { id: string, venueName: string }) {
  const [isPending, setIsPending] = useState(false)
  const router = useRouter()

  async function handleDelete() {
    if (!confirm(`Yakin ingin menghapus venue ${venueName}?`)) return
    
    setIsPending(true)
    const result = await deleteVenueAction(id)
    
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
      title="Hapus Venue"
    >
      {isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Trash2 className="h-4 w-4" />}
      Hapus
    </button>
  )
}
