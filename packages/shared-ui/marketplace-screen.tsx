import { useEffect, useState } from "react"
import { Store, Tag, Gavel } from "lucide-react"

export function MarketplaceScreen() {
  const [data, setData] = useState<{ resells: any[]; auctions: any[] } | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/marketplace")
      .then((res) => res.json())
      .then((d) => {
        setData(d)
        setLoading(false)
      })
      .catch((e) => {
        console.error(e)
        setLoading(false)
      })
  }, [])

  return (
    <div className="flex h-full flex-col bg-[#f4f7f5] pb-24">
      <div className="sticky top-0 z-50 flex items-center justify-between bg-white px-6 py-4 shadow-sm">
        <h1 className="text-xl font-semibold text-[#0f2923]">Marketplace</h1>
      </div>

      <div className="flex-1 overflow-auto p-6">
        <div className="lg:max-w-4xl lg:mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-foreground flex items-center gap-2">
              <Store className="h-8 w-8 text-emerald-600" />
              Pasar Tiket
            </h1>
            <p className="mt-2 text-muted-foreground">Temukan tiket resell atau lelang dari pengguna lain dengan harga terbaik.</p>
          </div>

          <div className="mb-10">
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2 mb-4">
              <Tag className="h-5 w-5 text-emerald-500" />
              Tiket Resell (Jual Langsung)
            </h2>
            {loading ? (
              <p className="text-muted-foreground">Memuat data...</p>
            ) : data?.resells && data.resells.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {data.resells.map((r: any) => (
                  <div key={r.id} className="p-4 border rounded-xl bg-white shadow-sm flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-foreground">Booking: {r.bookingId}</p>
                      <p className="text-emerald-600 font-bold">Rp {r.price.toLocaleString("id-ID")}</p>
                    </div>
                    <button className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700">
                      Beli
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground bg-muted/50 p-6 rounded-xl border border-dashed border-border text-center">Belum ada tiket resell yang tersedia.</p>
            )}
          </div>

          <div>
            <h2 className="text-xl font-bold text-foreground flex items-center gap-2 mb-4">
              <Gavel className="h-5 w-5 text-amber-500" />
              Lelang Tiket
            </h2>
            {loading ? (
              <p className="text-muted-foreground">Memuat data...</p>
            ) : data?.auctions && data.auctions.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {data.auctions.map((a: any) => (
                  <div key={a.id} className="p-4 border rounded-xl bg-white shadow-sm flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-foreground">Booking: {a.bookingId}</p>
                      <p className="text-amber-600 font-bold">Mulai: Rp {a.startPrice.toLocaleString("id-ID")}</p>
                    </div>
                    <button className="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-amber-600">
                      Ikut Lelang
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground bg-muted/50 p-6 rounded-xl border border-dashed border-border text-center">Belum ada tiket yang sedang dilelang.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
