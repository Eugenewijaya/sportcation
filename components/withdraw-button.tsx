"use client"

import { useState } from "react"
import { Download, X } from "lucide-react"

export function WithdrawButton({ maxAmount, hasPin }: { maxAmount: number, hasPin: boolean }) {
  const [isOpen, setIsOpen] = useState(false)
  const [amount, setAmount] = useState("")
  const [pin, setPin] = useState("")
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!hasPin) {
      alert("Anda harus membuat PIN keamanan di Pengaturan Profil terlebih dahulu.")
      return
    }
    const numAmount = parseInt(amount.replace(/\D/g, ""), 10)
    if (numAmount < 10000) {
      alert("Minimal penarikan adalah Rp 10.000")
      return
    }
    if (numAmount > maxAmount) {
      alert("Saldo tersedia tidak mencukupi.")
      return
    }
    
    setLoading(true)
    // Here we would call the withdrawal API
    setTimeout(() => {
      alert(`Permintaan penarikan Rp ${numAmount.toLocaleString("id-ID")} berhasil dikirim. Menunggu persetujuan admin.`)
      setIsOpen(false)
      setLoading(false)
    }, 1000)
  }

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-white/20 py-2.5 text-sm font-bold backdrop-blur-sm transition hover:bg-white/30"
      >
        <Download className="h-4 w-4" />
        Tarik Saldo
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
          <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl relative text-gray-900">
            <button onClick={() => setIsOpen(false)} className="absolute right-4 top-4 text-gray-400 hover:text-gray-600">
              <X className="h-5 w-5" />
            </button>
            <h2 className="text-xl font-bold mb-1">Tarik Saldo</h2>
            <p className="text-sm text-gray-500 mb-6">Maksimal penarikan: Rp {maxAmount.toLocaleString("id-ID")}</p>
            
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold mb-1">Jumlah Penarikan</label>
                <input 
                  type="number" 
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500" 
                  placeholder="Contoh: 50000"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-semibold mb-1">PIN Keamanan (6 Digit)</label>
                <input 
                  type="password" 
                  maxLength={6}
                  value={pin}
                  onChange={(e) => setPin(e.target.value)}
                  className="w-full rounded-lg border border-gray-300 p-3 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 text-center tracking-[0.5em] font-bold text-xl" 
                  placeholder="••••••"
                  required
                />
              </div>
              <button 
                type="submit" 
                disabled={loading}
                className="w-full rounded-xl bg-emerald-600 py-3 font-bold text-white transition hover:bg-emerald-700 disabled:opacity-50"
              >
                {loading ? "Memproses..." : "Konfirmasi Tarik Dana"}
              </button>
            </form>
          </div>
        </div>
      )}
    </>
  )
}
