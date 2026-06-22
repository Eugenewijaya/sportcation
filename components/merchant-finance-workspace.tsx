"use client"

import { useCallback, useEffect, useMemo, useState } from "react"
import {
  AlertCircle,
  Banknote,
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
  TrendingUp,
  WalletCards,
  type LucideIcon,
} from "lucide-react"
import type {
  MerchantFinanceDashboard,
  MerchantFinancePaymentBreakdown,
  MerchantFinanceSettlementStatus,
  MerchantFinanceTransaction,
  MerchantFinanceVenueSettlement,
} from "@/lib/merchant-finance/types"

type Notice = { tone: "success" | "error"; message: string } | null

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

export function MerchantFinanceWorkspace({ onAction }: { onAction: (message: string) => void }) {
  const [dashboard, setDashboard] = useState<MerchantFinanceDashboard | null>(null)
  const [query, setQuery] = useState("")
  const [loading, setLoading] = useState(true)
  const [notice, setNotice] = useState<Notice>(null)

  const load = useCallback(async () => {
    setLoading(true)
    setNotice(null)
    try {
      const data = await apiRequest<MerchantFinanceDashboard>("/api/merchant/finance")
      setDashboard(data)
      onAction("Merchant finance data refreshed from persisted bookings and payments")
    } catch (error) {
      setNotice({ tone: "error", message: error instanceof Error ? error.message : "Data finance gagal dimuat." })
    } finally {
      setLoading(false)
    }
  }, [onAction])

  useEffect(() => {
    let active = true
    apiRequest<MerchantFinanceDashboard>("/api/merchant/finance")
      .then((data) => {
        if (active) setDashboard(data)
      })
      .catch((error: unknown) => {
        if (active) setNotice({ tone: "error", message: error instanceof Error ? error.message : "Data finance gagal dimuat." })
      })
      .finally(() => {
        if (active) setLoading(false)
      })
    return () => {
      active = false
    }
  }, [])

  const filteredSettlements = useMemo(() => {
    const value = query.trim().toLowerCase()
    const settlements = dashboard?.settlements ?? []
    if (!value) return settlements
    return settlements.filter((settlement) =>
      [settlement.venue.name, settlement.venue.location, settlement.status].join(" ").toLowerCase().includes(value),
    )
  }, [dashboard, query])

  const filteredTransactions = useMemo(() => {
    const value = query.trim().toLowerCase()
    const transactions = dashboard?.transactions ?? []
    if (!value) return transactions
    return transactions.filter((transaction) =>
      [
        transaction.bookingCode,
        transaction.paymentMethod,
        transaction.paymentStatus,
        transaction.bookingStatus,
        transaction.providerReference,
        transaction.venue.name,
        transaction.item.courtName,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(value),
    )
  }, [dashboard, query])

  const summary = dashboard?.summary
  const stats = summary
    ? [
        { label: "Net receivable", value: rupiah(summary.netReceivable), helper: `${summary.paidBookingCount} paid bookings`, icon: TrendingUp },
        { label: "Payout ready", value: rupiah(summary.payoutReadyAmount), helper: `Next ${summary.nextPayoutDate}`, icon: Banknote },
        { label: "Pending payment", value: rupiah(summary.pendingAmount), helper: "Not eligible for payout", icon: CreditCard },
        { label: "Refund holds", value: rupiah(summary.refundHoldAmount), helper: "Manual review later", icon: ShieldCheck },
      ]
    : []

  return (
    <div className="space-y-6">
      <section className="rounded-[30px] bg-white p-6 shadow-sm lg:p-8">
        <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-end">
          <div>
            <div className="flex flex-wrap items-center gap-3">
              <p className="text-xs font-black uppercase tracking-[0.24em] text-[#007c61]">Merchant finance database</p>
              <span className="inline-flex items-center gap-2 rounded-full bg-[#eafff8] px-3 py-1 text-xs font-black text-[#007c61]">
                <Database className="h-3.5 w-3.5" />
                SQLite / libSQL
              </span>
            </div>
            <h2 className="mt-3 text-4xl font-black tracking-[-0.07em] lg:text-5xl">Settlement Center</h2>
            <p className="mt-3 max-w-3xl text-base font-semibold leading-relaxed text-[#687073]">
              Read-only payout foundation derived from persisted booking, booking item, venue, and simulated payment records. Payout release remains out of scope for this stage.
            </p>
          </div>
          <button type="button" onClick={() => void load()} className="inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[#071413] px-5 text-sm font-black uppercase tracking-[0.12em] text-white">
            <RefreshCw className="h-5 w-5" />
            Refresh
          </button>
        </div>
        <div className="mt-7">
          <label className="flex h-13 items-center gap-3 rounded-2xl bg-[#edf1f1] px-4">
            <Search className="h-5 w-5 text-[#798186]" />
            <input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search venue, booking code, method, status..." className="min-w-0 flex-1 bg-transparent text-sm font-bold outline-none placeholder:text-[#9ca3a7]" />
          </label>
        </div>
      </section>

      {notice && <NoticeBanner notice={notice} />}

      {loading ? (
        <StateBlock icon={LoaderCircle} spin title="Loading finance dashboard..." body="Mengambil settlement summary dari database." />
      ) : !dashboard ? (
        <StateBlock icon={WalletCards} title="Finance data unavailable" body="Dashboard finance belum dapat dimuat. Coba refresh sesi merchant." />
      ) : (
        <>
          <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {stats.map((stat) => (
              <SummaryCard key={stat.label} {...stat} />
            ))}
          </section>

          <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_390px]">
            <section className="overflow-hidden rounded-[30px] bg-white shadow-sm">
              <div className="border-b border-[#edf1f1] px-6 py-5">
                <p className="text-xs font-black uppercase tracking-[0.22em] text-[#687073]">{filteredSettlements.length} venue settlements</p>
              </div>
              {!filteredSettlements.length ? (
                <StateBlock icon={Building2} title="No settlement records" body="Belum ada venue settlement yang cocok dengan filter." compact />
              ) : (
                <div className="divide-y divide-[#edf1f1]">
                  {filteredSettlements.map((settlement) => (
                    <SettlementRow key={settlement.id} settlement={settlement} />
                  ))}
                </div>
              )}
            </section>

            <aside className="space-y-6 xl:sticky xl:top-28 xl:h-fit">
              <PolicyCard dashboard={dashboard} />
              <PaymentBreakdownCard breakdown={dashboard.paymentBreakdown} />
            </aside>
          </div>

          <section className="overflow-hidden rounded-[30px] bg-white shadow-sm">
            <div className="border-b border-[#edf1f1] px-6 py-5">
              <p className="text-xs font-black uppercase tracking-[0.22em] text-[#687073]">{filteredTransactions.length} payment transactions</p>
            </div>
            {!filteredTransactions.length ? (
              <StateBlock icon={ReceiptText} title="No payment transactions" body="Tidak ada transaksi yang cocok dengan filter saat ini." compact />
            ) : (
              <div className="divide-y divide-[#edf1f1]">
                {filteredTransactions.map((transaction) => (
                  <TransactionRow key={transaction.id} transaction={transaction} />
                ))}
              </div>
            )}
          </section>
        </>
      )}
    </div>
  )
}

function SummaryCard({
  label,
  value,
  helper,
  icon: Icon,
}: {
  label: string
  value: string
  helper: string
  icon: LucideIcon
}) {
  return (
    <article className="rounded-[24px] bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <span className="grid h-12 w-12 shrink-0 place-items-center rounded-2xl bg-[#dcfff6] text-[#007c61]">
          <Icon className="h-6 w-6" />
        </span>
        <span className="rounded-full bg-[#eafff8] px-3 py-1 text-[10px] font-black uppercase tracking-[0.14em] text-[#007c61]">
          Live
        </span>
      </div>
      <p className="mt-5 text-xs font-black uppercase tracking-[0.18em] text-[#687073]">{label}</p>
      <h3 className="mt-2 text-2xl font-black tracking-[-0.05em]">{value}</h3>
      <p className="mt-1 text-sm font-semibold text-[#687073]">{helper}</p>
    </article>
  )
}

function SettlementRow({ settlement }: { settlement: MerchantFinanceVenueSettlement }) {
  return (
    <article className="grid gap-4 px-5 py-5 xl:grid-cols-[minmax(280px,1fr)_170px_170px_auto] xl:items-center xl:px-6">
      <div className="flex min-w-0 items-center gap-4">
        <img src={settlement.venue.image} alt="" className="h-20 w-20 shrink-0 rounded-2xl object-cover" />
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h3 className="truncate text-lg font-black">{settlement.venue.name}</h3>
            <StatusBadge status={settlement.status} />
          </div>
          <p className="mt-1 truncate text-sm font-semibold text-[#687073]">{settlement.venue.location || "Location not set"}</p>
          <p className="mt-2 text-xs font-black uppercase tracking-[0.12em] text-[#9aa1a6]">{settlement.bookingCount} bookings - {settlement.paidBookingCount} paid</p>
        </div>
      </div>
      <AmountBlock label="Gross" value={settlement.grossAmount} helper={`Fee ${rupiah(settlement.platformFee)}`} />
      <AmountBlock label="Net payout" value={settlement.netAmount} helper={`Pending ${rupiah(settlement.pendingAmount)}`} />
      <div className="rounded-2xl bg-[#f3f6f6] px-4 py-3">
        <p className="text-xs font-black uppercase tracking-[0.16em] text-[#687073]">Last paid</p>
        <p className="mt-1 text-sm font-black">{settlement.lastPaidAt ? new Date(settlement.lastPaidAt).toLocaleDateString("id-ID") : "No paid booking"}</p>
        <p className="mt-1 text-xs font-bold text-[#687073]">Hold {rupiah(settlement.refundHoldAmount)}</p>
      </div>
    </article>
  )
}

function TransactionRow({ transaction }: { transaction: MerchantFinanceTransaction }) {
  return (
    <article className="grid gap-4 px-5 py-5 lg:grid-cols-[minmax(260px,1fr)_150px_150px_auto] lg:items-center lg:px-6">
      <div className="flex min-w-0 items-center gap-4">
        <span className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl bg-[#dcfff6] text-[#007c61]">
          <ReceiptText className="h-7 w-7" />
        </span>
        <div className="min-w-0">
          <h3 className="truncate text-lg font-black">{transaction.bookingCode}</h3>
          <p className="mt-1 truncate text-sm font-semibold text-[#687073]">{transaction.venue.name} - {transaction.item.courtName}</p>
          <p className="mt-2 text-xs font-black uppercase tracking-[0.12em] text-[#9aa1a6]">
            {formatDate(transaction.item.slotDate)} - {transaction.item.startTime} - {transaction.item.endTime}
          </p>
        </div>
      </div>
      <div>
        <p className="text-xs font-black uppercase tracking-[0.16em] text-[#687073]">Payment</p>
        <p className="mt-1 text-sm font-black">{paymentMethodLabel(transaction.paymentMethod)}</p>
        <p className="mt-1 text-xs font-bold text-[#687073]">{transaction.providerReference ?? "No reference"}</p>
      </div>
      <div>
        <p className="text-lg font-black">{rupiah(transaction.grossAmount)}</p>
        <p className="mt-1 text-xs font-bold text-[#687073]">Net {rupiah(transaction.netAmount)}</p>
      </div>
      <div className="flex flex-wrap gap-2 lg:justify-end">
        <PlainBadge label={paymentStatusLabel(transaction.paymentStatus)} tone={paymentTone(transaction.paymentStatus)} />
        <PlainBadge label={bookingStatusLabel(transaction.bookingStatus)} tone={bookingTone(transaction.bookingStatus)} />
      </div>
    </article>
  )
}

function PolicyCard({ dashboard }: { dashboard: MerchantFinanceDashboard }) {
  return (
    <section className="rounded-[30px] bg-[#071413] p-6 text-white shadow-[0_26px_70px_rgb(0_0_0/0.12)]">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-[#49e7ba]">Read-only payout foundation</p>
      <h3 className="mt-3 text-2xl font-black tracking-[-0.05em]">Settlement policy</h3>
      <div className="mt-5 space-y-4">
        <PolicyLine icon={Banknote} text={dashboard.payoutPolicy.platformFeeLabel} />
        <PolicyLine icon={CalendarClock} text={dashboard.payoutPolicy.settlementCadence} />
        <PolicyLine icon={ShieldCheck} text={dashboard.payoutPolicy.mutationScope} />
      </div>
    </section>
  )
}

function PaymentBreakdownCard({ breakdown }: { breakdown: MerchantFinancePaymentBreakdown[] }) {
  return (
    <section className="rounded-[30px] bg-white p-6 shadow-sm">
      <p className="text-xs font-black uppercase tracking-[0.22em] text-[#007c61]">Payment breakdown</p>
      <h3 className="mt-3 text-2xl font-black tracking-[-0.05em]">Simulation methods</h3>
      <div className="mt-5 space-y-3">
        {breakdown.map((item) => (
          <div key={item.method} className="flex items-center justify-between gap-4 rounded-2xl bg-[#f3f6f6] p-4">
            <div>
              <p className="font-black">{paymentMethodLabel(item.method)}</p>
              <p className="mt-1 text-xs font-bold text-[#687073]">{item.count} records</p>
            </div>
            <p className="text-right text-sm font-black">{rupiah(item.amount)}</p>
          </div>
        ))}
      </div>
    </section>
  )
}

function PolicyLine({ icon: Icon, text }: { icon: LucideIcon; text: string }) {
  return (
    <div className="flex items-start gap-3 rounded-2xl bg-white/8 p-4">
      <Icon className="mt-0.5 h-5 w-5 shrink-0 text-[#49e7ba]" />
      <p className="text-sm font-semibold leading-relaxed text-white/75">{text}</p>
    </div>
  )
}

function AmountBlock({ label, value, helper }: { label: string; value: number; helper: string }) {
  return (
    <div>
      <p className="text-xs font-black uppercase tracking-[0.16em] text-[#687073]">{label}</p>
      <p className="mt-1 text-lg font-black">{rupiah(value)}</p>
      <p className="mt-1 text-xs font-bold text-[#687073]">{helper}</p>
    </div>
  )
}

function NoticeBanner({ notice }: { notice: Exclude<Notice, null> }) {
  const Icon = notice.tone === "success" ? CheckCircle2 : AlertCircle
  return (
    <div className={cx("flex items-start gap-3 rounded-2xl border px-4 py-3 text-sm font-bold", notice.tone === "success" ? "border-[#b8f3df] bg-[#eafff8] text-[#007c61]" : "border-[#ffd1d5] bg-[#fff0f1] text-[#c11f32]")}>
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
  compact,
}: {
  icon: LucideIcon
  title: string
  body: string
  spin?: boolean
  compact?: boolean
}) {
  return (
    <div className={cx("grid place-items-center p-8 text-center", compact ? "min-h-56" : "min-h-72 rounded-[30px] bg-white shadow-sm")}>
      <div>
        <Icon className={cx("mx-auto h-10 w-10 text-[#008f71]", spin && "animate-spin")} />
        <p className="mt-3 font-black">{title}</p>
        <p className="mt-1 text-sm font-semibold text-[#7d8589]">{body}</p>
      </div>
    </div>
  )
}

function StatusBadge({ status }: { status: MerchantFinanceSettlementStatus }) {
  return <PlainBadge label={settlementStatusLabel(status)} tone={settlementTone(status)} />
}

function PlainBadge({ label, tone }: { label: string; tone: "green" | "yellow" | "red" | "gray" | "blue" }) {
  return (
    <span className={cx("inline-flex rounded-full px-3 py-1 text-[10px] font-black uppercase tracking-[0.12em]", badgeClass(tone))}>
      {label}
    </span>
  )
}

function badgeClass(tone: "green" | "yellow" | "red" | "gray" | "blue") {
  if (tone === "green") return "bg-[#dcfff6] text-[#007c61]"
  if (tone === "yellow") return "bg-[#fff2c9] text-[#8a6f00]"
  if (tone === "red") return "bg-[#fff0f1] text-[#c11f32]"
  if (tone === "blue") return "bg-[#e5efff] text-[#2c64a7]"
  return "bg-[#f1f2f2] text-[#646c70]"
}

function settlementStatusLabel(status: MerchantFinanceSettlementStatus) {
  const labels: Record<MerchantFinanceSettlementStatus, string> = {
    ready_payout: "Ready payout",
    pending_payment: "Pending payment",
    refund_hold: "Refund hold",
    no_activity: "No activity",
  }
  return labels[status]
}

function settlementTone(status: MerchantFinanceSettlementStatus) {
  if (status === "ready_payout") return "green"
  if (status === "pending_payment") return "yellow"
  if (status === "refund_hold") return "red"
  return "gray"
}

function paymentMethodLabel(method: MerchantFinanceTransaction["paymentMethod"]) {
  const labels: Record<MerchantFinanceTransaction["paymentMethod"], string> = {
    qris: "QRIS / OVO",
    virtual_account: "Virtual Account",
    wallet: "Wallet",
    manual: "Manual",
  }
  return labels[method]
}

function paymentStatusLabel(status: MerchantFinanceTransaction["paymentStatus"]) {
  const labels: Record<MerchantFinanceTransaction["paymentStatus"], string> = {
    pending: "Pending",
    paid: "Paid",
    failed: "Failed",
    expired: "Expired",
    refunded: "Refunded",
  }
  return labels[status]
}

function bookingStatusLabel(status: MerchantFinanceTransaction["bookingStatus"]) {
  const labels: Record<MerchantFinanceTransaction["bookingStatus"], string> = {
    pending_payment: "Pending payment",
    confirmed: "Confirmed",
    checked_in: "Checked in",
    completed: "Completed",
    cancelled: "Cancelled",
    refunded: "Refunded",
  }
  return labels[status]
}

function paymentTone(status: MerchantFinanceTransaction["paymentStatus"]) {
  if (status === "paid") return "green"
  if (status === "pending") return "yellow"
  if (status === "failed" || status === "expired" || status === "refunded") return "red"
  return "gray"
}

function bookingTone(status: MerchantFinanceTransaction["bookingStatus"]) {
  if (status === "confirmed" || status === "checked_in" || status === "completed") return "green"
  if (status === "pending_payment") return "yellow"
  if (status === "cancelled" || status === "refunded") return "red"
  return "gray"
}
