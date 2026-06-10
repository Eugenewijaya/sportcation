"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, type FormEvent } from "react"
import { AlertCircle, ArrowRight, Eye, EyeOff, LoaderCircle, LockKeyhole, Mail, MapPin, UserRound } from "lucide-react"
import { authClient } from "@/lib/auth-client"

type Mode = "login" | "register"

export function AuthPanel({ mode, nextPath }: { mode: Mode; nextPath?: string }) {
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

  return (
    <main className="min-h-screen bg-[#f3f6f6] text-[#2c3133] lg:grid lg:grid-cols-[minmax(420px,0.9fr)_1.1fr]">
      <section className="relative hidden min-h-screen overflow-hidden bg-[#071413] lg:block">
        <img src="/padel-court-modern.jpg" alt="" className="absolute inset-0 h-full w-full object-cover opacity-55" />
        <div className="absolute inset-0 bg-[#071413]/45" />
        <div className="relative flex h-full min-h-screen flex-col justify-between p-12 text-white">
          <Link href="/" className="flex items-center gap-3 text-2xl font-black italic tracking-[-0.05em]">
            <span className="h-10 w-10 rounded-xl bg-[#12d5aa]" />
            SPORTCATION
          </Link>
          <div className="max-w-lg">
            <p className="text-xs font-black uppercase tracking-[0.28em] text-[#49e7ba]">Secure access</p>
            <h1 className="mt-5 text-6xl font-black leading-[0.96] tracking-[-0.07em]">
              Book, operate, and govern one sports platform.
            </h1>
            <p className="mt-6 max-w-md text-lg font-semibold leading-relaxed text-white/72">
              Satu session aman untuk pengguna, merchant partner, dan tim administrasi Sportcation.
            </p>
          </div>
          <div className="flex items-center gap-3 text-sm font-bold text-white/70">
            <MapPin className="h-5 w-5 text-[#49e7ba]" />
            Jakarta, Indonesia
          </div>
        </div>
      </section>

      <section className="flex min-h-screen items-center justify-center px-5 py-10 sm:px-8 lg:px-12">
        <div className="w-full max-w-[520px]">
          <Link href="/" className="mb-10 flex items-center gap-3 text-xl font-black italic tracking-[-0.05em] lg:hidden">
            <span className="h-9 w-9 rounded-xl bg-[#12d5aa]" />
            SPORTCATION
          </Link>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-[#007c61]">
            {mode === "login" ? "Welcome back" : "Customer registration"}
          </p>
          <h2 className="mt-4 text-5xl font-black leading-none tracking-[-0.07em]">
            {mode === "login" ? "Access your arena." : "Create your account."}
          </h2>
          <p className="mt-4 max-w-md font-semibold leading-relaxed text-[#687073]">
            {mode === "login"
              ? "Login pengguna, merchant, dan admin menggunakan akun yang sama. Hak akses ditentukan oleh role server."
              : "Registrasi publik hanya membuat akun customer. Akun merchant dan admin dibuat melalui proses bootstrap terkontrol."}
          </p>

          <form onSubmit={submit} className="mt-9 space-y-5">
            {mode === "register" && (
              <AuthField label="Nama lengkap" icon={UserRound}>
                <input
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  minLength={2}
                  maxLength={120}
                  required
                  autoComplete="name"
                  placeholder="Alex Rivera"
                  className="min-w-0 flex-1 bg-transparent text-sm font-bold outline-none placeholder:text-[#a2a8ab]"
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
                placeholder="name@sportcation.com"
                className="min-w-0 flex-1 bg-transparent text-sm font-bold outline-none placeholder:text-[#a2a8ab]"
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
                className="min-w-0 flex-1 bg-transparent text-sm font-bold outline-none placeholder:text-[#a2a8ab]"
              />
              <button type="button" onClick={() => setShowPassword((visible) => !visible)} title={showPassword ? "Sembunyikan password" : "Tampilkan password"} className="text-[#778085]">
                {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
              </button>
            </AuthField>

            {mode === "login" && (
              <label className="flex items-center gap-3 text-sm font-bold text-[#687073]">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(event) => setRememberMe(event.target.checked)}
                  className="h-4 w-4 accent-[#008f71]"
                />
                Pertahankan session di perangkat ini
              </label>
            )}

            {error && (
              <div role="alert" className="flex items-start gap-3 rounded-2xl border border-[#ffd1d5] bg-[#fff0f1] px-4 py-3 text-sm font-bold text-[#c11f32]">
                <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" />
                {error}
              </div>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="inline-flex h-14 w-full items-center justify-center gap-3 rounded-full bg-gradient-to-r from-[#008f71] to-[#49e7ba] px-6 text-sm font-black uppercase tracking-[0.14em] text-white shadow-[0_18px_35px_rgb(0_124_97/0.2)] disabled:cursor-not-allowed disabled:opacity-60"
            >
              {submitting ? <LoaderCircle className="h-5 w-5 animate-spin" /> : <ArrowRight className="h-5 w-5" />}
              {submitting ? "Memproses..." : mode === "login" ? "Login" : "Buat akun"}
            </button>
          </form>

          <p className="mt-7 text-center text-sm font-semibold text-[#687073]">
            {mode === "login" ? "Belum memiliki akun customer?" : "Sudah memiliki akun?"}{" "}
            <Link href={mode === "login" ? "/register" : "/login"} className="font-black text-[#007c61]">
              {mode === "login" ? "Register" : "Login"}
            </Link>
          </p>
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
      <span className="text-xs font-black uppercase tracking-[0.18em] text-[#687073]">{label}</span>
      <span className="mt-2 flex h-14 items-center gap-3 rounded-2xl bg-white px-4 shadow-sm ring-1 ring-[#e6ebeb] focus-within:ring-2 focus-within:ring-[#49e7ba]">
        <Icon className="h-5 w-5 shrink-0 text-[#008f71]" />
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
    return "Email sudah terdaftar. Silakan login."
  }
  if (normalized.includes("too many")) {
    return "Terlalu banyak percobaan. Tunggu sebentar sebelum mencoba kembali."
  }
  return message
}
