"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  ArrowLeft,
  BadgeCheck,
  Banknote,
  Bell,
  Building2,
  CalendarDays,
  Car,
  Check,
  ChevronRight,
  Clock,
  Download,
  ExternalLink,
  Fingerprint,
  Gavel,
  Heart,
  HelpCircle,
  Home,
  Languages,
  LockKeyhole,
  LogOut,
  Mail,
  MapPin,
  MessageCircle,
  Moon,
  Plus,
  QrCode,
  Repeat2,
  Search,
  Settings,
  Share2,
  ShieldCheck,
  ShowerHead,
  Star,
  Store,
  Tag,
  Ticket,
  Timer,
  Trophy,
  User,
  Wallet,
  X,
  Zap,
  type LucideIcon,
} from "lucide-react"
import type { CustomerNotification, CustomerProfile } from "@/lib/customer-account/types"
import type { CustomerBooking, CustomerPaymentMethod } from "@/lib/customer-bookings/types"
import type { PublicCatalogPayload, PublicSlot, PublicVenue } from "@/lib/public-catalog/types"

type View =
  | "onboarding"
  | "login"
  | "home"
  | "explore"
  | "venue"
  | "checkout"
  | "payment"
  | "success"
  | "bookings"
  | "marketplace"
  | "notifications"
  | "profile"
  | "edit-profile"
  | "settings"
  | "help"
  | "privacy"

type Venue = PublicVenue
type Slot = PublicSlot

export interface PromoBanner {
  id: string
  title: string
  imageUrl: string
  termsAndConditions: string | null
  linkUrl: string | null
}


const navItems: Array<{ view: View; label: string; icon: LucideIcon }> = [
  { view: "home", label: "Home", icon: Home },
  { view: "explore", label: "Explore", icon: Search },
  { view: "bookings", label: "Bookings", icon: Ticket },
  { view: "marketplace", label: "Pasar", icon: Store },
  { view: "profile", label: "Profile", icon: User },
]

const views: View[] = [
  "onboarding",
  "login",
  "home",
  "explore",
  "venue",
  "checkout",
  "payment",
  "success",
  "bookings",
  "notifications",
  "profile",
  "edit-profile",
  "settings",
  "help",
  "privacy",
]

const quickActions: Array<{ view: View; label: string; icon: LucideIcon; hot?: boolean }> = [
  { view: "explore", label: "Cari Venue", icon: CalendarDays, hot: true },
  { view: "bookings", label: "My Booking", icon: CalendarDays },
  { view: "checkout", label: "Order", icon: Wallet },
]

function formatRp(value: number) {
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  })
    .format(value)
    .replace("IDR", "Rp")
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ")
}

async function readApiData<T>(response: Response): Promise<T> {
  const payload = (await response.json().catch(() => null)) as {
    data?: T
    error?: { message?: string }
  } | null

  if (!response.ok) {
    throw new Error(payload?.error?.message ?? "Request gagal diproses.")
  }
  if (!payload || !("data" in payload)) {
    throw new Error("Format response server tidak valid.")
  }
  return payload.data as T
}


function formatSlotWindow(slot?: Slot) {
  if (!slot) return "Pilih slot"
  return `${slot.startTime} - ${slot.endTime}`
}

function formatSlotDate(slot?: Slot) {
  if (!slot) return "Tanggal belum dipilih"
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(new Date(`${slot.slotDate}T00:00:00`))
}

function formatStoredDate(date: string) {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "short",
    day: "2-digit",
    month: "short",
  }).format(new Date(`${date}T00:00:00`))
}

function formatBookingWindow(booking: CustomerBooking) {
  return `${booking.item.startTime} - ${booking.item.endTime}`
}

function formatCompactNumber(value: number) {
  if (value >= 1000) return `${(value / 1000).toFixed(value % 1000 === 0 ? 0 : 1)}k`
  return `${value}`
}

function formatNotificationTime(value: string) {
  const timestamp = new Date(value).getTime()
  if (Number.isNaN(timestamp)) return "Now"
  const minutes = Math.max(0, Math.round((Date.now() - timestamp) / 60_000))
  if (minutes < 1) return "Now"
  if (minutes < 60) return `${minutes}M AGO`
  const hours = Math.round(minutes / 60)
  if (hours < 24) return `${hours}H AGO`
  return `${Math.round(hours / 24)}D AGO`
}

function paymentMethodToApi(label: string): CustomerPaymentMethod {
  if (label.toLowerCase().includes("virtual")) return "virtual_account"
  if (label.toLowerCase().includes("wallet")) return "wallet"
  if (label.toLowerCase().includes("manual")) return "manual"
  return "qris"
}

function paymentMethodLabel(method: CustomerPaymentMethod) {
  if (method === "virtual_account") return "Virtual Account"
  if (method === "wallet") return "Wallet"
  if (method === "manual") return "Manual"
  return "QRIS / OVO"
}

function bookingStatusLabel(status: CustomerBooking["status"]) {
  const labels: Record<CustomerBooking["status"], string> = {
    pending_payment: "Pending payment",
    confirmed: "Confirmed",
    checked_in: "Checked in",
    completed: "Completed",
    cancelled: "Cancelled",
    refunded: "Refunded",
  }
  return labels[status]
}

function isUpcomingBooking(booking: CustomerBooking) {
  return ["pending_payment", "confirmed", "checked_in"].includes(booking.status)
}

type ProfileUpdatePayload = {
  name?: string
  fullName?: string
  phone?: string
  city?: string
  avatarUrl?: string
}

