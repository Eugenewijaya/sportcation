"use client"

import dynamic from "next/dynamic"
import Link from "next/link"
import { ArrowRight, Trophy, BarChart3, Calendar, CreditCard } from "lucide-react"

const FlowingMenu = dynamic(() => import("@/components/animations/FlowingMenu"), { ssr: false })
const Stepper = dynamic(() => import("@/components/animations/Stepper").then(m => ({ default: m.default })), { ssr: false })
const StepComponent = dynamic(() => import("@/components/animations/Stepper").then(m => ({ default: m.Step })), { ssr: false })
const CardSwap = dynamic(() => import("@/components/animations/CardSwap").then(m => ({ default: m.default })), { ssr: false })
const CardComponent = dynamic(() => import("@/components/animations/CardSwap").then(m => ({ default: m.Card })), { ssr: false })
const Magnet = dynamic(() => import("@/components/animations/Magnet"), { ssr: false })

const sportCategories = [
  { link: "#", text: "Mini Soccer", image: "https://images.unsplash.com/photo-1551958219-acbc608c6377?w=600&h=400&fit=crop" },
  { link: "#", text: "Badminton", image: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=600&h=400&fit=crop" },
  { link: "#", text: "Basketball", image: "https://images.unsplash.com/photo-1546519638-68e109498ffc?w=600&h=400&fit=crop" },
  { link: "#", text: "Tennis", image: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=600&h=400&fit=crop" },
  { link: "#", text: "Volleyball", image: "https://images.unsplash.com/photo-1612872087720-bb876e2e67d1?w=600&h=400&fit=crop" },
]

interface LandingInteractiveProps {
  section: "flowing-menu" | "stepper" | "card-swap" | "magnet-cta"
}

export default function LandingInteractive({ section }: LandingInteractiveProps) {
  if (section === "flowing-menu") {
    return (
      <FlowingMenu
        items={sportCategories}
        speed={12}
        textColor="#ffffff"
        bgColor="#030712"
        marqueeBgColor="#10b981"
        marqueeTextColor="#030712"
        borderColor="rgba(255,255,255,0.1)"
      />
    )
  }

  if (section === "stepper") {
    return (
      <Stepper
        initialStep={1}
        backButtonText="Sebelumnya"
        nextButtonText="Selanjutnya"
      >
        <StepComponent>
          <div className="text-center py-6">
            <div className="h-16 w-16 rounded-2xl bg-emerald-500/20 flex items-center justify-center mx-auto mb-4">
              <Trophy className="h-8 w-8 text-emerald-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Buat Akun</h3>
            <p className="text-gray-400 max-w-sm mx-auto">
              Daftar gratis dengan Google atau email. Hanya butuh 30 detik untuk memulai.
            </p>
          </div>
        </StepComponent>
        <StepComponent>
          <div className="text-center py-6">
            <div className="h-16 w-16 rounded-2xl bg-blue-500/20 flex items-center justify-center mx-auto mb-4">
              <Calendar className="h-8 w-8 text-blue-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Cari & Pilih Venue</h3>
            <p className="text-gray-400 max-w-sm mx-auto">
              Telusuri katalog venue berdasarkan lokasi, jenis olahraga, dan ketersediaan jadwal.
            </p>
          </div>
        </StepComponent>
        <StepComponent>
          <div className="text-center py-6">
            <div className="h-16 w-16 rounded-2xl bg-violet-500/20 flex items-center justify-center mx-auto mb-4">
              <CreditCard className="h-8 w-8 text-violet-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Booking & Bayar</h3>
            <p className="text-gray-400 max-w-sm mx-auto">
              Pilih jadwal, bayar dengan QRIS atau transfer bank. Konfirmasi otomatis dan instan.
            </p>
          </div>
        </StepComponent>
        <StepComponent>
          <div className="text-center py-6">
            <div className="h-16 w-16 rounded-2xl bg-amber-500/20 flex items-center justify-center mx-auto mb-4">
              <BarChart3 className="h-8 w-8 text-amber-400" />
            </div>
            <h3 className="text-2xl font-bold text-white mb-2">Main & Nikmati!</h3>
            <p className="text-gray-400 max-w-sm mx-auto">
              Datang ke venue, tunjukkan bukti booking, dan nikmati permainan Anda. Selesai!
            </p>
          </div>
        </StepComponent>
      </Stepper>
    )
  }

  if (section === "card-swap") {
    return (
      <CardSwap
        cardDistance={50}
        verticalDistance={60}
        delay={4000}
        pauseOnHover={true}
        width={380}
        height={260}
      >
        <CardComponent customClass="!bg-gradient-to-br !from-emerald-600 !to-teal-500 !border-emerald-400/30">
          <div className="p-8 h-full flex flex-col justify-between text-white">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider opacity-70">Dashboard</span>
              <h3 className="text-2xl font-bold mt-2">Pendapatan Hari Ini</h3>
            </div>
            <div>
              <p className="text-4xl font-black">Rp 2.450.000</p>
              <p className="text-sm opacity-70 mt-1">↑ 12% dari kemarin</p>
            </div>
          </div>
        </CardComponent>
        <CardComponent customClass="!bg-gradient-to-br !from-violet-600 !to-purple-500 !border-violet-400/30">
          <div className="p-8 h-full flex flex-col justify-between text-white">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider opacity-70">Booking</span>
              <h3 className="text-2xl font-bold mt-2">Hari Ini</h3>
            </div>
            <div>
              <p className="text-4xl font-black">24 Sesi</p>
              <p className="text-sm opacity-70 mt-1">Okupansi 87%</p>
            </div>
          </div>
        </CardComponent>
        <CardComponent customClass="!bg-gradient-to-br !from-amber-500 !to-orange-500 !border-amber-400/30">
          <div className="p-8 h-full flex flex-col justify-between text-white">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider opacity-70">Ulasan</span>
              <h3 className="text-2xl font-bold mt-2">Rating Venue</h3>
            </div>
            <div>
              <p className="text-4xl font-black">⭐ 4.8/5.0</p>
              <p className="text-sm opacity-70 mt-1">156 ulasan bulan ini</p>
            </div>
          </div>
        </CardComponent>
      </CardSwap>
    )
  }

  if (section === "magnet-cta") {
    return (
      <Magnet padding={80} magnetStrength={3}>
        <Link
          href="/merchant/login"
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-teal-400 text-white font-bold text-lg rounded-full shadow-xl shadow-emerald-500/30 hover:shadow-2xl hover:shadow-emerald-500/40 transition-all"
        >
          Daftar Mitra Sekarang <ArrowRight className="h-5 w-5" />
        </Link>
      </Magnet>
    )
  }

  return null
}
