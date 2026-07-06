"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, type FormEvent, use } from "react"
import { AlertCircle, ArrowLeft, ArrowRight, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail, Store } from "lucide-react"
import { authClient } from "@/lib/auth-client"

function safeInternalPath(value?: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return null
  return value
}

function defaultDestination(role?: string) {
  if (role === "admin") return "/admin"
  if (role === "merchant_owner" || role === "merchant_staff") return "/merchant"
  return "/app"
}

export default function MerchantLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const { next } = use(searchParams)
  const router = useRouter()
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [rememberMe, setRememberMe] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError("")

    try {
      const result = await authClient.signIn.email({
        email: email.trim().toLowerCase(),
        password,
        rememberMe,
      })
      
      if (result.error) throw new Error(result.error.message || "Email atau password salah.")

      const userRole = result.data?.user.role
      const requestedPath = safeInternalPath(next)
      const destination = requestedPath ?? defaultDestination(userRole ?? undefined)
      
      router.push(destination)
      router.refresh()
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Gagal masuk.")
    } finally {
      setSubmitting(false)
    }
  }

  async function loginWithGoogle() {
    setSubmitting(true)
    setError("")
    try {
      await authClient.signIn.social({ provider: "google" })
    } catch {
      setError("Gagal masuk dengan Google.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen bg-slate-50">
      {/* Left Branding for Merchant */}
      <section className="relative hidden w-1/2 overflow-hidden lg:block bg-slate-900">
        <img src="https://images.unsplash.com/photo-1555597673-b21d5c935865?q=80&w=1470&auto=format&fit=crop" alt="Business Dashboard" className="absolute inset-0 h-full w-full object-cover opacity-50 grayscale mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-t from-slate-900 via-slate-900/80 to-transparent" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link href="/" className="flex items-center gap-2 text-2xl font-black text-white">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-600 shadow-lg">
              <Store className="h-6 w-6 text-white" />
            </div>
            Sportcation <span className="text-blue-400 font-medium">Merchant</span>
          </Link>
          <div>
            <h1 className="text-4xl font-bold text-white leading-tight mb-4 tracking-tight">
              Kelola Lapangan<br/>Tingkatkan Pendapatan.
            </h1>
            <p className="text-lg text-slate-300">
              Sistem manajemen lapangan pintar untuk pemilik bisnis olahraga.
            </p>
          </div>
        </div>
      </section>

      {/* Right Form */}
      <section className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:px-16">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-10 flex items-center gap-2 text-xl font-black text-slate-900 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-blue-600 shadow-md">
              <Store className="h-5 w-5 text-white" />
            </div>
            Sportcation Merchant
          </Link>

          <h2 className="text-2xl font-bold text-slate-900 tracking-tight">Merchant Portal</h2>
          <p className="mt-2 text-sm text-slate-500">Silakan masuk ke akun bisnis Anda.</p>

          <button
            type="button"
            onClick={loginWithGoogle}
            disabled={submitting}
            className="mt-8 flex h-11 w-full items-center justify-center gap-3 rounded-lg border border-slate-200 bg-white text-sm font-medium text-slate-700 shadow-sm transition hover:bg-slate-50 hover:border-slate-300 disabled:opacity-50"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              <path d="M1 1h22v22H1z" fill="none" />
            </svg>
            Masuk dengan Google (Business)
          </button>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-slate-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-slate-50 px-4 text-slate-500">Atau gunakan email bisnis</span>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Email Bisnis</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="admin@lapangan.com"
                  className="block h-11 w-full rounded-lg border-slate-200 bg-white pl-10 pr-4 text-sm focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">Kata Sandi</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
                  <LockKeyhole className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  placeholder="••••••••"
                  className="block h-11 w-full rounded-lg border-slate-200 bg-white pl-10 pr-12 text-sm focus:border-blue-500 focus:ring-blue-500 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between py-1">
              <label className="flex items-center gap-2 text-sm text-slate-600 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                Ingat saya
              </label>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm font-medium text-red-600">
                <AlertCircle className="h-5 w-5" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex h-11 w-full mt-2 items-center justify-center gap-2 rounded-lg bg-blue-600 text-sm font-semibold text-white shadow-md shadow-blue-500/20 transition hover:bg-blue-700 disabled:opacity-50"
            >
              {submitting ? <LoaderCircle className="h-5 w-5 animate-spin" /> : "Masuk ke Dashboard"}
              {!submitting && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <p className="mt-8 text-center text-sm text-slate-500">
            Belum mendaftarkan lapangan Anda?{" "}
            <Link href="/merchant/register" className="font-semibold text-blue-600 hover:text-blue-700">
              Daftar Mitra
            </Link>
          </p>

          <div className="mt-12 rounded-xl border border-dashed border-slate-300 p-4 text-center">
            <button
              onClick={() => { setEmail("merchant@sportcation.local"); setPassword("password123") }}
              className="text-xs font-medium text-slate-400 hover:text-slate-600"
            >
              [Dev] Isi Data Demo Merchant
            </button>
          </div>
        </div>
      </section>
    </main>
  )
}