function MarketplaceScreen({ onBack }: { onBack?: () => void }) {
  const [data, setData] = useState<{ resells: any[]; auctions: any[] } | null>(null)
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState(false)

  const fetchMarketplace = () => {
    setLoading(true)
    fetch("/api/marketplace")
      .then((res) => res.json())
      .then((d) => {
        setData(d)
        setLoading(false)
      })
      .catch((e) => {
        console.error(e)
        setLoading(false)
      })
  }

  useEffect(() => {
    fetchMarketplace()
  }, [])

  const handleBuyResell = async (resell: any) => {
    if (!confirm(`Yakin ingin membeli tiket ini seharga Rp ${resell.price.toLocaleString("id-ID")}?`)) return
    setActionLoading(true)
    try {
      const res = await fetch(`/api/marketplace/resell/${resell.id}/buy`, {
        method: "POST"
      })
      const result = await res.json()
      if (res.ok) {
        alert("Berhasil membeli tiket! Cek bagian Tiket Saya.")
        fetchMarketplace()
      } else {
        alert(result.error || "Gagal membeli tiket.")
      }
    } catch (e) {
      alert("Terjadi kesalahan jaringan.")
    }
    setActionLoading(false)
  }

  const handleBidAuction = async (auction: any) => {
    const amountStr = prompt(`Masukkan tawaran Anda. Harus lebih besar dari Rp ${auction.currentHighestBid.toLocaleString("id-ID")}:`)
    if (!amountStr) return
    const amount = parseInt(amountStr.replace(/\D/g, ""), 10)
    
    if (isNaN(amount) || amount <= auction.currentHighestBid) {
      alert(`Tawaran harus lebih besar dari Rp ${auction.currentHighestBid.toLocaleString("id-ID")}`)
      return
    }

    setActionLoading(true)
    try {
      const res = await fetch(`/api/marketplace/auction/${auction.id}/bid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount })
      })
      const result = await res.json()
      if (res.ok) {
        alert("Berhasil menawar tiket!")
        fetchMarketplace()
      } else {
        alert(result.error || "Gagal menawar tiket.")
      }
    } catch (e) {
      alert("Terjadi kesalahan jaringan.")
    }
    setActionLoading(false)
  }

  return (
    <>
      <MobileTopBar title="Marketplace" brand={false} onBell={onBack} />
      <div className="px-5 py-6 lg:px-0">
        <div className="lg:max-w-4xl lg:mx-auto">
          <div className="mb-8">
            <h1 className="text-3xl font-bold text-gray-900 flex items-center gap-2">
              <Store className="h-8 w-8 text-emerald-600" />
              Pasar Tiket
            </h1>
            <p className="mt-2 text-gray-600">Temukan tiket resell atau lelang dari pengguna lain dengan harga terbaik.</p>
          </div>

          <div className="mb-10">
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
              <Tag className="h-5 w-5 text-emerald-500" />
              Tiket Resell (Jual Langsung)
            </h2>
            {loading ? (
              <p className="text-gray-500">Memuat data...</p>
            ) : data?.resells && data.resells.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {data.resells.map((r: any) => (
                  <div key={r.id} className="p-4 border rounded-xl bg-white shadow-sm flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-900">Booking: {r.bookingId}</p>
                      <p className="text-emerald-600 font-bold">Rp {r.price.toLocaleString("id-ID")}</p>
                    </div>
                    <button 
                      onClick={() => handleBuyResell(r)}
                      disabled={actionLoading}
                      className="bg-emerald-600 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-emerald-700 disabled:opacity-50"
                    >
                      Beli
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 bg-gray-50 p-6 rounded-xl border border-dashed border-gray-200 text-center">Belum ada tiket resell yang tersedia.</p>
            )}
          </div>

          <div>
            <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2 mb-4">
              <Gavel className="h-5 w-5 text-amber-500" />
              Lelang Tiket
            </h2>
            {loading ? (
              <p className="text-gray-500">Memuat data...</p>
            ) : data?.auctions && data.auctions.length > 0 ? (
              <div className="grid gap-4 sm:grid-cols-2">
                {data.auctions.map((a: any) => (
                  <div key={a.id} className="p-4 border rounded-xl bg-white shadow-sm flex justify-between items-center">
                    <div>
                      <p className="font-semibold text-gray-900">Booking: {a.bookingId}</p>
                      <p className="text-amber-600 font-bold">Mulai: Rp {a.startPrice.toLocaleString("id-ID")}</p>
                    </div>
                    <button 
                      onClick={() => handleBidAuction(a)}
                      disabled={actionLoading}
                      className="bg-amber-500 text-white px-4 py-2 rounded-lg text-sm font-semibold hover:bg-amber-600 disabled:opacity-50"
                    >
                      Ikut Lelang
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-gray-500 bg-gray-50 p-6 rounded-xl border border-dashed border-gray-200 text-center">Belum ada tiket yang sedang dilelang.</p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}

export function SportcationWebApp({ 
  initialCatalog, 
  initialBanners = [] 
}: { 
  initialCatalog: PublicCatalogPayload
  initialBanners?: PromoBanner[]
}) {
  const [view, setView] = useState<View>("home")
  const [catalog, setCatalog] = useState(initialCatalog)
  const [banners, setBanners] = useState<PromoBanner[]>(initialBanners)
  const [catalogStatus, setCatalogStatus] = useState<"idle" | "loading" | "error">("idle")
  const [catalogError, setCatalogError] = useState("")
  const [selectedVenueId, setSelectedVenueId] = useState(initialCatalog.venues[0]?.id ?? "")
  const [category, setCategory] = useState("All Venues")
  const [query, setQuery] = useState("")
  const [selectedSlotId, setSelectedSlotId] = useState(initialCatalog.venues[0]?.slots[0]?.id ?? "")
  const [activeBooking, setActiveBooking] = useState<CustomerBooking | null>(null)
  const [bookingMutationStatus, setBookingMutationStatus] = useState<"idle" | "loading">("idle")
  const [bookingMutationError, setBookingMutationError] = useState("")
  const [paymentMutationStatus, setPaymentMutationStatus] = useState<"idle" | "loading">("idle")
  const [paymentMutationError, setPaymentMutationError] = useState("")
  const [customerBookings, setCustomerBookings] = useState<CustomerBooking[]>([])
  const [customerBookingsStatus, setCustomerBookingsStatus] = useState<"idle" | "loading" | "error" | "unauthenticated">("idle")
  const [customerBookingsError, setCustomerBookingsError] = useState("")
  const [bookingActionId, setBookingActionId] = useState("")
  const [bookingActionError, setBookingActionError] = useState("")
  const [customerProfile, setCustomerProfile] = useState<CustomerProfile | null>(null)
  const [customerProfileStatus, setCustomerProfileStatus] = useState<"idle" | "loading" | "error" | "unauthenticated">("idle")
  const [customerProfileError, setCustomerProfileError] = useState("")
  const [profileMutationStatus, setProfileMutationStatus] = useState<"idle" | "loading">("idle")
  const [profileMutationError, setProfileMutationError] = useState("")
  const [customerNotifications, setCustomerNotifications] = useState<CustomerNotification[]>([])
  const [customerNotificationsStatus, setCustomerNotificationsStatus] = useState<"idle" | "loading" | "error" | "unauthenticated">("idle")
  const [customerNotificationsError, setCustomerNotificationsError] = useState("")
  const [notificationActionStatus, setNotificationActionStatus] = useState<"idle" | "loading">("idle")
  const [paymentMethod, setPaymentMethod] = useState("QRIS / OVO")
  const [darkMode, setDarkMode] = useState(false)
  const [pushEnabled, setPushEnabled] = useState(true)
  const [biometricEnabled, setBiometricEnabled] = useState(true)
  const [showOnboarding, setShowOnboarding] = useState(false)

  useEffect(() => {
    const hasSeen = localStorage.getItem("sportcation_onboarding")
    if (!hasSeen) {
      setShowOnboarding(true)
    }
  }, [])

  const categories = useMemo(() => ["All Venues", ...catalog.categories.map((item) => item.name)], [catalog.categories])
  const selectedCategorySlug = useMemo(() => {
    if (category === "All Venues") return ""
    return catalog.categories.find((item) => item.name === category)?.slug ?? ""
  }, [catalog.categories, category])
  const selectedVenue = catalog.venues.find((venue) => venue.id === selectedVenueId) ?? catalog.venues[0]
  const selectedSlot = selectedVenue?.slots.find((slot) => slot.id === selectedSlotId) ?? selectedVenue?.slots[0]

  const loadCustomerProfile = useCallback(async (signal?: AbortSignal) => {
    setCustomerProfileStatus("loading")
    setCustomerProfileError("")

    try {
      const response = await fetch("/api/profile", {
        signal,
        headers: {
          Accept: "application/json",
        },
      })
      if (response.status === 401) {
        setCustomerProfile(null)
        setCustomerProfileStatus("unauthenticated")
        return
      }

      const profile = await readApiData<CustomerProfile>(response)
      setCustomerProfile(profile)
      setCustomerProfileStatus("idle")
    } catch (error) {
      if (signal?.aborted) return
      setCustomerProfileStatus("error")
      setCustomerProfileError(error instanceof Error ? error.message : "Profil tidak dapat dimuat.")
    }
  }, [])

  const loadCustomerNotifications = useCallback(async (signal?: AbortSignal) => {
    setCustomerNotificationsStatus("loading")
    setCustomerNotificationsError("")

    try {
      const response = await fetch("/api/notifications", {
        signal,
        headers: {
          Accept: "application/json",
        },
      })
      if (response.status === 401) {
        setCustomerNotifications([])
        setCustomerNotificationsStatus("unauthenticated")
        return
      }

      const notifications = await readApiData<CustomerNotification[]>(response)
      setCustomerNotifications(notifications)
      setCustomerNotificationsStatus("idle")
    } catch (error) {
      if (signal?.aborted) return
      setCustomerNotificationsStatus("error")
      setCustomerNotificationsError(error instanceof Error ? error.message : "Notifikasi tidak dapat dimuat.")
    }
  }, [])

  const loadCustomerBookings = useCallback(async (signal?: AbortSignal) => {
    setCustomerBookingsStatus("loading")
    setCustomerBookingsError("")

    try {
      const expirationResponse = await fetch("/api/bookings/expire-pending", {
        method: "POST",
        signal,
        headers: {
          Accept: "application/json",
        },
      })
      if (expirationResponse.status === 401) {
        setCustomerBookings([])
        setCustomerBookingsStatus("unauthenticated")
        return
      }
      if (!expirationResponse.ok) {
        await readApiData(expirationResponse)
      }

      const response = await fetch("/api/bookings", {
        signal,
        headers: {
          Accept: "application/json",
        },
      })
      if (response.status === 401) {
        setCustomerBookings([])
        setCustomerBookingsStatus("unauthenticated")
        return
      }
      const nextBookings = await readApiData<CustomerBooking[]>(response)
      setCustomerBookings(nextBookings)
      setCustomerBookingsStatus("idle")
    } catch (error) {
      if (signal?.aborted) return
      setCustomerBookingsStatus("error")
      setCustomerBookingsError(error instanceof Error ? error.message : "Booking tidak dapat dimuat.")
    }
  }, [])

  useEffect(() => {
    const screen = new URLSearchParams(window.location.search).get("screen")
    const hasOnboarded = typeof window !== "undefined" && localStorage.getItem("sportcation_onboarded") === "true"

    if (screen && views.includes(screen as View)) {
      const frame = window.requestAnimationFrame(() => setView(screen as View))
      return () => window.cancelAnimationFrame(frame)
    } else if (!hasOnboarded) {
      setView("onboarding")
    }
  }, [])

  useEffect(() => {
    const controller = new AbortController()
    const timeout = window.setTimeout(async () => {
      setCatalogStatus("loading")
      setCatalogError("")

      try {
        const params = new URLSearchParams({
          pageSize: "12",
        })
        const trimmedQuery = query.trim()
        if (trimmedQuery) params.set("q", trimmedQuery)
        if (selectedCategorySlug) params.set("category", selectedCategorySlug)

        const response = await fetch(`/api/public/catalog?${params.toString()}`, {
          signal: controller.signal,
        })
        if (!response.ok) throw new Error("Catalog request failed")
        const nextCatalog = (await response.json()) as PublicCatalogPayload
        setCatalog(nextCatalog)
        setSelectedVenueId((current) => nextCatalog.venues.some((venue) => venue.id === current) ? current : nextCatalog.venues[0]?.id ?? "")
        setCatalogStatus("idle")
      } catch (error) {
        if (controller.signal.aborted) return
        setCatalogStatus("error")
        setCatalogError(error instanceof Error ? error.message : "Catalog request failed")
      }
    }, 220)

    return () => {
      controller.abort()
      window.clearTimeout(timeout)
    }
  }, [query, selectedCategorySlug])

  useEffect(() => {
    if (view !== "bookings") return

    const controller = new AbortController()
    const timeout = window.setTimeout(() => {
      void loadCustomerBookings(controller.signal)
    }, 0)

    return () => {
      window.clearTimeout(timeout)
      controller.abort()
    }
  }, [loadCustomerBookings, view])

  useEffect(() => {
    if (!["profile", "edit-profile", "settings"].includes(view)) return

    const controller = new AbortController()
    const timeout = window.setTimeout(() => {
      void loadCustomerProfile(controller.signal)
    }, 0)

    return () => {
      window.clearTimeout(timeout)
      controller.abort()
    }
  }, [loadCustomerProfile, view])

  useEffect(() => {
    if (view !== "notifications") return

    const controller = new AbortController()
    const timeout = window.setTimeout(() => {
      void loadCustomerNotifications(controller.signal)
    }, 0)

    return () => {
      window.clearTimeout(timeout)
      controller.abort()
    }
  }, [loadCustomerNotifications, view])

  function go(next: View) {
    setView(next)
    if (typeof window !== "undefined") {
      const url = new URL(window.location.href)
      if (next === "onboarding") {
        url.searchParams.delete("screen")
      } else {
        url.searchParams.set("screen", next)
      }
      window.history.replaceState(null, "", url)
      window.scrollTo({ top: 0, behavior: "smooth" })
    }
  }

  function openVenue(id: string) {
    setSelectedVenueId(id)
    const venue = catalog.venues.find((item) => item.id === id)
    setSelectedSlotId(venue?.slots[0]?.id ?? "")
    setBookingMutationError("")
    setPaymentMutationError("")
    go("venue")
  }

  function redirectToLogin(returnView: View) {
    const url = new URL(window.location.href)
    url.searchParams.set("screen", returnView)
    window.location.assign(`/login?next=${encodeURIComponent(`${url.pathname}${url.search}`)}`)
  }

  function removeSlotFromCatalog(slotId: string) {
    setCatalog((current) => ({
      ...current,
      venues: current.venues.map((venue) => ({
        ...venue,
        slots: venue.slots.filter((slot) => slot.id !== slotId),
      })),
    }))
    setSelectedSlotId((current) => (current === slotId ? "" : current))
  }

  async function startBookingPayment() {
    if (!selectedSlot) {
      setBookingMutationError("Pilih slot tersedia sebelum checkout.")
      return
    }

    setBookingMutationStatus("loading")
    setBookingMutationError("")
    setPaymentMutationError("")

    try {
      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          slotId: selectedSlot.id,
          paymentMethod: paymentMethodToApi(paymentMethod),
        }),
      })
      if (response.status === 401) {
        setBookingMutationStatus("idle")
        redirectToLogin("checkout")
        return
      }

      const booking = await readApiData<CustomerBooking>(response)
      setActiveBooking(booking)
      removeSlotFromCatalog(booking.item.slotId)
      setBookingMutationStatus("idle")
      go("payment")
    } catch (error) {
      setBookingMutationStatus("idle")
      setBookingMutationError(error instanceof Error ? error.message : "Booking gagal dibuat.")
    }
  }

  async function checkPaymentResult() {
    if (!activeBooking) {
      setPaymentMutationError("Booking belum dibuat. Kembali ke checkout dan coba lagi.")
      return
    }

    setPaymentMutationStatus("loading")
    setPaymentMutationError("")

    try {
      const response = await fetch(`/api/payments/${activeBooking.id}/check`, {
        method: "GET",
        headers: {
          Accept: "application/json",
        },
      })
      if (response.status === 401) {
        setPaymentMutationStatus("idle")
        redirectToLogin("payment")
        return
      }

      const booking = await readApiData<CustomerBooking>(response)
      setActiveBooking(booking)
      setPaymentMutationStatus("idle")
      await loadCustomerBookings()

      if (booking.payment.status === "paid" || booking.status === "confirmed") {
        go("success")
      } else if (booking.payment.status === "failed" || booking.payment.status === "expired") {
        setPaymentMutationError("Pembayaran gagal atau kadaluwarsa. Slot dilepas kembali dan booking dibatalkan.")
      } else {
        setPaymentMutationError("Pembayaran belum diterima. Silakan cek kembali beberapa saat lagi.")
      }
    } catch (error) {
      setPaymentMutationStatus("idle")
      setPaymentMutationError(error instanceof Error ? error.message : "Gagal mengecek status pembayaran.")
    }
  }

  function openCustomerBooking(booking: CustomerBooking) {
    setActiveBooking(booking)
    if (booking.status === "pending_payment" && booking.payment.status === "pending") {
      go("payment")
      return
    }
    go("success")
  }

  async function cancelCustomerBooking(booking: CustomerBooking) {
    setBookingActionId(booking.id)
    setBookingActionError("")

    try {
      const response = await fetch(`/api/bookings/${booking.id}/cancel`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          reason: "Customer requested cancellation from My Bookings.",
        }),
      })
      if (response.status === 401) {
        redirectToLogin("bookings")
        return
      }

      const cancelledBooking = await readApiData<CustomerBooking>(response)
      setActiveBooking((current) => (current?.id === cancelledBooking.id ? cancelledBooking : current))
      setCustomerBookings((current) =>
        current.map((item) => (item.id === cancelledBooking.id ? cancelledBooking : item)),
      )
      await loadCustomerBookings()
    } catch (error) {
      setBookingActionError(error instanceof Error ? error.message : "Booking gagal dibatalkan.")
    } finally {
      setBookingActionId("")
    }
  }

  async function saveCustomerProfile(input: ProfileUpdatePayload) {
    setProfileMutationStatus("loading")
    setProfileMutationError("")

    try {
      const response = await fetch("/api/profile", {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify(input),
      })
      if (response.status === 401) {
        setProfileMutationStatus("idle")
        redirectToLogin("edit-profile")
        return
      }

      const profile = await readApiData<CustomerProfile>(response)
      setCustomerProfile(profile)
      setProfileMutationStatus("idle")
      go("profile")
    } catch (error) {
      setProfileMutationStatus("idle")
      setProfileMutationError(error instanceof Error ? error.message : "Profil gagal disimpan.")
    }
  }

  async function markAllCustomerNotificationsRead() {
    setNotificationActionStatus("loading")

    try {
      const response = await fetch("/api/notifications/mark-all-read", {
        method: "POST",
        headers: {
          Accept: "application/json",
        },
      })
      if (response.status === 401) {
        setNotificationActionStatus("idle")
        redirectToLogin("notifications")
        return
      }

      const notifications = await readApiData<CustomerNotification[]>(response)
      setCustomerNotifications(notifications)
      setCustomerProfile((current) =>
        current
          ? {
              ...current,
              stats: {
                ...current.stats,
                unreadNotifications: 0,
              },
            }
          : current,
      )
    } catch (error) {
      setCustomerNotificationsStatus("error")
      setCustomerNotificationsError(error instanceof Error ? error.message : "Notifikasi gagal diperbarui.")
    } finally {
      setNotificationActionStatus("idle")
    }
  }

  async function openCustomerNotification(notification: CustomerNotification) {
    setNotificationActionStatus("loading")

    try {
      if (!notification.readAt) {
        const response = await fetch(`/api/notifications/${notification.id}/read`, {
          method: "POST",
          headers: {
            Accept: "application/json",
          },
        })
        if (response.status === 401) {
          setNotificationActionStatus("idle")
          redirectToLogin("notifications")
          return
        }

        const updated = await readApiData<CustomerNotification>(response)
        setCustomerNotifications((current) => current.map((item) => (item.id === updated.id ? updated : item)))
        setCustomerProfile((current) =>
          current
            ? {
                ...current,
                stats: {
                  ...current.stats,
                  unreadNotifications: Math.max(0, current.stats.unreadNotifications - 1),
                },
              }
            : current,
        )
      }

      if (notification.actionUrl) {
        const target = new URL(notification.actionUrl, window.location.origin).searchParams.get("screen")
        if (views.includes(target as View)) {
          go(target as View)
        }
      }
    } catch (error) {
      setCustomerNotificationsStatus("error")
      setCustomerNotificationsError(error instanceof Error ? error.message : "Notifikasi gagal dibuka.")
    } finally {
      setNotificationActionStatus("idle")
    }
  }

  const shouldShowBottomNav = ["home", "explore", "bookings", "notifications", "profile", "settings", "help"].includes(view)

  return (
    <div className={cx("min-h-screen bg-gray-50 text-gray-900", darkMode && "dark bg-background text-foreground")}>
      <div className="lg:flex">
        <DesktopSidebar active={view} onNavigate={go} />
        <main className="min-h-screen flex-1 lg:pl-[260px]">
          <DesktopTopBar onNavigate={go} />
          <div className="mx-auto min-h-screen w-full max-w-[430px] bg-gray-50 pb-10 lg:max-w-none lg:bg-transparent lg:px-8 lg:pb-12">
            {view === "home" && (
              <HomeScreen
                venues={catalog.venues}
                banners={banners}
                catalogStatus={catalogStatus}
                catalogError={catalogError}
                onNavigate={go}
                onVenue={openVenue}
              />
            )}
            {view === "explore" && (
              <ExploreScreen
                category={category}
                onCategoryChange={setCategory}
                categories={categories}
                query={query}
                onQueryChange={setQuery}
                venues={catalog.venues}
                catalogStatus={catalogStatus}
                catalogError={catalogError}
                onVenue={openVenue}
              />
            )}
            {view === "venue" && selectedVenue && (
              <VenueDetailScreen
                venue={selectedVenue}
                selectedSlot={selectedSlot}
                onSelectSlot={setSelectedSlotId}
                onBack={() => go("explore")}
                onCheckout={() => go("checkout")}
              />
            )}
            {view === "venue" && !selectedVenue && <CatalogEmptyState onExplore={() => go("explore")} />}
            {view === "checkout" && selectedVenue && (
              <CheckoutScreen
                venue={selectedVenue}
                slot={selectedSlot}
                paymentMethod={paymentMethod}
                onPaymentMethod={setPaymentMethod}
                onBack={() => go("venue")}
                onPay={startBookingPayment}
                mutationStatus={bookingMutationStatus}
                mutationError={bookingMutationError}
              />
            )}
            {view === "checkout" && !selectedVenue && <CatalogEmptyState onExplore={() => go("explore")} />}
            {view === "payment" && selectedVenue && (
              <PaymentScreen
                venue={selectedVenue}
                slot={selectedSlot}
                booking={activeBooking}
                mutationStatus={paymentMutationStatus}
                mutationError={paymentMutationError}
                onBack={() => go("checkout")}
                onCheckStatus={() => void checkPaymentResult()}
              />
            )}
            {view === "payment" && !selectedVenue && <CatalogEmptyState onExplore={() => go("explore")} />}
            {view === "success" && selectedVenue && (
              <SuccessScreen booking={activeBooking} venue={selectedVenue} slot={selectedSlot} onTicket={() => go("bookings")} onHome={() => go("home")} />
            )}
            {view === "success" && !selectedVenue && <CatalogEmptyState onExplore={() => go("explore")} />}
            {view === "marketplace" && (
              <MarketplaceScreen onBack={() => go("home")} />
            )}
            {view === "bookings" && (
              <BookingsScreen
                bookings={customerBookings}
                status={customerBookingsStatus}
                error={customerBookingsError}
                onNavigate={go}
                onRefresh={() => void loadCustomerBookings()}
                onLogin={() => redirectToLogin("bookings")}
                onOpenBooking={openCustomerBooking}
                onCancelBooking={(booking) => void cancelCustomerBooking(booking)}
                actionBookingId={bookingActionId}
                actionError={bookingActionError}
              />
            )}
            {view === "notifications" && (
              <NotificationsScreen
                notifications={customerNotifications}
                status={customerNotificationsStatus}
                error={customerNotificationsError}
                actionStatus={notificationActionStatus}
                onBack={() => go("profile")}
                onLogin={() => redirectToLogin("notifications")}
                onRefresh={() => void loadCustomerNotifications()}
                onMarkAll={() => void markAllCustomerNotificationsRead()}
                onOpen={(notification) => void openCustomerNotification(notification)}
              />
            )}
            {view === "profile" && (
              <ProfileScreen
                profile={customerProfile}
                status={customerProfileStatus}
                error={customerProfileError}
                onNavigate={go}
                onRefresh={() => void loadCustomerProfile()}
                onLogin={() => redirectToLogin("profile")}
              />
            )}
            {view === "edit-profile" && (
              <EditProfileScreen
                key={customerProfile?.id ?? customerProfileStatus}
                profile={customerProfile}
                status={customerProfileStatus}
                error={customerProfileError}
                mutationStatus={profileMutationStatus}
                mutationError={profileMutationError}
                onBack={() => go("profile")}
                onLogin={() => redirectToLogin("edit-profile")}
                onSave={(input) => void saveCustomerProfile(input)}
              />
            )}
            {view === "settings" && (
              <SettingsScreen
                onNavigate={go}
                profile={customerProfile}
                darkMode={darkMode}
                onDarkMode={setDarkMode}
                pushEnabled={pushEnabled}
                onPushEnabled={setPushEnabled}
                biometricEnabled={biometricEnabled}
                onBiometricEnabled={setBiometricEnabled}
              />
            )}
            {view === "help" && <HelpScreen onBack={() => go("profile")} />}
            {view === "privacy" && <PrivacyScreen onBack={() => go("settings")} />}
          </div>
          {shouldShowBottomNav && <BottomNav active={view} onNavigate={go} />}
        </main>
      </div>
    </div>
  )
}

function PromoBannerCarousel({ banners }: { banners: PromoBanner[] }) {
  const [currentIndex, setCurrentIndex] = useState(0)

  useEffect(() => {
    if (banners.length <= 1) return
    const timer = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length)
    }, 5000)
    return () => clearInterval(timer)
  }, [banners.length])

  if (!banners || banners.length === 0) return null

  return (
    <div className="relative mt-6 overflow-hidden rounded-xl bg-gray-100 pb-[45%] lg:pb-[25%] shadow-sm">
      {banners.map((banner, index) => (
        <a
          key={banner.id}
          href={banner.linkUrl || "#"}
          target={banner.linkUrl ? "_blank" : undefined}
          className={cx(
            "absolute inset-0 transition-opacity duration-500",
            index === currentIndex ? "opacity-100 z-10" : "opacity-0 z-0"
          )}
        >
          <img src={banner.imageUrl} alt={banner.title} className="h-full w-full object-cover" />
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
          <div className="absolute bottom-4 left-4 right-4 text-white">
            <h3 className="font-bold text-lg leading-tight">{banner.title}</h3>
            {banner.termsAndConditions && (
              <p className="text-xs opacity-80 mt-1 line-clamp-1">{banner.termsAndConditions}</p>
            )}
          </div>
        </a>
      ))}
      {banners.length > 1 && (
        <div className="absolute bottom-4 right-4 z-20 flex gap-1.5">
          {banners.map((_, index) => (
            <button
              key={index}
              onClick={(e) => {
                e.preventDefault()
                setCurrentIndex(index)
              }}
              className={cx(
                "h-1.5 rounded-full transition-all",
                index === currentIndex ? "w-4 bg-white" : "w-1.5 bg-white/50 hover:bg-white/70"
              )}
            />
          ))}
        </div>
      )}
    </div>
  )
}

function Brand({ compact = false, inverse = false }: { compact?: boolean; inverse?: boolean }) {
  return (
    <div
      className={cx(
        "flex items-center gap-2",
        inverse ? "text-white" : "text-gray-900",
      )}
    >
      <img src="/logo.png" alt="Sportcation" className={cx("w-auto", compact ? "h-6" : "h-8")} />
    </div>
  )
}

function Avatar({
  size = "md",
  src = "/placeholder-user.jpg",
  alt = "Sportcation user avatar",
}: {
  size?: "sm" | "md" | "lg"
  src?: string | null
  alt?: string
}) {
  return (
    <div
      className={cx(
        "grid shrink-0 place-items-center overflow-hidden rounded-full border-2 border-[#46e2bd] bg-[#f4d5bd]",
        size === "sm" && "h-9 w-9",
        size === "md" && "h-11 w-11",
        size === "lg" && "h-28 w-28 border-4",
      )}
    >
      <img src={src || "/placeholder-user.jpg"} alt={alt} className="h-full w-full object-cover" />
    </div>
  )
}

function AppButton({
  children,
  onClick,
  variant = "primary",
  className,
  disabled,
}: {
  children: React.ReactNode
  onClick?: () => void
  variant?: "primary" | "dark" | "ghost" | "light"
  className?: string
  disabled?: boolean
}) {
  return (
    <button
      type="button"
      disabled={disabled}
      onClick={onClick}
      className={cx(
        "inline-flex h-11 items-center justify-center gap-2 rounded-lg px-5 text-sm font-semibold transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-emerald-600 text-white hover:bg-emerald-700",
        variant === "dark" && "bg-gray-800 text-white hover:bg-gray-900",
        variant === "ghost" && "bg-transparent text-emerald-600 hover:bg-emerald-50",
        variant === "light" && "bg-white text-gray-800 shadow-sm hover:bg-gray-50",
        className,
      )}
    >
      {children}
    </button>
  )
}

function MobileTopBar({
  title,
  back,
  onBack,
  onBell,
  brand = true,
}: {
  title?: string
  back?: boolean
  onBack?: () => void
  onBell?: () => void
  brand?: boolean
}) {
  return (
    <header className="sticky top-0 z-30 flex h-14 items-center justify-between border-b border-gray-200 bg-white/95 px-4 backdrop-blur lg:hidden">
      <div className="flex min-w-0 items-center gap-2.5">
        {back ? (
          <button type="button" onClick={onBack} className="grid h-8 w-8 place-items-center rounded-lg text-gray-700 hover:bg-gray-100">
            <ArrowLeft className="h-4 w-4" />
          </button>
        ) : (
          <MapPin className="h-4 w-4 text-emerald-600" />
        )}
        {title ? (
          <span className="truncate text-sm font-semibold text-gray-900">{title}</span>
        ) : brand ? (
          <img src="/logo.png" alt="Sportcation" className="h-6 w-auto" />
        ) : (
          <span className="truncate text-sm font-semibold text-gray-900">Jakarta</span>
        )}
      </div>
      <div className="flex items-center gap-2">
        {onBell && (
          <button type="button" onClick={onBell} className="grid h-8 w-8 place-items-center rounded-lg text-gray-500 hover:bg-gray-100">
            <Bell className="h-4 w-4" />
          </button>
        )}
        <a href="/login" className="rounded-lg bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700">Masuk</a>
      </div>
    </header>
  )
}

function DesktopTopBar({ onNavigate }: { onNavigate: (view: View) => void }) {
  return (
    <header className="sticky top-0 z-20 hidden h-16 items-center justify-between border-b border-gray-200 bg-white/95 px-8 backdrop-blur lg:flex">
      <div>
        <h1 className="text-base font-semibold text-gray-900">Booking Venue Olahraga</h1>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onNavigate("explore")}
          className="flex h-10 w-[280px] items-center gap-2.5 rounded-lg border border-gray-200 bg-white px-4 text-sm text-gray-400"
        >
          <Search className="h-4 w-4" />
          Cari venue, olahraga, area...
        </button>
        <button type="button" onClick={() => onNavigate("notifications")} className="grid h-10 w-10 place-items-center rounded-lg border border-gray-200 bg-white">
          <Bell className="h-4 w-4 text-gray-500" />
        </button>
        <a href="/login" className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700">Masuk</a>
      </div>
    </header>
  )
}

function DesktopSidebar({ active, onNavigate }: { active: View; onNavigate: (view: View) => void }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[260px] border-r border-gray-200 bg-white p-5 lg:block">
      <button type="button" onClick={() => onNavigate("home")} className="mb-8">
        <Brand compact />
      </button>
      <nav className="space-y-1">
        {navItems.map((item) => {
          const Icon = item.icon
          const selected = active === item.view
          return (
            <button
              key={item.view}
              type="button"
              onClick={() => onNavigate(item.view)}
              className={cx(
                "flex h-10 w-full items-center gap-2.5 rounded-lg px-3 text-sm font-medium transition",
                selected ? "bg-emerald-50 text-emerald-700" : "text-gray-500 hover:bg-gray-50 hover:text-gray-900",
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          )
        })}
      </nav>

      <div className="mt-4 grid gap-2">
        <a href="/merchant" className="rounded-lg bg-emerald-50 px-3 py-2.5 text-sm font-medium text-emerald-700 hover:bg-emerald-100">
          Panel Merchant
        </a>
        <a href="/admin" className="rounded-lg bg-gray-100 px-3 py-2.5 text-sm font-medium text-gray-600 hover:bg-gray-200">
          Panel Admin
        </a>
      </div>
    </aside>
  )
}

function BottomNav({ active, onNavigate }: { active: View; onNavigate: (view: View) => void }) {
  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 mx-auto flex h-16 w-full items-center justify-around border-t border-gray-200 bg-white px-2 lg:hidden">
      {navItems.map((item) => {
        const Icon = item.icon
        const selected = active === item.view || (item.view === "profile" && ["settings", "notifications", "help", "privacy"].includes(active))
        return (
          <button
            key={item.view}
            type="button"
            onClick={() => onNavigate(item.view)}
            className={cx("flex min-w-0 flex-col items-center gap-0.5 rounded-lg px-3 py-1.5 text-[10px] font-medium", selected ? "text-emerald-600" : "text-gray-400")}
            aria-current={selected ? "page" : undefined}
          >
            <Icon className="h-5 w-5" />
            <span>{item.label}</span>
          </button>
        )
      })}
    </nav>
  )
}

function OnboardingScreen({ onFinish }: { onFinish: () => void }) {
  const [currentSlide, setCurrentSlide] = useState(0)

  const slides = [
    {
      title: "Cari Lapangan Sporty",
      description: "Temukan ratusan lapangan olahraga terbaik di sekitarmu dengan mudah dan cepat.",
      color: "bg-[#48e3b6]"
    },
    {
      title: "Ajak Teman Main",
      description: "Buat jadwal, booking bareng, dan bayar patungan tanpa ribet.",
      color: "bg-[#ffc532]"
    },
    {
      title: "Jual Beli & Lelang",
      description: "Batal main? Jual kembali atau lelang jadwalmu ke player lain di komunitas.",
      color: "bg-[#ff6b6b]"
    }
  ]

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#f3f6f6] p-6">
      <div className={`absolute -right-24 top-8 h-72 w-72 rounded-full blur-3xl transition-colors duration-500 ${slides[currentSlide].color}`} />
      <div className="absolute -left-24 bottom-20 h-72 w-72 rounded-full bg-[#f3f6f6] blur-3xl mix-blend-overlay" />
      <section className="relative w-full max-w-[560px] flex flex-col items-center text-center">
        <div className="mb-12 h-64 w-full rounded-[34px] bg-white/50 backdrop-blur-sm shadow-xl flex items-center justify-center border border-white/20">
           {/* Placeholder for illustration */}
           <div className={`h-32 w-32 rounded-full opacity-80 ${slides[currentSlide].color}`} />
        </div>
        
        <h1 className="mb-4 text-3xl font-black tracking-tight text-[#0f2923] md:text-4xl">
          {slides[currentSlide].title}
        </h1>
        <p className="mb-10 text-lg text-[#617a74]">
          {slides[currentSlide].description}
        </p>

        <div className="flex gap-2 mb-10">
          {slides.map((_, idx) => (
            <div key={idx} className={`h-2 rounded-full transition-all duration-300 ${currentSlide === idx ? "w-8 bg-[#007c61]" : "w-2 bg-[#d1dada]"}`} />
          ))}
        </div>

        <div className="w-full flex gap-4">
          <AppButton 
            variant="ghost" 
            className="flex-1 border-[#007c61] text-[#007c61]" 
            onClick={onFinish}
          >
            Lewati
          </AppButton>
          <AppButton 
            className="flex-1" 
            onClick={() => {
              if (currentSlide < slides.length - 1) {
                setCurrentSlide(prev => prev + 1)
              } else {
                onFinish()
              }
            }}
          >
            {currentSlide < slides.length - 1 ? "Lanjut" : "Mulai Sekarang"}
          </AppButton>
        </div>
      </section>
    </main>
  )
}

import { authClient } from "@/lib/auth-client"

function LoginScreen({ onBack, onSubmit }: { onBack: () => void; onSubmit: () => void }) {
  const [isLoadingGoogle, setIsLoadingGoogle] = useState(false)

  const handleGoogleLogin = async () => {
    setIsLoadingGoogle(true)
    try {
      await authClient.signIn.social({
        provider: "google",
        callbackURL: "/",
      })
    } catch (error) {
      console.error(error)
      setIsLoadingGoogle(false)
    }
  }

  return (
    <main className="relative grid min-h-screen place-items-center overflow-hidden bg-[#f3f6f6] p-6">
      <div className="absolute -right-24 top-8 h-72 w-72 rounded-full bg-[#48e3b6] blur-3xl" />
      <div className="absolute -left-24 bottom-20 h-72 w-72 rounded-full bg-[#ffc532] blur-3xl" />
      <section className="relative w-full max-w-[560px] rounded-[34px] bg-[#f7fafa]/90 p-8 shadow-[0_30px_90px_rgb(0_0_0/0.08)] lg:p-12">
        <button type="button" onClick={onBack} className="mb-8 flex items-center gap-2 text-sm font-black text-[#007c61]">
          <ArrowLeft className="h-4 w-4" />
          Back
        </button>
        <div className="mb-14">
          <Brand compact />
        </div>
        <h1 className="text-4xl font-black leading-[1.05] tracking-[-0.06em] lg:text-5xl">
          Unlock Your <span className="text-[#007c61]">Next Adventure</span>
        </h1>
        <p className="mt-5 text-lg leading-relaxed text-[#687073]">Enter your credentials to access the world of high-performance sports travel.</p>
        <label className="mt-10 block text-xs font-black uppercase tracking-[0.22em] text-[#63696d]">Email / No HP</label>
        <input className="mt-3 h-16 w-full rounded-2xl border-0 bg-[#edf1f1] px-5 text-base font-semibold outline-none ring-[#49e7ba] placeholder:text-[#a8adb0] focus:ring-2" placeholder="Enter your email or phone" />
        <AppButton onClick={onSubmit} className="mt-6 w-full">
          Kirim OTP
          <ChevronRight className="h-5 w-5" />
        </AppButton>
        <div className="my-10 flex items-center gap-4">
          <span className="h-px flex-1 bg-[#dfe5e5]" />
          <span className="text-xs font-black uppercase tracking-[0.18em] text-[#a1a7aa]">Or continue with</span>
          <span className="h-px flex-1 bg-[#dfe5e5]" />
        </div>
        <div className="grid grid-cols-2 gap-4">
          <button 
            type="button" 
            onClick={handleGoogleLogin}
            disabled={isLoadingGoogle}
            className="h-14 rounded-2xl bg-white text-sm font-black shadow-sm disabled:opacity-50"
          >
            {isLoadingGoogle ? "Connecting..." : "Google"}
          </button>
          <button type="button" onClick={onSubmit} className="h-14 rounded-2xl bg-white text-sm font-black shadow-sm">Apple</button>
        </div>
        <p className="mt-10 text-center text-xs text-[#687073]">
          By continuing, you agree to our <button type="button" className="font-black text-[#007c61]">Terms of Service</button> and{" "}
          <button type="button" className="font-black text-[#007c61]">Privacy Policy</button>
        </p>
      </section>
    </main>
  )
}

function HomeScreen({
  venues,
  banners,
  catalogStatus,
  catalogError,
  onNavigate,
  onVenue,
}: {
  venues: Venue[]
  banners?: PromoBanner[]
  catalogStatus: "idle" | "loading" | "error"
  catalogError: string
  onNavigate: (view: View) => void
  onVenue: (id: string) => void
}) {
  const recommended = venues[0]

  return (
    <>
      <MobileTopBar title="Jakarta" brand={false} onBell={() => onNavigate("notifications")} />
      <div className="px-5 py-6 lg:px-0">
        <div className="lg:grid lg:grid-cols-[minmax(0,1.1fr)_400px] lg:gap-8">
          <div>
            <button
              type="button"
              onClick={() => onNavigate("explore")}
              className="flex h-11 w-full items-center gap-3 rounded-lg border border-gray-200 bg-white px-4 text-left text-sm text-gray-400 lg:max-w-xl"
            >
              <Search className="h-4 w-4 text-gray-400" />
              Cari venue olahraga...
            </button>

            {banners && banners.length > 0 && <PromoBannerCarousel banners={banners} />}

            <div className="mt-6 grid grid-cols-3 gap-3 lg:grid-cols-6">
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <button
                    key={action.label}
                    type="button"
                    onClick={() => onNavigate(action.view)}
                    className="grid min-h-[88px] place-items-center rounded-xl bg-white p-3 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <span className={cx("grid h-10 w-10 place-items-center rounded-lg", action.hot ? "bg-emerald-50 text-emerald-600" : "bg-gray-100 text-gray-500")}>
                      <Icon className="h-5 w-5" />
                    </span>
                    <span className="mt-2 text-[11px] font-semibold text-gray-600">{action.label}</span>
                  </button>
                )
              })}
            </div>
          </div>

          <aside className="mt-8 lg:mt-0">
            <SectionTitle title="Rekomendasi" subtitle="Pilihan terbaik untuk Anda" />
            {recommended ? (
              <RecommendedCard venue={recommended} onBook={() => onVenue(recommended.id)} />
            ) : (
              <CatalogInlineState title="Belum ada rekomendasi" message="Venue published akan muncul di area ini." />
            )}

          </aside>
        </div>
      </div>
    </>
  )
}

function SectionTitle({ title, subtitle, action, onAction }: { title: string; subtitle?: string; action?: string; onAction?: () => void }) {
  return (
    <div className="mt-8 mb-4 flex items-end justify-between gap-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900 lg:text-2xl">{title}</h2>
        {subtitle && <p className="mt-0.5 text-sm text-gray-500">{subtitle}</p>}
      </div>
      {action && (
        <button type="button" onClick={onAction} className="text-sm font-semibold text-emerald-600 hover:text-emerald-700">
          {action}
        </button>
      )}
    </div>
  )
}

function CatalogInlineState({ title, message }: { title: string; message: string }) {
  return (
    <div className="min-w-[264px] rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center shadow-sm lg:col-span-2 lg:min-w-0">
      <Search className="mx-auto h-7 w-7 text-gray-400" />
      <h3 className="mt-3 text-base font-bold text-gray-900">{title}</h3>
      <p className="mt-1.5 text-sm leading-relaxed text-gray-500">{message}</p>
    </div>
  )
}

function CatalogEmptyState({ onExplore }: { onExplore: () => void }) {
  return (
    <div className="grid min-h-[calc(100vh-80px)] place-items-center px-6 py-12">
      <section className="w-full max-w-md rounded-[30px] bg-white p-8 text-center shadow-sm">
        <Search className="mx-auto h-10 w-10 text-[#9aa0a4]" />
        <h1 className="mt-5 text-2xl font-black">Catalog belum tersedia</h1>
        <p className="mt-3 text-sm font-semibold leading-relaxed text-[#687073]">
          Venue published dari database akan muncul setelah merchant mengaktifkan katalog publik.
        </p>
        <AppButton onClick={onExplore} className="mt-6 w-full">
          Kembali ke Explore
        </AppButton>
      </section>
    </div>
  )
}


function RecommendedCard({ venue, onBook }: { venue: Venue; onBook: () => void }) {
  return (
    <article className="overflow-hidden rounded-2xl bg-white shadow-sm">
      <div className="relative h-60 overflow-hidden">
        <img src={venue.image} alt={venue.name} className="h-full w-full object-cover" />
        <div className="absolute left-5 top-5 flex gap-2">
          <span className="rounded-md bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Trending</span>
          <span className="rounded-md bg-white px-3 py-1 text-xs font-semibold text-gray-800">
            <Star className="mr-0.5 inline h-3 w-3 fill-current text-amber-500" />
            {venue.rating}
          </span>
        </div>
      </div>
      <div className="p-6">
        <h3 className="text-2xl font-bold text-gray-900">{venue.name}</h3>
        <p className="mt-3 text-sm leading-relaxed text-gray-500">{venue.description}</p>
        <div className="mt-5 flex flex-wrap gap-2">
          {venue.facilities.slice(3).map((item) => (
            <span key={item} className="rounded-md border border-gray-200 px-3 py-1 text-xs font-medium text-gray-600">
              {item}
            </span>
          ))}
        </div>
        <AppButton onClick={onBook} className="mt-6 w-full">
          Pesan Sekarang
          <ChevronRight className="h-4 w-4" />
        </AppButton>
      </div>
    </article>
  )
}

function ExploreScreen({
  category,
  onCategoryChange,
  categories,
  query,
  onQueryChange,
  venues: list,
  catalogStatus,
  catalogError,
  onVenue,
}: {
  category: string
  onCategoryChange: (value: string) => void
  categories: string[]
  query: string
  onQueryChange: (value: string) => void
  venues: Venue[]
  catalogStatus: "idle" | "loading" | "error"
  catalogError: string
  onVenue: (id: string) => void
}) {
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null)
  const [isLocating, setIsLocating] = useState(false)

  const handleGetLocation = () => {
    if (!navigator.geolocation) {
      alert("Geolocation is not supported by your browser")
      return
    }
    setIsLocating(true)
    navigator.geolocation.getCurrentPosition(
      (position) => {
        setUserLocation({
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        })
        setIsLocating(false)
      },
      (error) => {
        console.error("Error getting location", error)
        alert("Gagal mendapatkan lokasi. Pastikan izin lokasi diberikan.")
        setIsLocating(false)
      }
    )
  }

  // Haversine formula
  const getDistance = (lat1: number, lon1: number, lat2: number, lon2: number) => {
    const R = 6371 // Radius of the earth in km
    const dLat = (lat2 - lat1) * (Math.PI / 180)
    const dLon = (lon2 - lon1) * (Math.PI / 180)
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
    return R * c // Distance in km
  }

  const sortedList = [...list].sort((a, b) => {
    if (userLocation && a.coordinates && b.coordinates) {
      const distA = getDistance(userLocation.lat, userLocation.lng, a.coordinates.lat, a.coordinates.lng)
      const distB = getDistance(userLocation.lat, userLocation.lng, b.coordinates.lat, b.coordinates.lng)
      return distA - distB
    }
    return 0
  })

  return (
    <>
      <MobileTopBar title="Jakarta" brand={false} />
      <div className="px-5 py-6 lg:px-0">
        <div className="lg:grid lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-8">
          <aside className="lg:sticky lg:top-24 lg:h-fit">
            <p className="text-sm font-semibold text-emerald-600">Jelajahi Venue</p>
            <h1 className="mt-2 text-3xl font-bold leading-snug text-gray-900 lg:text-4xl">Temukan Lapangan Favorit Anda</h1>
            <div className="mt-6 flex flex-col gap-3">
              <div className="flex h-11 items-center gap-2.5 rounded-lg border border-gray-200 bg-white px-4">
                <Search className="h-4 w-4 text-gray-400" />
                <input
                  className="w-full bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-400"
                  placeholder="Cari nama venue, area..."
                  value={query}
                  onChange={(e) => onQueryChange(e.target.value)}
                />
              </div>
              <button
                type="button"
                onClick={handleGetLocation}
                disabled={isLocating}
                className="flex h-11 items-center justify-center gap-2 rounded-lg bg-[#ecfdf5] text-sm font-semibold text-emerald-700 hover:bg-[#d1fae5] disabled:opacity-50"
              >
                <MapPin className="h-4 w-4" />
                {isLocating ? "Mencari Lokasi..." : userLocation ? "Urutkan: Terdekat (GPS)" : "Gunakan Lokasi Saya"}
              </button>
            </div>
            <div className="sportcation-scrollbar mt-5 flex gap-2 overflow-x-auto pb-2 lg:flex-wrap lg:overflow-visible">
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => onCategoryChange(item)}
                  className={cx(
                    "whitespace-nowrap rounded-full px-5 py-2 text-sm font-black transition-all",
                    category === item
                      ? "bg-gradient-to-r from-[#48e3b6] to-[#007c61] text-white shadow-md shadow-[#48e3b6]/30 scale-105"
                      : "bg-white text-[#687073] border border-gray-200 hover:bg-gray-50",
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
          </aside>
          <section className="mt-6 grid gap-5 lg:mt-0 lg:grid-cols-2">
            {catalogStatus === "loading" ? (
              <CatalogInlineState title="Memuat katalog" message="Mencari venue sesuai filter..." />
            ) : catalogStatus === "error" ? (
              <CatalogInlineState title="Terjadi kesalahan" message={catalogError || "Katalog tidak dapat dimuat."} />
            ) : sortedList.length === 0 ? (
              <div className="rounded-xl border border-dashed border-gray-200 bg-white p-8 text-center lg:col-span-2">
                <Search className="mx-auto h-7 w-7 text-gray-400" />
                <h2 className="mt-3 text-lg font-bold">Venue tidak ditemukan</h2>
                <p className="mt-1.5 text-sm text-gray-500">Coba kata kunci lain atau periksa lokasi Anda.</p>
              </div>
            ) : (
              sortedList.map((venue, index) => {
                let distanceText = venue.distance
                if (userLocation && venue.coordinates) {
                  const dist = getDistance(
                    userLocation.lat,
                    userLocation.lng,
                    venue.coordinates.lat,
                    venue.coordinates.lng
                  )
                  distanceText = dist < 1 ? `${(dist * 1000).toFixed(0)}m` : `${dist.toFixed(1)}km`
                }
                return (
                  <div key={venue.id} className="relative">
                    <VenueListCard venue={venue} featured={index === 0} onClick={() => onVenue(venue.id)} />
                    {distanceText && (
                      <div className="absolute left-4 top-4 rounded-full bg-black/60 px-2 py-1 text-xs font-medium text-white backdrop-blur-md">
                        {distanceText}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </section>
        </div>
      </div>
    </>
  )
}

function VenueListCard({ venue, featured, onClick }: { venue: Venue; featured?: boolean; onClick: () => void }) {
  if (featured) {
    return (
      <button type="button" onClick={onClick} className="relative min-h-[200px] overflow-hidden rounded-2xl bg-gray-900 p-6 text-left text-white shadow-sm lg:col-span-2">
        <img src={venue.image} alt={venue.name} className="absolute inset-0 h-full w-full object-cover opacity-60" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
        <div className="relative flex min-h-[160px] flex-col justify-between">
          <div className="flex justify-between">
            <span className="rounded-md bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Featured</span>
            <Heart className="h-5 w-5 text-white/70" />
          </div>
          <div className="grid grid-cols-[1fr_auto] items-end gap-4">
            <div>
              <p className="text-xs font-medium text-emerald-300">{venue.rating} · {venue.category} · {venue.distance}</p>
              <h3 className="mt-1 text-2xl font-bold">{venue.name}</h3>
              <p className="mt-1 text-sm text-white/70">{venue.location}</p>
            </div>
            <p className="text-right text-xl font-bold text-emerald-300">{formatRp(venue.price)}<span className="block text-[10px] text-white/60">per jam</span></p>
          </div>
        </div>
      </button>
    )
  }

  return (
    <article className="overflow-hidden rounded-xl bg-white shadow-sm">
      <button type="button" onClick={onClick} className="block w-full text-left">
        <div className="relative h-56 overflow-hidden">
          <img src={venue.image} alt={venue.name} className="h-full w-full object-cover" />
          <span className="absolute right-3 top-3 grid h-9 w-9 place-items-center rounded-lg bg-white/20 text-white backdrop-blur">
            <Heart className="h-4 w-4" />
          </span>
        </div>
        <div className="p-4">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-bold text-gray-900">{venue.name}</h3>
            <span className="flex items-center gap-0.5 text-xs font-semibold text-amber-700">
              <Star className="h-3.5 w-3.5 fill-current" />
              {venue.rating}
            </span>
          </div>
          <div className="mt-1.5 flex items-center gap-1 text-sm text-gray-500">
            <MapPin className="h-3.5 w-3.5" />
            {venue.coordinates ? (
              <a href={`https://www.google.com/maps/search/?api=1&query=${venue.coordinates.lat},${venue.coordinates.lng}`} target="_blank" rel="noreferrer" className="hover:underline hover:text-emerald-600" onClick={(e) => e.stopPropagation()}>
                {venue.location}
              </a>
            ) : (
              <span>{venue.location}</span>
            )}
          </div>
          <div className="mt-4 flex items-center justify-between border-t border-gray-100 pt-4">
            <p className="text-base font-bold text-emerald-600">{formatRp(venue.price)} <span className="text-xs text-gray-500">/ jam</span></p>
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-gray-100 text-gray-600">
              <ChevronRight className="h-4 w-4" />
            </span>
          </div>
        </div>
      </button>
    </article>
  )
}

