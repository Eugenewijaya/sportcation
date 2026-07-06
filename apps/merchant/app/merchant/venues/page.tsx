import { requirePageRole } from "@/lib/auth-access"
import { getDb } from "@/lib/db"
import { venues } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { MapPin, Plus } from "lucide-react"

import { findMerchantContext } from "@/lib/repositories/merchant-repository"

export const dynamic = "force-dynamic"

export default async function MerchantVenuesPage() {
  const session = await requirePageRole(["merchant_owner", "merchant_staff"], "/merchant")
  const db = getDb()
  const merchantContext = await findMerchantContext(db, session.user.id)
  if (!merchantContext) return null

  const myVenues = await db.select().from(venues).where(eq(venues.merchantId, merchantContext.merchantId))

  return (
    <div className="p-8">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manajemen Lapangan</h1>
          <p className="text-gray-600 mt-1">Kelola daftar venue dan lapangan yang Anda sewakan.</p>
        </div>
        <button className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-semibold transition">
          <Plus className="h-5 w-5" />
          Tambah Venue
        </button>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        {myVenues.length === 0 ? (
          <div className="p-12 text-center text-gray-500">
            <MapPin className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Anda belum menambahkan lapangan satupun.</p>
          </div>
        ) : (
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200">
                <th className="p-4 font-semibold text-gray-600 text-sm">Nama Venue</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Kota</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Status</th>
                <th className="p-4 font-semibold text-gray-600 text-sm">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {myVenues.map((v) => (
                <tr key={v.id} className="hover:bg-gray-50">
                  <td className="p-4 font-medium text-gray-900">{v.name}</td>
                  <td className="p-4 text-gray-600">{v.city}</td>
                  <td className="p-4">
                    <span className="px-2 py-1 rounded-full text-xs font-bold bg-green-100 text-green-700">
                      {v.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="p-4">
                    <button className="text-emerald-600 font-semibold hover:underline">Edit</button>
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
