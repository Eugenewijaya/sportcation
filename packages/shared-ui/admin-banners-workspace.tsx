"use client"

import { useCallback, useEffect, useState } from "react"
import { AlertCircle, CheckCircle2, LoaderCircle, Plus, Tag, RefreshCw } from "lucide-react"

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

export function AdminBannersWorkspace({ onAction }: { onAction: (message: string) => void }) {
  const [banners, setBanners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isAdding, setIsAdding] = useState(false)
  const [newTitle, setNewTitle] = useState("")
  const [newImageUrl, setNewImageUrl] = useState("")
  const [newLinkUrl, setNewLinkUrl] = useState("")
  const [newTerms, setNewTerms] = useState("")
  const [notice, setNotice] = useState<{ tone: "success" | "error"; message: string } | null>(null)

  const loadBanners = async () => {
    setLoading(true)
    try {
      // ponytail: hit the API service instead of current origin, send cookies for auth
      const res = await fetch(`/api/public/promo-banners`, { credentials: "include" })
      const data = await res.json()
      setBanners(data)
    } catch (err) {
      console.error(err)
      setNotice({ tone: "error", message: "Gagal memuat banners." })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadBanners()
  }, [])

  const handleSave = async () => {
    // Usually we would POST to an admin API endpoint. Since we don't have it yet, simulate.
    onAction("Banner added! (API not implemented yet)")
    setBanners([...banners, { id: Date.now().toString(), title: newTitle, imageUrl: newImageUrl, linkUrl: newLinkUrl, termsAndConditions: newTerms }])
    setIsAdding(false)
    setNewTitle("")
    setNewImageUrl("")
    setNewLinkUrl("")
    setNewTerms("")
  }

  const handleDelete = (id: string) => {
    setBanners(banners.filter(b => b.id !== id))
    onAction("Banner removed! (API not implemented yet)")
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold tracking-tight text-slate-900">Manage Promo Banners</h2>
          <p className="text-sm text-slate-500">Add, edit, or remove promotional banners from the home screen.</p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={loadBanners}
            disabled={loading}
            className="inline-flex items-center gap-2 rounded-lg border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-colors hover:bg-slate-50 hover:text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 disabled:opacity-50"
          >
            <RefreshCw className={cx("h-4 w-4", loading && "animate-spin")} />
            Refresh
          </button>
          <button
            onClick={() => setIsAdding(true)}
            className="inline-flex items-center gap-2 rounded-lg bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm transition-colors hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          >
            <Plus className="h-4 w-4" />
            Add Banner
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

      {isAdding && (
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h3 className="mb-4 text-lg font-semibold text-slate-900">New Banner</h3>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Title</label>
              <input value={newTitle} onChange={(e) => setNewTitle(e.target.value)} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:text-sm" placeholder="Promo Title" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Image URL</label>
              <input value={newImageUrl} onChange={(e) => setNewImageUrl(e.target.value)} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:text-sm" placeholder="https://example.com/image.jpg" />
              <p className="mt-1 text-xs text-slate-500">Provide an absolute URL for the banner image. Recommend landscape aspect ratio.</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Link URL (Optional)</label>
              <input value={newLinkUrl} onChange={(e) => setNewLinkUrl(e.target.value)} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:text-sm" placeholder="https://example.com/promo-details" />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700">Terms & Conditions (Optional)</label>
              <textarea value={newTerms} onChange={(e) => setNewTerms(e.target.value)} rows={3} className="mt-1 block w-full rounded-md border border-slate-300 px-3 py-2 shadow-sm focus:border-emerald-500 focus:outline-none focus:ring-1 focus:ring-emerald-500 sm:text-sm" placeholder="Syarat dan ketentuan berlaku..." />
            </div>
            <div className="flex gap-3 pt-2">
              <button onClick={handleSave} className="rounded-lg bg-emerald-600 px-6 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-emerald-500/20">Save Banner</button>
              <button onClick={() => setIsAdding(false)} className="rounded-lg border border-slate-200 bg-white px-6 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="flex h-64 flex-col items-center justify-center gap-3 rounded-xl border border-slate-200 bg-white text-slate-400">
          <LoaderCircle className="h-8 w-8 animate-spin" />
          <p className="text-sm font-medium">Memuat banners...</p>
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-2">
          {banners.map((banner) => (
            <div key={banner.id} className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm flex flex-col">
              <div className="aspect-[21/9] bg-slate-100 flex-shrink-0">
                <img src={banner.imageUrl} alt={banner.title} className="h-full w-full object-cover" onError={(e) => { e.currentTarget.style.display = "none" }} />
              </div>
              <div className="p-5 flex flex-col flex-1">
                <h3 className="font-semibold text-slate-900">{banner.title}</h3>
                {banner.linkUrl && <a href={banner.linkUrl} target="_blank" rel="noreferrer" className="mt-1 text-xs font-medium text-emerald-600 hover:underline">{banner.linkUrl}</a>}
                {banner.termsAndConditions && <p className="mt-3 text-xs text-slate-500 line-clamp-2">{banner.termsAndConditions}</p>}
                <div className="mt-auto pt-4 flex justify-end">
                  <button onClick={() => handleDelete(banner.id)} className="rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-medium text-red-600 transition-colors hover:bg-red-100">Delete</button>
                </div>
              </div>
            </div>
          ))}
          {banners.length === 0 && !isAdding && (
            <div className="col-span-full rounded-xl border border-dashed border-slate-300 p-12 text-center text-slate-500">
              <Tag className="mx-auto h-10 w-10 opacity-20 mb-3" />
              <p className="text-sm font-medium">No banners active. Click "Add Banner" to create one.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
