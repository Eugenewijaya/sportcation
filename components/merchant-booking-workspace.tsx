"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  AlertCircle,
  BadgeCheck,
  CalendarClock,
  CheckCircle2,
  Clock,
  Database,
  LoaderCircle,
  RefreshCw,
  Search,
  Ticket,
  User,
} from "lucide-react"
import type { MerchantBooking, MerchantBookingStatus } from "@/lib/merchant-bookings/types"

type Notice = { tone: "success" | "error"; message: string } | null
type BookingTab = "all" | MerchantBookingStatus

const tabs: Array<{ id: BookingTab; label: string }> = [
  { id: "all", label: "All" },
  { id: "pending_payment", label: "Pending" },
  { id: "confirmed", label: "Confirmed" },
  { id: "checked_in", label: "Checked in" },
  { id: "completed", label: "Completed" },
  { id: "cancelled", label: "Cancelled" },
]

async function apiRequest<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    headers: {
      "Content-Type": "application/json",
      ...init?.headers,
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

export function MerchantBookingWorkspace({ onAction }: { onAction: (message: string) => void }) {
  const [bookings, setBookings] = useState<MerchantBooking[]>([])
  const [selected, setSelected] = useState<MerchantBooking | null>(null)
  const [query, setQuery] = useState("")
  const [tab, setTab] = useState<BookingTab>("all")
  const [loading, setLoading] = useState(true)
  const [detailLoading, setDetailLoading] = useState(false)
  const [actionBookingId, setActionBookingId] = useState("")
  const [notice, setNotice] = useState<Notice>(null)

  const load = useCallback(async () => {
    setLoading(true)
    try {
      const data = await apiRequest<MerchantBooking[]>("/api/merchant/bookings")
      setBookings(data)
      setSelected((current) => (current ? data.find((booking) => booking.id === current.id) ?? null : null))
    } catch (error) {
      setNotice({ tone: "error", message: error instanceof Error ? error.message : "Data booking gagal dimuat." })
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    let active = true
    apiRequest<MerchantBooking[]>("/api/merchant/bookings")
      .then((data) => {
        if (!active) return
        setBookings(data)
      })
      .catch((error: unknown) => {
        if (active) setNotice({ tone: "error", message: error instanceof Error ? error.message : "Data booking gagal dimuat." })
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
          booking.customer.phone,
          booking.venue.name,
          booking.venue.location,
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
      { label: "Total bookings", value: String(bookings.length), helper: "Owned venues only" },
      { label: "Confirmed", value: String(bookings.filter((booking) => booking.status === "confirmed").length), helper: "Ready for check-in" },
      { label: "Checked in", value: String(bookings.filter((booking) => booking.status === "checked_in").length), helper: "On court now" },
      { label: "GMV tracked", value: rupiah(gmv), helper: "Before payout ledger" },
    ]
  }, [bookings])

  async function openDetail(bookingId: string) {
    setDetailLoading(true)
    setNotice(null)
    try {
      setSelected(await apiRequest<MerchantBooking>(`/api/merchant/bookings/${bookingId}`))
    } catch (error) {
      setNotice({ tone: "error", message: error instanceof Error ? error.message : "Booking detail gagal dimuat." })
    } finally {
      setDetailLoading(false)
    }
  }

  async function changeStatus(booking: MerchantBooking, status: "checked_in" | "completed") {
    setActionBookingId(booking.id)
    setNotice(null)
    try {
      const updated = await apiRequest<MerchantBooking>(`/api/merchant/bookings/${booking.id}/status`, {
        method: "POST",
        body: JSON.stringify({ status, note: `Merchant marked ${status}` }),
      })
      setBookings((current) => current.map((item) => (item.id === updated.id ? updated : item)))
      setSelected((current) => (current?.id === updated.id ? updated : current))
      const message = status === "checked_in" ? "Booking berhasil di-check-in." : "Booking berhasil diselesaikan."
      setNotice({ tone: "success", message })
      onAction(message)
    } catch (error) {
      setNotice({ tone: "error", message: error instanceof Error ? error.message : "Status booking gagal diperbarui." })
    } finally {
      setActionBookingId("")
    }
  }

  return (
    <div className="space-y-6">
      <section className="rounded-[30px] bg-white p-6 shadow-sm lg:p-8">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#007c61]">Merchant database</p>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#eafff8] px-3 py-1 text-xs font-black text-[#007c61]">
                <Database className="h-3.5 w-3.5" />
                SQLite / libSQL
              </span>
            </div>
            <h2 className="mt-3 text-4xl font-black tracking-[-0.07em] lg:text-5xl">Booking Operations</h2>
            <p className="mt-3 max-w-2xl text-base font-semibold leading-relaxed text-[#687073]">
              Customer booking records are now read from persisted booking, payment, venue, and slot tables with merchant ownership filtering.
            </p>
          </div>
          <button type="button" onClick={() => void load()} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#071413] px-5 text-sm font-black uppercase tracking-[0.12em] text-white">
            <RefreshCw className="h-5 w-5" />
            Refresh
          </button>
        </div>
        <div className="mt-7 grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto]">
          <label className="flex h-13 items-center gap-3 rounded-2xl bg-[#edf1f1] px-4">
            <Search className="h-5 w-5 text-[#798186]" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search booking code, customer, venue..." className="min-w-0 flex-1 bg-transparent text-sm font-bold outline-none placeholder:text-[#9ca3a7]" />
          </label>
          <div className="sportcation-scrollbar flex gap-2 overflow-x-auto">
            {tabs.map((item) => (
              <button
                key={item.id}
                type="button"
                onClick={() => setTab(item.id)}
                className={cx(
                  "h-13 min-w-fit rounded-2xl px-4 text-xs font-black uppercase tracking-[0.12em]",
                  tab === item.id ? "bg-[#007c61] text-white" : "bg-[#edf1f1] text-[#687073]",
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
            <p className="text-xs font-black uppercase tracking-[0.18em] text-[#687073]">{stat.label}</p>
            <h3 className="mt-2 text-2xl font-black tracking-[-0.05em]">{stat.value}</h3>
            <p className="mt-1 text-sm font-semibold text-[#687073]">{stat.helper}</p>
          </article>
        ))}
      </section>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_380px]">
        <section className="overflow-hidden rounded-[30px] bg-white shadow-sm">
          {loading ? (
            <StateBlock icon={LoaderCircle} spin title="Loading merchant bookings..." body="Mengambil data booking dari database." />
          ) : !filtered.length ? (
            <StateBlock icon={Ticket} title="No booking records" body="Tidak ada booking yang cocok dengan filter saat ini." />
          ) : (
            <div className="divide-y divide-[#edf1f1]">
              {filtered.map((booking) => (
                <article key={booking.id} className="grid gap-4 px-5 py-5 xl:grid-cols-[minmax(260px,1fr)_150px_auto] xl:items-center xl:px-6">
                  <div className="flex min-w-0 items-center gap-4">
                    <img src={booking.venue.image} alt="" className="h-20 w-20 shrink-0 rounded-2xl object-cover" />
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="truncate text-lg font-black">{booking.bookingCode}</h3>
                        <StatusBadge label={bookingStatusLabel(booking.status)} status={booking.status} />
                      </div>
                      <p className="mt-1 truncate text-sm font-semibold text-[#687073]">{booking.customer.name} - {booking.venue.name}</p>
                      <p className="mt-2 text-xs font-black uppercase tracking-[0.12em] text-[#9aa1a6]">
                        {formatDate(booking.item.slotDate)} - {booking.item.startTime} - {booking.item.endTime}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-lg font-black">{rupiah(booking.totalAmount)}</p>
                    <p className="mt-1 text-xs font-bold text-[#687073]">{booking.item.courtName}</p>
                    <p className="mt-1 text-xs font-black uppercase text-[#007c61]">{booking.payment.status}</p>
                  </div>
                  <div className="flex flex-wrap gap-2 xl:justify-end">
                    <button type="button" onClick={() => void openDetail(booking.id)} className="h-10 rounded-xl bg-[#edf1f1] px-4 text-xs font-black uppercase text-[#4d5559]">
                      Detail
                    </button>
                    {booking.actions.canCheckIn && (
                      <button type="button" disabled={actionBookingId === booking.id} onClick={() => void changeStatus(booking, "checked_in")} className="h-10 rounded-xl bg-[#007c61] px-4 text-xs font-black uppercase text-white disabled:opacity-50">
                        Check In
                      </button>
                    )}
                    {booking.actions.canComplete && (
                      <button type="button" disabled={actionBookingId === booking.id} onClick={() => void changeStatus(booking, "completed")} className="h-10 rounded-xl bg-[#071413] px-4 text-xs font-black uppercase text-white disabled:opacity-50">
                        Complete
                      </button>
                    )}
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>

        <aside className="h-fit rounded-[30px] bg-white p-6 shadow-sm xl:sticky xl:top-28">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#007c61]">Booking detail</p>
              <h3 className="mt-2 text-2xl font-black tracking-[-0.05em]">{selected?.bookingCode ?? "Select booking"}</h3>
            </div>
            {detailLoading && <LoaderCircle className="h-5 w-5 animate-spin text-[#008f71]" />}
          </div>

          {selected ? (
            <div className="mt-6 space-y-5">
              <img src={selected.venue.image} alt="" className="h-40 w-full rounded-[24px] object-cover" />
              <DetailRow icon={User} label="Customer" value={selected.customer.name} helper={selected.customer.email ?? selected.customer.phone ?? "No contact"} />
              <DetailRow icon={Ticket} label="Venue" value={selected.venue.name} helper={`${selected.item.courtName} - ${selected.venue.location}`} />
              <DetailRow icon={CalendarClock} label="Schedule" value={formatDate(selected.item.slotDate)} helper={`${selected.item.startTime} - ${selected.item.endTime}`} />
              <DetailRow icon={BadgeCheck} label="Status" value={bookingStatusLabel(selected.status)} helper={`Payment ${selected.payment.status} - ${rupiah(selected.payment.amount)}`} />
              <div className="rounded-2xl bg-[#f3f6f6] p-4">
                <p className="text-xs font-black uppercase tracking-[0.18em] text-[#687073]">Operational action</p>
                <div className="mt-4 grid gap-2">
                  <button type="button" disabled={!selected.actions.canCheckIn || actionBookingId === selected.id} onClick={() => void changeStatus(selected, "checked_in")} className="h-12 rounded-full bg-[#007c61] text-sm font-black uppercase text-white disabled:cursor-not-allowed disabled:bg-[#d8dddd] disabled:text-[#889094]">
                    Mark Checked In
                  </button>
                  <button type="button" disabled={!selected.actions.canComplete || actionBookingId === selected.id} onClick={() => void changeStatus(selected, "completed")} className="h-12 rounded-full bg-[#071413] text-sm font-black uppercase text-white disabled:cursor-not-allowed disabled:bg-[#d8dddd] disabled:text-[#889094]">
                    Mark Completed
                  </button>
                </div>
                <p className="mt-3 text-xs font-semibold leading-relaxed text-[#687073]">
                  Merchant actions are limited to check-in and completion. Cancellation, refund, and payment mutations remain outside merchant MVP scope.
                </p>
              </div>
            </div>
          ) : (
            <div className="mt-6 rounded-2xl border border-dashed border-[#d7dddd] p-6 text-center">
              <Clock className="mx-auto h-9 w-9 text-[#9aa1a6]" />
              <p className="mt-3 text-sm font-bold text-[#687073]">Open a booking detail to run safe operational actions.</p>
            </div>
          )}
        </aside>
      </div>
    </div>
  )
}

function NoticeBanner({ notice }: { notice: Exclude<Notice, null> }) {
  const Icon = notice.tone === "success" ? CheckCircle2 : AlertCircle
  return (
    <div className={`flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm font-bold ${notice.tone === "success" ? "border-[#b8f3df] bg-[#eafff8] text-[#007c61]" : "border-[#ffd1d5] bg-[#fff0f1] text-[#c11f32]"}`}>
      <Icon className="mt-0.5 h-5 w-5 shrink-0" />
      {notice.message}
    </div>
  )
}

function StateBlock({
  icon: Icon,
  title,
  body,
  spin,
}: {
  icon: typeof Ticket
  title: string
  body: string
  spin?: boolean
}) {
  return (
    <div className="grid min-h-72 place-items-center p-8 text-center">
      <div>
        <Icon className={cx("mx-auto h-10 w-10 text-[#008f71]", spin && "animate-spin")} />
        <p className="mt-3 font-black">{title}</p>
        <p className="mt-1 text-sm font-semibold text-[#7d8589]">{body}</p>
      </div>
    </div>
  )
}

function DetailRow({
  icon: Icon,
  label,
  value,
  helper,
}: {
  icon: typeof User
  label: string
  value: string
  helper: string
}) {
  return (
    <div className="flex items-start gap-4">
      <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-[#dcfff6] text-[#007c61]">
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-[#687073]">{label}</p>
        <p className="mt-1 truncate text-base font-black">{value}</p>
        <p className="mt-1 text-sm font-semibold text-[#687073]">{helper}</p>
      </div>
    </div>
  )
}

function StatusBadge({ label, status }: { label: string; status: MerchantBookingStatus }) {
  return (
    <span className={cx("rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em]", statusClass(status))}>
      {label}
    </span>
  )
}

function statusClass(status: MerchantBookingStatus) {
  if (status === "confirmed" || status === "completed") return "bg-[#dcfff6] text-[#007c61]"
  if (status === "checked_in") return "bg-[#e5efff] text-[#2c64a7]"
  if (status === "pending_payment") return "bg-[#fff2c9] text-[#8a6f00]"
  if (status === "cancelled" || status === "refunded") return "bg-[#fff0f1] text-[#c11f32]"
  return "bg-[#f1f2f2] text-[#646c70]"
}

function bookingStatusLabel(status: MerchantBookingStatus) {
  const labels: Record<MerchantBookingStatus, string> = {
    pending_payment: "Pending payment",
    confirmed: "Confirmed",
    checked_in: "Checked in",
    completed: "Completed",
    cancelled: "Cancelled",
    refunded: "Refunded",
  }
  return labels[status]
}
