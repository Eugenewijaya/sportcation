"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { AlertCircle, Upload, CheckCircle2, Loader2, Store } from "lucide-react"

export default function MerchantVerificationPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [status, setStatus] = useState<string>("draft")
  
  const [formData, setFormData] = useState({
    ktpUrl: "",
    npwpUrl: "",
    businessLicenseUrl: "",
    legalName: "",
  })

  useEffect(() => {
    // Cek status merchant
    fetch("/api/merchant/dashboard")
      .then(res => res.json())
      .then(data => {
        if (data.profile?.status) {
          setStatus(data.profile.status)
          if (data.profile.status === "verified") {
            router.push("/merchant")
          }
        }
      })
      .finally(() => setLoading(false))
  }, [router])

  async function handleFileUpload(e: React.ChangeEvent<HTMLInputElement>, field: keyof typeof formData) {
    const file = e.target.files?.[0]
    if (!file) return

    const uploadData = new FormData()
    uploadData.append("file", file)

    try {
      const res = await fetch("/api/upload", {
        method: "POST",
        body: uploadData,
      })
      const result = await res.json()
      if (result.url) {
        setFormData(prev => ({ ...prev, [field]: result.url }))
      }
    } catch (error) {
      console.error("Upload error", error)
      alert("Gagal mengunggah file")
    }
  }

  async function submitForm(e: React.FormEvent) {
    e.preventDefault()
    setSubmitting(true)

    try {
      const res = await fetch("/api/merchant/verification", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })
      
      if (res.ok) {
        setStatus("review")
      } else {
        alert("Gagal mengirim dokumen")
      }
    } catch (error) {
      console.error("Submit error", error)
    } finally {
      setSubmitting(false)
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
      </div>
    )
  }

  if (status === "review") {
    return (
      <div className="max-w-2xl mx-auto py-12 px-6">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 p-8 text-center">
          <div className="mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-6">
            <CheckCircle2 className="h-8 w-8 text-blue-600" />
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Dokumen Sedang Direview</h2>
          <p className="text-gray-500 mb-6">
            Tim admin Sportcation sedang meninjau dokumen pendaftaran Anda. Proses ini biasanya memakan waktu 1-2 hari kerja.
          </p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-3xl mx-auto py-12 px-6">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-8 border-b border-gray-100 bg-emerald-50">
          <div className="flex items-center gap-4 mb-2">
            <div className="p-3 bg-emerald-100 text-emerald-600 rounded-xl">
              <Store className="h-6 w-6" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Verifikasi Mitra</h2>
              <p className="text-gray-600">Lengkapi dokumen untuk mulai menerima pesanan</p>
            </div>
          </div>
        </div>

        <form onSubmit={submitForm} className="p-8 space-y-6">
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 flex gap-3 text-amber-800">
            <AlertCircle className="h-5 w-5 shrink-0 mt-0.5" />
            <div className="text-sm">
              <p className="font-semibold mb-1">Kenapa kami butuh dokumen ini?</p>
              <p>Sesuai regulasi, kami membutuhkan identitas dan legalitas usaha untuk memastikan keamanan transaksi pengguna kami.</p>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Nama Legal Usaha / PT</label>
            <input
              type="text"
              required
              value={formData.legalName}
              onChange={e => setFormData(prev => ({ ...prev, legalName: e.target.value }))}
              placeholder="PT Sportcation Nusantara"
              className="w-full h-11 px-4 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none"
            />
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Foto KTP Pemilik</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg bg-gray-50 hover:bg-gray-100 transition">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-8 w-8 text-gray-400" />
                  <div className="flex text-sm text-gray-600 justify-center">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-emerald-600 hover:text-emerald-500 focus-within:outline-none">
                      <span>{formData.ktpUrl ? "Ubah File" : "Upload File"}</span>
                      <input type="file" className="sr-only" accept="image/*" onChange={e => handleFileUpload(e, "ktpUrl")} required={!formData.ktpUrl} />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">PNG, JPG up to 5MB</p>
                  {formData.ktpUrl && <p className="text-xs text-emerald-600 font-bold mt-2">✓ Terunggah</p>}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">NPWP Usaha</label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg bg-gray-50 hover:bg-gray-100 transition">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-8 w-8 text-gray-400" />
                  <div className="flex text-sm text-gray-600 justify-center">
                    <label className="relative cursor-pointer bg-white rounded-md font-medium text-emerald-600 hover:text-emerald-500 focus-within:outline-none">
                      <span>{formData.npwpUrl ? "Ubah File" : "Upload File"}</span>
                      <input type="file" className="sr-only" accept="image/*,.pdf" onChange={e => handleFileUpload(e, "npwpUrl")} required={!formData.npwpUrl} />
                    </label>
                  </div>
                  <p className="text-xs text-gray-500">PDF, PNG, JPG up to 5MB</p>
                  {formData.npwpUrl && <p className="text-xs text-emerald-600 font-bold mt-2">✓ Terunggah</p>}
                </div>
              </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Dokumen Izin Usaha (NIB/SIUP)</label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg bg-gray-50 hover:bg-gray-100 transition">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-8 w-8 text-gray-400" />
                <div className="flex text-sm text-gray-600 justify-center">
                  <label className="relative cursor-pointer bg-white rounded-md font-medium text-emerald-600 hover:text-emerald-500 focus-within:outline-none">
                    <span>{formData.businessLicenseUrl ? "Ubah File" : "Upload File"}</span>
                    <input type="file" className="sr-only" accept="image/*,.pdf" onChange={e => handleFileUpload(e, "businessLicenseUrl")} required={!formData.businessLicenseUrl} />
                  </label>
                </div>
                <p className="text-xs text-gray-500">PDF, PNG, JPG up to 10MB</p>
                {formData.businessLicenseUrl && <p className="text-xs text-emerald-600 font-bold mt-2">✓ Terunggah</p>}
              </div>
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <button
              type="submit"
              disabled={submitting || !formData.ktpUrl || !formData.npwpUrl || !formData.businessLicenseUrl || !formData.legalName}
              className="flex items-center gap-2 bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold hover:bg-emerald-700 disabled:opacity-50 transition"
            >
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? "Menyimpan..." : "Kirim Dokumen"}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
