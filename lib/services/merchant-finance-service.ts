import { desc, eq } from "drizzle-orm"
import type { CustomerBookingStatus, CustomerPaymentMethod, CustomerPaymentStatus } from "@/lib/customer-bookings/types"
import type { SportcationDbExecutor } from "@/lib/db"
import { bookingItems, bookings, payments, venues } from "@/lib/db/schema"
import type {
  MerchantFinanceDashboard,
  MerchantFinancePaymentBreakdown,
  MerchantFinanceSettlementStatus,
  MerchantFinanceTransaction,
  MerchantFinanceVenueSettlement,
} from "@/lib/merchant-finance/types"

const defaultImage = "/padel-court-modern.jpg"
const paymentMethods: CustomerPaymentMethod[] = ["qris", "virtual_account", "wallet", "manual"]

type MerchantFinanceOptions = {
  now?: () => Date
}

type VenueRow = Awaited<ReturnType<ReturnType<typeof selectMerchantVenueRows>["get"]>>
type FinanceRow = Awaited<ReturnType<ReturnType<typeof selectMerchantFinanceRows>["get"]>>

export async function getMerchantFinanceDashboard(
  db: SportcationDbExecutor,
  merchantId: string,
  options: MerchantFinanceOptions = {},
): Promise<MerchantFinanceDashboard> {
  const [venueRows, financeRows] = await Promise.all([
    selectMerchantVenueRows(db).where(eq(venues.merchantId, merchantId)).orderBy(desc(venues.updatedAt)),
    selectMerchantFinanceRows(db).where(eq(venues.merchantId, merchantId)).orderBy(desc(payments.createdAt)),
  ])

  const rows = financeRows.filter(Boolean).map(mapFinanceRow)
  const settlements = mapSettlements(venueRows.filter(Boolean), rows)
  const summary = mapSummary(rows, options.now ?? (() => new Date()))
  const paymentBreakdown = mapPaymentBreakdown(rows)

  return {
    merchant: {
      id: merchantId,
    },
    summary,
    settlements,
    transactions: rows,
    paymentBreakdown,
    payoutPolicy: {
      platformFeeLabel: "Platform fee follows each booking.platformFee value.",
      settlementCadence: "MVP preview assumes weekly Friday settlement after paid booking review.",
      mutationScope: "Read-only foundation. Payout release, bank transfer, refund approval, and gateway reconciliation are not implemented yet.",
    },
  }
}

function selectMerchantVenueRows(db: SportcationDbExecutor) {
  return db
    .select({
      id: venues.id,
      name: venues.name,
      area: venues.area,
      city: venues.city,
      imageUrl: venues.imageUrl,
      updatedAt: venues.updatedAt,
    })
    .from(venues)
}

function selectMerchantFinanceRows(db: SportcationDbExecutor) {
  return db
    .select({
      paymentId: payments.id,
      paymentStatus: payments.status,
      paymentMethod: payments.method,
      paymentAmount: payments.amount,
      providerReference: payments.providerReference,
      paidAt: payments.paidAt,
      paymentCreatedAt: payments.createdAt,
      bookingId: bookings.id,
      bookingCode: bookings.bookingCode,
      bookingStatus: bookings.status,
      subtotal: bookings.subtotal,
      platformFee: bookings.platformFee,
      totalAmount: bookings.totalAmount,
      venueId: venues.id,
      venueName: venues.name,
      venueArea: venues.area,
      venueCity: venues.city,
      courtName: bookingItems.courtName,
      slotDate: bookingItems.slotDate,
      startTime: bookingItems.startTime,
      endTime: bookingItems.endTime,
    })
    .from(payments)
    .innerJoin(bookings, eq(payments.bookingId, bookings.id))
    .innerJoin(venues, eq(bookings.venueId, venues.id))
    .innerJoin(bookingItems, eq(bookingItems.bookingId, bookings.id))
}

function mapFinanceRow(row: NonNullable<FinanceRow>): MerchantFinanceTransaction {
  return {
    id: row.paymentId,
    bookingId: row.bookingId,
    bookingCode: row.bookingCode,
    bookingStatus: row.bookingStatus,
    paymentStatus: row.paymentStatus,
    paymentMethod: row.paymentMethod,
    grossAmount: row.paymentAmount,
    platformFee: row.platformFee,
    netAmount: getNetAmount(row.paymentStatus, row.bookingStatus, row.paymentAmount, row.platformFee),
    providerReference: row.providerReference,
    paidAt: row.paidAt,
    createdAt: row.paymentCreatedAt,
    venue: {
      id: row.venueId,
      name: row.venueName,
    },
    item: {
      courtName: row.courtName,
      slotDate: row.slotDate,
      startTime: row.startTime,
      endTime: row.endTime,
    },
  }
}