function VenueDetailScreen({
  venue,
  selectedSlot,
  onSelectSlot,
  onBack,
  onCheckout,
}: {
  venue: Venue
  selectedSlot?: Slot
  onSelectSlot: (slotId: string) => void
  onBack: () => void
  onCheckout: () => void
}) {
  const selectedDate = selectedSlot?.slotDate ?? venue.slots[0]?.slotDate
  const dates = [...new Set(venue.slots.map((slot) => slot.slotDate))].slice(0, 5)
  const slots = selectedDate ? venue.slots.filter((slot) => slot.slotDate === selectedDate) : venue.slots
  const facilityIcons: Record<string, LucideIcon> = {
    Parking: Car,
    Locker: LockKeyhole,
    Shower: ShowerHead,
  }

  return (
    <div>
      <MobileTopBar back onBack={onBack} />
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_390px] lg:gap-8 lg:pt-8">
        <section>
          <div className="relative h-[400px] overflow-hidden lg:rounded-2xl">
            <img src={venue.image} alt={venue.name} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <div className="absolute bottom-6 left-5 right-5">
              <span className="rounded-md bg-emerald-500 px-3 py-1 text-xs font-bold text-white">{venue.tag}</span>
              <h1 className="mt-4 max-w-[560px] text-3xl font-bold leading-tight text-white lg:text-5xl">{venue.name}</h1>
              <div className="mt-3 flex flex-wrap gap-4 text-sm font-medium text-white/90">
                <span className="flex items-center gap-1"><Star className="h-4 w-4 fill-amber-400 text-amber-400" /> {venue.rating} (124 ulasan)</span>
                {venue.coordinates ? (
                  <a href={`https://www.google.com/maps/search/?api=1&query=${venue.coordinates.lat},${venue.coordinates.lng}`} target="_blank" rel="noreferrer" className="flex items-center gap-1 hover:underline">
                    <MapPin className="h-4 w-4" /> {venue.location}
                  </a>
                ) : (
                  <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {venue.location}</span>
                )}
              </div>
            </div>
          </div>
          <div className="-mt-6 grid grid-cols-3 gap-3 px-5 lg:relative lg:mt-6 lg:px-0">
            {venue.facilities.slice(0, 3).map((label) => {
              const Icon = facilityIcons[label] ?? BadgeCheck
              return (
                <div key={label} className="relative grid min-h-[88px] place-items-center rounded-xl bg-white p-3 text-center shadow-sm">
                  <Icon className="h-6 w-6 text-emerald-600" />
                  <span className="mt-2 text-[11px] font-semibold text-gray-600">{label}</span>
                </div>
              )
            })}
          </div>
          <div className="px-5 py-8 lg:px-0">
            <div className="mb-5 flex items-end justify-between">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Jadwal Booking</h2>
                <p className="mt-1 text-sm text-gray-500">Pilih tanggal dan waktu bermain</p>
              </div>
              <button type="button" className="text-sm font-semibold text-emerald-600">Lihat Kalender</button>
            </div>
            <div className="sportcation-scrollbar flex gap-2 overflow-x-auto pb-1">
              {dates.map((date, index) => {
                const parsedDate = new Date(`${date}T00:00:00`)
                const day = new Intl.DateTimeFormat("id-ID", { day: "2-digit" }).format(parsedDate)
                const month = new Intl.DateTimeFormat("id-ID", { month: "short" }).format(parsedDate)
                const label = new Intl.DateTimeFormat("id-ID", { weekday: "short" }).format(parsedDate)
                const selected = selectedDate === date
                return (
                  <button
                    key={date}
                    type="button"
                    onClick={() => onSelectSlot(venue.slots.find((slot) => slot.slotDate === date)?.id ?? "")}
                    className={cx("h-20 min-w-[66px] rounded-xl text-center shadow-sm transition", selected || (!selectedDate && index === 0) ? "bg-emerald-50 text-emerald-700 ring-1 ring-emerald-600" : "bg-white text-gray-600")}
                  >
                    <span className="block text-[10px] font-bold uppercase">{month}</span>
                    <span className="block text-xl font-bold">{day}</span>
                    <span className="block text-xs">{label}</span>
                  </button>
                )
              })}
              {dates.length === 0 && (
                <div className="rounded-xl bg-white px-5 py-4 text-sm font-medium text-gray-500 shadow-sm">
                  Tidak ada slot tersedia.
                </div>
              )}
            </div>
            <div className="mt-6 grid grid-cols-3 gap-3">
              {slots.map((slot) => {
                const isSelected = selectedSlot?.id === slot.id
                return (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => onSelectSlot(slot.id)}
                    className={cx(
                      "h-16 rounded-xl text-center text-sm font-bold transition disabled:cursor-not-allowed",
                      isSelected && "bg-emerald-600 text-white shadow-md",
                      !isSelected && "bg-white text-gray-700 shadow-sm hover:bg-gray-50",
                    )}
                  >
                    <span className="block">{slot.startTime}</span>
                    <span className={cx("mt-0.5 block text-[10px] font-medium", isSelected ? "text-emerald-100" : "text-gray-400")}>
                      {isSelected ? "Terpilih" : "Tersedia"}
                    </span>
                  </button>
                )
              })}
            </div>
            <div className="mt-8">
              <h2 className="mb-4 flex items-center gap-2 text-lg font-bold text-gray-900">
                <MapPin className="h-5 w-5 text-emerald-600" />
                Detail Lokasi
              </h2>
              <div className="relative h-40 overflow-hidden rounded-2xl border border-gray-200 bg-gray-50 shadow-sm">
                <div className="absolute inset-0 opacity-50 [background-image:linear-gradient(90deg,#e5e7eb_1px,transparent_1px),linear-gradient(#e5e7eb_1px,transparent_1px)] [background-size:20px_20px]" />
                <div className="absolute left-1/2 top-1/2 grid h-12 w-12 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-emerald-600 text-white shadow-md">
                  <MapPin className="h-6 w-6" />
                </div>
                <div className="absolute bottom-3 left-3 right-3 rounded-xl bg-white p-3 text-sm font-semibold text-gray-800 shadow-sm">{venue.location}</div>
              </div>
            </div>
          </div>
        </section>
        <aside className="mx-5 mb-6 rounded-2xl bg-white px-5 py-5 shadow-lg shadow-black/5 border border-gray-100 lg:sticky lg:top-24 lg:mx-0 lg:mb-0 lg:h-fit lg:shadow-sm">
          <p className="text-xs font-semibold text-gray-500">Total Harga</p>
          <div className="mt-1 flex items-center justify-between gap-4">
            <p className="text-2xl font-bold text-gray-900"><span className="text-sm font-medium text-gray-500">Rp</span> {(selectedSlot?.price ?? venue.price).toLocaleString("id-ID")}<span className="text-xs font-medium text-gray-500">/jam</span></p>
            <AppButton onClick={onCheckout} disabled={!selectedSlot} className="min-w-[140px]">
              Pesan
            </AppButton>
          </div>
        </aside>
      </div>
    </div>
  )
}

