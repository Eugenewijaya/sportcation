import type { ReactNode } from "react"
import { requirePageRole } from "@/lib/auth-access"
import Link from "next/link"
import { MapPin, CalendarDays, Wallet, Home, LogOut } from "lucide-react"
import { headers } from "next/headers"

export default async function MerchantLayout({ children }: { children: ReactNode }) {
  await requirePageRole(["merchant_owner", "merchant_staff"], "/merchant")
  const headersList = await headers()
  const pathname = headersList.get("x-invoke-path") || ""

  // Check merchant verification status
  const session = await requirePageRole(["merchant_owner", "merchant_staff"], "/merchant")
  if (session) {
    const { redirect } = await import("next/navigation")
    const { apiFetch } = await import("@/lib/api/fetch")
    
    // Note: api/merchant/verification doesn't use ok() wrapper, so apiFetch won't unwrap
    // It returns { merchant: MerchantProfile }
    const res = await apiFetch<{ merchant: { status: string } | null }>("/api/merchant/verification")
    const merchant = res?.merchant

    const isVerificationPage = pathname === "/merchant/verification"
    
    if (merchant && (merchant.status === "draft" || merchant.status === "review")) {
      if (!isVerificationPage) {
        redirect("/merchant/verification")
      }
    } else if (isVerificationPage && merchant && merchant.status === "verified") {
      redirect("/merchant")
    }
  }

  const links = [
    { href: "/merchant", label: "Dashboard", icon: Home },
    { href: "/merchant/venues", label: "Manajemen Lapangan", icon: MapPin },
    { href: "/merchant/bookings", label: "Data Pesanan", icon: CalendarDays },
    { href: "/merchant/finance", label: "Keuangan & Tarik Dana", icon: Wallet },
  ]

  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-200 flex flex-col">
        <div className="h-16 flex items-center px-6 border-b border-gray-200">
          <span className="text-xl font-black text-emerald-600">Sportcation</span>
          <span className="ml-2 text-xs font-bold bg-emerald-100 text-emerald-800 px-2 py-1 rounded-full">MITRA</span>
        </div>
        <nav className="flex-1 p-4 space-y-1">
          {links.map((link) => {
            const Icon = link.icon
            const isActive = pathname === link.href || pathname.startsWith(link.href + "/")
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition ${
                  isActive ? "bg-emerald-50 text-emerald-700" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                }`}
              >
                <Icon className="h-5 w-5" />
                {link.label}
              </Link>
            )
          })}
        </nav>
        <div className="p-4 border-t border-gray-200">
          <Link href="/api/auth/signout" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold text-red-600 hover:bg-red-50 transition">
            <LogOut className="h-5 w-5" />
            Keluar
          </Link>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
