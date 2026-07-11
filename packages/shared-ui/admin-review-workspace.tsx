"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import type { ReactNode } from "react"
import {
  AlertCircle,
  BadgeCheck,
  Building2,
  CalendarClock,
  CheckCircle2,
  CreditCard,
  Database,
  LoaderCircle,
  ReceiptText,
  RefreshCw,
  Search,
  ShieldCheck,
  Ticket,
  User,
  type LucideIcon,
} from "lucide-react"
import type { AdminBookingReview, AdminBookingStatus, AdminPaymentReview, AdminPaymentStatus } from "@/lib/admin-review/types"

type Notice = { tone: "success" | "error"; message: string } | null
type BookingTab = "all" | AdminBookingStatus
type PaymentTab = "all" | AdminPaymentStatus

const bookingTabs: Array<{ id: BookingTab; label: string }> = [
  { id: "all", label: "All" },
  { id: "pending_payment", label: "Pending" },
  { id: "confirmed", label: "Confirmed" },
  { id: "checked_in", label: "Checked in" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
  { id: "refunded", label: "Refunded" },
]

const paymentTabs: Array<{ id: PaymentTab; label: string }> = [
  { id: "all", label: "All" },
  { id: "pending", label: "Pending" },
  { id: "paid", label: "Paid" },
  { id: "failed", label: "Failed" },
  { id: "expired", label: "Expired" },
  { id: "refunded", label: "Refunded" },
]

async function apiRequest<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      "Content-Type": "application/json",
    },
  })
  if (response.status === 401 && typeof window !== "undefined") {
    window.location.assign(`/login?next=${encodeURIComponent(window.location.pathname)}`)
    throw new Error("Session berakhir. Silakan login kembali.")
  }
  const payload = await response.json()
  if (!response.ok) {
    const details = payload.error?.details as Array<{ message?: string }> | undefined
    throw new Error(details?.[0]?.message || payload.error?.message || "Request gagal diproses.")
  }
  return payload.data as T
}

