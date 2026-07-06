import Link from "next/link"
import { ShieldAlert } from "lucide-react"

export default function UnauthorizedPage() {
  return (
    <main className="grid min-h-screen place-items-center bg-[#f3f6f6] px-6 text-[#2c3133]">
      <section className="w-full max-w-lg rounded-[30px] bg-white p-8 text-center shadow-sm">
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl bg-[#fff0f1] text-[#c11f32]">
          <ShieldAlert className="h-8 w-8" />
        </span>
        <p className="mt-6 text-xs font-black uppercase tracking-[0.22em] text-[#c11f32]">Access denied</p>
        <h1 className="mt-3 text-4xl font-black tracking-[-0.06em]">Akun ini tidak memiliki akses.</h1>
        <p className="mt-4 font-semibold leading-relaxed text-[#687073]">
          Login dengan akun yang memiliki role sesuai atau kembali ke aplikasi pengguna.
        </p>
        <div className="mt-7 grid gap-3 sm:grid-cols-2">
          <Link href="/login" className="rounded-full bg-[#071413] px-5 py-4 text-sm font-black text-white">
            Login akun lain
          </Link>
          <Link href="/" className="rounded-full bg-[#eafff8] px-5 py-4 text-sm font-black text-[#007c61]">
            Kembali ke aplikasi
          </Link>
        </div>
      </section>
    </main>
  )
}
