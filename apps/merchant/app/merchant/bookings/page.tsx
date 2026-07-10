import { requirePageRole } from "@/lib/auth-access"
import { apiFetch } from "@/lib/api/fetch"
import { CalendarDays, Filter } from "lucide-react"

type MerchantBooking = {
  id: string
  bookingCode: string
  status: string
  totalAmount: number
  createdAt: string
  customer: { name: string; email: string | null }
  payment: { amount: number }
}

export const dynamic = "force-dynamic"

export default async function MerchantBookingsPage() {
  await requirePageRole(["merchant_owner", "merchant_staff"], "/merchant")
  const myBookings = await apiFetch<MerchantBooking[]>("/api/merchant/bookings")

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Data Pesanan</h1>
          <p className="text-gray-600 mt-1">Lacak semua pesanan yang masuk ke venue Anda.</p>
        </div>
        <button className="flex items-center gap-2 bg-white border border-gray-200 hover:bg-gray-50 text-gray-700 px-4 py-2 rounded-lg font-semibold transition">
          <Filter className="h-5 w-5" />
          Filter
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {myBookings.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <CalendarDays className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Belum ada pesanan yang masuk.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 font-semibold text-gray-600 text-sm">Kode Booking</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Customer</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Total Tagihan</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Status</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {myBookings.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900">{b.bookingCode}</td>
                  <td className="p-4 text-gray-600">{b.customer.name || b.customer.email}</td>
                  <td className="p-4 text-gray-600">Rp {b.totalAmount.toLocaleString("id-ID")}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      b.status === "confirmed" ? "bg-green-100 text-green-700" :
                      b.status === "pending_payment" ? "bg-amber-100 text-amber-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {b.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4">
                    <button className="text-emerald-600 font-semibold hover:underline">Detail</button>
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

