"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createSlotAction } from "../../../actions/slot-actions"
import { Loader2 } from "lucide-react"

type CourtOption = {
  id: string
  name: string
  venueName: string
}

export function SlotForm({ courts }: { courts: CourtOption[] }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsPending(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await createSlotAction(formData)

    if (result?.error) {
      setError(result.error)
      setIsPending(false)
    } else {
      router.push("/merchant/slots")
      router.refresh()
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm font-medium">
          {error}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Lapangan (Court)</label>
        <select 
          required 
          name="courtId" 
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
        >
          <option value="">-- Pilih Lapangan --</option>
          {courts.map(c => (
            <option key={c.id} value={c.id}>{c.venueName} - {c.name}</option>
          ))}
        </select>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Tanggal</label>
        <input 
          required 
          name="slotDate" 
          type="date" 
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500" 
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Waktu Mulai (HH:mm)</label>
          <input 
            required 
            name="startTime" 
            type="time" 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Waktu Selesai (HH:mm)</label>
          <input 
            required 
            name="endTime" 
            type="time" 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500" 
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Harga (Rp)</label>
        <input 
          required 
          name="price" 
          type="number" 
          min="1"
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500" 
          placeholder="150000" 
        />
      </div>

      <div className="pt-4 flex justify-end gap-3">
        <button 
          type="button" 
          onClick={() => router.back()} 
          className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
          disabled={isPending}
        >
          Batal
        </button>
        <button 
          type="submit" 
          disabled={isPending}
          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-medium flex items-center gap-2"
        >
          {isPending && <Loader2 className="h-4 w-4 animate-spin" />}
          Simpan Slot
        </button>
      </div>
    </form>
  )
}
