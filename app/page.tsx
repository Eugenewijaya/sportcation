import Link from "next/link"
import { Trophy, Store, ArrowRight, Activity, MapPin, ShieldCheck } from "lucide-react"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col items-center selection:bg-emerald-500 selection:text-white">
      {/* Top Header */}
      <header className="w-full max-w-5xl mx-auto px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/20">
            <Trophy className="h-5 w-5 text-white" />
          </div>
          <span className="text-xl font-black tracking-tight text-gray-900">Sportcation</span>
        </div>
        <div className="hidden sm:flex gap-4">
          <Link
            href="/merchant/login"
            className="text-sm font-semibold text-gray-600 hover:text-gray-900 px-4 py-2 transition-colors"
          >
            Mitra Login
          </Link>
          <Link
            href="/login"
            className="text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 px-4 py-2 rounded-lg transition-colors shadow-sm"
          >
            Mulai Booking
          </Link>
        </div>
      </header>

      {/* Hero Section */}
      <main className="w-full max-w-5xl mx-auto px-6 flex-1 flex flex-col justify-center items-center text-center py-20 lg:py-32">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-wider mb-8">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
          </span>
          Platform Olahraga #1
        </div>
        
        <h1 className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tight leading-[1.1] mb-6">
          Booking Lapangan <br className="hidden sm:block" />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-emerald-500 to-teal-400">
            Lebih Cepat & Mudah
          </span>
        </h1>
        
        <p className="text-lg text-gray-500 max-w-2xl mx-auto mb-12">
          Temukan ratusan venue olahraga terbaik di kota Anda. Bandingkan harga, lihat fasilitas, dan amankan jadwal secara instan tanpa perlu telepon.
        </p>

        {/* Action Cards */}
        <div className="grid sm:grid-cols-2 gap-6 w-full max-w-3xl">
          {/* Card: Sportcationer */}
          <Link
            href="/login"
            className="group relative flex flex-col p-8 bg-white rounded-3xl border border-gray-200 shadow-sm hover:shadow-xl hover:border-emerald-300 transition-all text-left overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">
              <ArrowRight className="h-6 w-6 text-emerald-500" />
            </div>
            <div className="h-14 w-14 rounded-2xl bg-emerald-100 flex items-center justify-center mb-6">
              <Activity className="h-7 w-7 text-emerald-600" />
            </div>
            <h3 className="text-2xl font-bold text-gray-900 mb-2">Sportcationer</h3>
            <p className="text-gray-500 mb-8 flex-1">
              Saya ingin mencari dan memesan lapangan olahraga untuk bermain hari ini.
            </p>
            <div className="font-semibold text-emerald-600 flex items-center gap-2">
              Masuk / Daftar <ArrowRight className="h-4 w-4" />
            </div>
          </Link>

          {/* Card: Merchant */}
          <Link
            href="/merchant/login"
            className="group relative flex flex-col p-8 bg-gray-900 rounded-3xl border border-gray-800 shadow-sm hover:shadow-xl hover:border-gray-700 transition-all text-left overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-opacity translate-x-4 group-hover:translate-x-0">
              <ArrowRight className="h-6 w-6 text-white" />
            </div>
            <div className="h-14 w-14 rounded-2xl bg-gray-800 flex items-center justify-center mb-6 border border-gray-700">
              <Store className="h-7 w-7 text-gray-300" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Pemilik Venue</h3>
            <p className="text-gray-400 mb-8 flex-1">
              Saya ingin mendaftarkan lapangan saya untuk menjangkau lebih banyak pelanggan.
            </p>
            <div className="font-semibold text-white flex items-center gap-2">
              Mitra Dashboard <ArrowRight className="h-4 w-4" />
            </div>
          </Link>
        </div>

        {/* Feature Highlights */}
        <div className="mt-24 grid sm:grid-cols-3 gap-8 text-center border-t border-gray-200 pt-16 w-full">
          <div className="flex flex-col items-center">
            <MapPin className="h-8 w-8 text-emerald-500 mb-4" />
            <h4 className="font-bold text-gray-900 mb-2">Venue Terlengkap</h4>
            <p className="text-sm text-gray-500">Mulai dari Mini Soccer, Basket, hingga Tenis. Semua ada dalam satu aplikasi.</p>
          </div>
          <div className="flex flex-col items-center">
            <Activity className="h-8 w-8 text-emerald-500 mb-4" />
            <h4 className="font-bold text-gray-900 mb-2">Real-time Jadwal</h4>
            <p className="text-sm text-gray-500">Ketersediaan jam lapangan di-update secara real-time langsung oleh merchant.</p>
          </div>
          <div className="flex flex-col items-center">
            <ShieldCheck className="h-8 w-8 text-emerald-500 mb-4" />
            <h4 className="font-bold text-gray-900 mb-2">Transaksi Aman</h4>
            <p className="text-sm text-gray-500">Sistem pembayaran terenkripsi penuh yang dijamin oleh regulator resmi.</p>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="w-full py-8 text-center text-gray-400 text-sm border-t border-gray-200 bg-white">
        &copy; {new Date().getFullYear()} Sportcation. All rights reserved.
      </footer>
    </div>
  )
}
