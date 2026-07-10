import { requirePageRole } from "@/lib/auth-access"
import { apiFetch } from "@/lib/api/fetch"
import { CalendarClock, Plus } from "lucide-react"
import Link from "next/link"
import { DeleteSlotButton } from "./delete-button"

type Slot = {
  id: string
  venueName: string
  courtName: string
  slotDate: string
  startTime: string
  endTime: string
  price: number
  status: string
}

export const dynamic = "force-dynamic"

export default async function MerchantSlotsPage() {
  await requirePageRole(["merchant_owner", "merchant_staff"], "/merchant")
  const mySlots = await apiFetch<Slot[]>("/api/merchant/slots")

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Slot Jadwal</h1>
          <p className="text-gray-600 mt-1">Kelola ketersediaan jam dan harga sewa lapangan Anda.</p>
        </div>
        <Link href="/merchant/slots/new" className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-semibold transition">
          <Plus className="h-5 w-5" />
          Tambah Slot
        </Link>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {mySlots.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <CalendarClock className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Anda belum menambahkan slot jadwal satupun.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 font-semibold text-gray-600 text-sm">Venue & Court</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Tanggal & Waktu</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Harga</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Status</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {mySlots.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50">
                  <td className="p-4">
                    <p className="font-medium text-gray-900">{s.venueName}</p>
                    <p className="text-sm text-gray-500">{s.courtName}</p>
                  </td>
                  <td className="p-4 text-gray-600">
                    {s.slotDate} <br /> {s.startTime} - {s.endTime}
                  </td>
                  <td className="p-4 font-medium text-gray-900">
                    Rp {s.price.toLocaleString("id-ID")}
                  </td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      s.status === 'available' ? 'bg-green-100 text-green-700' :
                      s.status === 'booked' ? 'bg-blue-100 text-blue-700' :
                      'bg-gray-100 text-gray-700'
                    }`}>
                      {s.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4 flex gap-4">
                    <button className="text-emerald-600 font-semibold hover:underline">Edit</button>
                    <DeleteSlotButton id={s.id} description={`${s.slotDate} ${s.startTime}`} />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}
