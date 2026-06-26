import { requirePageRole } from "@/lib/auth-access"
import { getDb } from "@/lib/db"
import { eq, desc } from "drizzle-orm"
import { ledgerTransactions, withdrawals, users } from "@/lib/db/schema"
import { Wallet, CheckCircle, XCircle } from "lucide-react"

export default async function AdminFinancePage() {
  await requirePageRole(["admin"], "/admin")
  const db = getDb()

  const platformFees = await db.select()
    .from(ledgerTransactions)
    .where(eq(ledgerTransactions.type, "fee_deduction"))
    .orderBy(desc(ledgerTransactions.createdAt))
    .limit(50)

  const pendingWithdrawals = await db.select({
    id: withdrawals.id,
    amount: withdrawals.amount,
    adminFee: withdrawals.adminFee,
    netAmount: withdrawals.netAmount,
    bankName: withdrawals.bankName,
    accountNumber: withdrawals.accountNumber,
    accountHolder: withdrawals.accountHolder,
    status: withdrawals.status,
    createdAt: withdrawals.createdAt,
    merchantName: users.name,
  })
  .from(withdrawals)
  .innerJoin(users, eq(withdrawals.userId, users.id))
  .where(eq(withdrawals.status, "pending"))
  .orderBy(desc(withdrawals.createdAt))

  const totalRevenue = platformFees.reduce((sum, tx) => sum + Math.abs(tx.amount), 0)

  return (
    <div className="mx-auto max-w-5xl p-6">
      <h1 className="mb-8 text-2xl font-bold tracking-tight text-[#0f2923]">Dasbor Keuangan Admin</h1>

      <div className="mb-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-2xl bg-gradient-to-br from-[#007c61] to-[#005a46] p-6 text-white shadow-lg">
          <div className="mb-4 flex items-center justify-between opacity-80">
            <span className="text-sm font-medium">Estimasi Pendapatan Platform</span>
            <Wallet className="h-5 w-5" />
          </div>
          <div className="text-3xl font-black tracking-tight">
            Rp {totalRevenue.toLocaleString("id-ID")}
          </div>
          <p className="mt-2 text-xs opacity-70">
            Dari {platformFees.length} potongan fee terakhir
          </p>
        </div>
      </div>

      <div className="mb-8">
        <h2 className="mb-4 text-lg font-bold text-[#0f2923]">Permintaan Pencairan Dana (Pending)</h2>
        <div className="overflow-hidden rounded-2xl border border-gray-100 bg-white shadow-sm">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-gray-50 text-xs text-gray-500">
                <tr>
                  <th className="px-4 py-3 font-medium">Tanggal</th>
                  <th className="px-4 py-3 font-medium">Merchant</th>
                  <th className="px-4 py-3 font-medium">Tujuan Transfer</th>
                  <th className="px-4 py-3 font-medium text-right">Nominal Transfer</th>
                  <th className="px-4 py-3 font-medium text-center">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {pendingWithdrawals.length === 0 ? (
                  <tr>
                    <td colSpan={5} className="px-4 py-8 text-center text-gray-500">
                      Tidak ada permintaan pencairan dana saat ini.
                    </td>
                  </tr>
                ) : (
                  pendingWithdrawals.map((wd) => (
                    <tr key={wd.id}>
                      <td className="px-4 py-3 text-gray-500">
                        {new Date(wd.createdAt).toLocaleDateString("id-ID", {
                          day: "numeric",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                      <td className="px-4 py-3 font-medium">{wd.merchantName}</td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900">{wd.bankName}</div>
                        <div className="text-xs text-gray-500">{wd.accountNumber} - {wd.accountHolder}</div>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="font-bold text-gray-900">Rp {wd.netAmount.toLocaleString("id-ID")}</div>
                        <div className="text-xs text-emerald-600">Fee Platform: Rp {wd.adminFee.toLocaleString("id-ID")}</div>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-2">
                          <button className="rounded-lg bg-emerald-50 p-2 text-emerald-600 transition hover:bg-emerald-100" title="Setujui & Tandai Selesai">
                            <CheckCircle className="h-4 w-4" />
                          </button>
                          <button className="rounded-lg bg-red-50 p-2 text-red-600 transition hover:bg-red-100" title="Tolak">
                            <XCircle className="h-4 w-4" />
                          </button>
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
    </div>
  )
}
