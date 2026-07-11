import { requirePageRole } from "@/lib/auth-access"
import { apiFetch } from "@/lib/api/fetch"
import { MerchantModerationButtons } from "./moderation-buttons"
import { Search } from "lucide-react"

type Merchant = {
  id: string
  businessName: string
  status: string
  ownerName: string | null
  ownerEmail: string | null
  ownerPhone: string | null
}

export default async function AdminMerchantsPage() {
  await requirePageRole(["admin"], "/admin/login")

  const merchants = await apiFetch<Merchant[]>("/api/admin/merchants")

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Verifikasi Merchant</h1>
          <p className="text-gray-500">Kelola status dan verifikasi pendaftaran merchant.</p>
        </div>
        <div className="relative w-full md:w-64">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
          <input 
            type="text" 
            placeholder="Cari merchant..." 
            className="w-full pl-9 pr-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-700 font-medium border-b">
              <tr>
                <th className="px-6 py-4">Nama Bisnis</th>
                <th className="px-6 py-4">Pemilik</th>
                <th className="px-6 py-4">Kontak</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {merchants.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-8 text-center text-gray-500">
                    Tidak ada data merchant.
                  </td>
                </tr>
              ) : (
                merchants.map((merchant) => (
                  <tr key={merchant.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {merchant.businessName}
                    </td>
                    <td className="px-6 py-4">
                      {merchant.ownerName || "-"}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      {merchant.ownerEmail}<br/>
                      {merchant.ownerPhone}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${
                        merchant.status === 'verified' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        merchant.status === 'suspended' ? 'bg-red-50 text-red-700 border-red-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {merchant.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end">
                        <MerchantModerationButtons id={merchant.id} currentStatus={merchant.status} />
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
