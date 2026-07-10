import { requirePageRole } from "@/lib/auth-access"
import { apiFetch } from "@/lib/api/fetch"
import { SlotForm } from "./slot-form"

type Court = { id: string; name: string; venueName: string }

export default async function NewSlotPage() {
  await requirePageRole(["merchant_owner", "merchant_staff"], "/merchant")

  const { courts: myCourts } = await apiFetch<{ courts: Court[] }>("/api/merchant/courts")

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tambah Slot Jadwal</h1>
        <p className="text-gray-600 mt-1">Tambahkan jam tersedia untuk disewa.</p>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <SlotForm courts={myCourts} />
      </div>
    </div>
  )
}
