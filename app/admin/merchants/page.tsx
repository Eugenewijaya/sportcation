"use client"

import { useState, useEffect } from "react"
import { CheckCircle2, XCircle, FileText, Loader2, Store, Search } from "lucide-react"

export default function AdminMerchantsPage() {
  const [merchants, setMerchants] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchMerchants()
  }, [])

  async function fetchMerchants() {
    try {
      const res = await fetch("/api/admin/merchants")
      const data = await res.json()
      if (data.merchants) {
        setMerchants(data.merchants)
      }
    } catch (error) {
      console.error(error)
    } finally {
      setLoading(false)
    }
  }

  async function updateStatus(id: string, action: string) {
    if (!confirm(`Yakin ingin melakukan ${action} pada merchant ini?`)) return
    
    try {
      const res = await fetch(`/api/admin/merchants/${id}/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
          action,
          reason: action === 'reject' ? prompt("Alasan penolakan?") || "Data tidak valid" : undefined
        })
      })
      if (res.ok) {
        fetchMerchants()
      } else {
        const err = await res.json()
        alert(err.error || "Gagal update status")
      }
    } catch (error) {
      console.error(error)
      alert("Terjadi kesalahan jaringan.")
    }
  }

  if (loading) {
    return <div className="p-8 flex justify-center"><Loader2 className="animate-spin h-8 w-8 text-blue-600" /></div>
  }

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">Verifikasi Mitra (Merchant)</h1>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              <th className="py-4 px-6 font-medium text-gray-500">Nama Usaha</th>
              <th className="py-4 px-6 font-medium text-gray-500">Pemilik (User ID)</th>
              <th className="py-4 px-6 font-medium text-gray-500">Dokumen</th>
              <th className="py-4 px-6 font-medium text-gray-500">Status</th>
              <th className="py-4 px-6 font-medium text-gray-500 text-right">Aksi</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {merchants.map((m) => (
              <tr key={m.id} className="hover:bg-gray-50">
                <td className="py-4 px-6 font-medium text-gray-900">{m.legalName || m.businessName}</td>
                <td className="py-4 px-6 text-gray-500">{m.ownerUserId}</td>
                <td className="py-4 px-6">
                  <div className="flex gap-2">
                    {m.ktpUrl && <a href={m.ktpUrl} target="_blank" className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100">KTP</a>}
                    {m.npwpUrl && <a href={m.npwpUrl} target="_blank" className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100">NPWP</a>}
                    {m.businessLicenseUrl && <a href={m.businessLicenseUrl} target="_blank" className="text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded hover:bg-blue-100">Izin Usaha</a>}
                  </div>
                </td>
                <td className="py-4 px-6">
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    m.status === 'verified' ? 'bg-green-100 text-green-800' :
                    m.status === 'review' ? 'bg-amber-100 text-amber-800' :
                    m.status === 'rejected' ? 'bg-red-100 text-red-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                    {m.status.toUpperCase()}
                  </span>
                </td>
                <td className="py-4 px-6 text-right">
                  {m.status === 'review' && (
                    <div className="flex justify-end gap-2">
                      <button onClick={() => updateStatus(m.id, 'approve')} className="p-2 text-green-600 hover:bg-green-50 rounded-lg transition">
                        <CheckCircle2 className="h-5 w-5" />
                      </button>
                      <button onClick={() => updateStatus(m.id, 'reject')} className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition">
                        <XCircle className="h-5 w-5" />
                      </button>
                    </div>
                  )}
                  {m.status === 'verified' && (
                    <button onClick={() => updateStatus(m.id, 'reject')} className="text-sm text-red-600 hover:underline">
                      Cabut Verifikasi
                    </button>
                  )}
                </td>
              </tr>
            ))}
            {merchants.length === 0 && (
              <tr>
                <td colSpan={5} className="py-8 text-center text-gray-500">Belum ada merchant yang mendaftar.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