function CheckoutScreen({
  venue,
  slot,
  paymentMethod,
  onPaymentMethod,
  onBack,
  onPay,
  mutationStatus,
  mutationError,
}: {
  venue: Venue
  slot?: Slot
  paymentMethod: string
  onPaymentMethod: (method: string) => void
  onBack: () => void
  onPay: () => void
  mutationStatus: "idle" | "loading"
  mutationError: string
}) {
  const serviceFee = 15000
  const slotPrice = slot?.price ?? venue.price
  const total = slotPrice + serviceFee

  return (
    <div>
      <MobileTopBar title="Checkout" back onBack={onBack} />
      <div className="px-5 py-6 lg:px-0">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8">
          <section>
            <h1 className="text-3xl font-bold leading-tight text-gray-900 lg:text-4xl">Review & Checkout</h1>
            <p className="mt-2 text-sm text-gray-500">Selesaikan pemesanan venue Anda.</p>
            <div className="mt-6 overflow-hidden rounded-2xl border border-gray-100 bg-white p-5 shadow-sm">
              <span className="rounded-md bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-700">Venue Terkonfirmasi</span>
              <div className="mt-5 grid gap-4 border-b border-gray-100 pb-5 lg:grid-cols-[1fr_auto]">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{venue.name}</h2>
                  <p className="mt-1 flex items-start gap-1 text-sm text-gray-500">
                    <MapPin className="mt-0.5 h-4 w-4 shrink-0" />
                    {venue.location}
                  </p>
                </div>
                <CalendarDays className="h-6 w-6 text-emerald-600 hidden lg:block" />
              </div>
              <div className="mt-5">
                <p className="text-xs font-semibold text-gray-500">Tanggal & Waktu</p>
                <p className="mt-1 text-base font-bold text-gray-900">{formatSlotDate(slot)} • {formatSlotWindow(slot)}</p>
              </div>
            </div>
            <div className="mt-3 h-40 overflow-hidden rounded-2xl lg:h-48">
              <img src={venue.image} alt="Venue" className="h-full w-full object-cover" />
            </div>
            <div className="mt-8">
              <p className="mb-3 text-sm font-semibold text-gray-700">Punya kode promo?</p>
              <div className="flex gap-2">
                <div className="flex h-12 flex-1 items-center gap-2 rounded-lg border border-gray-200 bg-gray-50 px-4 text-sm text-gray-500">
                  <Ticket className="h-4 w-4" />
                  Masukkan kode
                </div>
                <AppButton variant="light" className="h-12 px-6">
                  Terapkan
                </AppButton>
              </div>
            </div>
            <div className="mt-8">
              <p className="mb-3 text-sm font-semibold text-gray-700">Metode Pembayaran</p>
              <div className="grid gap-3">
                {[
                  { method: "QRIS / OVO", helper: "Scan QR atau potong saldo", icon: QrCode },
                  { method: "Virtual Account", helper: "BCA, Mandiri, BNI, BRI", icon: Building2 },
                ].map((item) => {
                  const Icon = item.icon
                  const selected = paymentMethod === item.method
                  return (
                    <button key={item.method} type="button" onClick={() => onPaymentMethod(item.method)} className="flex items-center gap-4 rounded-xl border border-gray-100 bg-white p-4 text-left shadow-sm transition hover:border-emerald-200">
                      <span className={cx("grid h-10 w-10 place-items-center rounded-lg", selected ? "bg-emerald-50 text-emerald-600" : "bg-gray-50 text-gray-500")}>
                        <Icon className="h-5 w-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-sm font-bold text-gray-900">{item.method}</span>
                        <span className="block text-xs text-gray-500">{item.helper}</span>
                      </span>
                      <span className={cx("h-4 w-4 rounded-full border-2", selected ? "border-emerald-600 bg-emerald-600 ring-2 ring-emerald-100" : "border-gray-300")} />
                    </button>
                  )
                })}
              </div>
            </div>
          </section>
          <aside className="mt-8 rounded-2xl border border-gray-200 bg-gray-50 p-6 lg:sticky lg:top-24 lg:mt-0 lg:h-fit">
            <p className="text-sm font-bold text-gray-900">Rincian Pembayaran</p>
            <div className="mt-5 space-y-4 text-sm">
              <div className="flex justify-between gap-4">
                <span className="text-gray-600">Biaya Lapangan</span>
                <strong className="text-gray-900">{formatRp(slotPrice)}</strong>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-gray-600">Biaya Layanan</span>
                <strong className="text-gray-900">{formatRp(serviceFee)}</strong>
              </div>
              <div className="flex justify-between gap-4 border-t border-gray-200 pt-4 text-lg font-bold">
                <span className="text-gray-900">Total Pembayaran</span>
                <span className="text-emerald-600">{formatRp(total)}</span>
              </div>
            </div>
            <p className="mt-6 flex items-center justify-center gap-1.5 text-[10px] font-semibold uppercase tracking-wider text-gray-500">
              <ShieldCheck className="h-3.5 w-3.5" />
              Pembayaran Terenkripsi Aman
            </p>
            {mutationError && (
              <div role="alert" className="mt-5 rounded-lg border border-red-200 bg-red-50 p-3 text-xs font-medium text-red-600">
                {mutationError}
              </div>
            )}
            <AppButton onClick={onPay} disabled={!slot || mutationStatus === "loading"} className="mt-6 w-full">
              <QrCode className="h-4 w-4" />
              {mutationStatus === "loading" ? "Memproses..." : "Bayar Sekarang"}
            </AppButton>
          </aside>
        </div>
      </div>
    </div>
  )
}

