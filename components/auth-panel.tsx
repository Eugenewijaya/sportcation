"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, type FormEvent } from "react"
import { AlertCircle, ArrowLeft, ArrowRight, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail, UserRound } from "lucide-react"
import { authClient } from "@/lib/auth-client"

type Mode = "login" | "register"

export function AuthPanel({ mode, nextPath, role = "customer" }: { mode: Mode; nextPath?: string; role?: "customer" | "merchant" | "admin" }) {
  const router = useRouter()
  const [name, setName] = useState("")
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
      if (mode === "register") {
        const result = await authClient.signUp.email({
          name: name.trim(),
          email: email.trim().toLowerCase(),
          password,
        })
        if (result.error) throw new Error(result.error.message || "Registrasi gagal.")
        router.push("/")
        router.refresh()
        return
      }

      const result = await authClient.signIn.email({
        email: email.trim().toLowerCase(),
        password,
        rememberMe,
      })
      if (result.error) throw new Error(result.error.message || "Email atau password tidak valid.")

      const role = result.data?.user.role
      const requestedPath = safeInternalPath(nextPath)
      const destination = requestedPath ?? defaultDestination(role ?? undefined)
      router.push(destination)
      router.refresh()
    } catch (authError) {
      setError(authError instanceof Error ? translateAuthError(authError.message) : "Autentikasi gagal diproses.")
    } finally {
      setSubmitting(false)
    }
  }

  async function loginWithGoogle() {
    setSubmitting(true)
    setError("")
    try {
      await authClient.signIn.social({ provider: "google" })
    } catch (authError) {
      setError("Gagal masuk dengan Google.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen">
      {/* Left panel — branding (desktop only) */}
      <section className="relative hidden w-[480px] shrink-0 overflow-hidden bg-gray-900 lg:block xl:w-[540px]">
        <img src="/padel-court-modern.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-40" />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/50 to-gray-900/30" />
        <div className="relative flex h-full flex-col justify-between p-10">
          <Link href="/" className="flex items-center gap-2.5 text-xl font-bold text-white">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-sm font-extrabold text-white">S</span>
            Sportcation
          </Link>
          <div className="max-w-sm">
            <h1 className="text-3xl font-bold leading-snug text-white">
              Satu platform untuk semua kebutuhan venue olahraga Anda.
            </h1>
            <p className="mt-4 text-base leading-relaxed text-white/60">
              Booking lapangan, kelola venue, dan pantau operasional — semua dari satu akun.
            </p>
          </div>
          <p className="text-sm text-white/40">© 2024 Sportcation. All rights reserved.</p>
        </div>
      </section>

      {/* Right panel — form */}
      <section className="flex flex-1 items-center justify-center bg-gray-50 px-5 py-10 sm:px-8 lg:px-12">
        <div className="w-full max-w-md">
          {/* Mobile logo */}
          <Link href="/" className="mb-8 flex items-center gap-2.5 text-lg font-bold lg:hidden">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-emerald-600 text-sm font-extrabold text-white">S</span>
            Sportcation
          </Link>

          <h2 className="text-2xl font-bold text-gray-900">
            {mode === "login" ? "Masuk ke akun Anda" : "Buat akun baru"}
          </h2>
          <p className="mt-2 text-sm leading-relaxed text-gray-500">
            {mode === "login"
              ? role === "merchant"
                ? "Masuk ke dashboard merchant Anda."
                : role === "admin"
                  ? "Masuk ke sistem administrasi."
                  : "Masuk ke sistem Sportcation."
              : "Daftar sebagai customer. Akun merchant dan admin dibuat oleh administrator."}
          </p>



          <form onSubmit={submit} className="mt-6 space-y-4">
            {mode === "register" && (
              <AuthField label="Nama lengkap" icon={UserRound}>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  minLength={2}
                  maxLength={120}
                  required
                  autoComplete="name"
                  placeholder="Nama Anda"
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
                />
              </AuthField>
            )}
            <AuthField label="Email" icon={Mail}>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                required
                autoComplete="email"
                placeholder={
                  mode === "login" 
                    ? `nama@${role === "merchant" ? "mitra." : role === "admin" ? "admin." : ""}email.com` 
                    : "nama@email.com"
                }
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
              />
            </AuthField>
            <AuthField label="Password" icon={LockKeyhole}>
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                minLength={8}
                maxLength={128}
                required
                autoComplete={mode === "login" ? "current-password" : "new-password"}
                placeholder="Minimal 8 karakter"
                className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
              />
              <button type="button" onClick={() => setShowPassword((visible) => !visible)} title={showPassword ? "Sembunyikan" : "Tampilkan"} className="text-gray-400 hover:text-gray-600">
                {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            </AuthField>

            {mode === "login" && (
              <label className="flex items-center gap-2.5 text-sm text-gray-500">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  className="h-4 w-4 rounded accent-emerald-600"
                />
                Ingat saya di perangkat ini
              </label>
            )}

            {error && (
              <div role="alert" className="flex items-start gap-2.5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="flex h-11 w-full items-center justify-center gap-2 rounded-lg bg-emerald-600 text-sm font-semibold text-white transition hover:bg-emerald-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? <LoaderCircle className="h-4 w-4 animate-spin" /> : <ArrowRight className="h-4 w-4" />}
              {submitting ? "Memproses..." : mode === "login" ? "Masuk" : "Buat akun"}
            </button>
          </form>

          <div className="mt-6 flex items-center gap-3">
            <hr className="flex-1 border-gray-200" />
            <span className="text-xs font-medium text-gray-400 uppercase">atau</span>
            <hr className="flex-1 border-gray-200" />
          </div>

          <button
            type="button"
            onClick={loginWithGoogle}
            disabled={submitting}
            className="mt-6 flex h-11 w-full items-center justify-center gap-2 rounded-lg border border-gray-200 bg-white text-sm font-semibold text-gray-700 transition hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <svg className="h-5 w-5" viewBox="0 0 24 24">
              <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
              <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
              <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
              <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              <path d="M1 1h22v22H1z" fill="none" />
            </svg>
            Masuk dengan Google
          </button>

          <p className="mt-6 text-center text-sm text-gray-500">
            {mode === "login" ? "Belum punya akun?" : "Sudah punya akun?"}{" "}
            <Link href={mode === "login" ? "/register" : "/login"} className="font-semibold text-emerald-600 hover:text-emerald-700">
              {mode === "login" ? "Daftar" : "Masuk"}
            </Link>
          </p>

          <div className="mt-6 text-center">
            <Link href="/" className="inline-flex items-center gap-1.5 text-sm text-gray-400 hover:text-gray-600">
              <ArrowLeft className="h-3.5 w-3.5" />
              Kembali ke beranda
            </Link>
          </div>
        </div>
      </section>
    </main>
  )
}

function AuthField({
  label,
  icon: Icon,
  children,
}: {
  label: string
  icon: typeof Mail
  children: React.ReactNode
}) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-gray-700">{label}</span>
      <span className="flex h-11 items-center gap-2.5 rounded-lg border border-gray-200 bg-white px-3.5 transition focus-within:border-emerald-500 focus-within:ring-1 focus-within:ring-emerald-500">
        <Icon className="h-4 w-4 shrink-0 text-gray-400" />
        {children}
      </span>
    </label>
  )
}

function safeInternalPath(value?: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return null
  return value
}

function defaultDestination(role?: string) {
  if (role === "admin") return "/admin"
  if (role === "merchant_owner" || role === "merchant_staff") return "/merchant"
  return "/"
}

function translateAuthError(message: string) {
  const normalized = message.toLowerCase()
  if (normalized.includes("invalid email or password") || normalized.includes("invalid password")) {
    return "Email atau password tidak valid."
  }
  if (normalized.includes("already exists") || normalized.includes("already registered")) {
    return "Email sudah terdaftar. Silakan masuk."
  }
  if (normalized.includes("too many")) {
    return "Terlalu banyak percobaan. Tunggu sebentar."
  }
  return message
}
