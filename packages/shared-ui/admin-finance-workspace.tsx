"use client"

import { useEffect, useState } from "react"
import { CheckCircle, XCircle, Wallet, RefreshCw, LoaderCircle, ReceiptText, Landmark } from "lucide-react"

type PlatformFee = {
  id: string
  amount: number
  createdAt: string
  referenceId: string | null
}

type Withdrawal = {
  id: string
  amount: number
  adminFee: number
  netAmount: number
  bankName: string
  accountNumber: string
  accountHolder: string
  status: "pending" | "completed" | "failed"
  createdAt: string
  merchantName: string | null
}

export function AdminFinanceWorkspace({ onAction }: { onAction: (message: string) => void }) {
  const [loading, setLoading] = useState(true)
  const [fees, setFees] = useState<PlatformFee[]>([])
  const [withdrawals, setWithdrawals] = useState<Withdrawal[]>([])

  async function load() {
    setLoading(true)
    try {
      const res = await fetch("/api/admin/finance")
      if (res.ok) {
        const data = await res.json()
        setFees(data.platformFees || [])
        setWithdrawals(data.withdrawals || [])
      }
    } catch (e) {
      console.error(e)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    void load()
  }, [])

  async function resolveWithdrawal(id: string, action: "approve" | "reject") {
    if (!confirm(`Are you sure you want to ${action} this withdrawal?`)) return
    
    let rejectedReason = undefined
    if (action === "reject") {
      rejectedReason = prompt("Reason for rejection?") || "Data tidak valid"
    }

    try {
      const res = await fetch(`/api/admin/finance/withdraw/${id}`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, rejectedReason })
      })
      if (res.ok) {
        onAction(`Withdrawal ${action}d successfully.`)
        void load()
      } else {
        const err = await res.json()
        alert(`Error: ${err.error?.message || "Unknown error"}`)
      }
    } catch (e) {
      console.error(e)
    }
  }

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <LoaderCircle className="h-8 w-8 animate-spin text-[#007c61]" />
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="flex items-end justify-between">
        <div>
          <h1 className="text-4xl font-black tracking-[-0.05em] text-[#071413]">Finance Hub</h1>
          <p className="mt-2 text-sm font-semibold text-[#687073]">
            Manage platform fees and process merchant withdrawals.
          </p>
        </div>
        <button 
          onClick={() => void load()}
          className="flex h-12 items-center gap-2 rounded-full bg-[#071413] px-5 text-sm font-black uppercase tracking-[0.12em] text-white hover:bg-black"
        >
          <RefreshCw className="h-5 w-5" />
          Refresh
        </button>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* WITHDRAWALS */}
        <section className="overflow-hidden rounded-[30px] bg-white shadow-sm">
          <div className="border-b border-[#edf1f1] px-6 py-5 flex items-center justify-between">
            <h2 className="text-lg font-black flex items-center gap-2">
              <Landmark className="h-5 w-5 text-[#007c61]" />
              Withdrawal Requests
            </h2>
            <span className="rounded-full bg-[#f3f6f6] px-3 py-1 text-xs font-black uppercase text-[#687073]">
              {withdrawals.filter(w => w.status === "pending").length} Pending
            </span>
          </div>
          
          <div className="divide-y divide-[#edf1f1]">
            {withdrawals.length === 0 ? (
              <div className="p-8 text-center text-[#687073]">
                <p className="text-sm font-bold">No withdrawal requests found.</p>
              </div>
            ) : (
              withdrawals.map(w => (
                <div key={w.id} className="p-6">
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-black uppercase text-[#007c61]">{w.merchantName || "Unknown Merchant"}</p>
                      <h3 className="mt-1 text-xl font-black">Rp {w.amount.toLocaleString("id-ID")}</h3>
                      <p className="text-sm font-bold text-[#687073]">ID: {w.id}</p>
                    </div>
                    <StatusBadge status={w.status} />
                  </div>
                  
                  <div className="mt-4 rounded-xl bg-[#f3f6f6] p-4">
                    <div className="grid grid-cols-2 gap-4 text-sm">
                      <div>
                        <p className="text-xs font-black uppercase text-[#9aa1a6]">Bank</p>
                        <p className="font-bold">{w.bankName}</p>
                      </div>
                      <div>
                        <p className="text-xs font-black uppercase text-[#9aa1a6]">Net Transfer</p>
                        <p className="font-bold">Rp {w.netAmount.toLocaleString("id-ID")}</p>
                      </div>
                      <div className="col-span-2">
                        <p className="text-xs font-black uppercase text-[#9aa1a6]">Account Details</p>
                        <p className="font-bold">{w.accountNumber} - {w.accountHolder}</p>
                      </div>
                    </div>
                  </div>

                  {w.status === "pending" && (
                    <div className="mt-4 flex gap-3">
                      <button 
                        onClick={() => resolveWithdrawal(w.id, "approve")}
                        className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#007c61] py-3 text-sm font-black uppercase text-white hover:bg-[#00634e]"
                      >
                        <CheckCircle className="h-5 w-5" />
                        Approve
                      </button>
                      <button 
                        onClick={() => resolveWithdrawal(w.id, "reject")}
                        className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-[#c11f32] py-3 text-sm font-black uppercase text-white hover:bg-[#a01627]"
                      >
                        <XCircle className="h-5 w-5" />
                        Reject
                      </button>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>
        </section>

        {/* PLATFORM FEES */}
        <section className="overflow-hidden rounded-[30px] bg-white shadow-sm">
          <div className="border-b border-[#edf1f1] px-6 py-5">
            <h2 className="text-lg font-black flex items-center gap-2">
              <Wallet className="h-5 w-5 text-[#007c61]" />
              Platform Fees Collected
            </h2>
          </div>
          
          <div className="divide-y divide-[#edf1f1]">
            {fees.length === 0 ? (
              <div className="p-8 text-center text-[#687073]">
                <p className="text-sm font-bold">No fees collected yet.</p>
              </div>
            ) : (
              fees.map(f => (
                <div key={f.id} className="p-4 px-6 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#eafff8] text-[#007c61]">
                      <ReceiptText className="h-5 w-5" />
                    </span>
                    <div>
                      <p className="text-sm font-bold">Fee Deduction</p>
                      <p className="text-xs text-[#9aa1a6]">{new Date(f.createdAt).toLocaleDateString("id-ID")}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-black text-[#007c61]">Rp {f.amount.toLocaleString("id-ID")}</p>
                    <p className="text-xs text-[#9aa1a6]">Ref: {f.referenceId}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </section>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: "pending" | "completed" | "failed" }) {
  if (status === "pending") {
    return <span className="rounded-full bg-yellow-100 px-3 py-1 text-xs font-black uppercase text-yellow-800">Pending</span>
  }
  if (status === "completed") {
    return <span className="rounded-full bg-[#eafff8] px-3 py-1 text-xs font-black uppercase text-[#007c61]">Completed</span>
  }
  return <span className="rounded-full bg-red-100 px-3 py-1 text-xs font-black uppercase text-red-800">Failed</span>
}
