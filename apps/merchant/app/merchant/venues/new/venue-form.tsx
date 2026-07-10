"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createVenueAction } from "../../../actions/venue-actions"
import { Loader2 } from "lucide-react"

export function VenueForm({ categories }: { categories: any[] }) {
  const router = useRouter()
  const [error, setError] = useState<string | null>(null)
  const [isPending, setIsPending] = useState(false)

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsPending(true)
    setError(null)

    const formData = new FormData(e.currentTarget)
    const result = await createVenueAction(formData)

    if (result?.error) {
      setError(result.error)
      setIsPending(false)
    } else {
      router.push("/merchant/venues")
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
        <label className="block text-sm font-medium text-gray-700 mb-1">Nama Venue</label>
        <input 
          required 
          name="name" 
          type="text" 
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500" 
          placeholder="Cth: Padel Arena Senopati" 
        />
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Kategori Olahraga</label>
        <select 
          required 
          name="categoryId" 
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500"
        >
          <option value="">-- Pilih Kategori --</option>
          {categories.map(c => (
            <option key={c.id} value={c.id}>{c.name}</option>
          ))}
        </select>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Kota</label>
          <input 
            required 
            name="city" 
            type="text" 
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500" 
            placeholder="Cth: Jakarta Selatan" 
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">Harga Mulai Dari (Rp)</label>
          <input 
            required 
            name="priceFrom" 
            type="number" 
            min="0"
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500" 
            placeholder="350000" 
          />
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Alamat Lengkap</label>
        <textarea 
          required 
          name="address" 
          rows={3}
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-emerald-500 focus:border-emerald-500" 
          placeholder="Jalan..." 
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
          Simpan Venue
        </button>
      </div>
    </form>
  )
}
