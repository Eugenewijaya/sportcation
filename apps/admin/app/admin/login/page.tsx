"use client"

import { useRouter } from "next/navigation"
import { useState, type FormEvent, use } from "react"
import { AlertCircle, ArrowRight, LoaderCircle, LockKeyhole, Mail, ShieldAlert } from "lucide-react"
import { authClient } from "@/lib/auth-client"

function safeInternalPath(value?: string) {
  if (!value || !value.startsWith("/") || value.startsWith("//") || value.includes("\\")) return null
  return value
}

export default function AdminLoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>
}) {
  const { next } = use(searchParams)
  const router = useRouter()
  
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
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
        rememberMe: false,
      })
      
      if (result.error) throw new Error(result.error.message || "Email atau password salah.")

      const userRole = result.data?.user.role
      // Protect admin route, if user is not admin, auth context will kick them out anyway, but we can check here.
      if (userRole !== "admin") {
         throw new Error("Akses ditolak. Anda bukan admin.")
      }
      
      const requestedPath = safeInternalPath(next)
      router.push(requestedPath ?? "/admin")
      router.refresh()
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Gagal masuk.")
      await authClient.signOut()
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-zinc-950 p-6">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900 p-8 shadow-2xl">
        <div className="mb-8 flex flex-col items-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 text-red-500">
            <ShieldAlert className="h-8 w-8" />
          </div>
          <h1 className="text-2xl font-bold tracking-tight text-white">System Admin</h1>
          <p className="mt-2 text-sm text-zinc-400">Restricted Access Only</p>
        </div>

        <form onSubmit={submit} className="space-y-4">
          <div>
            <label className="sr-only">Email</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <Mail className="h-5 w-5 text-zinc-500" />
              </div>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                placeholder="admin@sportcation.local"
                className="block h-12 w-full rounded-xl border-zinc-800 bg-zinc-950/50 pl-12 pr-4 text-sm text-white placeholder-zinc-500 focus:border-red-500 focus:ring-red-500"
              />
            </div>
          </div>

          <div>
            <label className="sr-only">Password</label>
            <div className="relative">
              <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
                <LockKeyhole className="h-5 w-5 text-zinc-500" />
              </div>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                placeholder="••••••••"
                className="block h-12 w-full rounded-xl border-zinc-800 bg-zinc-950/50 pl-12 pr-4 text-sm text-white placeholder-zinc-500 focus:border-red-500 focus:ring-red-500"
              />
            </div>
          </div>

          {error && (
            <div className="flex items-center gap-2 rounded-lg bg-red-950/50 border border-red-900 p-3 text-sm font-medium text-red-400">
              <AlertCircle className="h-5 w-5 shrink-0" />
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="flex h-12 w-full mt-2 items-center justify-center gap-2 rounded-xl bg-red-600 text-sm font-semibold text-white transition hover:bg-red-700 disabled:opacity-50"
          >
            {submitting ? <LoaderCircle className="h-5 w-5 animate-spin" /> : "Authenticate"}
            {!submitting && <ArrowRight className="h-4 w-4" />}
          </button>
        </form>
        
        <div className="mt-8 rounded-lg border border-dashed border-zinc-800 p-4 text-center">
            <button
              onClick={() => { setEmail("admin@sportcation.local"); setPassword("password123") }}
              className="text-xs font-medium text-zinc-500 hover:text-zinc-300 transition-colors"
            >
              [Dev] Auto-fill Admin Credentials
            </button>
        </div>
      </div>
    </main>
  )
}
