"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, type FormEvent } from "react"
import { AlertCircle, ArrowLeft, ArrowRight, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail, UserRound, Trophy } from "lucide-react"
import { authClient } from "@/lib/auth-client"

export default function RegisterPage() {
  const router = useRouter()
  
  const [name, setName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState("")

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault()
    setSubmitting(true)
    setError("")

    try {
      const result = await authClient.signUp.email({
        name: name.trim(),
        email: email.trim().toLowerCase(),
        password,
      })
      
      if (result.error) throw new Error(result.error.message || "Gagal membuat akun.")

      router.push("/app")
      router.refresh()
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Pendaftaran gagal.")
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
      setError("Gagal mendaftar dengan Google.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen bg-zinc-50">
      {/* Left Branding */}
      <section className="relative hidden w-1/2 overflow-hidden lg:block bg-gray-900">
        <img src="https://images.unsplash.com/photo-1574680096145-d05b474e2155?q=80&w=1469&auto=format&fit=crop" alt="Workout" className="absolute inset-0 h-full w-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900 via-gray-900/60 to-transparent" />
        <div className="relative flex h-full flex-col justify-between p-12">
          <Link href="/" className="flex items-center gap-2 text-2xl font-black text-white">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-500 shadow-lg">
              <Trophy className="h-6 w-6 text-white" />
            </div>
            Sportcation
          </Link>
          <div>
            <h1 className="text-5xl font-black text-white leading-tight mb-4">
              Join the Squad.<br/>Mulai Hari Ini.
            </h1>
            <p className="text-xl text-gray-300 font-medium">
              Akses ribuan jadwal lapangan dan fitur eksklusif lainnya.
            </p>
          </div>
        </div>
      </section>

      {/* Right Form */}
      <section className="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:px-16">
        <div className="w-full max-w-sm">
          <Link href="/" className="mb-10 flex items-center gap-2 text-xl font-black text-gray-900 lg:hidden">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-500 shadow-md">
              <Trophy className="h-5 w-5 text-white" />
            </div>
            Sportcation
          </Link>

          <h2 className="text-3xl font-black text-gray-900 tracking-tight">Buat Akun Baru 🚀</h2>
          <p className="mt-2 text-base text-gray-500 font-medium">Daftar sekarang buat mulai eksplor lapangan.</p>

          <button
            type="button"
            onClick={loginWithGoogle}
            disabled={submitting}
            className="mt-8 flex h-12 w-full items-center justify-center gap-3 rounded-xl border border-gray-200 bg-white text-sm font-bold text-gray-700 shadow-sm transition hover:bg-gray-50 hover:border-gray-300 disabled:opacity-50"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              <path d="M1 1h22v22H1z" fill="none" />
            </svg>
            Daftar dengan Google
          </button>

          <div className="relative my-8">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-200"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="bg-zinc-50 px-4 text-gray-500 font-medium">atau daftar email</span>
            </div>
          </div>

          <form onSubmit={submit} className="space-y-5">
            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Nama Lengkap</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <UserRound className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  placeholder="Nama Kamu"
                  className="block h-12 w-full rounded-xl border-gray-200 bg-white pl-11 pr-4 text-sm focus:border-emerald-500 focus:ring-emerald-500 shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Email</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <Mail className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  placeholder="kamu@contoh.com"
                  className="block h-12 w-full rounded-xl border-gray-200 bg-white pl-11 pr-4 text-sm focus:border-emerald-500 focus:ring-emerald-500 shadow-sm"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-bold text-gray-700 mb-2">Password</label>
              <div className="relative">
                <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                  <LockKeyhole className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={8}
                  placeholder="Min. 8 karakter"
                  className="block h-12 w-full rounded-xl border-gray-200 bg-white pl-11 pr-12 text-sm focus:border-emerald-500 focus:ring-emerald-500 shadow-sm"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 flex items-center pr-4 text-gray-400 hover:text-gray-600"
                >
                  {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-lg bg-red-50 p-3 text-sm font-semibold text-red-600">
                <AlertCircle className="h-5 w-5" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-emerald-500 text-sm font-bold text-white shadow-md shadow-emerald-500/20 transition hover:bg-emerald-600 disabled:opacity-50"
            >
              {submitting ? <LoaderCircle className="h-5 w-5 animate-spin" /> : "Buat Akun Sekarang"}
              {!submitting && <ArrowRight className="h-4 w-4" />}
            </button>
          </form>

          <p className="mt-8 text-center text-sm font-medium text-gray-500">
            Sudah punya akun?{" "}
            <Link href="/login" className="font-bold text-emerald-600 hover:text-emerald-700">
              Masuk di sini
            </Link>
          </p>
        </div>
      </section>
    </main>
  )
}
