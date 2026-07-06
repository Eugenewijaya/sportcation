import { requirePageRole } from "@/lib/auth-access"
import { getDb } from "@/lib/db"
import { bookings, payments, users } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"
import { CalendarDays, Filter } from "lucide-react"

import { findMerchantContext } from "@/lib/repositories/merchant-repository"
import { venues } from "@/lib/db/schema"

export const dynamic = "force-dynamic"

export default async function MerchantBookingsPage() {
  const session = await requirePageRole(["merchant_owner", "merchant_staff"], "/merchant")
  const db = getDb()
  const merchantContext = await findMerchantContext(db, session.user.id)
  if (!merchantContext) return null

  // Join bookings with users and payments and venues
  const myBookings = await db
    .select({
      booking: bookings,
      user: users,
      payment: payments
    })
    .from(bookings)
    .innerJoin(users, eq(bookings.userId, users.id))
    .innerJoin(payments, eq(bookings.id, payments.bookingId))
    .innerJoin(venues, eq(bookings.venueId, venues.id))
    .where(eq(venues.merchantId, merchantContext.merchantId))
    .orderBy(desc(bookings.createdAt))

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
                <tr key={b.booking.id} className="hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900">{b.booking.bookingCode}</td>
                  <td className="p-4 text-gray-600">{b.user.name || b.user.email}</td>
                  <td className="p-4 text-gray-600">Rp {b.payment.amount.toLocaleString("id-ID")}</td>
                  <td className="p-4">
                    <span className={`px-2 py-1 rounded-full text-xs font-bold ${
                      b.booking.status === "confirmed" ? "bg-green-100 text-green-700" :
                      b.booking.status === "pending_payment" ? "bg-amber-100 text-amber-700" :
                      "bg-gray-100 text-gray-700"
                    }`}>
                      {b.booking.status.toUpperCase()}
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