function mapSummary(rows: MerchantFinanceTransaction[], now: () => Date) {
  return {
    bookingCount: rows.length,
    paidBookingCount: rows.filter((row) => isPaidReceivable(row.paymentStatus, row.bookingStatus)).length,
    grossAmount: rows.reduce((total, row) => total + row.grossAmount, 0),
    paidAmount: sumBy(rows, (row) => (isPaidReceivable(row.paymentStatus, row.bookingStatus) ? row.grossAmount : 0)),
    pendingAmount: sumBy(rows, (row) => (row.paymentStatus === "pending" ? row.grossAmount : 0)),
    failedAmount: sumBy(rows, (row) => (row.paymentStatus === "failed" || row.paymentStatus === "expired" ? row.grossAmount : 0)),
    refundedAmount: sumBy(rows, (row) => (isRefundHold(row.paymentStatus, row.bookingStatus) ? row.grossAmount : 0)),
    platformFees: sumBy(rows, (row) => (isPaidReceivable(row.paymentStatus, row.bookingStatus) ? row.platformFee : 0)),
    netReceivable: sumBy(rows, (row) => row.netAmount),
    payoutReadyAmount: sumBy(rows, (row) => (isPayoutReady(row.paymentStatus, row.bookingStatus) ? row.netAmount : 0)),
    refundHoldAmount: sumBy(rows, (row) => (isRefundHold(row.paymentStatus, row.bookingStatus) ? row.grossAmount : 0)),
    nextPayoutDate: getNextFriday(now()).toISOString().slice(0, 10),
  }
}

function mapSettlements(venueRows: NonNullable<VenueRow>[], rows: MerchantFinanceTransaction[]): MerchantFinanceVenueSettlement[] {
  return venueRows.map((venue) => {
    const venueTransactions = rows.filter((row) => row.venue.id === venue.id)
    const grossAmount = sumBy(venueTransactions, (row) => row.grossAmount)
    const platformFee = sumBy(venueTransactions, (row) => (isPaidReceivable(row.paymentStatus, row.bookingStatus) ? row.platformFee : 0))
    const netAmount = sumBy(venueTransactions, (row) => row.netAmount)
    const pendingAmount = sumBy(venueTransactions, (row) => (row.paymentStatus === "pending" ? row.grossAmount : 0))
    const refundHoldAmount = sumBy(venueTransactions, (row) => (isRefundHold(row.paymentStatus, row.bookingStatus) ? row.grossAmount : 0))

    return {
      id: `settlement-${venue.id}`,
      status: getSettlementStatus(venueTransactions),
      venue: {
        id: venue.id,
        name: venue.name,
        location: [venue.area, venue.city].filter(Boolean).join(", "),
        image: venue.imageUrl ?? defaultImage,
      },
      bookingCount: venueTransactions.length,
      paidBookingCount: venueTransactions.filter((row) => isPaidReceivable(row.paymentStatus, row.bookingStatus)).length,
      grossAmount,
      platformFee,
      netAmount,
      pendingAmount,
      refundHoldAmount,
      lastPaidAt: venueTransactions.find((row) => row.paidAt)?.paidAt ?? null,
    }
  })
}

function mapPaymentBreakdown(rows: MerchantFinanceTransaction[]): MerchantFinancePaymentBreakdown[] {
  return paymentMethods.map((method) => {
    const methodRows = rows.filter((row) => row.paymentMethod === method)
    return {
      method,
      count: methodRows.length,
      amount: sumBy(methodRows, (row) => row.grossAmount),
    }
  })
}

function getSettlementStatus(rows: MerchantFinanceTransaction[]): MerchantFinanceSettlementStatus {
  if (!rows.length) return "no_activity"
  if (rows.some((row) => isRefundHold(row.paymentStatus, row.bookingStatus))) return "refund_hold"
  if (rows.some((row) => isPayoutReady(row.paymentStatus, row.bookingStatus))) return "ready_payout"
  if (rows.some((row) => row.paymentStatus === "pending")) return "pending_payment"
  return "no_activity"
}

function getNetAmount(paymentStatus: CustomerPaymentStatus, bookingStatus: CustomerBookingStatus, grossAmount: number, platformFee: number) {
  return isPaidReceivable(paymentStatus, bookingStatus) ? Math.max(grossAmount - platformFee, 0) : 0
}

function isPaidReceivable(paymentStatus: CustomerPaymentStatus, bookingStatus: CustomerBookingStatus) {
  return paymentStatus === "paid" && !["cancelled", "refunded"].includes(bookingStatus)
}

function isPayoutReady(paymentStatus: CustomerPaymentStatus, bookingStatus: CustomerBookingStatus) {
  return paymentStatus === "paid" && ["confirmed", "checked_in", "completed"].includes(bookingStatus)
}

function isRefundHold(paymentStatus: CustomerPaymentStatus, bookingStatus: CustomerBookingStatus) {
  return paymentStatus === "refunded" || bookingStatus === "cancelled" || bookingStatus === "refunded"
}

function getNextFriday(date: Date) {
  const next = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()))
  const day = next.getUTCDay()
  const daysUntilFriday = (5 - day + 7) % 7 || 7
  next.setUTCDate(next.getUTCDate() + daysUntilFriday)
  return next
}

function sumBy<T>(items: T[], getValue: (item: T) => number) {
  return items.reduce((total, item) => total + getValue(item), 0)
}
