"use client"

import { useState, useEffect } from "react"
import { Loader2, Plus, Trash2, Edit2, Check, X, Image as ImageIcon } from "lucide-react"

export default function AdminBannersPage() {
  const [banners, setBanners] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [editData, setEditData] = useState<any>(null)
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    fetchBanners()
  }, [])

  async function fetchBanners() {
    try {
      const res = await fetch("/api/admin/banners")
      const data = await res.json()
      if (data.banners) {
        setBanners(data.banners)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  async function handleDelete(id: string) {
    if (!confirm("Yakin ingin menghapus banner ini?")) return
    try {
      const res = await fetch(`/api/admin/banners/${id}`, { method: "DELETE" })
      if (res.ok) fetchBanners()
    } catch (error) {
      console.error(error)
    }
  }

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return

    const uploadData = new FormData()
    uploadData.append("file", file)

    try {
      const res = await fetch("/api/upload", { method: "POST", body: uploadData })
      const result = await res.json()
      if (result.url) {
        setEditData({ ...editData, imageUrl: result.url })
      }
    } catch (error) {
      alert("Gagal upload gambar")
    }
  }

  async function submitForm(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)
    try {
      const url = editData.id ? `/api/admin/banners/${editData.id}` : "/api/admin/banners"
      const method = editData.id ? "PATCH" : "POST"

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(editData),
      })
      
      if (res.ok) {
        setIsEditing(false)
        fetchBanners()
      } else {
        alert(await res.text())
      }
    } catch (error) {
      console.error(error)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Manajemen Banner Promo</h1>
        <button 
          onClick={() => {
            if (banners.length >= 10) {
              alert("Maksimal 10 banner diperbolehkan.")
              return
            }
            setEditData({ title: "", imageUrl: "", termsAndConditions: "", linkUrl: "", isActive: true, sortOrder: 0 })
            setIsEditing(true)
          }}
          className="bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center gap-2"
        >
          <Plus className="h-4 w-4" /> Tambah Banner
        </button>
      </div>

      {isEditing && (
        <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
          <h2 className="text-lg font-semibold mb-4">{editData.id ? "Edit Banner" : "Banner Baru"}</h2>
          <form onSubmit={submitForm} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm mb-1">Judul Promo</label>
                <input required type="text" className="w-full border p-2 rounded" value={editData.title} onChange={e => setEditData({...editData, title: e.target.value})} />
              </div>
              <div>
                <label className="block text-sm mb-1">Link URL (Opsional)</label>
                <input type="text" className="w-full border p-2 rounded" value={editData.linkUrl || ""} onChange={e => setEditData({...editData, linkUrl: e.target.value})} />
              </div>
            </div>
            
            <div>
              <label className="block text-sm mb-1">Upload Gambar (Landscape disarankan)</label>
              <div className="flex items-center gap-4">
                <input type="file" accept="image/*" onChange={handleFileUpload} className="border p-1 rounded" />
                {editData.imageUrl && <img src={editData.imageUrl} className="h-12 rounded object-cover" alt="Preview" />}
              </div>
            </div>

            <div>
              <label className="block text-sm mb-1">Syarat & Ketentuan / Detail Program</label>
              <textarea rows={3} className="w-full border p-2 rounded" value={editData.termsAndConditions || ""} onChange={e => setEditData({...editData, termsAndConditions: e.target.value})} />
            </div>

            <div className="flex gap-4">
              <label className="flex items-center gap-2">
                <input type="checkbox" checked={editData.isActive} onChange={e => setEditData({...editData, isActive: e.target.checked})} />
                Aktif
              </label>
              <label className="flex items-center gap-2">
                Urutan: 
                <input type="number" className="border w-16 p-1 rounded" value={editData.sortOrder} onChange={e => setEditData({...editData, sortOrder: parseInt(e.target.value) || 0})} />
              </label>
            </div>

            <div className="flex gap-2 justify-end pt-4">
              <button type="button" onClick={() => setIsEditing(false)} className="px-4 py-2 border rounded">Batal</button>
              <button type="submit" disabled={submitting || !editData.imageUrl} className="bg-blue-600 text-white px-4 py-2 rounded">
                {submitting ? "Menyimpan..." : "Simpan"}
              </button>
            </div>
          </form>
        </div>
      )}

      {loading ? (
        <div className="p-8 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {banners.map(b => (
            <div key={b.id} className={`bg-white rounded-xl shadow-sm border ${!b.isActive && 'opacity-60'} overflow-hidden`}>
              <div className="h-40 bg-gray-100 relative">
                {b.imageUrl ? (
                  <img src={b.imageUrl} className="w-full h-full object-cover" alt={b.title} />
                ) : (
                  <div className="flex h-full items-center justify-center"><ImageIcon className="text-gray-400" /></div>
                )}
                {!b.isActive && <div className="absolute top-2 right-2 bg-red-100 text-red-800 text-xs px-2 py-1 rounded">Nonaktif</div>}
              </div>
              <div className="p-4">
                <h3 className="font-bold truncate">{b.title}</h3>
                <p className="text-xs text-gray-500 mt-1 line-clamp-2">{b.termsAndConditions || "Tidak ada S&K"}</p>
                <div className="flex justify-between items-center mt-4">
                  <span className="text-xs font-mono bg-gray-100 px-2 rounded">Urutan: {b.sortOrder}</span>
                  <div className="flex gap-2">
                    <button onClick={() => { setEditData(b); setIsEditing(true); }} className="text-blue-600 p-1 hover:bg-blue-50 rounded"><Edit2 className="w-4 h-4" /></button>
                    <button onClick={() => handleDelete(b.id)} className="text-red-600 p-1 hover:bg-red-50 rounded"><Trash2 className="w-4 h-4" /></button>
                  </div>
                </div>
              </div>
            </div>
          ))}
          {banners.length === 0 && <p className="text-gray-500 col-span-full">Belum ada banner promo.</p>}
        </div>
      )}
    </div>
  )
}