function PaymentScreen({
  venue,
  slot,
  booking,
  mutationStatus,
  mutationError,
  onBack,
  onCheckStatus,
}: {
  venue: Venue
  slot?: Slot
  booking: CustomerBooking | null
  mutationStatus: "idle" | "loading"
  mutationError: string
  onBack: () => void
  onCheckStatus: () => void
}) {
  const total = booking?.totalAmount ?? (slot?.price ?? venue.price) + 15000
  const venueName = booking?.venue.name ?? venue.name
  const dateLabel = booking ? formatStoredDate(booking.item.slotDate) : formatSlotDate(slot)
  const timeLabel = booking ? formatBookingWindow(booking) : formatSlotWindow(slot)
  const methodLabel = booking ? paymentMethodLabel(booking.payment.method) : "QRIS / OVO"

  return (
    <div>
      <MobileTopBar title={`Pembayaran ${methodLabel}`} back onBack={onBack} brand={false} />
      <div className="px-5 py-6 lg:grid lg:grid-cols-[380px_minmax(0,1fr)] lg:gap-8 lg:px-0">
        <section className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
          <p className="text-xs font-semibold text-gray-500">Venue & Jadwal</p>
          <div className="mt-3 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-xl font-bold text-gray-900">{venueName}</h1>
              {booking && <p className="mt-1 text-xs font-semibold text-emerald-600">KODE: {booking.bookingCode}</p>}
              <p className="mt-3 flex flex-col gap-1.5 text-sm text-gray-600">
                <span className="flex items-center gap-2"><CalendarDays className="h-4 w-4" /> {dateLabel}</span>
                <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> {timeLabel}</span>
              </p>
            </div>
            <span className="grid h-10 w-10 place-items-center rounded-lg bg-emerald-50 text-emerald-600">
              <QrCode className="h-5 w-5" />
            </span>
          </div>
        </section>
        <section className="mt-6 rounded-2xl bg-gray-50 p-4 lg:mt-0 lg:p-6 border border-gray-200">
          <div className="rounded-xl bg-white p-6 text-center shadow-sm">
            {booking?.payment?.qrisUrl ? (
              <div className="mx-auto flex justify-center overflow-hidden rounded-3xl border border-gray-200">
                <img src={booking.payment.qrisUrl} alt="QRIS" className="w-full max-w-[260px] h-auto object-contain" />
              </div>
            ) : (
              <div className="mx-auto grid h-64 max-w-[260px] place-items-center rounded-3xl border-4 border-dashed border-[#d4dddd] bg-[#14383d] text-white">
                <div>
                  <QrCode className="mx-auto h-24 w-24" />
                  <p className="mt-3 text-sm font-black">QRIS</p>
                </div>
              </div>
            )}
            <p className="mx-auto mt-7 max-w-[260px] text-base font-semibold leading-relaxed text-[#687073]">Buka aplikasi e-wallet atau bank favoritmu, lalu scan QR di atas.</p>
            <p className="mt-5 text-sm font-black text-[#007c61]">Status: {booking ? booking.payment.status : "pending"}</p>
            <p className="mt-8 text-xs font-black uppercase tracking-[0.22em] text-[#777d82]">Total Pembayaran</p>
            <p className="mt-2 text-4xl font-black tracking-[-0.05em]">{formatRp(total)}</p>
            <div className="mx-auto mt-6 max-w-[260px] rounded-full bg-[#ffe8ea] px-5 py-4 text-sm font-black text-[#c91f31]">
              <Timer className="mr-2 inline h-4 w-4" />
              Berlaku hingga 15 menit
            </div>
          </div>
          {booking?.payment?.paymentUrl && (
            <a href={booking.payment.paymentUrl} target="_blank" rel="noreferrer" className="mt-6 flex w-full items-center justify-center gap-2 text-base font-black text-[#007c61]">
              <ExternalLink className="h-5 w-5" />
              Buka Halaman Bayar.gg
            </a>
          )}
        </section>
        <div className="mt-12 grid gap-3 lg:col-start-2 lg:col-span-1">
          {mutationError && (
            <div role="alert" className="rounded-2xl border border-[#ffd0d6] bg-[#fff0f2] p-4 text-sm font-bold leading-relaxed text-[#c92034] lg:col-span-1">
              {mutationError}
            </div>
          )}
          <AppButton onClick={onCheckStatus} disabled={!booking || mutationStatus === "loading" || booking.payment.status !== "pending"} className="w-full">
            {mutationStatus === "loading" ? "Mengecek..." : "Cek Status Pembayaran"}
          </AppButton>
        </div>
      </div>
    </div>
  )
}

