import { requirePageRole } from "@/lib/auth-access"
import { apiFetch } from "@/lib/api/fetch"
import { Wallet, ArrowUpRight, ArrowDownRight, Clock, ShieldCheck } from "lucide-react"
import { WithdrawButton } from "@/components/withdraw-button"

type FinanceData = {
  wallet: { availableBalance: number; pendingBalance: number } | null
  transactions: Array<{ id: string; amount: number; description: string; balanceType: string; createdAt: string }>
  withdrawals: Array<{ id: string; netAmount: number; bankName: string; accountNumber: string; status: string; createdAt: string }>
}

export default async function MerchantFinancePage() {
  await requirePageRole(["merchant_owner", "merchant_staff"], "/merchant")

  const data = await apiFetch<FinanceData>("/api/merchant/finance")
  const { wallet, transactions, withdrawals: wdList } = data

  return (
    <div className="mx-auto max-w-4xl p-6">
      <h1 className="mb-8 text-2xl font-bold tracking-tight text-[#0f2923]">Keuangan Merchant</h1>

      <div className="mb-8 grid gap-4 sm:grid-cols-2">
        <div className="rounded-2xl bg-gradient-to-br from-[#007c61] to-[#005a46] p-6 text-white shadow-lg">
          <div className="mb-4 flex items-center justify-between opacity-80">
            <span className="text-sm font-medium">Saldo Tersedia</span>
            <Wallet className="h-5 w-5" />
          </div>
          <div className="text-3xl font-black tracking-tight">
            Rp {(wallet?.availableBalance || 0).toLocaleString("id-ID")}
          </div>
          <div className="mt-6">
            <WithdrawButton maxAmount={wallet?.availableBalance || 0} hasPin={true} />
          </div>
        </div>

        <div className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center justify-between text-gray-500">
            <span className="text-sm font-medium">Saldo Tertahan</span>
            <ShieldCheck className="h-5 w-5 text-[#ffc532]" />
          </div>
          <div className="text-3xl font-black tracking-tight text-gray-900">
            Rp {(wallet?.pendingBalance || 0).toLocaleString("id-ID")}
          </div>
          <p className="mt-2 text-xs leading-relaxed text-gray-500">
            Dana dari booking yang belum selesai ditahan sementara untuk keamanan. Akan otomatis masuk ke Saldo Tersedia setelah jadwal main berakhir.
          </p>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="mb-4 text-lg font-bold text-[#0f2923]">Status Penarikan Terakhir</h2>
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Tanggal</th>
                  <th className="px-4 py-3 font-medium">Nominal Bersih</th>
                  <th className="px-4 py-3 font-medium">Tujuan</th>
                  <th className="px-4 py-3 font-medium">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {wdList.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-gray-500">
                      Belum ada riwayat penarikan.
                    </td>
                  </tr>
                ) : (
                  wdList.map((wd) => (
                    <tr key={wd.id}>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(wd.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-4 py-3 font-medium">Rp {wd.netAmount.toLocaleString("id-ID")}</td>
                      <td className="px-4 py-3 text-gray-600">
                        {wd.bankName} - {wd.accountNumber}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center rounded-full px-2 py-0.5 text-xs font-medium ${
                            wd.status === "completed"
                              ? "bg-emerald-50 text-emerald-700"
                              : wd.status === "pending" || wd.status === "processing"
                                ? "bg-amber-50 text-amber-700"
                                : "bg-red-50 text-red-700"
                          }`}
                        >
                          {wd.status}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div>
        <h2 className="mb-4 text-lg font-bold text-[#0f2923]">Riwayat Ledger</h2>
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="divide-y divide-gray-100">
            {transactions.length === 0 ? (
              <div className="p-8 text-center text-gray-500">Belum ada transaksi.</div>
            ) : (
              transactions.map((tx) => (
                <div key={tx.id} className="flex items-center justify-between p-4">
                  <div className="flex items-center gap-3">
                    <div
                      className={`flex h-10 w-10 items-center justify-center rounded-full ${
                        tx.amount > 0 ? "bg-emerald-50 text-emerald-600" : "bg-red-50 text-red-600"
                      }`}
                    >
                      {tx.amount > 0 ? <ArrowDownRight className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">{tx.description}</div>
                      <div className="flex items-center gap-2 text-xs text-gray-500">
                        <Clock className="h-3 w-3" />
                        {new Date(tx.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                        <span>•</span>
                        <span>{tx.balanceType === "pending" ? "Saldo Tertahan" : "Saldo Tersedia"}</span>
                      </div>
                    </div>
                  </div>
                  <div className={`font-bold ${tx.amount > 0 ? "text-emerald-600" : "text-gray-900"}`}>
                    {tx.amount > 0 ? "+" : ""}
                    Rp {tx.amount.toLocaleString("id-ID")}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
