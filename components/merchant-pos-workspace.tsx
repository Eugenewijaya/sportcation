"use client"

import { useState } from "react"
import { Calculator, CreditCard, Banknote, ShoppingCart, Search, Plus, Trash2, Tag } from "lucide-react"

export function MerchantPosWorkspace({ onAction }: { onAction: (message: string) => void }) {
  const [cart, setCart] = useState<{ id: string; name: string; price: number; type: string }[]>([])
  const [activeVenue, setActiveVenue] = useState<string>("venue-1") // Hardcoded dummy venue ID for MVP
  const [isProcessing, setIsProcessing] = useState<boolean>(false)
  const [qrisUrl, setQrisUrl] = useState<string | null>(null)

  const availableItems = [
    { id: "SLT-1", name: "Padel Court 01 - 18:00 (Walk-in)", price: 350000, type: "slot" },
    { id: "SLT-2", name: "Tennis Court 02 - 19:00 (Walk-in)", price: 250000, type: "slot" },
    { id: "ADD-1", name: "Racket Rental", price: 50000, type: "addon" },
    { id: "ADD-2", name: "Mineral Water", price: 10000, type: "addon" },
  ]

  const addToCart = (item: typeof availableItems[0]) => {
    setCart([...cart, item])
    onAction(`Added ${item.name} to cart`)
  }

  const removeFromCart = (index: number) => {
    const newCart = [...cart]
    newCart.splice(index, 1)
    setCart(newCart)
  }

  const total = cart.reduce((sum, item) => sum + item.price, 0)

  const handleCheckout = async (method: "Cash" | "QRIS") => {
    if (cart.length === 0 || !activeVenue) return
    setIsProcessing(true)
    
    try {
      const response = await fetch("/api/merchant/pos/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          venueId: activeVenue,
          slotIds: cart.map((item) => item.id),
          paymentMethod: method,
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Gagal memproses pembayaran")
      }

      const data = await response.json()
      
      if (method === "QRIS" && data.qrisUrl) {
        setQrisUrl(data.qrisUrl)
      } else {
        onAction(`Pembayaran ${method} sukses sejumlah Rp ${total.toLocaleString("id-ID")}`)
        setCart([])
      }
    } catch (error: any) {
      alert(error.message)
    } finally {
      setIsProcessing(false)
    }
  }

  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {/* Left Pane: Items */}
      <div className="space-y-4 lg:col-span-2">
        <div className="rounded-[30px] bg-white p-6 shadow-sm">
          <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-xl font-black text-[#1f2326]">Point of Sale</h2>
              <p className="mt-1 text-sm font-semibold text-[#687073]">Add walk-in slots and items to cart</p>
            </div>
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#9aa1a6]" />
              <input
                type="text"
                placeholder="Search slots or items..."
                className="w-full rounded-full border border-[#edf1f1] bg-[#f9fbfb] py-2 pl-9 pr-4 text-sm font-semibold text-[#1f2326] outline-none focus:border-[#007c61]"
              />
            </div>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            {availableItems.map((item) => (
              <button
                key={item.id}
                onClick={() => addToCart(item)}
                className="flex items-center justify-between rounded-2xl border border-[#edf1f1] p-4 text-left transition hover:border-[#007c61] hover:bg-[#f9fbfb]"
              >
                <div>
                  <span className="block text-sm font-bold text-[#1f2326]">{item.name}</span>
                  <span className="mt-1 block text-xs font-semibold text-[#687073]">Rp {item.price.toLocaleString("id-ID")}</span>
                </div>
                <span className="grid h-8 w-8 place-items-center rounded-full bg-[#dcfff6] text-[#007c61]">
                  <Plus className="h-4 w-4" />
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Right Pane: Cart */}
      <div className="space-y-4">
        <div className="rounded-[30px] bg-white p-6 shadow-sm">
          <div className="mb-4 flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-[#f9fbfb] text-[#687073]">
              <ShoppingCart className="h-5 w-5" />
            </span>
            <h3 className="text-lg font-black text-[#1f2326]">Current Cart</h3>
          </div>

          <div className="min-h-[200px] divide-y divide-[#edf1f1]">
            {cart.length === 0 ? (
              <div className="flex h-[200px] flex-col items-center justify-center text-center">
                <Tag className="mb-2 h-8 w-8 text-[#a1a8ac]" />
                <p className="text-sm font-semibold text-[#687073]">Cart is empty</p>
              </div>
            ) : (
              cart.map((item, i) => (
                <div key={i} className="flex items-center justify-between py-3">
                  <div className="min-w-0 pr-4">
                    <p className="truncate text-sm font-bold text-[#1f2326]">{item.name}</p>
                    <p className="text-xs font-semibold text-[#687073]">Rp {item.price.toLocaleString("id-ID")}</p>
                  </div>
                  <button onClick={() => removeFromCart(i)} className="text-[#a1a8ac] transition hover:text-red-500">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              ))
            )}
          </div>

          <div className="mt-4 border-t border-[#edf1f1] pt-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-bold text-[#687073]">Total</span>
              <span className="text-2xl font-black text-[#1f2326]">Rp {total.toLocaleString("id-ID")}</span>
            </div>
            
            <div className="mt-6 grid gap-2">
              <button
                onClick={() => handleCheckout("Cash")}
                disabled={cart.length === 0 || isProcessing}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-[#007c61] py-3 text-sm font-bold text-white transition hover:bg-[#006650] disabled:opacity-50"
              >
                <Banknote className="h-4 w-4" />
                {isProcessing ? "Processing..." : "Pay with Cash"}
              </button>
              <button
                onClick={() => handleCheckout("QRIS")}
                disabled={cart.length === 0 || isProcessing}
                className="flex w-full items-center justify-center gap-2 rounded-xl border border-[#edf1f1] bg-white py-3 text-sm font-bold text-[#1f2326] transition hover:bg-[#f9fbfb] disabled:opacity-50"
              >
                <CreditCard className="h-4 w-4" />
                {isProcessing ? "Processing..." : "Generate QRIS"}
              </button>
            </div>
          </div>
        </div>

        {qrisUrl && (
          <div className="rounded-[30px] bg-white p-6 shadow-sm flex flex-col items-center justify-center">
            <h3 className="text-lg font-bold text-[#1f2326] mb-4">Silahkan Scan QRIS</h3>
            <a href={qrisUrl} target="_blank" rel="noreferrer" className="text-blue-500 hover:underline mb-4 break-all text-center">Buka QRIS</a>
            <button 
              onClick={() => {
                setQrisUrl(null)
                setCart([])
                onAction("QRIS Checkout completed")
              }}
              className="rounded-xl bg-[#007c61] px-4 py-2 text-white text-sm font-bold hover:bg-[#006650]"
            >
              Tutup & Selesai
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