function SuccessScreen({
  booking,
  venue,
  slot,
  onTicket,
  onHome,
}: {
  booking: CustomerBooking | null
  venue: Venue
  slot?: Slot
  onTicket: () => void
  onHome: () => void
}) {
  const total = booking?.totalAmount ?? (slot?.price ?? venue.price) + 15000
  const bookingCode = booking?.bookingCode ?? "Belum tersedia"
  const venueName = booking?.venue.name ?? venue.name
  const venueImage = booking?.venue.image ?? venue.image
  const dateLabel = booking ? formatStoredDate(booking.item.slotDate) : formatSlotDate(slot)
  const timeLabel = booking ? formatBookingWindow(booking) : formatSlotWindow(slot)
  const statusLabel = booking ? bookingStatusLabel(booking.status) : "Confirmed"

  return (
    <div className="grid min-h-screen place-items-center px-6 py-12 lg:min-h-[calc(100vh-80px)]">
      <section className="w-full max-w-[520px] text-center">
        <div className="mx-auto grid h-32 w-32 place-items-center rounded-full bg-[#d8fff3]">
          <div className="grid h-24 w-24 place-items-center rounded-full bg-gradient-to-br from-[#007c61] to-[#49e7ba] text-white">
            <Check className="h-14 w-14 stroke-[4]" />
          </div>
        </div>
        <h1 className="mt-8 text-3xl font-black tracking-[-0.05em] lg:text-5xl">Pemesanan Berhasil!</h1>
        <p className="mt-3 text-lg font-semibold">ID: <span className="font-black text-[#007c61]">{bookingCode}</span></p>
        <div className="mt-10 overflow-hidden rounded-[34px] bg-white text-left shadow-sm">
          <div className="relative h-36 overflow-hidden">
            <img src={venueImage} alt={venueName} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-black/35" />
            <div className="absolute bottom-5 left-6">
              <span className="rounded-full bg-[#49e7ba] px-3 py-1 text-xs font-black uppercase text-[#007c61]">{statusLabel}</span>
              <h2 className="mt-2 text-2xl font-black text-white">{venueName}</h2>
            </div>
          </div>
          <div className="p-7">
            <div className="grid grid-cols-2 gap-6">
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#687073]">Date</p>
                <p className="mt-2 font-black"><CalendarDays className="mr-1 inline h-4 w-4 text-[#007c61]" /> {dateLabel}</p>
              </div>
              <div>
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#687073]">Time</p>
                <p className="mt-2 font-black"><Clock className="mr-1 inline h-4 w-4 text-[#007c61]" /> {timeLabel} WIB</p>
              </div>
            </div>
            <div className="my-8 border-t border-dashed border-[#dce2e2]" />
            <div className="mx-auto grid h-44 w-44 place-items-center rounded-3xl bg-[#eef2f2]">
              <div className="grid h-32 w-32 place-items-center bg-[#1d2a31] text-white shadow-xl">
                <QrCode className="h-20 w-20" />
              </div>
            </div>
            <p className="mt-6 text-center text-sm font-semibold text-[#687073]">Tunjukkan QR Code ini pada petugas lapangan untuk check-in.</p>
            <div className="mt-8 rounded-2xl bg-[#f3f6f6] p-5 text-center text-lg font-black">
              Total Pembayaran <span className="text-2xl text-[#007c61]">{formatRp(total)}</span>
            </div>
          </div>
        </div>
        <AppButton onClick={onTicket} className="mt-10 w-full">
          Lihat Tiket
        </AppButton>
        <button type="button" onClick={onHome} className="mt-5 inline-flex items-center gap-3 text-base font-black text-[#007c61]">
          <ArrowLeft className="h-5 w-5" />
          Kembali ke Beranda
        </button>
      </section>
    </div>
  )
}


