import Link from "next/link"
import { Trophy, Store, ArrowRight, Activity, MapPin, Repeat, Gavel, Shield, Zap, Users, Clock, Flame } from "lucide-react"
import { AuroraBackground } from "@/components/animations/AuroraBackground"
import { BlurText } from "@/components/animations/BlurText"
import { FadeInScroll } from "@/components/animations/FadeInScroll"
import { HoverTiltCard } from "@/components/animations/HoverTiltCard"
import LandingInteractive from "@/components/LandingInteractive"
import PromoSlider from "@/components/PromoSlider"

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-zinc-50 selection:bg-emerald-500 selection:text-white font-sans overflow-x-hidden">
      {/* ─── SECTION 1: Hero with Aurora ─── */}
      <AuroraBackground className="min-h-screen bg-transparent dark:bg-transparent">
        {/* Navbar / Header */}
        <nav className="fixed top-0 left-0 right-0 z-50 bg-white/70 backdrop-blur-lg border-b border-white/20 shadow-sm transition-all duration-300">
          <div className="w-full max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
            <Link href="/" className="flex items-center gap-2 group">
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 shadow-lg shadow-emerald-500/30 group-hover:shadow-emerald-500/50 transition-all group-hover:scale-105">
                <Trophy className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-black tracking-tighter text-gray-900 group-hover:text-emerald-700 transition-colors">Sportcation</span>
            </Link>
            
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-sm font-bold text-gray-600 hover:text-emerald-600 transition-colors">Fitur</a>
              <a href="#sports" className="text-sm font-bold text-gray-600 hover:text-emerald-600 transition-colors">Olahraga</a>
              <a href="#how-it-works" className="text-sm font-bold text-gray-600 hover:text-emerald-600 transition-colors">Cara Kerja</a>
            </div>

            <div className="flex gap-4 items-center">
              <Link
                href="/merchant/login"
                className="hidden sm:flex text-sm font-bold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 px-5 py-2.5 rounded-full transition-colors"
              >
                Pemilik Venue
              </Link>
              <Link
                href="/login"
                className="text-sm font-bold bg-gray-900 text-white hover:bg-emerald-600 px-6 py-2.5 rounded-full transition-all shadow-md hover:shadow-xl hover:-translate-y-0.5"
              >
                Masuk
              </Link>
            </div>
          </div>
        </nav>

        <div className="pt-24" />
        {/* Promo Banners Slider */}
        <PromoSlider />

        {/* Hero Content */}
        <main className="w-full max-w-7xl mx-auto px-6 flex-1 flex flex-col justify-start pt-16 lg:pt-24 items-center text-center z-20 pb-32">
          <FadeInScroll delay={0.1}>
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/60 backdrop-blur-md border border-white/50 shadow-sm text-emerald-800 text-xs font-bold uppercase tracking-widest mb-8">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              Booking Lapangan #1 di Indonesia
            </div>
          </FadeInScroll>

          <BlurText
            text="Cari Lapangan."
            delay={0.05}
            duration={0.6}
            className="text-6xl lg:text-[7rem] font-black text-gray-900 tracking-tighter leading-[1] mb-2 justify-center"
          />
          <BlurText
            text="Ga Pake Drama."
            delay={0.15}
            duration={0.6}
            className="text-6xl lg:text-[7rem] font-black text-transparent bg-clip-text bg-gradient-to-r from-emerald-600 to-teal-500 tracking-tighter leading-[1] mb-8 justify-center"
          />

          <FadeInScroll delay={0.5}>
            <p className="text-xl md:text-2xl text-gray-600 max-w-3xl mx-auto mb-16 font-medium leading-relaxed">
              Langsung cek jadwal kosong, booking, dan bayar. Ga perlu nunggu balasan chat admin yang super lama.
            </p>
          </FadeInScroll>

          {/* Action Cards */}
          <div className="grid md:grid-cols-2 gap-8 w-full max-w-5xl perspective-1000">
            <FadeInScroll delay={0.7}>
              <HoverTiltCard>
                <Link
                  href="/login"
                  className="group relative flex flex-col h-full p-10 bg-white/80 backdrop-blur-xl rounded-[2.5rem] border border-white/50 shadow-2xl hover:shadow-emerald-500/10 hover:border-emerald-200 transition-all text-left overflow-hidden"
                >
                  <div className="absolute -right-8 -top-8 h-40 w-40 bg-emerald-100/50 rounded-full blur-3xl group-hover:bg-emerald-200/50 transition-colors"></div>
                  
                  <div className="absolute top-0 right-0 p-10 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-8 group-hover:translate-x-0">
                    <ArrowRight className="h-8 w-8 text-emerald-500" />
                  </div>
                  
                  <div className="relative h-20 w-20 rounded-3xl bg-emerald-50 flex items-center justify-center mb-8 border border-emerald-100 shadow-sm">
                    <Flame className="h-10 w-10 text-emerald-600" />
                  </div>
                  
                  <h3 className="relative text-4xl font-black text-gray-900 mb-4 tracking-tight">Pemain</h3>
                  <p className="relative text-gray-600 mb-12 flex-1 text-xl leading-relaxed font-medium">
                    Jadwal futsal, basket, badminton—semua ada di ujung jari. Temukan lawan tanding, join mabar, atau sekadar sewa untuk timmu.
                  </p>
                  
                  <div className="relative font-extrabold text-emerald-600 flex items-center gap-2 text-xl">
                    Mulai Eksplor <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
                  </div>
                </Link>
              </HoverTiltCard>
            </FadeInScroll>

            <FadeInScroll delay={0.9}>
              <HoverTiltCard>
                <Link
                  href="/merchant/login"
                  className="group relative flex flex-col h-full p-10 bg-gray-900 backdrop-blur-xl rounded-[2.5rem] border border-gray-800 shadow-2xl hover:shadow-blue-900/20 hover:border-gray-700 transition-all text-left overflow-hidden"
                >
                  <div className="absolute -right-8 -top-8 h-40 w-40 bg-blue-500/10 rounded-full blur-3xl group-hover:bg-blue-500/20 transition-colors"></div>
                  
                  <div className="absolute top-0 right-0 p-10 opacity-0 group-hover:opacity-100 transition-all duration-500 translate-x-8 group-hover:translate-x-0">
                    <ArrowRight className="h-8 w-8 text-white" />
                  </div>
                  
                  <div className="relative h-20 w-20 rounded-3xl bg-gray-800 flex items-center justify-center mb-8 border border-gray-700 shadow-sm">
                    <Store className="h-10 w-10 text-blue-400" />
                  </div>
                  
                  <h3 className="relative text-4xl font-black text-white mb-4 tracking-tight">Mitra Venue</h3>
                  <p className="relative text-gray-400 mb-12 flex-1 text-xl leading-relaxed font-medium">
                    Tinggalkan buku catatan manual. Biarkan sistem kami mendatangkan pelanggan otomatis 24/7 sambil Anda fokus ngurus bisnis.
                  </p>
                  
                  <div className="relative font-extrabold text-white flex items-center gap-2 text-xl">
                    Daftarkan Lapangan <ArrowRight className="h-6 w-6 group-hover:translate-x-2 transition-transform" />
                  </div>
                </Link>
              </HoverTiltCard>
            </FadeInScroll>
          </div>
        </main>
      </AuroraBackground>

      {/* ─── SECTION 2: Flowing Menu (Full Width Animations) ─── */}
      <section id="sports" className="w-full bg-gray-950 overflow-hidden relative">
        <FadeInScroll>
          <div className="max-w-7xl mx-auto px-6 pt-24 pb-8 text-center">
            <h2 className="text-5xl lg:text-7xl font-black text-white mb-6 tracking-tighter">Pilih Permainanmu.</h2>
            <p className="text-gray-400 text-xl font-medium max-w-2xl mx-auto">Dari rumput sintetis sampai lapangan vinyl indoor. Pilih dan main tanpa ribet cari ketersediaan.</p>
          </div>
        </FadeInScroll>
        
        {/* Full width bleeding edge animation container */}
        <div className="w-full h-[600px] relative border-y border-white/10">
          <LandingInteractive section="flowing-menu" />
        </div>
      </section>

      {/* ─── SECTION 3: Step-by-step (Stepper) ─── */}
      <section id="how-it-works" className="w-full bg-zinc-900 py-32 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6">
          <FadeInScroll>
            <div className="mb-24 text-center max-w-4xl mx-auto">
              <h2 className="text-5xl lg:text-6xl font-black text-white mb-6 tracking-tighter">Booking Ga Ribet.</h2>
              <p className="text-gray-400 text-xl font-medium leading-relaxed">Pesan, bayar, main. Cuma butuh empat step doang, selebihnya urusan kami. Bebas drama jadwal bentrok.</p>
            </div>
          </FadeInScroll>
          <FadeInScroll delay={0.2}>
            <LandingInteractive section="stepper" />
          </FadeInScroll>
        </div>
      </section>

      {/* ─── SECTION 4: Kenapa Pakai Ini? ─── */}
      <section id="features" className="w-full bg-zinc-50 py-32">
        <div className="max-w-7xl mx-auto px-6">
          <FadeInScroll>
            <div className="text-center mb-24 max-w-4xl mx-auto">
              <h2 className="text-5xl lg:text-6xl font-black text-gray-900 mb-6 tracking-tighter">Bukan Sekadar Aplikasi Booking.</h2>
              <p className="text-gray-500 text-xl font-medium">Platform ekosistem olahraga terlengkap di kantongmu dengan dukungan keamanan tingkat tinggi.</p>
            </div>
          </FadeInScroll>

          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-6 text-center w-full">
            <FadeInScroll delay={0.1}>
              <HoverTiltCard>
                <div className="flex flex-col items-center p-10 rounded-[2.5rem] bg-white shadow-2xl shadow-gray-200/50 border border-gray-100 hover:border-emerald-200 transition-colors h-full">
                  <div className="h-20 w-20 rounded-3xl bg-emerald-50 flex items-center justify-center mb-8 shadow-inner border border-emerald-100">
                    <MapPin className="h-10 w-10 text-emerald-500" />
                  </div>
                  <h4 className="font-black text-gray-900 text-2xl mb-4 tracking-tight">Pilihan Tanpa Batas</h4>
                  <p className="text-gray-500 text-lg leading-relaxed font-medium">Ratusan venue dengan berbagai fasilitas. Pilih yang paling dekat atau yang paling elite.</p>
                </div>
              </HoverTiltCard>
            </FadeInScroll>
            
            <FadeInScroll delay={0.2}>
              <HoverTiltCard>
                <div className="flex flex-col items-center p-10 rounded-[2.5rem] bg-white shadow-2xl shadow-gray-200/50 border border-gray-100 hover:border-blue-200 transition-colors h-full">
                  <div className="h-20 w-20 rounded-3xl bg-blue-50 flex items-center justify-center mb-8 shadow-inner border border-blue-100">
                    <Clock className="h-10 w-10 text-blue-500" />
                  </div>
                  <h4 className="font-black text-gray-900 text-2xl mb-4 tracking-tight">Ketersediaan Real-time</h4>
                  <p className="text-gray-500 text-lg leading-relaxed font-medium">Gak ada lagi cerita 'lapangan full padahal di web kosong'. Data 100% akurat.</p>
                </div>
              </HoverTiltCard>
            </FadeInScroll>
            
            <FadeInScroll delay={0.3}>
              <HoverTiltCard>
                <div className="flex flex-col items-center p-10 rounded-[2.5rem] bg-white shadow-2xl shadow-gray-200/50 border border-gray-100 hover:border-violet-200 transition-colors h-full">
                  <div className="h-20 w-20 rounded-3xl bg-violet-50 flex items-center justify-center mb-8 shadow-inner border border-violet-100">
                    <Repeat className="h-10 w-10 text-violet-500" />
                  </div>
                  <h4 className="font-black text-gray-900 text-2xl mb-4 tracking-tight">Batal Main? Resell Aja</h4>
                  <p className="text-gray-500 text-lg leading-relaxed font-medium">Uang gak hangus kalau mendadak ada urusan. Jual lagi slotmu ke pemain lain.</p>
                </div>
              </HoverTiltCard>
            </FadeInScroll>
            
            <FadeInScroll delay={0.4}>
              <HoverTiltCard>
                <div className="flex flex-col items-center p-10 rounded-[2.5rem] bg-white shadow-2xl shadow-gray-200/50 border border-gray-100 hover:border-amber-200 transition-colors h-full">
                  <div className="h-20 w-20 rounded-3xl bg-amber-50 flex items-center justify-center mb-8 shadow-inner border border-amber-100">
                    <Gavel className="h-10 w-10 text-amber-500" />
                  </div>
                  <h4 className="font-black text-gray-900 text-2xl mb-4 tracking-tight">Lelang Jam Sultan</h4>
                  <p className="text-gray-500 text-lg leading-relaxed font-medium">Ikut bidding untuk ngedapetin jam-jam prime time incaran semua orang.</p>
                </div>
              </HoverTiltCard>
            </FadeInScroll>
          </div>
        </div>
      </section>

      {/* ─── SECTION 5: B2B Merchant CTA (CardSwap) ─── */}
      <section className="w-full bg-gray-950 py-32 overflow-hidden border-t border-gray-900">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid lg:grid-cols-2 gap-20 items-center">
            <FadeInScroll>
              <div>
                <div className="inline-block px-4 py-1.5 rounded-full bg-gray-800 border border-gray-700 text-gray-300 font-bold text-xs uppercase tracking-widest mb-6">
                  Bisnis Lapangan Olahraga
                </div>
                <h2 className="text-5xl lg:text-7xl font-black text-white mb-8 tracking-tighter leading-tight">Berhenti Catat Manual.</h2>
                <p className="text-gray-400 text-2xl mb-12 font-medium leading-relaxed">
                  Zaman udah canggih, masa masih pake buku tulis? Transformasi venue Anda, terima order 24/7, dan biarkan pendapatan mengalir masuk.
                </p>
                
                <div className="space-y-8 mb-12">
                  <div className="flex items-start gap-6">
                    <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                      <Zap className="h-7 w-7 text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white mb-2 tracking-tight">Auto-Pilot Booking</h4>
                      <p className="text-gray-400 text-lg">Gak perlu standby balas WhatsApp. Pelanggan book & bayar otomatis dari aplikasi.</p>
                    </div>
                  </div>
                  <div className="flex items-start gap-6">
                    <div className="h-14 w-14 rounded-2xl bg-blue-500/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0">
                      <Shield className="h-7 w-7 text-blue-400" />
                    </div>
                    <div>
                      <h4 className="text-xl font-bold text-white mb-2 tracking-tight">Uang Pasti Masuk</h4>
                      <p className="text-gray-400 text-lg">Bye-bye pelanggan PHP. Semua bayar lunas di muka via QRIS atau Virtual Account.</p>
                    </div>
                  </div>
                </div>
                
                <LandingInteractive section="magnet-cta" />
              </div>
            </FadeInScroll>

            <FadeInScroll delay={0.3}>
              <div className="relative h-[600px] hidden lg:flex items-center justify-center rounded-3xl bg-gradient-to-tr from-gray-900 to-gray-800 border border-gray-800 shadow-2xl p-10">
                {/* Visualizing Card Swap Component */}
                <LandingInteractive section="card-swap" />
              </div>
            </FadeInScroll>
          </div>
        </div>
      </section>

      {/* ─── SECTION 6: Final CTA ─── */}
      <section className="w-full relative overflow-hidden bg-gray-900 py-40">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-600 to-teal-500 opacity-90"></div>
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1579952363873-27f3bade9f55?q=80&w=2000&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-30"></div>
        
        <div className="relative max-w-5xl mx-auto px-6 text-center z-10">
          <FadeInScroll>
            <h2 className="text-6xl lg:text-[6rem] font-black text-white mb-8 tracking-tighter leading-[1]">Gas Sekarang!</h2>
            <p className="text-emerald-50 text-2xl lg:text-3xl mb-16 max-w-3xl mx-auto font-medium leading-relaxed opacity-90">
              Jangan sampai kehabisan jadwal prime time. Cari teman main, booking lapangannya, bakar kalorinya.
            </p>
            <div className="flex flex-col sm:flex-row gap-6 justify-center">
              <Link
                href="/login"
                className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-gray-900 text-white font-black text-xl rounded-full shadow-2xl hover:bg-black hover:shadow-emerald-900/50 hover:-translate-y-1 transition-all"
              >
                Mulai Booking <ArrowRight className="h-6 w-6" />
              </Link>
              <Link
                href="/merchant/login"
                className="inline-flex items-center justify-center gap-3 px-10 py-5 bg-white/10 backdrop-blur-md text-white font-bold text-xl rounded-full border border-white/30 hover:bg-white/20 transition-all"
              >
                Gabung Mitra
              </Link>
            </div>
          </FadeInScroll>
        </div>
      </section>

      {/* ─── Footer ─── */}
      <footer className="w-full py-16 bg-black text-center">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col items-center justify-center gap-6">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600">
                <Trophy className="h-5 w-5 text-white" />
              </div>
              <span className="text-3xl font-black text-white tracking-tighter">Sportcation</span>
            </div>
            
            <div className="flex flex-wrap justify-center gap-8 text-gray-500 font-medium">
              <Link href="#" className="hover:text-white transition-colors">Tentang Kami</Link>
              <Link href="#" className="hover:text-white transition-colors">Syarat & Ketentuan</Link>
              <Link href="#" className="hover:text-white transition-colors">Kebijakan Privasi</Link>
              <Link href="#" className="hover:text-white transition-colors">Bantuan</Link>
            </div>
            
            <div className="w-24 h-1 bg-gray-900 rounded-full my-4"></div>
            
            <p className="text-gray-600 font-medium">
              &copy; {new Date().getFullYear()} Sportcation. Dibangun dengan keringat & air mata.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