function rupiah(value: number) {
  return new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(value)
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("id-ID", {
    weekday: "short",
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(`${date}T00:00:00`))
}

function cx(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ")
}

export function AdminBookingReviewWorkspace({ onAction }: { onAction: (message: string) => void }) {
  const [bookings, setBookings] = useState<AdminBookingReview[]>([])
  const [selected, setSelected] = useState<AdminBookingReview | null>(null)
  const [query, setQuery] = useState("")
  const [tab, setTab] = useState<BookingTab>("all")
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [notice, setNotice] = useState<Notice>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiRequest<AdminBookingReview[]>("/api/admin/bookings")
      setBookings(data)
      setSelected((current) => (current ? data.find((booking) => booking.id === current.id) ?? null : current))
    } catch (error) {
      setNotice({ tone: "error", message: error instanceof Error ? error.message : "Data booking admin gagal dimuat." })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    apiRequest<AdminBookingReview[]>("/api/admin/bookings")
      .then((data) => {
        if (active) setBookings(data)
      })
      .catch((error: unknown) => {
        if (active) setNotice({ tone: "error", message: error instanceof Error ? error.message : "Data booking admin gagal dimuat." })
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase()
    return bookings
      .filter((booking) => tab === "all" || booking.status === tab)
      .filter((booking) => {
        if (!value) return true
        return [
          booking.bookingCode,
          booking.customer.name,
          booking.customer.email,
          booking.merchant.businessName,
          booking.venue.name,
          booking.item.courtName,
          booking.status,
          booking.payment.status,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(value)
      })
  }, [bookings, query, tab])

  const stats = useMemo(() => {
    const gmv = bookings.reduce((total, booking) => total + booking.totalAmount, 0)
    return [
      { label: "Platform bookings", value: String(bookings.length), helper: "All merchants" },
      { label: "Need review", value: String(bookings.filter((booking) => booking.review.needsAttention).length), helper: "Payment or booking state" },
      { label: "Completed", value: String(bookings.filter((booking) => booking.status === "completed").length), helper: "Closed sessions" },
      { label: "GMV visible", value: rupiah(gmv), helper: "Before payout ledger" },
    ]
  }, [bookings])

  async function openDetail(bookingId: string) {
    setDetailLoading(true)
    setNotice(null)
    try {
      setSelected(await apiRequest<AdminBookingReview>(`/api/admin/bookings/${bookingId}`))
      onAction("Admin booking detail loaded from persisted data")
    } catch (error) {
      setNotice({ tone: "error", message: error instanceof Error ? error.message : "Booking detail gagal dimuat." })
    } finally {
      setDetailLoading(false)
    }
  }

  return (
    <AdminReviewFrame
      eyebrow="Admin database"
      title="Admin Booking Review"
      description="Review booking states across all merchants from persisted booking, payment, venue, slot, and customer tables."
      actionLabel="Refresh Bookings"
      onRefresh={() => void load()}
      query={query}
      onQueryChange={setQuery}
      queryPlaceholder="Search code, customer, merchant, venue..."
      notice={notice}
      stats={stats}
      tabs={bookingTabs}
      activeTab={tab}
      onTabChange={(value) => setTab(value as BookingTab)}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
        <section className="overflow-hidden rounded-3xl bg-white shadow-sm">
          {loading ? (
            <StateBlock icon={LoaderCircle} spin title="Loading admin bookings..." body="Mengambil booking lintas merchant dari SQLite/libSQL." />
          ) : !filtered.length ? (
            <StateBlock icon={Ticket} title="No booking records" body="Tidak ada booking yang cocok dengan filter admin saat ini." />
          ) : (
            <div className="divide-y divide-[#edf1f1]">
              {filtered.map((booking) => (
                <article key={booking.id} className="grid gap-4 px-5 py-5 xl:grid-cols-[minmax(280px,1fr)_170px_auto] xl:items-center xl:px-6">
                  <div className="flex min-w-0 items-center gap-4">
                    <img src={booking.venue.image} alt="" className="h-20 w-20 shrink-0 rounded-2xl object-cover" />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-lg font-semibold">{booking.bookingCode}</h3>
                        <StatusBadge label={bookingStatusLabel(booking.status)} tone={booking.review.needsAttention ? "yellow" : statusTone(booking.status)} />
                      </div>
                      <p className="mt-1 truncate text-sm font-semibold text-muted-foreground">{booking.customer.name} - {booking.venue.name}</p>
                      <p className="mt-1 truncate text-xs font-bold text-muted-foreground">{booking.merchant.businessName}</p>
                      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#9aa1a6]">
                        {formatDate(booking.item.slotDate)} - {booking.item.startTime} - {booking.item.endTime}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{rupiah(booking.totalAmount)}</p>
                    <p className="mt-1 text-xs font-bold text-muted-foreground">{paymentMethodLabel(booking.payment.method)}</p>
                    <p className="mt-1 text-xs font-semibold uppercase text-primary">{paymentStatusLabel(booking.payment.status)}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 xl:justify-end">
                    <button type="button" onClick={() => void openDetail(booking.id)} className="h-10 rounded-xl bg-muted px-4 text-xs font-semibold uppercase text-[#4d5559]">
                      Detail
                    </button>
                    {booking.review.needsAttention && (
                      <span className="inline-flex h-10 items-center rounded-xl bg-[#fff2c9] px-4 text-xs font-semibold uppercase text-[#8a6f00]">
                        Review
                      </span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <AdminBookingDetailPanel selected={selected} detailLoading={detailLoading} />
      </div>
    </AdminReviewFrame>
  )
}

export function AdminPaymentReviewWorkspace({ onAction }: { onAction: (message: string) => void }) {
  const [payments, setPayments] = useState<AdminPaymentReview[]>([])
  const [selected, setSelected] = useState<AdminPaymentReview | null>(null)
  const [query, setQuery] = useState("")
  const [tab, setTab] = useState<PaymentTab>("all")
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [notice, setNotice] = useState<Notice>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiRequest<AdminPaymentReview[]>("/api/admin/payments")
      setPayments(data)
      setSelected((current) => (current ? data.find((payment) => payment.id === current.id) ?? null : current))
    } catch (error) {
      setNotice({ tone: "error", message: error instanceof Error ? error.message : "Data payment admin gagal dimuat." })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    apiRequest<AdminPaymentReview[]>("/api/admin/payments")
      .then((data) => {
        if (active) setPayments(data)
      })
      .catch((error: unknown) => {
        if (active) setNotice({ tone: "error", message: error instanceof Error ? error.message : "Data payment admin gagal dimuat." })
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const filtered = useMemo(() => {
    const value = query.trim().toLowerCase()
    return payments
      .filter((payment) => tab === "all" || payment.status === tab)
      .filter((payment) => {
        if (!value) return true
        return [
          payment.id,
          payment.bookingCode,
          payment.providerReference,
          payment.customer.name,
          payment.customer.email,
          payment.merchant.businessName,
          payment.venue.name,
          payment.method,
          payment.status,
        ]
          .filter(Boolean)
          .join(" ")
          .toLowerCase()
          .includes(value)
      })
  }, [payments, query, tab])

  const stats = useMemo(() => {
    const amount = payments.reduce((total, payment) => total + payment.amount, 0)
    return [
      { label: "Payments", value: String(payments.length), helper: "Simulation ledger" },
      { label: "Need review", value: String(payments.filter((payment) => payment.review.needsAttention).length), helper: "Pending or failed" },
      { label: "Paid", value: String(payments.filter((payment) => payment.status === "paid").length), helper: "Settled simulation" },
      { label: "Amount tracked", value: rupiah(amount), helper: "Gross visible value" },
    ]
  }, [payments])

  async function openDetail(paymentId: string) {
    setDetailLoading(true)
    setNotice(null)
    try {
      setSelected(await apiRequest<AdminPaymentReview>(`/api/admin/payments/${paymentId}`))
      onAction("Admin payment detail loaded from persisted data")
    } catch (error) {
      setNotice({ tone: "error", message: error instanceof Error ? error.message : "Payment detail gagal dimuat." })
    } finally {
      setDetailLoading(false)
    }
  }

  return (
    <AdminReviewFrame
      eyebrow="Payment database"
      title="Payment Review"
      description="Inspect simulated payment records across bookings before real gateway, webhook, refund, and payout modules are added."
      actionLabel="Refresh Payments"
      onRefresh={() => void load()}
      query={query}
      onQueryChange={setQuery}
      queryPlaceholder="Search reference, code, customer, method..."
      notice={notice}
      stats={stats}
      tabs={paymentTabs}
      activeTab={tab}
      onTabChange={(value) => setTab(value as PaymentTab)}
    >
      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
        <section className="overflow-hidden rounded-3xl bg-white shadow-sm">
          {loading ? (
            <StateBlock icon={LoaderCircle} spin title="Loading payment reviews..." body="Mengambil payment simulation dari SQLite/libSQL." />
          ) : !filtered.length ? (
            <StateBlock icon={CreditCard} title="No payment records" body="Tidak ada payment yang cocok dengan filter admin saat ini." />
          ) : (
            <div className="divide-y divide-[#edf1f1]">
              {filtered.map((payment) => (
                <article key={payment.id} className="grid gap-4 px-5 py-5 xl:grid-cols-[minmax(280px,1fr)_170px_auto] xl:items-center xl:px-6">
                  <div className="flex min-w-0 items-center gap-4">
                    <span className="grid h-20 w-20 shrink-0 place-items-center rounded-2xl bg-[#dcfff6] text-primary">
                      <ReceiptText className="h-8 w-8" />
                    </span>
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-lg font-semibold">{payment.providerReference ?? payment.id}</h3>
                        <StatusBadge label={paymentStatusLabel(payment.status)} tone={payment.review.needsAttention ? "yellow" : paymentStatusTone(payment.status)} />
                      </div>
                      <p className="mt-1 truncate text-sm font-semibold text-muted-foreground">{payment.bookingCode} - {payment.customer.name}</p>
                      <p className="mt-1 truncate text-xs font-bold text-muted-foreground">{payment.merchant.businessName}</p>
                      <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-[#9aa1a6]">{paymentMethodLabel(payment.method)}</p>
                    </div>
                  </div>
                  <div>
                    <p className="text-lg font-semibold">{rupiah(payment.amount)}</p>
                    <p className="mt-1 text-xs font-bold text-muted-foreground">Booking {bookingStatusLabel(payment.bookingStatus)}</p>
                    <p className="mt-1 text-xs font-semibold uppercase text-primary">{payment.venue.name}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 xl:justify-end">
                    <button type="button" onClick={() => void openDetail(payment.id)} className="h-10 rounded-xl bg-muted px-4 text-xs font-semibold uppercase text-[#4d5559]">
                      Detail
                    </button>
                    {payment.review.needsAttention && (
                      <span className="inline-flex h-10 items-center rounded-xl bg-[#fff2c9] px-4 text-xs font-semibold uppercase text-[#8a6f00]">
                        Review
                      </span>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <AdminPaymentDetailPanel selected={selected} detailLoading={detailLoading} />
      </div>
    </AdminReviewFrame>
  )
}

function AdminReviewFrame({
  eyebrow,
  title,
  description,
  actionLabel,
  onRefresh,
  query,
  onQueryChange,
  queryPlaceholder,
  notice,
  stats,
  tabs,
  activeTab,
  onTabChange,
  children,
}: {
  eyebrow: string
  title: string
  description: string
  actionLabel: string
  onRefresh: () => void
  query: string
  onQueryChange: (value: string) => void
  queryPlaceholder: string
  notice: Notice
  stats: Array<{ label: string; value: string; helper: string }>
  tabs: Array<{ id: string; label: string }>
  activeTab: string
  onTabChange: (value: string) => void
  children: ReactNode
}) {
  return (
    <div className="space-y-6">
      <section className="rounded-3xl bg-white p-6 shadow-sm lg:p-8">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xs font-semibold uppercase tracking-[0.24em] text-primary">{eyebrow}</p>
              <span className="inline-flex items-center gap-2 rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-primary">
                <Database className="h-3.5 w-3.5" />
                SQLite / libSQL
              </span>
            </div>
            <h2 className="mt-3 text-4xl font-semibold tracking-[-0.07em] lg:text-5xl">{title}</h2>
            <p className="mt-3 max-w-3xl text-base font-semibold leading-relaxed text-muted-foreground">{description}</p>
          </div>
          <button type="button" onClick={onRefresh} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#071413] px-5 text-sm font-semibold uppercase tracking-[0.12em] text-white">
            <RefreshCw className="h-5 w-5" />
            {actionLabel}
          </button>
        </div>
        <div className="mt-7 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
          <label className="flex h-13 items-center gap-3 rounded-2xl bg-muted px-4">
            <Search className="h-5 w-5 text-[#798186]" />
            <input value={query} onChange={(event) => onQueryChange(event.target.value)} placeholder={queryPlaceholder} className="min-w-0 flex-1 bg-transparent text-sm font-bold outline-none placeholder:text-[#9ca3a7]" />
          </label>
          <div className="sportcation-scrollbar flex gap-2 overflow-x-auto">
            {tabs.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => onTabChange(item.id)}
                className={cx(
                  "h-13 min-w-fit rounded-2xl px-4 text-xs font-semibold uppercase tracking-[0.12em]",
                  activeTab === item.id ? "bg-primary text-white" : "bg-muted text-muted-foreground",
                )}
              >
                {item.label}
              </button>
            ))}
          </div>
        </div>
      </section>

      {notice && <NoticeBanner notice={notice} />}

      <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {stats.map((stat) => (
          <article key={stat.label} className="rounded-[24px] bg-white p-5 shadow-sm">
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{stat.label}</p>
            <h3 className="mt-2 text-2xl font-semibold tracking-[-0.05em]">{stat.value}</h3>
            <p className="mt-1 text-sm font-semibold text-muted-foreground">{stat.helper}</p>
          </article>
        ))}
      </section>

      {children}
    </div>
  )
}

function AdminBookingDetailPanel({ selected, detailLoading }: { selected: AdminBookingReview | null; detailLoading: boolean }) {
  return (
    <aside className="h-fit rounded-3xl bg-white p-6 shadow-sm xl:sticky xl:top-28">
      <PanelHeader title={selected?.bookingCode ?? "Select booking"} loading={detailLoading} />
      {selected ? (
        <div className="mt-6 space-y-5">
          <img src={selected.venue.image} alt="" className="h-40 w-full rounded-[24px] object-cover" />
          <DetailRow icon={User} label="Customer" value={selected.customer.name} helper={selected.customer.email ?? selected.customer.phone ?? "No contact"} />
          <DetailRow icon={Building2} label="Merchant" value={selected.merchant.businessName} helper={`Merchant status ${selected.merchant.status}`} />
          <DetailRow icon={Ticket} label="Venue" value={selected.venue.name} helper={`${selected.item.courtName} - ${selected.venue.location}`} />
          <DetailRow icon={CalendarClock} label="Schedule" value={formatDate(selected.item.slotDate)} helper={`${selected.item.startTime} - ${selected.item.endTime} - Slot ${selected.item.slotStatus}`} />
          <DetailRow icon={CreditCard} label="Payment" value={`${paymentMethodLabel(selected.payment.method)} / ${paymentStatusLabel(selected.payment.status)}`} helper={`${rupiah(selected.payment.amount)} - ${selected.payment.providerReference ?? "No provider reference"}`} />
          <ReviewBox review={selected.review} />
        </div>
      ) : (
        <EmptyDetail icon={Ticket} body="Open a booking detail to review customer, merchant, venue, slot, and payment state." />
      )}
    </aside>
  )
}

function AdminPaymentDetailPanel({ selected, detailLoading }: { selected: AdminPaymentReview | null; detailLoading: boolean }) {
  return (
    <aside className="h-fit rounded-3xl bg-white p-6 shadow-sm xl:sticky xl:top-28">
      <PanelHeader title={selected?.providerReference ?? selected?.id ?? "Select payment"} loading={detailLoading} />
      {selected ? (
        <div className="mt-6 space-y-5">
          <div className="rounded-[24px] bg-[#071413] p-5 text-white">
            <p className="text-xs font-semibold uppercase tracking-[0.22em] text-[#49e7ba]">Simulated payment</p>
            <h3 className="mt-3 text-3xl font-semibold tracking-[-0.05em]">{rupiah(selected.amount)}</h3>
            <p className="mt-2 text-sm font-bold text-white/65">{paymentMethodLabel(selected.method)} - {paymentStatusLabel(selected.status)}</p>
          </div>
          <DetailRow icon={ReceiptText} label="Reference" value={selected.providerReference ?? selected.id} helper={`Payment ID ${selected.id}`} />
          <DetailRow icon={Ticket} label="Booking" value={selected.bookingCode} helper={`Booking status ${bookingStatusLabel(selected.bookingStatus)}`} />
          <DetailRow icon={User} label="Customer" value={selected.customer.name} helper={selected.customer.email ?? "No email"} />
          <DetailRow icon={Building2} label="Merchant" value={selected.merchant.businessName} helper={`${selected.venue.name} - ${selected.venue.location}`} />
          <DetailRow icon={BadgeCheck} label="Paid at" value={selected.paidAt ?? "Not paid yet"} helper={`Created ${selected.createdAt}`} />
          <ReviewBox review={selected.review} />
        </div>
      ) : (
        <EmptyDetail icon={CreditCard} body="Open a payment detail to review provider reference, customer, booking, and settlement state." />
      )}
    </aside>
  )
}

function PanelHeader({ title, loading }: { title: string; loading: boolean }) {
  return (
    <div className="flex items-start justify-between gap-4">
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-primary">Read-only detail</p>
        <h3 className="mt-2 truncate text-2xl font-semibold tracking-[-0.05em]">{title}</h3>
      </div>
      {loading && <LoaderCircle className="h-5 w-5 animate-spin text-[#008f71]" />}
    </div>
  )
}

function ReviewBox({ review }: { review: { needsAttention: boolean; reason: string } }) {
  return (
    <div className={cx("rounded-2xl p-4", review.needsAttention ? "bg-[#fff8df] text-[#7b6400]" : "bg-emerald-50 text-primary")}>
      <div className="flex items-start gap-3">
        {review.needsAttention ? <AlertCircle className="mt-0.5 h-5 w-5 shrink-0" /> : <ShieldCheck className="mt-0.5 h-5 w-5 shrink-0" />}
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em]">{review.needsAttention ? "Needs review" : "Healthy"}</p>
          <p className="mt-1 text-sm font-bold leading-relaxed">{review.reason}</p>
        </div>
      </div>
    </div>
  )
}

function EmptyDetail({ icon: Icon, body }: { icon: LucideIcon; body: string }) {
  return (
    <div className="mt-6 rounded-2xl border border-dashed border-[#d7dddd] p-6 text-center">
      <Icon className="mx-auto h-9 w-9 text-[#9aa1a6]" />
      <p className="mt-3 text-sm font-bold text-muted-foreground">{body}</p>
    </div>
  )
}

function NoticeBanner({ notice }: { notice: Exclude<Notice, null> }) {
  const Icon = notice.tone === "success" ? CheckCircle2 : AlertCircle
  return (
    <div className={cx("flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm font-bold", notice.tone === "success" ? "border-[#b8f3df] bg-emerald-50 text-primary" : "border-[#ffd1d5] bg-[#fff0f1] text-[#c11f32]")}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      {notice.message}
    </div>
  )
}

function StateBlock({ icon: Icon, title, body, spin }: { icon: LucideIcon; title: string; body: string; spin?: boolean }) {
  return (
    <div className="grid min-h-72 place-items-center p-8 text-center">
      <div>
        <Icon className={cx("mx-auto h-10 w-10 text-[#008f71]", spin && "animate-spin")} />
        <p className="mt-3 font-semibold">{title}</p>
        <p className="mt-1 text-sm font-semibold text-[#7d8589]">{body}</p>
      </div>
    </div>
  )
}

function DetailRow({ icon: Icon, label, value, helper }: { icon: LucideIcon; label: string; value: string; helper: string }) {
  return (
    <div className="flex items-start gap-4">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#dcfff6] text-primary">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">{label}</p>
        <p className="mt-1 truncate text-base font-semibold">{value}</p>
        <p className="mt-1 text-sm font-semibold text-muted-foreground">{helper}</p>
      </div>
    </div>
  )
}

function StatusBadge({ label, tone }: { label: string; tone: "green" | "yellow" | "red" | "gray" | "blue" }) {
  return (
    <span className={cx("rounded-full px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.12em]", badgeClass(tone))}>
      {label}
    </span>
  )
}

function badgeClass(tone: "green" | "yellow" | "red" | "gray" | "blue") {
  if (tone === "green") return "bg-[#dcfff6] text-primary"
  if (tone === "yellow") return "bg-[#fff2c9] text-[#8a6f00]"
  if (tone === "red") return "bg-[#fff0f1] text-[#c11f32]"
  if (tone === "blue") return "bg-[#e5efff] text-[#2c64a7]"
  return "bg-[#f1f2f2] text-[#646c70]"
}

function statusTone(status: AdminBookingStatus) {
  if (status === "confirmed" || status === "completed") return "green"
  if (status === "checked_in") return "blue"
  if (status === "pending_payment") return "yellow"
  if (status === "cancelled" || status === "refunded") return "red"
  return "gray"
}

function paymentStatusTone(status: AdminPaymentStatus) {
  if (status === "paid") return "green"
  if (status === "pending") return "yellow"
  if (status === "failed" || status === "expired" || status === "refunded") return "red"
  return "gray"
}

function bookingStatusLabel(status: AdminBookingStatus) {
  const labels: Record<AdminBookingStatus, string> = {
    pending_payment: "Pending payment",
    confirmed: "Confirmed",
    checked_in: "Checked in",
    completed: "Completed",
    cancelled: "Cancelled",
    refunded: "Refunded",
  }
  return labels[status]
}

function paymentStatusLabel(status: AdminPaymentStatus) {
  const labels: Record<AdminPaymentStatus, string> = {
    pending: "Pending",
    paid: "Paid",
    failed: "Failed",
    expired: "Expired",
    refunded: "Refunded",
  }
  return labels[status]
}

function paymentMethodLabel(method: AdminPaymentReview["method"]) {
  const labels: Record<AdminPaymentReview["method"], string> = {
    qris: "QRIS / OVO",
    virtual_account: "Virtual Account",
    wallet: "Wallet",
    manual: "Manual",
  }
  return labels[method]
}