function BookingsScreen({
  bookings,
  status,
  error,
  onNavigate,
  onRefresh,
  onLogin,
  onOpenBooking,
  onCancelBooking,
  actionBookingId,
  actionError,
}: {
  bookings: CustomerBooking[]
  status: "idle" | "loading" | "error" | "unauthenticated"
  error: string
  onNavigate: (view: View) => void
  onRefresh: () => void
  onLogin: () => void
  onOpenBooking: (booking: CustomerBooking) => void
  onCancelBooking: (booking: CustomerBooking) => void
  actionBookingId: string
  actionError: string
}) {
  const [tab, setTab] = useState<"upcoming" | "completed" | "cancelled">("upcoming")
  const visibleBookings = bookings.filter((booking) => {
    if (tab === "upcoming") return isUpcomingBooking(booking)
    if (tab === "completed") return booking.status === "completed"
    return ["cancelled", "refunded"].includes(booking.status)
  })

  return (
    <>
      <MobileTopBar brand />
      <div className="px-6 py-7 lg:px-0">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#007c61]">Your Activities</p>
        <h1 className="mt-3 text-5xl font-black tracking-[-0.08em]">My Bookings</h1>
        <div className="sportcation-scrollbar mt-8 flex gap-9 overflow-x-auto border-b border-[#dfe5e5] pb-2 text-lg font-bold text-[#5f666a]">
          {[
            { id: "upcoming" as const, label: "Upcoming" },
            { id: "completed" as const, label: "Past Sessions" },
            { id: "cancelled" as const, label: "Cancelled" },
          ].map((item) => (
            <button
              key={item.id}
              type="button"
              onClick={() => setTab(item.id)}
              className={cx(tab === item.id && "relative text-[#2d3234] after:absolute after:-bottom-2 after:left-0 after:h-1 after:w-8 after:rounded-full after:bg-[#007c61]")}
            >
              {item.label}
            </button>
          ))}
        </div>
        {status === "loading" && (
          <div className="mt-8 rounded-[28px] bg-white p-10 text-center shadow-sm">
            <Clock className="mx-auto h-9 w-9 animate-pulse text-[#007c61]" />
            <h2 className="mt-4 text-xl font-black">Loading bookings</h2>
            <p className="mt-2 text-sm font-semibold text-[#687073]">Mengambil riwayat booking dari database.</p>
          </div>
        )}
        {status === "unauthenticated" && (
          <div className="mt-8 rounded-[28px] bg-white p-10 text-center shadow-sm">
            <LockKeyhole className="mx-auto h-10 w-10 text-[#007c61]" />
            <h2 className="mt-4 text-xl font-black">Login diperlukan</h2>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-[#687073]">My Bookings hanya menampilkan data booking customer yang sedang login.</p>
            <AppButton onClick={onLogin} className="mt-6 w-full">Login Customer</AppButton>
          </div>
        )}
        {status === "error" && (
          <div className="mt-8 rounded-[28px] border border-[#ffd0d6] bg-white p-10 text-center shadow-sm">
            <h2 className="text-xl font-black text-[#c92034]">Booking gagal dimuat</h2>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-[#687073]">{error || "Coba refresh daftar booking."}</p>
            <AppButton onClick={onRefresh} className="mt-6 w-full">Refresh</AppButton>
          </div>
        )}
        {status === "idle" && visibleBookings.length === 0 && (
          <div className="mt-8 rounded-[28px] border border-dashed border-[#d3dada] bg-white p-10 text-center shadow-sm">
            <Ticket className="mx-auto h-10 w-10 text-[#a6adb0]" />
            <h2 className="mt-4 text-xl font-black">Belum ada booking</h2>
            <p className="mt-2 text-sm font-semibold leading-relaxed text-[#687073]">
              Booking persisted akan muncul di tab ini setelah checkout dan payment simulation.
            </p>
            <AppButton onClick={() => onNavigate("explore")} className="mt-6 w-full">Cari Venue</AppButton>
          </div>
        )}
        {status === "idle" && visibleBookings.length > 0 && (
          <div className="mt-8 grid gap-7 lg:grid-cols-2">
            {actionError && (
              <div role="alert" className="rounded-2xl border border-[#ffd0d6] bg-white p-4 text-sm font-bold leading-relaxed text-[#c92034] lg:col-span-2">
                {actionError}
              </div>
            )}
            {visibleBookings.map((booking) => (
              <article key={booking.id} className="overflow-hidden rounded-[28px] bg-white shadow-sm">
                <div className="relative h-52 overflow-hidden">
                  <img src={booking.venue.image} alt={booking.venue.name} className="h-full w-full object-cover" />
                  <span className="absolute left-4 top-4 rounded-full bg-[#49e7ba] px-4 py-2 text-xs font-black uppercase text-[#007c61]">
                    {bookingStatusLabel(booking.status)}
                  </span>
                </div>
                <div className="p-6">
                  <div className="grid grid-cols-[1fr_auto] gap-4">
                    <div>
                      <p className="text-xs font-black uppercase tracking-[0.16em] text-[#007c61]">{booking.bookingCode}</p>
                      <h2 className="mt-2 text-3xl font-black leading-tight tracking-[-0.06em]">{booking.venue.name}</h2>
                    </div>
                    <p className="text-right text-xl font-black text-[#007c61]">{formatRp(booking.totalAmount)}</p>
                  </div>
                  <p className="mt-4 flex flex-wrap gap-4 text-sm font-semibold text-[#5f666a]">
                    <span><CalendarDays className="mr-1 inline h-4 w-4" /> {formatStoredDate(booking.item.slotDate)}</span>
                    <span><Clock className="mr-1 inline h-4 w-4" /> {formatBookingWindow(booking)}</span>
                  </p>
                  <p className="mt-2 text-sm font-bold text-[#687073]">
                    {booking.item.courtName} - {paymentMethodLabel(booking.payment.method)} - {booking.payment.status}
                  </p>
                  <div className="mt-6 flex gap-4">
                    <AppButton onClick={() => onOpenBooking(booking)} className="h-12 flex-1 normal-case tracking-normal">
                      {booking.status === "pending_payment" ? "Bayar" : "Manage"}
                    </AppButton>
                    {booking.status === "confirmed" && (
                      <AppButton 
                        onClick={async () => {
                          const action = prompt("Ketik 'JUAL' untuk jual biasa (Resell) atau 'LELANG' untuk mulai lelang:")
                          if (!action) return
                          
                          if (action.toUpperCase() === "JUAL") {
                            const priceStr = prompt("Masukkan harga jual (contoh: 50000):")
                            if (!priceStr) return
                            const price = parseInt(priceStr.replace(/\D/g, ""), 10)
                            if (isNaN(price)) return
                            
                            try {
                              const res = await fetch("/api/marketplace/resell", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ bookingId: booking.id, price })
                              })
                              if (res.ok) {
                                alert("Berhasil dipasang di pasar Resell!")
                                onRefresh()
                              } else {
                                const err = await res.json()
                                alert(err.error || "Gagal memasang di pasar.")
                              }
                            } catch (e) {
                              alert("Terjadi kesalahan jaringan.")
                            }
                          } else if (action.toUpperCase() === "LELANG") {
                            const priceStr = prompt("Masukkan harga awal lelang (contoh: 20000):")
                            if (!priceStr) return
                            const startPrice = parseInt(priceStr.replace(/\D/g, ""), 10)
                            if (isNaN(startPrice)) return
                            
                            try {
                              const res = await fetch("/api/marketplace/auction", {
                                method: "POST",
                                headers: { "Content-Type": "application/json" },
                                body: JSON.stringify({ bookingId: booking.id, startPrice })
                              })
                              if (res.ok) {
                                alert("Berhasil dipasang di pasar Lelang!")
                                onRefresh()
                              } else {
                                const err = await res.json()
                                alert(err.error || "Gagal memasang lelang.")
                              }
                            } catch (e) {
                              alert("Terjadi kesalahan jaringan.")
                            }
                          } else {
                            alert("Aksi tidak valid.")
                          }
                        }}
                        className="h-12 flex-1 normal-case tracking-normal bg-[#ffc532] text-black hover:bg-[#e5b12d]"
                      >
                        Jual / Lelang
                      </AppButton>
                    )}
                    {["pending_payment", "confirmed"].includes(booking.status) && (
                      <button
                        type="button"
                        onClick={() => onCancelBooking(booking)}
                        disabled={actionBookingId === booking.id}
                        className="h-12 rounded-full bg-[#ffe8ea] px-5 text-sm font-black text-[#c92034] disabled:cursor-not-allowed disabled:opacity-60"
                      >
                        {actionBookingId === booking.id ? "Cancelling" : "Cancel"}
                      </button>
                    )}
                  </div>
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </>
  )
}

function NotificationsScreen({
  notifications,
  status,
  error,
  actionStatus,
  onBack,
  onLogin,
  onRefresh,
  onMarkAll,
  onOpen,
}: {
  notifications: CustomerNotification[]
  status: "idle" | "loading" | "error" | "unauthenticated"
  error: string
  actionStatus: "idle" | "loading"
  onBack: () => void
  onLogin: () => void
  onRefresh: () => void
  onMarkAll: () => void
  onOpen: (notification: CustomerNotification) => void
}) {
  const unreadCount = notifications.filter((item) => !item.readAt).length
  return (
    <>
      <MobileTopBar title="Notifications" back onBack={onBack} onBell={() => undefined} brand={false} />
      <div className="px-6 py-8 lg:px-0">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#687073]">Activity Feed</p>
            <h1 className="mt-3 text-4xl font-black tracking-[-0.07em]">Updates</h1>
          </div>
          <button
            type="button"
            disabled={!unreadCount || actionStatus === "loading"}
            onClick={onMarkAll}
            className="text-sm font-black text-[#007c61] disabled:cursor-not-allowed disabled:opacity-40"
          >
            {actionStatus === "loading" ? "Updating..." : "Mark all as read"}
          </button>
        </div>

        {status === "unauthenticated" && (
          <StatePanel
            title="Login required"
            body="Masuk terlebih dahulu untuk melihat notifikasi booking, promo, dan aktivitas akun."
            actionLabel="Login"
            onAction={onLogin}
          />
        )}

        {status === "loading" && notifications.length === 0 && (
          <StatePanel title="Loading notifications" body="Mengambil update terbaru dari akun Sportcation Anda." />
        )}

        {status === "error" && notifications.length === 0 && (
          <StatePanel title="Notifications unavailable" body={error} actionLabel="Retry" onAction={onRefresh} />
        )}

        {status !== "unauthenticated" && status !== "loading" && notifications.length === 0 && (
          <StatePanel title="No notifications yet" body="Kami akan menampilkan update booking, payment, promo, dan sistem di sini." />
        )}

        {notifications.length > 0 && (
          <div className="mt-8 grid gap-5 lg:grid-cols-3">
            {notifications.map((item) => {
              const meta = notificationMeta(item.type)
              const Icon = meta.icon
              const unread = !item.readAt
              return (
                <article
                  key={item.id}
                  className={cx(
                    "rounded-[22px] bg-white p-6 shadow-sm",
                    unread && meta.borderClass,
                    !unread && "opacity-75",
                  )}
                >
                  <div className="flex items-start gap-5">
                    <span className={cx("grid h-14 w-14 shrink-0 place-items-center rounded-full", meta.iconClass)}>
                      <Icon className="h-6 w-6" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-start justify-between gap-4">
                        <h2 className="text-lg font-black">{item.title}</h2>
                        <span className="shrink-0 text-[10px] font-black text-[#777d82]">{formatNotificationTime(item.createdAt)}</span>
                      </div>
                      <p className="mt-1 text-base font-semibold leading-relaxed text-[#687073]">{item.body}</p>
                      <div className="mt-5 flex flex-wrap items-center gap-3">
                        <button
                          type="button"
                          onClick={() => onOpen(item)}
                          disabled={actionStatus === "loading"}
                          className="h-10 rounded-full bg-[#007c61] px-5 text-xs font-black uppercase text-white disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {item.actionUrl ? "Open" : unread ? "Mark read" : "Read"}
                        </button>
                        <span className={cx("rounded-full px-3 py-1 text-[10px] font-black uppercase", unread ? "bg-[#dcfff6] text-[#007c61]" : "bg-[#edf1f1] text-[#687073]")}>
                          {unread ? "Unread" : "Read"}
                        </span>
                      </div>
                    </div>
                  </div>
                </article>
              )
            })}
          </div>
        )}

        {notifications.length > 0 && (
          <div className="mt-14">
            <p className="mb-5 text-xs font-black uppercase tracking-[0.24em] text-[#b0b5b8]">Earlier this week</p>
            <div className="grid min-h-[220px] place-items-center rounded-[26px] border border-dashed border-[#d3dada] p-8 text-center">
              <div>
                <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#e7ecec] text-[#c3c8ca]"><Clock className="h-8 w-8" /></span>
                <p className="mt-6 font-semibold text-[#687073]">No older notifications to show.</p>
                <p className="mt-1 text-sm text-[#9aa0a4]">We will keep you posted on your next adventure.</p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}

function notificationMeta(type: CustomerNotification["type"]) {
  if (type === "auction") {
    return {
      icon: Gavel,
      borderClass: "border-l-4 border-[#c92034]",
      iconClass: "bg-[#ffe0e5] text-[#c92034]",
    }
  }
  if (type === "promo") {
    return {
      icon: Zap,
      borderClass: "border-l-4 border-[#8a6f00]",
      iconClass: "bg-[#fff2c9] text-[#8a6f00]",
    }
  }
  if (type === "payment") {
    return {
      icon: Wallet,
      borderClass: "border-l-4 border-[#007c61]",
      iconClass: "bg-[#dcfff6] text-[#007c61]",
    }
  }
  if (type === "system") {
    return {
      icon: Bell,
      borderClass: "border-l-4 border-[#64707a]",
      iconClass: "bg-[#e8eeee] text-[#64707a]",
    }
  }
  return {
    icon: BadgeCheck,
    borderClass: "border-l-4 border-[#007c61]",
    iconClass: "bg-[#dcfff6] text-[#007c61]",
  }
}

function ProfileScreen({
  profile,
  status,
  error,
  onNavigate,
  onRefresh,
  onLogin,
}: {
  profile: CustomerProfile | null
  status: "idle" | "loading" | "error" | "unauthenticated"
  error: string
  onNavigate: (view: View) => void
  onRefresh: () => void
  onLogin: () => void
}) {
  const menu = [
    { label: "Edit Profile", view: "edit-profile" as View, icon: User },
    { label: "My Bookings", view: "bookings" as View, icon: CalendarDays },
    { label: "Payment Methods", view: "checkout" as View, icon: Wallet },
    { label: "Notifications", view: "notifications" as View, icon: Bell, badge: profile?.stats.unreadNotifications ? `${profile.stats.unreadNotifications} New` : undefined },
    { label: "Help Center", view: "help" as View, icon: HelpCircle },
    { label: "Settings", view: "settings" as View, icon: Settings },
  ]
  const displayName = profile?.profile.fullName || profile?.name || "Sportcation Member"
  const contact = profile?.email ?? profile?.phone ?? "Lengkapi email atau nomor HP"
  const avatar = profile?.profile.avatarUrl ?? profile?.image

  return (
    <>
      <MobileTopBar title={profile?.profile.city ? `${profile.profile.city} ID` : "Jakarta ID"} brand={false} />
      <div className="px-6 py-7 text-center lg:px-0">
        {status === "unauthenticated" && (
          <StatePanel title="Login required" body="Masuk untuk membuka profil, booking, dan preferensi akun." actionLabel="Login" onAction={onLogin} />
        )}
        {status === "loading" && !profile && (
          <StatePanel title="Loading profile" body="Mengambil profil customer dari database lokal." />
        )}
        {status === "error" && !profile && (
          <StatePanel title="Profile unavailable" body={error} actionLabel="Retry" onAction={onRefresh} />
        )}
        {profile && (
          <div className="mx-auto max-w-4xl lg:grid lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-8 lg:text-left">
            <section className="lg:rounded-[32px] lg:bg-white lg:p-8 lg:shadow-sm">
              <div className="relative mx-auto w-fit">
                <Avatar size="lg" src={avatar} alt={`${displayName} avatar`} />
                <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-[#007c61] px-5 py-1 text-xs font-black uppercase text-white">Pro</span>
              </div>
              <h1 className="mt-7 text-3xl font-black tracking-[-0.06em] lg:text-center">{displayName}</h1>
              <p className="mt-1 text-lg font-semibold text-[#687073] lg:text-center">{contact}</p>
              {profile.phone && profile.email && (
                <p className="mt-1 text-sm font-bold text-[#007c61] lg:text-center">{profile.phone}</p>
              )}
              <div className="mt-9 grid grid-cols-3 gap-3">
                {[
                  [formatCompactNumber(profile.stats.bookings), "Bookings"],
                  [formatCompactNumber(profile.stats.unreadNotifications), "Unread"],
                  [formatCompactNumber(profile.stats.points), "Points"],
                ].map(([value, label]) => (
                  <div key={label} className="rounded-2xl bg-white p-5 text-center shadow-sm lg:bg-[#f3f6f6]">
                    <p className="text-2xl font-black text-[#007c61]">{value}</p>
                    <p className="mt-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#666b70]">{label}</p>
                  </div>
                ))}
              </div>
            </section>
            <section className="mt-9 grid gap-4 lg:mt-0">
              {menu.map((item) => {
                const Icon = item.icon
                return (
                  <button key={item.label} type="button" onClick={() => onNavigate(item.view)} className="flex items-center gap-4 rounded-[22px] bg-white p-5 text-left shadow-sm">
                    <span className="grid h-12 w-12 place-items-center rounded-xl bg-[#dcfff6] text-[#007c61]"><Icon className="h-6 w-6" /></span>
                    <span className="min-w-0 flex-1 text-base font-black">{item.label}</span>
                    {item.badge && <span className="rounded-full bg-[#ffc107] px-3 py-1 text-[10px] font-black uppercase">{item.badge}</span>}
                    <ChevronRight className="h-5 w-5 text-[#a1a7aa]" />
                  </button>
                )
              })}
              <a href="/merchant" className="flex items-center gap-4 rounded-[22px] bg-white p-5 text-left shadow-sm">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-[#dcfff6] text-[#007c61]"><Store className="h-6 w-6" /></span>
                <span className="min-w-0 flex-1 text-base font-black">Merchant Studio</span>
                <ChevronRight className="h-5 w-5 text-[#a1a7aa]" />
              </a>
              <a href="/admin" className="flex items-center gap-4 rounded-[22px] bg-white p-5 text-left shadow-sm">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-[#071413] text-[#49e7ba]"><ShieldCheck className="h-6 w-6" /></span>
                <span className="min-w-0 flex-1 text-base font-black">Admin Command</span>
                <ChevronRight className="h-5 w-5 text-[#a1a7aa]" />
              </a>
              <button type="button" onClick={() => onNavigate("onboarding")} className="flex items-center gap-4 rounded-[22px] bg-white p-5 text-left shadow-sm">
                <span className="grid h-12 w-12 place-items-center rounded-xl bg-[#f8e3e6] text-[#c41226]"><LogOut className="h-6 w-6" /></span>
                <span className="min-w-0 flex-1 text-base font-black text-[#c41226]">Logout</span>
              </button>
            </section>
          </div>
        )}
      </div>
    </>
  )
}

function EditProfileScreen({
  profile,
  status,
  error,
  mutationStatus,
  mutationError,
  onBack,
  onLogin,
  onSave,
}: {
  profile: CustomerProfile | null
  status: "idle" | "loading" | "error" | "unauthenticated"
  error: string
  mutationStatus: "idle" | "loading"
  mutationError: string
  onBack: () => void
  onLogin: () => void
  onSave: (input: ProfileUpdatePayload) => void
}) {
  const [name, setName] = useState(profile?.name ?? "")
  const [fullName, setFullName] = useState(profile?.profile.fullName ?? "")
  const [phone, setPhone] = useState(profile?.phone ?? "")
  const [city, setCity] = useState(profile?.profile.city ?? "")
  const [avatarUrl, setAvatarUrl] = useState(profile?.profile.avatarUrl ?? profile?.image ?? "")
  const [localError, setLocalError] = useState("")

  function submit() {
    if (!name.trim() || !fullName.trim()) {
      setLocalError("Nama akun dan nama lengkap wajib diisi.")
      return
    }
    setLocalError("")
    onSave({
      name,
      fullName,
      phone,
      city,
      avatarUrl,
    })
  }

  return (
    <>
      <MobileTopBar title="Edit Profile" back onBack={onBack} brand={false} />
      <div className="px-6 py-7 lg:px-0">
        <div className="mx-auto max-w-2xl">
          {status === "unauthenticated" && (
            <StatePanel title="Login required" body="Masuk untuk mengubah profil customer." actionLabel="Login" onAction={onLogin} />
          )}
          {status === "loading" && !profile && <StatePanel title="Loading profile" body="Menyiapkan form profil." />}
          {status === "error" && !profile && <StatePanel title="Profile unavailable" body={error} />}

          {profile && (
            <section className="rounded-[28px] bg-white p-6 shadow-sm">
              <div className="flex items-center gap-4">
                <Avatar src={avatarUrl || profile.profile.avatarUrl || profile.image} alt={`${fullName || profile.name} avatar`} />
                <div>
                  <p className="text-xs font-black uppercase tracking-[0.2em] text-[#007c61]">Customer Profile</p>
                  <h1 className="mt-1 text-3xl font-black tracking-[-0.06em]">Personal Info</h1>
                </div>
              </div>

              <div className="mt-8 grid gap-5">
                <ProfileField label="Account name" value={name} onChange={setName} placeholder="Alex Rivera" />
                <ProfileField label="Full name" value={fullName} onChange={setFullName} placeholder="Alex Rivera" />
                <ProfileField label="Phone" value={phone} onChange={setPhone} placeholder="+62 812 3456 7890" />
                <ProfileField label="City" value={city} onChange={setCity} placeholder="Jakarta" />
                <ProfileField label="Avatar URL" value={avatarUrl} onChange={setAvatarUrl} placeholder="https://example.com/avatar.jpg" />
              </div>

              {(localError || mutationError) && (
                <p className="mt-5 rounded-2xl bg-[#ffe0e5] p-4 text-sm font-bold text-[#c41226]">
                  {localError || mutationError}
                </p>
              )}

              <div className="mt-8 flex flex-col gap-3 sm:flex-row">
                <AppButton onClick={submit} disabled={mutationStatus === "loading"} className="flex-1">
                  {mutationStatus === "loading" ? "Saving..." : "Save Profile"}
                </AppButton>
                <AppButton onClick={onBack} variant="light" className="flex-1">Cancel</AppButton>
              </div>
            </section>
          )}
        </div>
      </div>
    </>
  )
}

function ProfileField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string
  value: string
  onChange: (value: string) => void
  placeholder: string
}) {
  return (
    <label className="block">
      <span className="text-xs font-black uppercase tracking-[0.2em] text-[#687073]">{label}</span>
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="mt-2 h-14 w-full rounded-2xl bg-[#f3f6f6] px-5 text-base font-bold outline-none ring-[#49e7ba] transition focus:ring-2"
      />
    </label>
  )
}

function StatePanel({
  title,
  body,
  actionLabel,
  onAction,
}: {
  title: string
  body: string
  actionLabel?: string
  onAction?: () => void
}) {
  return (
    <div className="mt-8 grid min-h-[220px] place-items-center rounded-[26px] border border-dashed border-[#d3dada] bg-white p-8 text-center shadow-sm">
      <div>
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-[#dcfff6] text-[#007c61]">
          <Bell className="h-8 w-8" />
        </span>
        <h2 className="mt-6 text-xl font-black">{title}</h2>
        <p className="mx-auto mt-2 max-w-md text-sm font-semibold leading-relaxed text-[#687073]">{body}</p>
        {actionLabel && onAction && (
          <AppButton onClick={onAction} className="mt-6 h-12 px-8 text-xs">
            {actionLabel}
          </AppButton>
        )}
      </div>
    </div>
  )
}

function SettingsScreen({
  onNavigate,
  profile,
  darkMode,
  onDarkMode,
  pushEnabled,
  onPushEnabled,
  biometricEnabled,
  onBiometricEnabled,
}: {
  onNavigate: (view: View) => void
  profile: CustomerProfile | null
  darkMode: boolean
  onDarkMode: (value: boolean) => void
  pushEnabled: boolean
  onPushEnabled: (value: boolean) => void
  biometricEnabled: boolean
  onBiometricEnabled: (value: boolean) => void
}) {
  return (
    <>
      <MobileTopBar brand />
      <div className="px-6 py-7 lg:px-0">
        <h1 className="text-4xl font-black tracking-[-0.07em]">Settings</h1>
        <p className="mt-2 text-base font-semibold text-[#687073]">Manage your elite sport vacation experience</p>
        <div className="mt-9 grid gap-8 lg:grid-cols-2">
          <SettingsGroup title="Account" meta="Priority">
            <SettingsRow
              icon={User}
              title="Personal Info"
              subtitle={profile?.email ?? profile?.phone ?? "Name, Email, Phone"}
              onClick={() => onNavigate("edit-profile")}
            />
          </SettingsGroup>
          <SettingsGroup title="Preferences">
            <SettingsRow icon={Moon} title="Dark Mode" toggle checked={darkMode} onToggle={() => onDarkMode(!darkMode)} />
            <SettingsRow icon={Languages} title="Language" subtitle="English (US)" />
            <SettingsRow icon={Bell} title="Push Notifications" toggle checked={pushEnabled} onToggle={() => onPushEnabled(!pushEnabled)} />
          </SettingsGroup>
          <SettingsGroup title="Privacy & Security">
            <SettingsRow icon={LockKeyhole} title="Change Password" />
            <SettingsRow icon={ShieldCheck} title="Privacy Center" onClick={() => onNavigate("privacy")} />
            <SettingsRow icon={Fingerprint} title="Biometric Login" toggle checked={biometricEnabled} onToggle={() => onBiometricEnabled(!biometricEnabled)} />
          </SettingsGroup>
          <SettingsGroup title="About">
            <SettingsRow icon={Gavel} title="Legal Info" onClick={() => onNavigate("privacy")} />
            <SettingsRow icon={HelpCircle} title="Help Center" onClick={() => onNavigate("help")} />
          </SettingsGroup>
        </div>
        <button type="button" onClick={() => onNavigate("onboarding")} className="mt-10 h-14 w-full rounded-full bg-[#d8dddd] text-base font-black text-[#c41226] lg:max-w-sm">
          <LogOut className="mr-2 inline h-5 w-5" />
          Logout
        </button>
      </div>
    </>
  )
}

function SettingsGroup({ title, meta, children }: { title: string; meta?: string; children: React.ReactNode }) {
  return (
    <section>
      <div className="mb-5 flex items-center justify-between">
        <h2 className="text-xl font-black">{title}</h2>
        {meta && <span className="text-xs font-black uppercase tracking-[0.22em] text-[#007c61]">{meta}</span>}
      </div>
      <div className="overflow-hidden rounded-[20px] bg-white shadow-sm">{children}</div>
    </section>
  )
}

function SettingsRow({
  icon: Icon,
  title,
  subtitle,
  toggle,
  checked,
  onToggle,
  onClick,
}: {
  icon: LucideIcon
  title: string
  subtitle?: string
  toggle?: boolean
  checked?: boolean
  onToggle?: () => void
  onClick?: () => void
}) {
  return (
    <button type="button" onClick={toggle ? onToggle : onClick} className="flex min-h-[78px] w-full items-center gap-4 px-6 text-left">
      <span className="grid h-12 w-12 place-items-center rounded-xl bg-[#dcfff6] text-[#007c61]"><Icon className="h-6 w-6" /></span>
      <span className="min-w-0 flex-1">
        <span className="block text-base font-black">{title}</span>
        {subtitle && <span className="text-sm font-semibold text-[#687073]">{subtitle}</span>}
      </span>
      {toggle ? (
        <span className={cx("relative h-7 w-12 rounded-full transition", checked ? "bg-[#007c61]" : "bg-[#d1d6d8]")}>
          <span className={cx("absolute top-1 h-5 w-5 rounded-full bg-white transition", checked ? "left-6" : "left-1")} />
        </span>
      ) : (
        <ChevronRight className="h-5 w-5 text-[#a1a7aa]" />
      )}
    </button>
  )
}


function HelpScreen({ onBack }: { onBack: () => void }) {
  return (
    <div>
      <MobileTopBar title="Help & Support" back onBack={onBack} brand={false} onBell={() => undefined} />
      <div className="px-6 py-8 lg:px-0">
        <h1 className="text-4xl font-black leading-tight tracking-[-0.07em] lg:text-6xl">How can we <span className="text-[#007c61]">assist</span> your performance?</h1>
        <div className="mt-8 flex h-14 items-center gap-3 rounded-2xl bg-[#eceff0] px-5 text-[#9ba0a4]"><Search className="h-5 w-5" /> Search FAQ, topics, or issues...</div>
        <SectionTitle title="Popular Topics" action="View all" />
        <div className="grid gap-5 lg:grid-cols-3">
          {[
            { title: "Booking", body: "Modify, cancel or track your sportcations.", icon: CalendarDays },
            { title: "Payments", body: "Refunds, billing cycles, and invoices.", icon: Wallet },
          ].map((topic) => {
            const Icon = topic.icon
            return (
              <article key={topic.title} className="rounded-[26px] bg-white p-7 shadow-sm">
                <span className="grid h-14 w-14 place-items-center rounded-2xl bg-[#dcfff6] text-[#007c61]"><Icon className="h-7 w-7" /></span>
                <h2 className="mt-5 text-xl font-black">{topic.title}</h2>
                <p className="mt-2 text-base font-semibold leading-relaxed text-[#687073]">{topic.body}</p>
              </article>
            )
          })}
        </div>
        <section className="mt-8 rounded-[28px] bg-[#071413] p-8 text-white lg:max-w-lg">
          <h2 className="text-2xl font-black">Still need help?</h2>
          <p className="mt-3 text-base leading-relaxed text-white/70">Our dedicated sports concierge team is available 24/7 to ensure your experience is seamless.</p>
          <AppButton className="mt-8 w-full"><MessageCircle className="h-5 w-5" /> Live Chat</AppButton>
          <AppButton variant="dark" className="mt-4 w-full border border-white/10"><Mail className="h-5 w-5" /> Email Support</AppButton>
        </section>
      </div>
    </div>
  )
}

function PrivacyScreen({ onBack }: { onBack: () => void }) {
  return (
    <div>
      <MobileTopBar title="Privacy Policy" back onBack={onBack} brand={false} />
      <div className="px-6 py-8 lg:mx-auto lg:max-w-3xl lg:px-0">
        <span className="rounded-full bg-[#49e7ba] px-4 py-2 text-[10px] font-black uppercase tracking-[0.18em] text-[#007c61]">Version 2.4 - Updated Oct 2023</span>
        <h1 className="mt-6 text-4xl font-black leading-tight tracking-[-0.07em]">Your Security is Our <span className="text-[#007c61] italic">Top Gear.</span></h1>
        <p className="mt-6 text-lg leading-relaxed text-[#687073]">
          At Sportcation, we believe that your data privacy is as important as your physical performance. This policy outlines how we handle your digital footprint within the LockerRoom ecosystem.
        </p>
        <div className="mt-10 grid gap-5 lg:grid-cols-2">
          {[
            { title: "Encrypted Always", body: "Every byte of your data is protected with military-grade 256-bit encryption during transit and at rest.", icon: ShieldCheck },
            { title: "GDPR Compliant", body: "We strictly adhere to global privacy control standards, ensuring you have total control over your information.", icon: Gavel },
          ].map((item) => {
            const Icon = item.icon
            return (
              <article key={item.title} className="rounded-[20px] bg-white p-7 shadow-sm">
                <Icon className="h-7 w-7 text-[#007c61]" />
                <h2 className="mt-8 text-xl font-black">{item.title}</h2>
                <p className="mt-2 text-sm font-semibold leading-relaxed text-[#687073]">{item.body}</p>
              </article>
            )
          })}
        </div>
        {["Data Collection", "Data Usage", "Your Rights"].map((title) => (
          <section key={title} className="mt-10">
            <h2 className="text-2xl font-black tracking-[-0.05em]">{title}</h2>
            <p className="mt-4 text-base leading-relaxed text-[#687073]">
              We collect and process data only to improve booking reliability, facility recommendations, account security, and customer support quality.
            </p>
          </section>
        ))}
        <section className="mt-10 rounded-[24px] bg-[#cffff2] p-8 text-center">
          <h2 className="text-xl font-black text-[#007c61]">Have Questions?</h2>
          <p className="mt-2 text-sm font-semibold text-[#2d7464]">Our privacy team is available 24/7 to discuss your data concerns.</p>
          <AppButton className="mt-6">Contact Data Officer</AppButton>
        </section>
      </div>
    </div>
  )
}


