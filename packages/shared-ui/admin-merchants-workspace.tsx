"use client"

import { useCallback, useEffect, useState } from "react"
import { AlertCircle, CheckCircle2, LoaderCircle, RefreshCw, Search, ShieldCheck } from "lucide-react"

async function apiRequest<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
  })
  if (response.status === 401 && typeof window !== "undefined") {
    window.location.assign(`/login?next=${encodeURIComponent(window.location.pathname)}`)
    throw new Error("Session berakhir. Silakan login kembali.")
  }
  const payload = await response.json()
  if (!response.ok) {
    const details = payload.error?.details as Array<{ message?: string }> | undefined
    throw new Error(details?.[0]?.message || payload.error?.message || "Request gagal diproses.")
  }
  return payload.data as T
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ")
}

export function AdminMerchantVerificationWorkspace({ onAction }: { onAction: (message: string) => void }) {
  const [merchants, setMerchants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState<{ tone: "success" | "error"; message: string } | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setNotice(null)
    try {
      const data = await apiRequest<any[]>("/api/admin/merchants")
      setMerchants(data)
    } catch (error) {
      setNotice({ tone: "error", message: error instanceof Error ? error.message : "Data merchant gagal dimuat." })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    load()
  }, [load])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">Merchant Verification</h2>
          <p className="text-sm text-slate-500">Tinjau dan setujui pendaftaran merchant baru.</p>
        </div>
        <button
          onClick={load}
          disabled={loading}
          className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50"
        >
          <RefreshCw className={cx("h-4 w-4", loading && "animate-spin")} />
          Refresh
        </button>
      </div>

      {notice && (
        <div
          className={cx(
            "flex items-center gap-3 rounded-xl border p-4 text-sm font-medium",
            notice.tone === "error"
              ? "border-red-100 bg-red-50/50 text-red-600"
              : "border-emerald-100 bg-emerald-50/50 text-emerald-600"
          )}
        >
          {notice.tone === "error" ? <AlertCircle className="h-5 w-5" /> : <CheckCircle2 className="h-5 w-5" />}
          {notice.message}
        </div>
      )}

      <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
        {loading ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 text-slate-400">
            <LoaderCircle className="h-8 w-8 animate-spin" />
            <p className="text-sm font-medium">Memuat data merchant...</p>
          </div>
        ) : merchants.length === 0 ? (
          <div className="flex h-64 flex-col items-center justify-center gap-3 text-slate-400">
            <ShieldCheck className="h-10 w-10 opacity-20" />
            <p className="text-sm font-medium">Belum ada pendaftaran merchant.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/50 text-slate-500">
                  <th className="p-4 font-medium">Nama Bisnis</th>
                  <th className="p-4 font-medium">Legal Name</th>
                  <th className="p-4 font-medium">Alamat</th>
                  <th className="p-4 font-medium text-right">Aksi</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {merchants.map((merchant) => (
                  <tr key={merchant.id} className="transition-colors hover:bg-slate-50/50">
                    <td className="p-4 font-medium text-slate-900">{merchant.businessName}</td>
                    <td className="p-4 text-slate-600">{merchant.legalName || "-"}</td>
                    <td className="p-4 text-slate-600">{merchant.address || "-"}</td>
                    <td className="p-4 text-right">
                      <button
                        onClick={() => onAction(`Tinjau dokumen untuk merchant ${merchant.businessName}`)}
                        className="inline-flex items-center justify-center rounded-lg bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 transition-colors hover:bg-emerald-100"
                      >
                        Tinjau
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}
