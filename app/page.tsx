import Link from "next/link"
import { Trophy, Store, ArrowRight, Activity, MapPin, Repeat, Gavel, Shield, Zap, Users, Clock } from "lucide-react"
import { AuroraBackground } from "@/components/animations/AuroraBackground"
import { BlurText } from "@/components/animations/BlurText"
import { FadeInScroll } from "@/components/animations/FadeInScroll"
import { HoverTiltCard } from "@/components/animations/HoverTiltCard"
import LandingInteractive from "@/components/LandingInteractive"
import PromoSlider from "@/components/PromoSlider"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-50 selection:bg-emerald-500 selection:text-white">
      {/* ─── SECTION 1: Hero with Aurora ─── */}
      <AuroraBackground className="min-h-screen bg-transparent dark:bg-transparent">
        {/* Top Header */}
        <header className="w-full max-w-6xl mx-auto px-6 py-6 flex items-center justify-between z-50">
          <div className="flex items-center gap-2">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/20">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight text-gray-900">Sportcation</span>
          </div>
          <div className="hidden sm:flex gap-4 items-center">
            <Link
              href="/merchant/login"
              className="text-sm font-semibold text-gray-700 hover:text-gray-900 px-4 py-2 transition-colors"
            >
              Mitra Login
            </Link>
            <Link
              href="/login"
              className="text-sm font-semibold bg-emerald-600 text-white hover:bg-emerald-700 px-5 py-2.5 rounded-full transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5"
            >
              Mulai Booking
            </Link>
          </div>
        </header>

        {/* Promo Banners Slider */}
        <PromoSlider />

        {/* Hero Content */}
        <main className="w-full max-w-6xl mx-auto px-6 flex-1 flex flex-col justify-start pt-6 lg:pt-10 items-center text-center z-20 pb-32">
          <FadeInScroll delay={0.1}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-white/50 shadow-sm text-emerald-800 text-xs font-bold uppercase tracking-wider mb-8">
              <span className="relative flex h-2.5 w-2.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
              </span>
              Platform Olahraga #1
            </div>
          </FadeInScroll>

          <BlurText
            text="Revolusi Booking Olahraga Anda"
            delay={0.05}
            duration={0.8}
            className="text-5xl lg:text-7xl font-black text-gray-900 tracking-tight leading-[1.1] mb-4 justify-center"
          />

          <FadeInScroll delay={0.5}>
            <h2 className="text-3xl lg:text-5xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 mb-8">
              Lebih Cepat & Mudah
            </h2>

            <p className="text-lg md:text-xl text-gray-700 max-w-2xl mx-auto mb-16 font-medium leading-relaxed">
              Temukan venue terbaik, booking instan, jual kembali jadwal batal (Resell), atau ikuti lelang lapangan premium hanya di Sportcation.
            </p>
          </FadeInScroll>

          {/* Action Cards */}
          <div className="grid md:grid-cols-2 gap-8 w-full max-w-4xl perspective-1000">
            <FadeInScroll delay={0.7}>
              <HoverTiltCard>
                <Link
                  href="/login"
                  className="group relative flex flex-col h-full p-8 bg-white/80 backdrop-blur-xl rounded-[2rem] border border-white/50 shadow-xl hover:shadow-2xl hover:border-emerald-300 transition-all text-left overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-8 group-hover:translate-x-0">
                    <ArrowRight className="h-8 w-8 text-emerald-500" />
                  </div>
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-emerald-100 to-emerald-50 flex items-center justify-center mb-8 shadow-inner">
                    <Activity className="h-8 w-8 text-emerald-600" />
                  </div>
                  <h3 className="text-3xl font-bold text-gray-900 mb-3">Sportcationer</h3>
                  <p className="text-gray-600 mb-10 flex-1 text-lg leading-relaxed">
                    Cari venue, booking jadwal main, dan nikmati kemudahan olahraga tanpa ribet telepon pengelola.
                  </p>
                  <div className="font-bold text-emerald-600 flex items-center gap-2 text-lg">
                    Masuk / Daftar <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </HoverTiltCard>
            </FadeInScroll>

            <FadeInScroll delay={0.9}>
              <HoverTiltCard>
                <Link
                  href="/merchant/login"
                  className="group relative flex flex-col h-full p-8 bg-gray-900/90 backdrop-blur-xl rounded-[2rem] border border-gray-800 shadow-xl hover:shadow-2xl hover:shadow-emerald-900/20 hover:border-gray-700 transition-all text-left overflow-hidden"
                >
                  <div className="absolute top-0 right-0 p-8 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-8 group-hover:translate-x-0">
                    <ArrowRight className="h-8 w-8 text-white" />
                  </div>
                  <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center mb-8 border border-gray-700 shadow-inner">
                    <Store className="h-8 w-8 text-gray-300" />
                  </div>
                  <h3 className="text-3xl font-bold text-white mb-3">Pemilik Venue</h3>
                  <p className="text-gray-400 mb-10 flex-1 text-lg leading-relaxed">
                    Kelola jadwal, atur harga, maksimalkan okupansi, dan pantau pendapatan langsung dari satu dashboard canggih.
                  </p>
                  <div className="font-bold text-white flex items-center gap-2 text-lg">
                    Mitra Dashboard <ArrowRight className="h-5 w-5 group-hover:translate-x-1 transition-transform" />
                  </div>
                </Link>
              </HoverTiltCard>
            </FadeInScroll>
          </div>
        </main>
      </AuroraBackground>

      {/* ─── SECTION 2: Sport Categories (FlowingMenu) ─── */}
      <section className="w-full bg-gray-950">
        <FadeInScroll>
          <div className="max-w-6xl mx-auto px-6 pt-20 pb-4 text-center">
            <h2 className="text-4xl lg:text-5xl font-black text-white mb-4">Jelajahi Kategori Olahraga</h2>
            <p className="text-gray-400 text-lg max-w-2xl mx-auto">Hover untuk melihat preview — pilih olahraga favorit Anda</p>
          </div>
        </FadeInScroll>
        <div style={{ height: '500px', position: 'relative' }}>
          <LandingInteractive section="flowing-menu" />
        </div>
      </section>

      {/* ─── SECTION 3: How It Works (Stepper) ─── */}
      <section className="w-full bg-zinc-900 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <FadeInScroll>
            <div className="text-center mb-12">
              <h2 className="text-4xl lg:text-5xl font-black text-white mb-4">Cara Kerja Sportcation</h2>
              <p className="text-gray-400 text-lg max-w-2xl mx-auto">Hanya 4 langkah sederhana menuju pengalaman olahraga terbaik</p>
            </div>
          </FadeInScroll>
          <FadeInScroll delay={0.2}>
            <LandingInteractive section="stepper" />
          </FadeInScroll>
        </div>
      </section>

      {/* ─── SECTION 4: Feature Highlights ─── */}
      <section className="w-full bg-zinc-50 py-24">
        <div className="max-w-6xl mx-auto px-6">
          <FadeInScroll>
            <div className="text-center mb-16">
              <h2 className="text-4xl lg:text-5xl font-black text-gray-900 mb-4">Kenapa Sportcation?</h2>
              <p className="text-gray-500 text-lg max-w-2xl mx-auto">Platform komprehensif yang menghubungkan pemain dan pemilik venue</p>
            </div>
          </FadeInScroll>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-8 text-center w-full">
            <FadeInScroll delay={0.1}>
              <HoverTiltCard>
                <div className="flex flex-col items-center p-8 rounded-3xl bg-white shadow-lg border border-gray-100 hover:shadow-xl transition-shadow h-full">
                  <div className="h-16 w-16 rounded-2xl bg-emerald-100 flex items-center justify-center mb-6">
                    <MapPin className="h-8 w-8 text-emerald-600" />
                  </div>
                  <h4 className="font-bold text-gray-900 text-xl mb-3">Venue Terlengkap</h4>
                  <p className="text-gray-500 leading-relaxed">Mini Soccer, Basket, Tenis, Badminton &mdash; semua ada dalam satu aplikasi.</p>
                </div>
              </HoverTiltCard>
            </FadeInScroll>
            <FadeInScroll delay={0.2}>
              <HoverTiltCard>
                <div className="flex flex-col items-center p-8 rounded-3xl bg-white shadow-lg border border-gray-100 hover:shadow-xl transition-shadow h-full">
                  <div className="h-16 w-16 rounded-2xl bg-blue-100 flex items-center justify-center mb-6">
                    <Clock className="h-8 w-8 text-blue-600" />
                  </div>
                  <h4 className="font-bold text-gray-900 text-xl mb-3">Real-time Jadwal</h4>
                  <p className="text-gray-500 leading-relaxed">Ketersediaan jam lapangan di-update secara real-time langsung oleh merchant.</p>
                </div>
              </HoverTiltCard>
            </FadeInScroll>
            <FadeInScroll delay={0.3}>
              <HoverTiltCard>
                <div className="flex flex-col items-center p-8 rounded-3xl bg-white shadow-lg border border-gray-100 hover:shadow-xl transition-shadow h-full">
                  <div className="h-16 w-16 rounded-2xl bg-violet-100 flex items-center justify-center mb-6">
                    <Repeat className="h-8 w-8 text-violet-600" />
                  </div>
                  <h4 className="font-bold text-gray-900 text-xl mb-3">Fitur Resell</h4>
                  <p className="text-gray-500 leading-relaxed">Batal main? Jual kembali jadwal Anda ke pengguna lain dengan mudah.</p>
                </div>
              </HoverTiltCard>
            </FadeInScroll>
            <FadeInScroll delay={0.4}>
              <HoverTiltCard>
                <div className="flex flex-col items-center p-8 rounded-3xl bg-white shadow-lg border border-gray-100 hover:shadow-xl transition-shadow h-full">
                  <div className="h-16 w-16 rounded-2xl bg-amber-100 flex items-center justify-center mb-6">
                    <Gavel className="h-8 w-8 text-amber-600" />
                  </div>
                  <h4 className="font-bold text-gray-900 text-xl mb-3">Sistem Lelang</h4>
                  <p className="text-gray-500 leading-relaxed">Ikuti lelang untuk mendapatkan jam prime-time favorit Anda.</p>
                </div>
              </HoverTiltCard>
            </FadeInScroll>
          </div>
        </div>
      </section>

      {/* ─── SECTION 5: Merchant Benefits (CardSwap) ─── */}
      <section className="w-full bg-gray-950 py-24 overflow-hidden">
        <div className="max-w-6xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <FadeInScroll>
              <div>
                <span className="text-emerald-400 font-bold uppercase text-sm tracking-wider">Untuk Pemilik Venue</span>
                <h2 className="text-4xl lg:text-5xl font-black text-white mt-4 mb-6">Maksimalkan Potensi Bisnis Anda</h2>
                <p className="text-gray-400 text-lg mb-8 leading-relaxed">
                  Bergabung sebagai mitra Sportcation dan nikmati dashboard canggih untuk mengelola jadwal, finansial, dan analitik bisnis Anda.
                </p>
                <div className="space-y-4">
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <Zap className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-1">Dashboard Real-time</h4>
                      <p className="text-gray-400 text-sm">Pantau pendapatan, booking, dan okupansi lapangan Anda secara real-time.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <Shield className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-1">Transaksi Aman</h4>
                      <p className="text-gray-400 text-sm">Sistem pembayaran terenkripsi dengan withdrawal langsung ke rekening Anda.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-4">
                    <div className="h-10 w-10 rounded-xl bg-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <Users className="h-5 w-5 text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="font-bold text-white mb-1">Jangkauan Luas</h4>
                      <p className="text-gray-400 text-sm">Tampilkan venue Anda ke ribuan Sportcationer yang mencari lapangan setiap hari.</p>
                    </div>
                  </div>
                </div>
                <div className="mt-10">
                  <LandingInteractive section="magnet-cta" />
                </div>
              </div>
            </FadeInScroll>

            <FadeInScroll delay={0.3}>
              <div className="relative h-[500px] hidden lg:block">
                <LandingInteractive section="card-swap" />
              </div>
            </FadeInScroll>
          </div>
        </div>
      </section>

      {/* ─── SECTION 6: Final CTA ─── */}
      <section className="w-full bg-gradient-to-br from-emerald-600 to-teal-500 py-24">
        <div className="max-w-4xl mx-auto px-6 text-center">
          <FadeInScroll>
            <h2 className="text-4xl lg:text-6xl font-black text-white mb-6">Siap Bermain?</h2>
            <p className="text-emerald-100 text-xl mb-10 max-w-2xl mx-auto leading-relaxed">
              Bergabung bersama ribuan Sportcationer lainnya dan temukan lapangan olahraga impian Anda hari ini.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white text-emerald-700 font-bold text-lg rounded-full shadow-xl hover:shadow-2xl hover:-translate-y-1 transition-all"
              >
                Mulai Booking Sekarang <ArrowRight className="h-5 w-5" />
              </Link>
              <Link
                href="/merchant/login"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-white/10 backdrop-blur-sm text-white font-bold text-lg rounded-full border border-white/30 hover:bg-white/20 transition-all"
              >
                Daftar Sebagai Mitra
              </Link>
            </div>
          </FadeInScroll>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="w-full py-12 bg-gray-950 text-center">
        <div className="max-w-6xl mx-auto px-6">
          <div className="flex items-center justify-center gap-2 mb-6">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-emerald-400 to-emerald-600">
              <Trophy className="h-4 w-4 text-white" />
            </div>
            <span className="text-lg font-black text-white">Sportcation</span>
          </div>
          <p className="text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} Sportcation. All rights reserved.
          </p>
        </div>
      </footer>
    </div>
  )
}

