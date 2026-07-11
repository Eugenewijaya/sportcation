"use client"

import { useCallback, useEffect, useState } from "react"
import { AlertCircle, BarChart3, CheckCircle2, Download, LoaderCircle, RefreshCw } from "lucide-react"
import { StatsGrid } from "./sportcation-ops-app"

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

export function AdminReportsWorkspace({ onAction }: { onAction: (message: string) => void }) {
  const [stats, setStats] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState<{ tone: "success" | "error"; message: string } | null>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setNotice(null)
    try {
      const data = await apiRequest<{ stats: any[] }>("/api/admin/reports")
      setStats(data.stats || [])
    } catch (error) {
      setNotice({ tone: "error", message: error instanceof Error ? error.message : "Data laporan gagal dimuat." })
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
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">System Reports</h2>
          <p className="text-sm text-slate-500">Platform performance and transaction logs.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => onAction("Export CSV functionality triggered")}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <Download className="h-4 w-4" />
            Export CSV
          </button>
          <button
            onClick={load}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50"
          >
            <RefreshCw className={cx("h-4 w-4", loading && "animate-spin")} />
            Refresh
          </button>
        </div>
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

      {loading ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white text-slate-400">
          <LoaderCircle className="h-8 w-8 animate-spin" />
          <p className="text-sm font-medium">Memuat statistik...</p>
        </div>
      ) : (
        <div className="space-y-8">
          {stats.length > 0 ? (
            <StatsGrid stats={stats} />
          ) : (
            <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white text-slate-400">
              <BarChart3 className="h-10 w-10 opacity-20" />
              <p className="text-sm font-medium">Belum ada data laporan.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
