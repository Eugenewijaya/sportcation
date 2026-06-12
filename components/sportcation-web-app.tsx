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
  Ticket,
  Timer,
  User,
  Wallet,
  Zap,
  type LucideIcon,
} from "lucide-react"
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
  | "auction"
  | "bookings"
  | "notifications"
  | "profile"
  | "settings"
  | "flash"
  | "resell"
  | "help"
  | "privacy"

type Venue = PublicVenue
type Slot = PublicSlot

const navItems: Array<{ view: View; label: string; icon: LucideIcon }> = [
  { view: "home", label: "Home", icon: Home },
  { view: "explore", label: "Explore", icon: Search },
  { view: "auction", label: "Auction", icon: Gavel },
  { view: "bookings", label: "Bookings", icon: Ticket },
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
  "auction",
  "bookings",
  "notifications",
  "profile",
  "settings",
  "flash",
  "resell",
  "help",
  "privacy",
]

const quickActions: Array<{ view: View; label: string; icon: LucideIcon; hot?: boolean }> = [
  { view: "explore", label: "Cari Venue", icon: CalendarDays, hot: true },
  { view: "flash", label: "Flash Sale", icon: Zap },
  { view: "resell", label: "Resell", icon: Repeat2 },
  { view: "flash", label: "Voucher", icon: Ticket },
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

type FlashDeal = Venue & { discount: string; ends: string }

function buildFlashDeals(venueList: Venue[]): FlashDeal[] {
  return venueList.slice(0, 4).map((venue, index) => ({
    ...venue,
    discount: ["-60%", "-45%", "-50%", "-40%"][index] ?? "-35%",
    ends: ["02:45:12", "00:15:45", "01:02:18", "04:40:00"][index] ?? "03:10:00",
  }))
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

export function SportcationWebApp({ initialCatalog }: { initialCatalog: PublicCatalogPayload }) {
  const [view, setView] = useState<View>("onboarding")
  const [catalog, setCatalog] = useState(initialCatalog)
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
  const [paymentMethod, setPaymentMethod] = useState("QRIS / OVO")
  const [darkMode, setDarkMode] = useState(false)
  const [pushEnabled, setPushEnabled] = useState(true)
  const [biometricEnabled, setBiometricEnabled] = useState(true)

  const categories = useMemo(() => ["All Venues", ...catalog.categories.map((item) => item.name)], [catalog.categories])
  const selectedCategorySlug = useMemo(() => {
    if (category === "All Venues") return ""
    return catalog.categories.find((item) => item.name === category)?.slug ?? ""
  }, [catalog.categories, category])
  const flashDeals = useMemo(() => buildFlashDeals(catalog.venues), [catalog.venues])
  const selectedVenue = catalog.venues.find((venue) => venue.id === selectedVenueId) ?? catalog.venues[0]
  const selectedSlot = selectedVenue?.slots.find((slot) => slot.id === selectedSlotId) ?? selectedVenue?.slots[0]

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
    if (views.includes(screen as View)) {
      const frame = window.requestAnimationFrame(() => setView(screen as View))
      return () => window.cancelAnimationFrame(frame)
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

  async function simulatePaymentResult(status: "paid" | "failed") {
    if (!activeBooking) {
      setPaymentMutationError("Booking belum dibuat. Kembali ke checkout dan coba lagi.")
      return
    }

    setPaymentMutationStatus("loading")
    setPaymentMutationError("")

    try {
      const response = await fetch(`/api/payments/${activeBooking.id}/simulate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({ status }),
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

      if (status === "paid") {
        go("success")
      } else {
        setPaymentMutationError("Simulasi pembayaran gagal. Slot dilepas kembali dan booking dibatalkan.")
      }
    } catch (error) {
      setPaymentMutationStatus("idle")
      setPaymentMutationError(error instanceof Error ? error.message : "Simulasi pembayaran gagal diproses.")
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

  const shouldShowBottomNav = ["home", "explore", "auction", "bookings", "notifications", "profile", "settings", "flash", "help"].includes(view)

  if (view === "onboarding") {
    return <OnboardingScreen onLogin={() => window.location.assign("/login")} onDemo={() => go("home")} />
  }

  if (view === "login") {
    return <LoginScreen onBack={() => go("onboarding")} onSubmit={() => go("home")} />
  }

  return (
    <div className={cx("min-h-screen bg-[#f3f6f6] text-[#2c3133]", darkMode && "dark bg-background text-foreground")}>
      <div className="lg:flex">
        <DesktopSidebar active={view} onNavigate={go} />
        <main className="min-h-screen flex-1 lg:pl-[280px]">
          <DesktopTopBar onNavigate={go} />
          <div className="mx-auto min-h-screen w-full max-w-[430px] bg-[#f3f6f6] pb-10 lg:max-w-none lg:bg-transparent lg:px-8 lg:pb-12">
            {view === "home" && (
              <HomeScreen
                venues={catalog.venues}
                flashDeals={flashDeals}
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
                onPaid={() => void simulatePaymentResult("paid")}
                onFailed={() => void simulatePaymentResult("failed")}
              />
            )}
            {view === "payment" && !selectedVenue && <CatalogEmptyState onExplore={() => go("explore")} />}
            {view === "success" && selectedVenue && (
              <SuccessScreen booking={activeBooking} venue={selectedVenue} slot={selectedSlot} onTicket={() => go("bookings")} onHome={() => go("home")} />
            )}
            {view === "success" && !selectedVenue && <CatalogEmptyState onExplore={() => go("explore")} />}
            {view === "auction" && <AuctionScreen onNavigate={go} />}
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
            {view === "notifications" && <NotificationsScreen onBack={() => go("profile")} />}
            {view === "profile" && <ProfileScreen onNavigate={go} />}
            {view === "settings" && (
              <SettingsScreen
                onNavigate={go}
                darkMode={darkMode}
                onDarkMode={setDarkMode}
                pushEnabled={pushEnabled}
                onPushEnabled={setPushEnabled}
                biometricEnabled={biometricEnabled}
                onBiometricEnabled={setBiometricEnabled}
              />
            )}
            {view === "flash" && <FlashSaleScreen deals={flashDeals} onVenue={openVenue} />}
            {view === "resell" && <ResellScreen onBack={() => go("bookings")} onPublish={() => go("auction")} />}
            {view === "help" && <HelpScreen onBack={() => go("profile")} />}
            {view === "privacy" && <PrivacyScreen onBack={() => go("settings")} />}
          </div>
          {shouldShowBottomNav && <BottomNav active={view} onNavigate={go} />}
        </main>
      </div>
    </div>
  )
}

function Brand({ compact = false, inverse = false }: { compact?: boolean; inverse?: boolean }) {
  return (
    <div
      className={cx(
        "flex items-center gap-2 font-black italic tracking-[-0.04em]",
        inverse ? "text-[#20d9ad]" : "text-[#1f2326]",
      )}
    >
      <span className={cx("rounded-xl bg-[#12d5aa]", compact ? "h-7 w-7" : "h-10 w-10")} />
      <span className={cx(compact ? "text-lg" : "text-2xl")}>SPORTCATION</span>
    </div>
  )
}

function Avatar({ size = "md" }: { size?: "sm" | "md" | "lg" }) {
  return (
    <div
      className={cx(
        "grid shrink-0 place-items-center overflow-hidden rounded-full border-2 border-[#46e2bd] bg-[#f4d5bd]",
        size === "sm" && "h-9 w-9",
        size === "md" && "h-11 w-11",
        size === "lg" && "h-28 w-28 border-4",
      )}
    >
      <img src="/placeholder-user.jpg" alt="Alex Rivera avatar" className="h-full w-full object-cover" />
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
        "inline-flex h-14 items-center justify-center gap-2 rounded-full px-7 text-sm font-black uppercase tracking-wide transition active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50",
        variant === "primary" && "bg-gradient-to-r from-[#007c61] to-[#48e3b6] text-white shadow-[0_18px_35px_rgb(0_124_97/0.22)]",
        variant === "dark" && "bg-[#2f3335] text-white",
        variant === "ghost" && "bg-transparent text-[#007c61]",
        variant === "light" && "bg-white text-[#2f3335] shadow-sm",
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
    <header className="sticky top-0 z-30 flex h-[72px] items-center justify-between border-b border-[#e7ebeb] bg-[#f7f9f9]/95 px-6 backdrop-blur lg:hidden">
      <div className="flex min-w-0 items-center gap-3">
        {back ? (
          <button type="button" onClick={onBack} className="grid h-9 w-9 place-items-center rounded-full text-[#25292b]">
            <ArrowLeft className="h-5 w-5" />
          </button>
        ) : (
          <MapPin className="h-5 w-5 text-[#10c99d]" />
        )}
        <span className={cx("truncate font-extrabold", brand && "italic tracking-[-0.04em]")}>{title ?? (brand ? "SPORTCATION" : "Jakarta")}</span>
      </div>
      <div className="flex items-center gap-3">
        {onBell && (
          <button type="button" onClick={onBell} className="grid h-9 w-9 place-items-center rounded-full text-[#777c80]">
            <Bell className="h-5 w-5" />
          </button>
        )}
        <Avatar size="sm" />
      </div>
    </header>
  )
}

function DesktopTopBar({ onNavigate }: { onNavigate: (view: View) => void }) {
  return (
    <header className="sticky top-0 z-20 hidden h-20 items-center justify-between border-b border-white/70 bg-[#f3f6f6]/90 px-8 backdrop-blur lg:flex">
      <div>
        <p className="text-xs font-black uppercase tracking-[0.28em] text-[#007c61]">Jakarta, ID</p>
        <h1 className="text-xl font-black tracking-[-0.04em]">Responsive Venue Booking Web App</h1>
      </div>
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={() => onNavigate("explore")}
          className="flex h-12 w-[320px] items-center gap-3 rounded-full bg-white px-5 text-sm font-semibold text-[#8b9093] shadow-sm"
        >
          <Search className="h-5 w-5" />
          Search venues, sports, or areas...
        </button>
        <button type="button" onClick={() => onNavigate("notifications")} className="grid h-12 w-12 place-items-center rounded-full bg-white shadow-sm">
          <Bell className="h-5 w-5 text-[#5c6266]" />
        </button>
        <button type="button" onClick={() => onNavigate("profile")}>
          <Avatar size="md" />
        </button>
      </div>
    </header>
  )
}

function DesktopSidebar({ active, onNavigate }: { active: View; onNavigate: (view: View) => void }) {
  return (
    <aside className="fixed inset-y-0 left-0 z-30 hidden w-[280px] border-r border-white/80 bg-white/95 p-6 lg:block">
      <button type="button" onClick={() => onNavigate("home")} className="mb-10">
        <Brand compact />
      </button>
      <nav className="space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon
          const selected = active === item.view
          return (
            <button
              key={item.view}
              type="button"
              onClick={() => onNavigate(item.view)}
              className={cx(
                "flex h-13 w-full items-center gap-3 rounded-2xl px-4 text-sm font-black uppercase tracking-[0.14em] transition",
                selected ? "bg-[#e7fff7] text-[#007c61]" : "text-[#8a8f94] hover:bg-[#f2f5f5] hover:text-[#2c3133]",
              )}
            >
              <Icon className="h-5 w-5" />
              {item.label}
            </button>
          )
        })}
      </nav>
      <div className="mt-8 rounded-[28px] bg-[#071413] p-5 text-white">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-[#49e7ba]">Prime access</p>
        <h3 className="mt-3 text-2xl font-black tracking-[-0.05em]">The Exchange.</h3>
        <p className="mt-2 text-sm text-white/65">Bid for premium court times and resell locked bookings.</p>
        <AppButton onClick={() => onNavigate("auction")} className="mt-5 h-11 w-full text-xs">
          Open Auction
        </AppButton>
      </div>
      <div className="mt-4 grid gap-3">
        <a href="/merchant" className="rounded-2xl bg-[#eafff8] px-4 py-3 text-sm font-black text-[#007c61]">
          Merchant Studio
        </a>
        <a href="/admin" className="rounded-2xl bg-[#edf1f1] px-4 py-3 text-sm font-black text-[#5f666a]">
          Admin Command
        </a>
      </div>
    </aside>
  )
}

function BottomNav({ active, onNavigate }: { active: View; onNavigate: (view: View) => void }) {
  return (
    <nav className="mx-auto mt-8 flex h-[84px] max-w-[430px] items-center justify-around rounded-t-[24px] bg-white px-3 shadow-[0_-18px_45px_rgb(31_174_139/0.12)] lg:hidden">
      {navItems.map((item) => {
        const Icon = item.icon
        const selected = active === item.view || (item.view === "profile" && ["settings", "notifications", "help", "privacy"].includes(active))
        return (
          <button
            key={item.view}
            type="button"
            onClick={() => onNavigate(item.view)}
            className={cx("flex min-w-0 flex-col items-center gap-1 rounded-2xl px-3 py-2 text-[10px] font-black uppercase tracking-[0.14em]", selected ? "bg-[#eafff8] text-[#00a983]" : "text-[#a2a6ad]")}
            aria-current={selected ? "page" : undefined}
          >
            <Icon className="h-5 w-5" />
            <span>{item.label}</span>
            {selected && <span className="h-1 w-1 rounded-full bg-current" />}
          </button>
        )
      })}
    </nav>
  )
}

function OnboardingScreen({ onLogin, onDemo }: { onLogin: () => void; onDemo: () => void }) {
  return (
    <main className="min-h-screen bg-[#071413] lg:grid lg:grid-cols-[minmax(420px,0.95fr)_1.05fr]">
      <section
        className="relative min-h-screen overflow-hidden bg-cover bg-center text-white"
        style={{ backgroundImage: "url('/padel-court-modern.jpg')" }}
      >
        <div className="absolute inset-0 bg-gradient-to-b from-black/25 via-black/35 to-[#071413]/90" />
        <div className="relative flex min-h-screen flex-col px-8 py-10 lg:px-14">
          <Brand inverse />
          <div className="mt-20 max-w-[420px] lg:mt-28">
            <h1 className="text-5xl font-black leading-[0.98] tracking-[-0.07em] lg:text-7xl">
              Sport Venue <span className="text-[#20d9ad]">Booking App</span>
            </h1>
            <p className="mt-6 text-xl font-medium leading-relaxed text-white/82">Easy booking, real-time slots, resell & auction</p>
            <button
              type="button"
              onClick={onLogin}
              className="mt-12 flex h-16 w-full max-w-[330px] items-center justify-center gap-3 rounded-full border border-white/40 bg-white/30 px-8 text-base font-black text-white shadow-2xl backdrop-blur"
            >
              <Search className="h-5 w-5 text-[#22ddae]" />
              Login via Email/No HP
            </button>
          </div>
          <div className="mt-auto flex items-end justify-between gap-5 pb-8">
            <div className="flex -space-x-3">
              {[0, 1, 2].map((item) => (
                <div key={item} className="h-10 w-10 rounded-full border-2 border-white bg-[#d9eee8]" />
              ))}
              <div className="grid h-10 w-10 place-items-center rounded-full bg-[#0dd8aa] text-xs font-black text-[#073b32]">+12k</div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-black uppercase tracking-[0.35em] text-white/55">Trusted by</p>
              <p className="mt-1 text-base font-black">450+ Sports Venue</p>
            </div>
          </div>
        </div>
      </section>
      <section className="hidden place-items-center bg-[#f3f6f6] p-10 lg:grid">
        <div className="w-full max-w-[560px] rounded-[36px] bg-white/80 p-10 shadow-[0_35px_90px_rgb(0_0_0/0.08)]">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#007c61]">Web responsive build</p>
          <h2 className="mt-5 text-5xl font-black leading-[1] tracking-[-0.07em]">Built from the Figma screen set.</h2>
          <p className="mt-5 text-lg leading-relaxed text-[#687073]">
            Mobile keeps the app-like bottom navigation. Desktop expands into a web booking dashboard with sidebar navigation and wider content.
          </p>
          <div className="mt-8 grid grid-cols-3 gap-3">
            {["Explore", "Checkout", "Auction"].map((item) => (
              <div key={item} className="rounded-3xl bg-[#f3f6f6] p-5 text-center text-sm font-black uppercase tracking-wide text-[#007c61]">
                {item}
              </div>
            ))}
          </div>
          <AppButton onClick={onDemo} className="mt-8 w-full">
            Enter Web App
          </AppButton>
        </div>
      </section>
    </main>
  )
}

function LoginScreen({ onBack, onSubmit }: { onBack: () => void; onSubmit: () => void }) {
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
          <button type="button" onClick={onSubmit} className="h-14 rounded-2xl bg-white text-sm font-black shadow-sm">Google</button>
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
  flashDeals,
  catalogStatus,
  catalogError,
  onNavigate,
  onVenue,
}: {
  venues: Venue[]
  flashDeals: FlashDeal[]
  catalogStatus: "idle" | "loading" | "error"
  catalogError: string
  onNavigate: (view: View) => void
  onVenue: (id: string) => void
}) {
  const recommended = venues[0]

  return (
    <>
      <MobileTopBar title="Jakarta" brand={false} onBell={() => onNavigate("notifications")} />
      <div className="px-6 py-8 lg:px-0">
        <div className="lg:grid lg:grid-cols-[minmax(0,1.1fr)_420px] lg:gap-8">
          <div>
            <button
              type="button"
              onClick={() => onNavigate("explore")}
              className="flex h-14 w-full items-center gap-4 rounded-full bg-[#eceff0] px-5 text-left text-base font-semibold text-[#9ba0a4] lg:max-w-xl"
            >
              <Search className="h-6 w-6 text-[#777e83]" />
              Cari venue olahraga...
            </button>

            <button
              type="button"
              onClick={() => onNavigate("flash")}
              className="mt-7 w-full overflow-hidden rounded-[28px] bg-[#006b56] p-6 text-left text-white shadow-sm lg:min-h-[260px] lg:p-8"
            >
              <div className="max-w-[360px]">
                <div className="mb-6 rounded-full bg-[#ffc107] px-4 py-1 text-xs font-black uppercase tracking-wide text-[#33403c]">
                  <Zap className="mr-1 inline h-3.5 w-3.5" />
                  Limited time
                </div>
                <h2 className="text-[28px] font-black leading-tight tracking-[-0.05em] lg:text-5xl">ULTRA FLASH SALE GET UP TO 70% OFF</h2>
                <p className="mt-4 text-base font-semibold text-white/70">Book your premier courts today.</p>
              </div>
            </button>

            <div className="mt-8 grid grid-cols-3 gap-4 lg:grid-cols-6">
              {quickActions.map((action) => {
                const Icon = action.icon
                return (
                  <button
                    key={action.label}
                    type="button"
                    onClick={() => onNavigate(action.view)}
                    className="grid min-h-[98px] place-items-center rounded-[24px] bg-white p-4 text-center shadow-sm transition hover:-translate-y-0.5 hover:shadow-md"
                  >
                    <span className={cx("grid h-12 w-12 place-items-center rounded-2xl", action.hot ? "bg-[#dcfff6] text-[#007c61]" : "bg-[#eceff0] text-[#7b8085]")}>
                      <Icon className="h-6 w-6" />
                    </span>
                    <span className="mt-3 text-[11px] font-black uppercase text-[#62686d]">{action.label}</span>
                  </button>
                )
              })}
            </div>

            <SectionTitle title="Flash Sale" subtitle="Snatched these deals before they're gone" action="See all" onAction={() => onNavigate("flash")} />
            <div className="sportcation-scrollbar -mx-6 flex snap-x gap-4 overflow-x-auto px-6 lg:mx-0 lg:grid lg:grid-cols-2 lg:overflow-visible lg:px-0">
              {catalogStatus === "loading" && <CatalogInlineState title="Loading venues" message="Mengambil katalog terbaru dari database." />}
              {catalogStatus === "error" && <CatalogInlineState title="Catalog unavailable" message={catalogError || "Gagal memuat katalog."} />}
              {catalogStatus !== "error" && flashDeals.slice(0, 2).map((deal) => (
                <DealCard key={deal.id + deal.name} deal={deal} onClick={() => onVenue(deal.id)} />
              ))}
              {catalogStatus !== "loading" && catalogStatus !== "error" && flashDeals.length === 0 && (
                <CatalogInlineState title="No public venues" message="Belum ada venue published untuk ditampilkan." />
              )}
            </div>
          </div>

          <aside className="mt-10 lg:mt-0">
            <SectionTitle title="Recommended" subtitle="Selected for your lifestyle" />
            {recommended ? (
              <RecommendedCard venue={recommended} onBook={() => onVenue(recommended.id)} />
            ) : (
              <CatalogInlineState title="No recommendation yet" message="Venue published akan muncul di area ini." />
            )}
            <button
              type="button"
              onClick={() => onNavigate("resell")}
              className="mt-8 ml-auto grid h-16 w-16 place-items-center rounded-full bg-[#007c61] text-white shadow-[0_18px_35px_rgb(0_124_97/0.28)] lg:hidden"
            >
              <Plus className="h-8 w-8" />
            </button>
          </aside>
        </div>
      </div>
    </>
  )
}

function SectionTitle({ title, subtitle, action, onAction }: { title: string; subtitle?: string; action?: string; onAction?: () => void }) {
  return (
    <div className="mt-10 mb-5 flex items-end justify-between gap-4 lg:mt-12">
      <div>
        <h2 className="text-2xl font-black uppercase tracking-[-0.06em] text-[#2d3234] lg:text-3xl">{title}</h2>
        {subtitle && <p className="mt-1 text-xs font-black uppercase tracking-[0.2em] text-[#747b80]">{subtitle}</p>}
      </div>
      {action && (
        <button type="button" onClick={onAction} className="text-xs font-black uppercase tracking-[0.22em] text-[#007c61]">
          {action}
        </button>
      )}
    </div>
  )
}

function CatalogInlineState({ title, message }: { title: string; message: string }) {
  return (
    <div className="min-w-[264px] rounded-[28px] border border-dashed border-[#d9dfdf] bg-white p-8 text-center shadow-sm lg:col-span-2 lg:min-w-0">
      <Search className="mx-auto h-8 w-8 text-[#a4aaae]" />
      <h3 className="mt-4 text-lg font-black">{title}</h3>
      <p className="mt-2 text-sm font-semibold leading-relaxed text-[#777d82]">{message}</p>
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

function DealCard({ deal, onClick }: { deal: FlashDeal; onClick: () => void }) {
  return (
    <article className="min-w-[264px] snap-start overflow-hidden rounded-[28px] bg-white shadow-sm lg:min-w-0">
      <div className="relative h-40 overflow-hidden">
        <img src={deal.image} alt={deal.name} className="h-full w-full object-cover" />
        <span className="absolute left-4 top-4 rounded-lg bg-[#d71f38] px-3 py-1 text-[10px] font-black text-white">{deal.discount ?? "HOT DEAL"}</span>
        {deal.ends && <span className="absolute bottom-4 right-4 rounded-full bg-black/25 px-3 py-1 text-xs font-black text-white">{deal.ends}</span>}
      </div>
      <div className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-black tracking-[-0.04em]">{deal.name}</h3>
            <p className="mt-1 flex items-center gap-1 text-sm font-semibold text-[#777d82]">
              <MapPin className="h-4 w-4" />
              {deal.location}
            </p>
          </div>
          <span className="flex items-center gap-1 text-xs font-black text-[#786b1b]">
            <Star className="h-4 w-4 fill-current" />
            {deal.rating}
          </span>
        </div>
        <div className="mt-5 flex items-end justify-between">
          <div>
            {deal.oldPrice && <p className="text-xs font-semibold text-[#9aa0a4] line-through">{formatRp(deal.oldPrice)}</p>}
            <p className="text-xl font-black tracking-[-0.04em] text-[#007c61]">{formatRp(deal.price)}<span className="text-xs text-[#687073]">/hr</span></p>
          </div>
          <button type="button" onClick={onClick} className="grid h-11 w-11 place-items-center rounded-full bg-[#007c61] text-white">
            <ChevronRight className="h-5 w-5" />
          </button>
        </div>
      </div>
    </article>
  )
}

function RecommendedCard({ venue, onBook }: { venue: Venue; onBook: () => void }) {
  return (
    <article className="overflow-hidden rounded-[34px] bg-white shadow-sm">
      <div className="relative h-72 overflow-hidden">
        <img src={venue.image} alt={venue.name} className="h-full w-full object-cover" />
        <div className="absolute left-6 top-6 flex gap-2">
          <span className="rounded-full bg-[#49e7ba] px-4 py-1.5 text-xs font-black uppercase text-[#007c61]">Trending</span>
          <span className="rounded-full bg-white px-4 py-1.5 text-xs font-black text-[#2d3234]">
            <Star className="mr-1 inline h-3.5 w-3.5 fill-current" />
            {venue.rating}
          </span>
        </div>
      </div>
      <div className="p-8">
        <h3 className="text-3xl font-black leading-tight tracking-[-0.06em]">{venue.name}</h3>
        <p className="mt-8 text-base font-semibold leading-relaxed text-[#777d82]">{venue.description}</p>
        <div className="mt-7 flex flex-wrap gap-2">
          {venue.facilities.slice(3).map((item) => (
            <span key={item} className="rounded-full border border-[#dce1e1] px-4 py-1 text-xs font-black text-[#777d82]">
              {item}
            </span>
          ))}
        </div>
        <AppButton onClick={onBook} className="mt-8 w-full">
          Book Now
          <ChevronRight className="h-5 w-5" />
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
  return (
    <>
      <MobileTopBar title="Jakarta" brand={false} />
      <div className="px-6 py-7 lg:px-0">
        <div className="lg:grid lg:grid-cols-[340px_minmax(0,1fr)] lg:gap-8">
          <aside className="lg:sticky lg:top-28 lg:h-fit">
            <p className="text-xs font-black uppercase tracking-[0.24em] text-[#007c61]">Curated Play</p>
            <h1 className="mt-3 text-4xl font-black leading-[1.05] tracking-[-0.07em] lg:text-6xl">Find Your Next Arena.</h1>
            <div className="mt-8 flex h-14 items-center gap-3 rounded-full bg-[#eceff0] px-5">
              <Search className="h-5 w-5 text-[#747b80]" />
              <input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder="Search venues, sports, or areas..." className="min-w-0 flex-1 bg-transparent text-sm font-semibold outline-none placeholder:text-[#92989c]" />
            </div>
            <div className="sportcation-scrollbar mt-7 flex gap-3 overflow-x-auto pb-2 lg:flex-wrap lg:overflow-visible">
              {categories.map((item) => (
                <button
                  key={item}
                  type="button"
                  onClick={() => onCategoryChange(item)}
                  className={cx(
                    "h-11 shrink-0 rounded-full px-6 text-sm font-black shadow-sm",
                    category === item ? "bg-[#007c61] text-white" : "bg-white text-[#73797e]",
                  )}
                >
                  {item}
                </button>
              ))}
            </div>
          </aside>
          <section className="mt-8 grid gap-7 lg:mt-0 lg:grid-cols-2">
            {catalogStatus === "loading" ? (
              <CatalogInlineState title="Loading catalog" message="Mencari venue sesuai filter..." />
            ) : catalogStatus === "error" ? (
              <CatalogInlineState title="Catalog error" message={catalogError || "Katalog tidak dapat dimuat."} />
            ) : list.length === 0 ? (
              <div className="rounded-[28px] border border-dashed border-[#d9dfdf] bg-white p-10 text-center lg:col-span-2">
                <Search className="mx-auto h-9 w-9 text-[#a4aaae]" />
                <h2 className="mt-4 text-xl font-black">No venue found</h2>
                <p className="mt-2 text-sm font-semibold text-[#777d82]">Try another sport, venue, or Jakarta area.</p>
              </div>
            ) : (
              list.map((venue, index) => <VenueListCard key={venue.id} venue={venue} featured={index === 0} onClick={() => onVenue(venue.id)} />)
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
      <button type="button" onClick={onClick} className="relative min-h-[210px] overflow-hidden rounded-[28px] bg-[#0d1717] p-7 text-left text-white shadow-sm lg:col-span-2">
        <img src={venue.image} alt={venue.name} className="absolute inset-0 h-full w-full object-cover opacity-75" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/65 via-black/25 to-transparent" />
        <div className="relative flex min-h-[170px] flex-col justify-between">
          <div className="flex justify-between">
            <span className="rounded-full bg-[#49e7ba] px-3 py-1 text-xs font-black uppercase text-[#007c61]">Featured</span>
            <Heart className="h-6 w-6 text-white" />
          </div>
          <div className="grid grid-cols-[1fr_auto] items-end gap-4">
            <div>
              <p className="text-xs font-black text-[#49e7ba]">{venue.rating} - {venue.category} - {venue.distance}</p>
              <h3 className="mt-1 text-3xl font-black leading-tight tracking-[-0.06em]">{venue.name}</h3>
              <p className="mt-1 text-sm font-semibold text-white/70">{venue.location}</p>
            </div>
            <p className="text-right text-2xl font-black text-[#49e7ba]">{formatRp(venue.price)}<span className="block text-[10px] uppercase tracking-[0.2em] text-white/60">per hour</span></p>
          </div>
        </div>
      </button>
    )
  }

  return (
    <article className="overflow-hidden rounded-[28px] bg-white shadow-sm">
      <button type="button" onClick={onClick} className="block w-full text-left">
        <div className="relative h-72 overflow-hidden">
          <img src={venue.image} alt={venue.name} className="h-full w-full object-cover" />
          <span className="absolute right-4 top-4 grid h-10 w-10 place-items-center rounded-full bg-white/25 text-white backdrop-blur">
            <Heart className="h-5 w-5" />
          </span>
        </div>
        <div className="p-5">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-xl font-black tracking-[-0.04em]">{venue.name}</h3>
            <span className="flex items-center gap-1 text-xs font-black text-[#776814]">
              <Star className="h-4 w-4 fill-current" />
              {venue.rating}
            </span>
          </div>
          <p className="mt-2 flex items-center gap-1 text-sm font-semibold text-[#777d82]">
            <MapPin className="h-4 w-4" />
            {venue.location}
          </p>
          <div className="mt-5 flex items-center justify-between border-t border-[#edf1f1] pt-5">
            <p className="text-lg font-black text-[#007c61]">{formatRp(venue.price)} <span className="text-xs text-[#777d82]">/ hour</span></p>
            <span className="grid h-10 w-10 place-items-center rounded-full bg-[#edf1f1] text-[#2d3234]">
              <ChevronRight className="h-5 w-5" />
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
      <MobileTopBar title="SPORTCATION" back onBack={onBack} />
      <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_390px] lg:gap-8 lg:pt-8">
        <section>
          <div className="relative h-[460px] overflow-hidden lg:rounded-[34px]">
            <img src={venue.image} alt={venue.name} className="h-full w-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/15 to-transparent" />
            <div className="absolute bottom-8 left-6 right-6">
              <span className="rounded-full bg-[#49e7ba] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#007c61]">{venue.tag}</span>
              <h1 className="mt-5 max-w-[560px] text-4xl font-black leading-tight tracking-[-0.07em] text-white lg:text-6xl">{venue.name}</h1>
              <div className="mt-4 flex flex-wrap gap-4 text-sm font-bold text-white">
                <span className="text-[#49e7ba]"><Star className="mr-1 inline h-4 w-4 fill-current" /> {venue.rating} (124 reviews)</span>
                <span><MapPin className="mr-1 inline h-4 w-4" /> {venue.location}</span>
              </div>
            </div>
          </div>
          <div className="-mt-8 grid grid-cols-3 gap-4 px-6 lg:relative lg:mt-6 lg:px-0">
            {venue.facilities.slice(0, 3).map((label) => {
              const Icon = facilityIcons[label] ?? BadgeCheck
              return (
                <div key={label} className="relative grid min-h-[92px] place-items-center rounded-2xl bg-white p-4 text-center shadow-sm">
                  <Icon className="h-8 w-8 text-[#007c61]" />
                  <span className="mt-2 text-[11px] font-black uppercase tracking-wide text-[#666b70]">{label}</span>
                </div>
              )
            })}
          </div>
          <div className="px-6 py-10 lg:px-0">
            <div className="mb-6 flex items-end justify-between">
              <div>
                <h2 className="text-3xl font-black tracking-[-0.06em]">Book Schedule</h2>
                <p className="mt-1 text-sm font-semibold text-[#687073]">Select your preferred date and time</p>
              </div>
              <button type="button" className="text-sm font-black text-[#007c61]">See Calendar</button>
            </div>
            <div className="sportcation-scrollbar flex gap-3 overflow-x-auto pb-1">
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
                    className={cx("h-20 min-w-[66px] rounded-2xl text-center shadow-sm", selected || (!selectedDate && index === 0) ? "bg-[#56e8bf] text-[#007c61] ring-2 ring-[#007c61]" : "bg-[#edf1f1] text-[#2d3234]")}
                  >
                    <span className="block text-[10px] font-black uppercase">{month}</span>
                    <span className="block text-2xl font-black">{day}</span>
                    <span className="block text-xs">{label}</span>
                  </button>
                )
              })}
              {dates.length === 0 && (
                <div className="rounded-2xl bg-white px-5 py-4 text-sm font-bold text-[#687073] shadow-sm">
                  Tidak ada slot tersedia.
                </div>
              )}
            </div>
            <div className="mt-8 grid grid-cols-3 gap-4">
              {slots.map((slot) => {
                const isSelected = selectedSlot?.id === slot.id
                return (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() => onSelectSlot(slot.id)}
                    className={cx(
                      "h-18 rounded-2xl text-center text-sm font-black transition disabled:cursor-not-allowed",
                      isSelected && "bg-[#007c61] text-white ring-4 ring-white outline outline-2 outline-[#007c61]",
                      !isSelected && "bg-[#edf1f1] text-[#2d3234]",
                    )}
                  >
                    <span className="block">{slot.startTime}</span>
                    <span className={cx("mt-1 block text-[10px] font-bold", isSelected ? "text-[#56e8bf]" : "text-[#697075]")}>
                      {isSelected ? "Selected" : "Available"}
                    </span>
                  </button>
                )
              })}
            </div>
            <div className="mt-10">
              <h2 className="mb-4 flex items-center gap-2 text-xl font-black">
                <MapPin className="h-5 w-5 text-[#007c61]" />
                Location Details
              </h2>
              <div className="relative h-48 overflow-hidden rounded-3xl border-4 border-white bg-[#e8ecec] shadow-sm">
                <div className="absolute inset-0 opacity-60 [background-image:linear-gradient(90deg,#d6dddd_1px,transparent_1px),linear-gradient(#d6dddd_1px,transparent_1px)] [background-size:24px_24px]" />
                <div className="absolute left-1/2 top-1/2 grid h-16 w-16 -translate-x-1/2 -translate-y-1/2 place-items-center rounded-full bg-[#007c61] text-white ring-4 ring-white">
                  <MapPin className="h-8 w-8" />
                </div>
                <div className="absolute bottom-4 left-4 right-4 rounded-2xl bg-white p-4 text-sm font-black">{venue.location}</div>
              </div>
            </div>
          </div>
        </section>
        <aside className="mx-6 mb-8 rounded-[30px] bg-white px-6 py-5 shadow-[0_18px_40px_rgb(0_0_0/0.08)] lg:sticky lg:top-28 lg:mx-0 lg:mb-0 lg:h-fit lg:rounded-[32px] lg:p-7 lg:shadow-sm">
          <p className="text-[10px] font-black uppercase tracking-[0.22em] text-[#687073]">Total Price</p>
          <div className="mt-1 flex items-center justify-between gap-5">
            <p className="text-2xl font-black tracking-[-0.05em]"><span className="text-base text-[#007c61]">Rp</span> {(selectedSlot?.price ?? venue.price).toLocaleString("id-ID")}<span className="text-xs font-bold text-[#687073]">/hr</span></p>
            <AppButton onClick={onCheckout} disabled={!selectedSlot} className="min-w-[170px] normal-case tracking-normal">
              Book Now
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
      <MobileTopBar title="SPORTCATION" back onBack={onBack} />
      <div className="px-6 py-9 lg:px-0">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_390px] lg:gap-8">
          <section>
            <h1 className="text-6xl font-black leading-[0.98] tracking-[-0.08em] lg:text-7xl">Review & Checkout</h1>
            <p className="mt-5 max-w-md text-lg leading-relaxed text-[#687073]">Complete your booking for the ultimate padel session.</p>
            <div className="mt-10 overflow-hidden rounded-[26px] bg-white p-8 shadow-sm">
              <span className="rounded-full bg-[#49e7ba] px-4 py-2 text-xs font-black uppercase tracking-[0.12em] text-[#007c61]">Confirmed Venue</span>
              <div className="mt-8 grid gap-8 border-b border-[#e2e7e7] pb-8 lg:grid-cols-[1fr_auto]">
                <div>
                  <h2 className="text-2xl font-black tracking-[-0.04em]">{venue.name}</h2>
                  <p className="mt-1 flex max-w-[190px] items-start gap-1 text-sm font-semibold text-[#687073]">
                    <MapPin className="mt-1 h-4 w-4 shrink-0" />
                    {venue.location}
                  </p>
                </div>
                <CalendarDays className="h-7 w-7 text-[#007c61]" />
              </div>
              <div className="mt-6">
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-[#687073]">Date & Time</p>
                <p className="mt-1 text-lg font-black text-[#007c61]">{formatSlotDate(slot)} - {formatSlotWindow(slot)}</p>
              </div>
            </div>
            <div className="mt-2 h-52 overflow-hidden rounded-[24px]">
              <img src={venue.image} alt="Court 04 Premium Indoor" className="h-full w-full object-cover" />
            </div>
            <div className="mt-10">
              <p className="mb-4 text-xs font-black uppercase tracking-[0.22em] text-[#777d82]">Have a voucher?</p>
              <div className="flex gap-3">
                <div className="flex h-16 flex-1 items-center gap-3 rounded-full bg-[#edf1f1] px-5 text-sm font-semibold text-[#777d82]">
                  <Ticket className="h-5 w-5" />
                  Enter promo code
                </div>
                <AppButton variant="dark" className="h-16 min-w-[112px]">
                  Apply
                </AppButton>
              </div>
            </div>
            <div className="mt-10">
              <p className="mb-4 text-xs font-black uppercase tracking-[0.22em] text-[#777d82]">Payment Method</p>
              <div className="grid gap-3">
                {[
                  { method: "QRIS / OVO", helper: "Scan QR or use OVO balance", icon: QrCode },
                  { method: "Virtual Account", helper: "BCA, Mandiri, BNI, BRI", icon: Building2 },
                ].map((item) => {
                  const Icon = item.icon
                  const selected = paymentMethod === item.method
                  return (
                    <button key={item.method} type="button" onClick={() => onPaymentMethod(item.method)} className="flex items-center gap-4 rounded-2xl bg-white p-5 text-left shadow-sm">
                      <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#edf1f1] text-[#5f666a]">
                        <Icon className="h-6 w-6" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-base font-black">{item.method}</span>
                        <span className="block text-sm font-semibold text-[#687073]">{item.helper}</span>
                      </span>
                      <span className={cx("h-5 w-5 rounded-full border", selected ? "border-[#007c61] bg-[#007c61] ring-4 ring-[#e1fff5]" : "border-[#a5abaf]")} />
                    </button>
                  )
                })}
              </div>
            </div>
          </section>
          <aside className="mt-10 rounded-[26px] bg-[#edf1f1] p-8 lg:sticky lg:top-28 lg:mt-0 lg:h-fit">
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#687073]">Payment Summary</p>
            <div className="mt-7 space-y-5 text-base">
              <div className="flex justify-between gap-4">
                <span className="text-[#687073]">Court Fee</span>
                <strong>{formatRp(slotPrice)}</strong>
              </div>
              <div className="flex justify-between gap-4">
                <span className="text-[#687073]">Service Fee</span>
                <strong>{formatRp(serviceFee)}</strong>
              </div>
              <div className="flex justify-between gap-4 border-t border-[#dce2e2] pt-5 text-xl font-black">
                <span>Total Payment</span>
                <span className="text-[#007c61]">{formatRp(total)}</span>
              </div>
            </div>
            <p className="mt-10 flex items-center justify-center gap-2 text-[10px] font-black uppercase tracking-[0.2em] text-[#7b8286]">
              <ShieldCheck className="h-4 w-4" />
              Secure 256-bit encrypted payment
            </p>
            {mutationError && (
              <div role="alert" className="mt-6 rounded-2xl border border-[#ffd0d6] bg-[#fff0f2] p-4 text-sm font-bold leading-relaxed text-[#c92034]">
                {mutationError}
              </div>
            )}
            <AppButton onClick={onPay} disabled={!slot || mutationStatus === "loading"} className="mt-8 h-16 w-full">
              <QrCode className="h-5 w-5" />
              {mutationStatus === "loading" ? "Creating Booking..." : "Pay Now"}
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
  onPaid,
  onFailed,
}: {
  venue: Venue
  slot?: Slot
  booking: CustomerBooking | null
  mutationStatus: "idle" | "loading"
  mutationError: string
  onBack: () => void
  onPaid: () => void
  onFailed: () => void
}) {
  const total = booking?.totalAmount ?? (slot?.price ?? venue.price) + 15000
  const venueName = booking?.venue.name ?? venue.name
  const dateLabel = booking ? formatStoredDate(booking.item.slotDate) : formatSlotDate(slot)
  const timeLabel = booking ? formatBookingWindow(booking) : formatSlotWindow(slot)
  const methodLabel = booking ? paymentMethodLabel(booking.payment.method) : "QRIS / OVO"

  return (
    <div>
      <MobileTopBar title={`Pembayaran ${methodLabel}`} back onBack={onBack} brand={false} />
      <div className="px-6 py-8 lg:grid lg:grid-cols-[390px_minmax(0,1fr)] lg:gap-10 lg:px-0">
        <section className="rounded-[28px] bg-white p-7 shadow-sm">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#687073]">Venue & Jadwal</p>
          <div className="mt-3 flex items-start justify-between gap-4">
            <div>
              <h1 className="text-2xl font-black">{venueName}</h1>
              {booking && <p className="mt-2 text-xs font-black uppercase tracking-[0.16em] text-[#007c61]">{booking.bookingCode}</p>}
              <p className="mt-4 flex flex-wrap gap-4 text-sm font-semibold text-[#5f666a]">
                <span><CalendarDays className="mr-1 inline h-4 w-4" /> {dateLabel}</span>
                <span><Clock className="mr-1 inline h-4 w-4" /> {timeLabel}</span>
              </p>
            </div>
            <span className="grid h-12 w-12 place-items-center rounded-xl bg-[#dcfff6] text-[#007c61]">
              <QrCode className="h-7 w-7" />
            </span>
          </div>
        </section>
        <section className="mt-8 rounded-[32px] bg-[#e9eeee] p-5 lg:mt-0">
          <div className="rounded-[28px] bg-white p-7 text-center">
            <div className="mx-auto grid h-64 max-w-[260px] place-items-center rounded-3xl border-4 border-dashed border-[#d4dddd] bg-[#14383d] text-white">
              <div>
                <QrCode className="mx-auto h-24 w-24" />
                <p className="mt-3 text-sm font-black">QRIS</p>
              </div>
            </div>
            <p className="mx-auto mt-7 max-w-[260px] text-base font-semibold leading-relaxed text-[#687073]">Buka aplikasi e-wallet atau bank favoritmu, lalu scan QR di atas.</p>
            <p className="mt-5 text-sm font-black text-[#007c61]">Status: {booking ? booking.payment.status : "pending"}</p>
            <p className="mt-8 text-xs font-black uppercase tracking-[0.22em] text-[#777d82]">Total Pembayaran</p>
            <p className="mt-2 text-4xl font-black tracking-[-0.05em]">{formatRp(total)}</p>
            <div className="mx-auto mt-6 max-w-[260px] rounded-full bg-[#ffe8ea] px-5 py-4 text-sm font-black text-[#c91f31]">
              <Timer className="mr-2 inline h-4 w-4" />
              Berlaku hingga 14:55 (0h 14m)
            </div>
          </div>
          <button type="button" className="mt-6 flex w-full items-center justify-center gap-2 text-base font-black text-[#007c61]">
            <Download className="h-5 w-5" />
            Simpan QR Code
          </button>
        </section>
        <div className="mt-12 grid gap-3 lg:col-start-2 lg:grid-cols-2">
          {mutationError && (
            <div role="alert" className="rounded-2xl border border-[#ffd0d6] bg-[#fff0f2] p-4 text-sm font-bold leading-relaxed text-[#c92034] lg:col-span-2">
              {mutationError}
            </div>
          )}
          <AppButton onClick={onPaid} disabled={!booking || mutationStatus === "loading" || booking.payment.status !== "pending"} className="w-full">
            {mutationStatus === "loading" ? "Memproses..." : "Selesai membayar"}
          </AppButton>
          <AppButton onClick={onFailed} disabled={!booking || mutationStatus === "loading" || booking.payment.status !== "pending"} variant="dark" className="w-full">
            Simulasi gagal
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

function AuctionScreen({ onNavigate }: { onNavigate: (view: View) => void }) {
  const auctions = [
    { title: "Clay Court - Court #4", club: "Tennis - Real Madrid Club", price: 2000000, ends: "Ends in 14m", image: "/squash-court.jpg" },
    { title: "18-Hole Green Fee (x2)", club: "Golf - La Quinta Resort", price: 2000000, ends: "Ends in 2h 05m", image: "/golf-course-green.png" },
  ]

  return (
    <>
      <MobileTopBar title="Jakarta, ID" brand={false} />
      <div className="px-6 py-7 lg:px-0">
        <div className="lg:grid lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-8">
          <section>
            <span className="rounded-lg bg-[#49e7ba] px-4 py-2 text-xs font-black uppercase tracking-[0.16em] text-[#007c61]">Prime Access</span>
            <h1 className="mt-5 text-5xl font-black tracking-[-0.08em] lg:text-7xl">The Exchange.</h1>
            <p className="mt-4 max-w-md text-lg font-semibold text-[#687073]">Bid for premium court times or explore the secondary market.</p>
            <div className="mt-9 flex items-end gap-10">
              <div>
                <h2 className="text-center text-2xl font-black leading-tight">Live<br />Auction</h2>
                <span className="mt-2 block h-1 rounded-full bg-[#007c61]" />
              </div>
              <span className="mb-7 h-2 w-2 rounded-full bg-[#c92034]" />
            </div>
            <button type="button" onClick={() => onNavigate("resell")} className="mt-8 rounded-full bg-[#e8eeee] px-7 py-3 text-sm font-black text-[#697075]">My Auction</button>
            <article className="relative mt-9 min-h-[340px] overflow-hidden rounded-[26px] bg-black p-6 text-white">
              <img src="/auction-bidding-mobile-interface.jpg" alt="Center Court prime time slot" className="absolute inset-0 h-full w-full object-cover opacity-75" />
              <div className="absolute inset-0 bg-gradient-to-br from-black/80 via-black/30 to-black/50" />
              <div className="relative flex h-full min-h-[292px] flex-col justify-between">
                <div className="flex gap-2">
                  <span className="rounded-full bg-[#d71f38] px-3 py-1 text-[10px] font-black uppercase">Live Now</span>
                  <span className="rounded-full bg-white/20 px-3 py-1 text-[10px] font-black uppercase">Padel Pro Center</span>
                </div>
                <div>
                  <h2 className="text-3xl font-black leading-tight tracking-[-0.06em]">Center Court - Prime Time Slot</h2>
                  <p className="mt-3 text-xs font-black uppercase tracking-[0.18em] text-white/60">Current Bid</p>
                  <div className="mt-1 flex items-end justify-between gap-4">
                    <p className="text-4xl font-black leading-none tracking-[-0.06em] text-[#49e7ba]">Rp<br />1.450.000</p>
                    <button type="button" className="grid h-28 w-28 place-items-center rounded-full bg-[#49e7ba] text-center text-base font-black text-[#064236]">
                      Place<br />Bid
                    </button>
                  </div>
                </div>
              </div>
            </article>
          </section>
          <aside className="mt-6 lg:mt-0">
            <div className="rounded-[24px] bg-[#edf1f1] p-5">
              <h3 className="text-lg font-black">Your Bids</h3>
              <div className="mt-5 flex items-center justify-between gap-3">
                <span className="grid h-11 w-11 place-items-center rounded-xl bg-[#dcfff6] text-[#007c61]"><Gavel className="h-6 w-6" /></span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-black">Clay Court #4</p>
                  <p className="text-[10px] font-black uppercase text-[#c92034]">Outbid</p>
                </div>
                <strong className="text-sm">Rp 120.000</strong>
              </div>
              <AppButton variant="dark" className="mt-5 h-11 w-full text-xs">View Wallet</AppButton>
            </div>
            <div className="mt-6 grid gap-6">
              {auctions.map((auction) => (
                <article key={auction.title} className="overflow-hidden rounded-[22px] bg-white shadow-sm">
                  <div className="relative h-44 overflow-hidden">
                    <img src={auction.image} alt={auction.title} className="h-full w-full object-cover" />
                    <span className="absolute right-3 top-3 rounded-lg bg-white px-3 py-1 text-[10px] font-black">{auction.ends}</span>
                  </div>
                  <div className="p-5">
                    <p className="text-[10px] font-black uppercase tracking-[0.14em] text-[#007c61]">{auction.club}</p>
                    <h3 className="mt-2 text-xl font-black tracking-[-0.04em]">{auction.title}</h3>
                    <div className="mt-5 flex items-end justify-between border-t border-[#edf1f1] pt-5">
                      <div>
                        <p className="text-xs font-semibold text-[#777d82]">Starting Price</p>
                        <p className="text-xl font-black">{formatRp(auction.price)}</p>
                      </div>
                      <span className="grid h-11 w-11 place-items-center rounded-full bg-[#eef2f2] text-[#007c61]"><Gavel className="h-5 w-5" /></span>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </aside>
        </div>
      </div>
    </>
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
      <MobileTopBar title="SPORTCATION" brand />
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
                    <button type="button" onClick={() => onNavigate("resell")} className="grid h-12 w-12 place-items-center rounded-full bg-[#edf1f1]">
                      <Share2 className="h-5 w-5" />
                    </button>
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

function NotificationsScreen({ onBack }: { onBack: () => void }) {
  const items = [
    { title: "Auction Outbid", body: "Someone just raised the stakes for the Pro Surfer Suite in Bali. Act fast to reclaim your lead!", tone: "red", icon: Gavel, time: "2M AGO" },
    { title: "Booking Confirmed", body: "Your session at The Kinetic Lab is locked in for Friday at 09:00. Get ready to move.", tone: "green", icon: BadgeCheck, time: "1H AGO" },
    { title: "Flash Sale Alert", body: "40% OFF all mountain biking excursions this weekend. Use code VELOCITY40.", tone: "yellow", icon: Zap, time: "4H AGO" },
  ]
  return (
    <>
      <MobileTopBar title="Notifications" back onBack={onBack} onBell={() => undefined} brand={false} />
      <div className="px-6 py-8 lg:px-0">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-[#687073]">Activity Feed</p>
            <h1 className="mt-3 text-4xl font-black tracking-[-0.07em]">Updates</h1>
          </div>
          <button type="button" className="text-sm font-black text-[#007c61]">Mark all as read</button>
        </div>
        <div className="mt-8 grid gap-5 lg:grid-cols-3">
          {items.map((item) => {
            const Icon = item.icon
            return (
              <article key={item.title} className={cx("rounded-[22px] bg-white p-6 shadow-sm", item.tone === "red" && "border-l-4 border-[#c92034]", item.tone === "green" && "border-l-4 border-[#007c61]", item.tone === "yellow" && "border-l-4 border-[#8a6f00]")}>
                <div className="flex items-start gap-5">
                  <span className={cx("grid h-14 w-14 shrink-0 place-items-center rounded-full", item.tone === "red" && "bg-[#ffe0e5] text-[#c92034]", item.tone === "green" && "bg-[#dcfff6] text-[#007c61]", item.tone === "yellow" && "bg-[#fff2c9] text-[#8a6f00]")}>
                    <Icon className="h-6 w-6" />
                  </span>
                  <div>
                    <div className="flex items-start justify-between gap-4">
                      <h2 className="text-lg font-black">{item.title}</h2>
                      <span className="text-[10px] font-black text-[#777d82]">{item.time}</span>
                    </div>
                    <p className="mt-1 text-base font-semibold leading-relaxed text-[#687073]">{item.body}</p>
                    {item.title === "Auction Outbid" && <AppButton className="mt-5 h-11 text-xs">Rebid Now</AppButton>}
                  </div>
                </div>
              </article>
            )
          })}
        </div>
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
      </div>
    </>
  )
}

function ProfileScreen({ onNavigate }: { onNavigate: (view: View) => void }) {
  const menu = [
    { label: "Payment Methods", view: "checkout" as View, icon: Wallet },
    { label: "My Auctions", view: "auction" as View, icon: Gavel, badge: "2 Active" },
    { label: "Notifications", view: "notifications" as View, icon: Bell },
    { label: "Help Center", view: "help" as View, icon: HelpCircle },
    { label: "Settings", view: "settings" as View, icon: Settings },
  ]
  return (
    <>
      <MobileTopBar title="Jakarta ID" brand={false} />
      <div className="px-6 py-7 text-center lg:px-0">
        <div className="mx-auto max-w-4xl lg:grid lg:grid-cols-[320px_minmax(0,1fr)] lg:gap-8 lg:text-left">
          <section className="lg:rounded-[32px] lg:bg-white lg:p-8 lg:shadow-sm">
            <div className="relative mx-auto w-fit">
              <Avatar size="lg" />
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 rounded-full bg-[#007c61] px-5 py-1 text-xs font-black uppercase text-white">Pro</span>
            </div>
            <h1 className="mt-7 text-3xl font-black tracking-[-0.06em] lg:text-center">Alex Rivera</h1>
            <p className="mt-1 text-lg font-semibold text-[#687073] lg:text-center">alex.rivera@sportcation.com</p>
            <div className="mt-9 grid grid-cols-3 gap-3">
              {[
                ["24", "Bookings"],
                ["12", "Reviews"],
                ["8.4k", "Points"],
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
      </div>
    </>
  )
}

function SettingsScreen({
  onNavigate,
  darkMode,
  onDarkMode,
  pushEnabled,
  onPushEnabled,
  biometricEnabled,
  onBiometricEnabled,
}: {
  onNavigate: (view: View) => void
  darkMode: boolean
  onDarkMode: (value: boolean) => void
  pushEnabled: boolean
  onPushEnabled: (value: boolean) => void
  biometricEnabled: boolean
  onBiometricEnabled: (value: boolean) => void
}) {
  return (
    <>
      <MobileTopBar title="SPORTCATION" brand />
      <div className="px-6 py-7 lg:px-0">
        <h1 className="text-4xl font-black tracking-[-0.07em]">Settings</h1>
        <p className="mt-2 text-base font-semibold text-[#687073]">Manage your elite sport vacation experience</p>
        <div className="mt-9 grid gap-8 lg:grid-cols-2">
          <SettingsGroup title="Account" meta="Priority">
            <SettingsRow icon={User} title="Personal Info" subtitle="Name, Email, Phone" />
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

function FlashSaleScreen({ deals, onVenue }: { deals: FlashDeal[]; onVenue: (id: string) => void }) {
  return (
    <>
      <MobileTopBar title="Jakarta, ID" brand={false} />
      <div className="px-6 py-7 lg:px-0">
        <div className="overflow-hidden rounded-[28px] bg-[#061313] p-7 text-white lg:min-h-[240px]">
          <span className="rounded-full bg-[#49e7ba] px-4 py-1 text-[10px] font-black uppercase tracking-[0.16em] text-[#007c61]">Limited time only</span>
          <h1 className="mt-6 text-4xl font-black leading-tight tracking-[-0.07em]">FLASHSALE <span className="text-[#49e7ba]">GILA-GILAAN!</span></h1>
          <p className="mt-4 max-w-lg text-base font-semibold leading-relaxed text-white/72">Nikmati potongan harga hingga 60% untuk venue olahraga premium di Jakarta.</p>
        </div>
        <div className="mt-7 flex gap-3">
          {["All Sports", "Badminton", "Futsal"].map((item, index) => (
            <button key={item} type="button" className={cx("h-11 rounded-full px-6 text-sm font-black", index === 0 ? "bg-[#071413] text-white" : "bg-[#e8eeee] text-[#71777b]")}>
              {item}
            </button>
          ))}
        </div>
        <div className="mt-8 grid gap-7 lg:grid-cols-3">
          {deals.map((deal) => (
            <DealCard key={deal.name} deal={deal} onClick={() => onVenue(deal.id)} />
          ))}
          {deals.length === 0 && <CatalogInlineState title="No deals yet" message="Flash sale akan muncul dari venue published." />}
        </div>
      </div>
    </>
  )
}

function ResellScreen({ onBack, onPublish }: { onBack: () => void; onPublish: () => void }) {
  const salePrice = 450000
  const fee = 22500
  return (
    <div>
      <MobileTopBar title="Jual Slot Booking" back onBack={onBack} brand={false} />
      <div className="px-6 py-8 lg:mx-auto lg:max-w-3xl lg:px-0">
        <h1 className="mb-6 flex items-center gap-3 text-xl font-black"><span className="h-1 w-8 rounded-full bg-[#007c61]" /> Rincian Slot</h1>
        <section className="rounded-[22px] bg-white p-6 shadow-sm">
          <div className="grid grid-cols-[1fr_84px] gap-5">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#687073]">Tempat & Jadwal</p>
              <h2 className="mt-2 text-2xl font-black">Padel Arena</h2>
              <p className="mt-2 flex flex-wrap gap-4 font-semibold">
                <span><CalendarDays className="mr-1 inline h-4 w-4 text-[#007c61]" /> Kamis, 24 Okt</span>
                <span><Clock className="mr-1 inline h-4 w-4 text-[#007c61]" /> 10:00 - 11:00</span>
              </p>
            </div>
            <img src="/padel-court-modern.jpg" alt="Padel Arena slot" className="h-20 w-20 rounded-2xl object-cover" />
          </div>
          <div className="mt-6 grid grid-cols-2 border-t border-dashed border-[#dce2e2] pt-5">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#687073]">Harga Asli</p>
              <p className="text-xl font-black">Rp 350.000</p>
            </div>
            <div>
              <p className="text-xs font-black uppercase tracking-[0.18em] text-[#687073]">Status</p>
              <p className="font-black"><span className="mr-1 inline-block h-2 w-2 rounded-full bg-[#1dbb84]" /> Terkonfirmasi</p>
            </div>
          </div>
        </section>
        <h2 className="mt-10 mb-6 flex items-center gap-3 text-xl font-black"><span className="h-1 w-8 rounded-full bg-[#007c61]" /> Pengaturan Harga</h2>
        <label className="text-xs font-black uppercase tracking-[0.22em] text-[#687073]">Harga Jual (Rp)</label>
        <div className="mt-3 flex h-16 items-center gap-4 rounded-2xl bg-[#e9eeee] px-5 text-2xl font-black">
          <span>Rp</span>
          <span>{salePrice.toLocaleString("id-ID")}</span>
        </div>
        <p className="mt-3 text-xs font-semibold text-[#5f666a]"><BadgeCheck className="mr-1 inline h-4 w-4 text-[#007c61]" /> Maksimal markup: <span className="text-[#007c61]">Rp 500.000</span> (Batas komunitas)</p>
        <div className="mt-6 flex items-center gap-4 rounded-2xl bg-white p-4 shadow-sm">
          <span className="grid h-12 w-12 place-items-center rounded-xl bg-[#dcfff6] text-[#007c61]"><Banknote className="h-6 w-6" /></span>
          <span className="min-w-0 flex-1">
            <span className="block font-black">Nego Aktif</span>
            <span className="text-sm font-semibold text-[#687073]">Pembeli bisa menawar harga</span>
          </span>
          <span className="relative h-7 w-12 rounded-full bg-[#007c61]"><span className="absolute left-6 top-1 h-5 w-5 rounded-full bg-white" /></span>
        </div>
        <section className="mt-8 rounded-[24px] bg-[#e9eeee] p-6">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-[#687073]">Ringkasan Pendapatan</p>
          <div className="mt-6 space-y-4">
            <div className="flex justify-between"><span className="text-[#687073]">Harga Jual</span><strong>{formatRp(salePrice)}</strong></div>
            <div className="flex justify-between"><span className="text-[#687073]">Fee Platform <span className="rounded bg-[#49e7ba] px-2 py-0.5 text-xs font-black text-[#007c61]">5%</span></span><strong className="text-[#c41226]">- {formatRp(fee)}</strong></div>
            <div className="flex justify-between border-t border-[#d5dddd] pt-4 text-xl font-black"><span>Total Diterima</span><span className="text-2xl text-[#007c61]">{formatRp(salePrice - fee)}</span></div>
          </div>
        </section>
        <p className="mx-auto mt-8 max-w-md text-center text-xs leading-relaxed text-[#687073]">
          Dengan mempublikasikan, Anda menyetujui Syarat & Ketentuan Resell KINETIC. Saldo akan diteruskan setelah pembeli menyelesaikan sesi.
        </p>
        <AppButton onClick={onPublish} className="mt-8 h-18 w-full normal-case tracking-normal">
          Publish ke My Auction
        </AppButton>
      </div>
    </div>
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
            { title: "Resell & Auction", body: "How to list tickets or bid on premium slots.", icon: Gavel },
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
