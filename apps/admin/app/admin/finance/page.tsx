import { requirePageRole } from "@/lib/auth-access"
import { apiFetch } from "@/lib/api/fetch"
import { WithdrawalButtons } from "./withdrawal-buttons"

type Withdrawal = {
  id: string
  amount: number
  netAmount: number
  bankName: string
  accountNumber: string
  accountHolder: string
  status: string
  createdAt: string
  merchantName: string | null
  userName: string | null
}

export default async function AdminFinancePage() {
  await requirePageRole(["admin"], "/admin/login")

  const { withdrawals: wdList } = await apiFetch<{ withdrawals: Withdrawal[] }>("/api/admin/finance")

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Keuangan & Pencairan Dana</h1>
        <p className="text-gray-500">Tinjau dan proses permintaan penarikan dana dari merchant.</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-50 text-gray-700 font-medium border-b">
              <tr>
                <th className="px-6 py-4">Waktu</th>
                <th className="px-6 py-4">Merchant</th>
                <th className="px-6 py-4">Jumlah (Bersih)</th>
                <th className="px-6 py-4">Rekening Tujuan</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {wdList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-8 text-center text-gray-500">
                    Tidak ada permintaan penarikan dana.
                  </td>
                </tr>
              ) : (
                wdList.map((wd) => (
                  <tr key={wd.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-gray-500">
                      {new Date(wd.createdAt).toLocaleDateString("id-ID", {
                        day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
                      })}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      {wd.merchantName || wd.userName}
                    </td>
                    <td className="px-6 py-4 font-medium text-gray-900">
                      Rp {wd.netAmount.toLocaleString("id-ID")}
                    </td>
                    <td className="px-6 py-4 text-gray-500">
                      <div>{wd.bankName} - {wd.accountNumber}</div>
                      <div className="text-xs">{wd.accountHolder}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-2.5 py-1 rounded-full text-xs font-medium border ${
                        wd.status === 'completed' ? 'bg-emerald-50 text-emerald-700 border-emerald-200' :
                        wd.status === 'rejected' ? 'bg-red-50 text-red-700 border-red-200' :
                        'bg-amber-50 text-amber-700 border-amber-200'
                      }`}>
                        {wd.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-end">
                        <WithdrawalButtons id={wd.id} currentStatus={wd.status} />
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
