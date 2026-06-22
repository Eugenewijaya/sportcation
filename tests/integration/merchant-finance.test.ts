import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { eq } from "drizzle-orm"
import type { SportcationDb } from "@/lib/db"
import { seedIds } from "@/lib/db/seed-data"
import {
  bookingItems,
  bookings,
  courts,
  merchantMembers,
  merchantProfiles,
  payments,
  slots,
  users,
  venues,
} from "@/lib/db/schema"
import { createCustomerBooking } from "@/lib/services/booking-service"
import { getMerchantFinanceDashboard } from "@/lib/services/merchant-finance-service"
import { createTestDatabase } from "@/tests/helpers/database"

describe("merchant finance service", () => {
  let db: SportcationDb
  let cleanup: () => Promise<void>

  beforeEach(async () => {
    const testDatabase = await createTestDatabase()
    db = testDatabase.db
    cleanup = testDatabase.cleanup
  })

  afterEach(async () => {
    await cleanup()
  })

  it("summarizes persisted merchant booking and payment records", async () => {
    const dashboard = await getMerchantFinanceDashboard(db, seedIds.merchant, {
      now: () => new Date("2026-06-15T00:00:00.000Z"),
    })

    expect(dashboard.merchant.id).toBe(seedIds.merchant)
    expect(dashboard.summary).toMatchObject({
      bookingCount: 1,
      paidBookingCount: 1,
      grossAmount: 365000,
      paidAmount: 365000,
      pendingAmount: 0,
      failedAmount: 0,
      refundedAmount: 0,
      platformFees: 15000,
      netReceivable: 350000,
      payoutReadyAmount: 350000,
      refundHoldAmount: 0,
      nextPayoutDate: "2026-06-19",
    })
    expect(dashboard.transactions).toHaveLength(1)
    expect(dashboard.transactions[0]).toMatchObject({
      id: seedIds.payment,
      bookingCode: "SP-77291",
      paymentStatus: "paid",
      paymentMethod: "qris",
      grossAmount: 365000,
      platformFee: 15000,
      netAmount: 350000,
      venue: {
        id: seedIds.venuePadel,
        name: "Padel Arena",
      },
    })

    const padelSettlement = dashboard.settlements.find((settlement) => settlement.venue.id === seedIds.venuePadel)
    const tennisSettlement = dashboard.settlements.find((settlement) => settlement.venue.id === seedIds.venueTennis)

    expect(padelSettlement).toMatchObject({
      status: "ready_payout",
      bookingCount: 1,
      paidBookingCount: 1,
      grossAmount: 365000,
      platformFee: 15000,
      netAmount: 350000,
    })
    expect(tennisSettlement).toMatchObject({
      status: "no_activity",
      bookingCount: 0,
      netAmount: 0,
    })

    expect(dashboard.paymentBreakdown.find((item) => item.method === "qris")).toMatchObject({
      count: 1,
      amount: 365000,
    })
  })

  it("filters finance data by merchant-owned venues only", async () => {
    await insertOtherMerchantFinanceFixture(db)

    const currentMerchantDashboard = await getMerchantFinanceDashboard(db, seedIds.merchant)
    expect(currentMerchantDashboard.summary.grossAmount).toBe(365000)
    expect(currentMerchantDashboard.settlements.some((settlement) => settlement.venue.name === "Other Merchant Court")).toBe(false)
    expect(currentMerchantDashboard.transactions.some((transaction) => transaction.bookingCode === "SP-OTHER")).toBe(false)

    const otherMerchantDashboard = await getMerchantFinanceDashboard(db, "merchant-other-finance")
    expect(otherMerchantDashboard.summary).toMatchObject({
      bookingCount: 1,
      paidBookingCount: 1,
      grossAmount: 215000,
      platformFees: 15000,
      netReceivable: 200000,
      payoutReadyAmount: 200000,
    })
    expect(otherMerchantDashboard.transactions[0]).toMatchObject({
      bookingCode: "SP-OTHER",
      venue: {
        name: "Other Merchant Court",
      },
    })
  })

  it("keeps pending payments and refunded bookings out of payout-ready totals", async () => {
    await db.update(bookings).set({ status: "cancelled" }).where(eq(bookings.id, seedIds.booking))
    await db.update(payments).set({ status: "refunded" }).where(eq(payments.id, seedIds.payment))

    await createCustomerBooking(
      db,
      { userId: seedIds.customerUser },
      {
        slotId: seedIds.slotAvailable,
        paymentMethod: "virtual_account",
      },
      deterministicOptions("pending-finance"),
    )

    const dashboard = await getMerchantFinanceDashboard(db, seedIds.merchant)

    expect(dashboard.summary).toMatchObject({
      bookingCount: 2,
      paidBookingCount: 0,
      paidAmount: 0,
      pendingAmount: 365000,
      refundedAmount: 365000,
      platformFees: 0,
      netReceivable: 0,
      payoutReadyAmount: 0,
      refundHoldAmount: 365000,
    })
    expect(dashboard.settlements.find((settlement) => settlement.venue.id === seedIds.venuePadel)?.status).toBe("refund_hold")
    expect(dashboard.transactions.map((transaction) => transaction.paymentStatus).sort()).toEqual(["pending", "refunded"])
  })
})

async function insertOtherMerchantFinanceFixture(db: SportcationDb) {
  await db.insert(users).values({
    id: "user-other-merchant-finance",
    name: "Other Finance Owner",
    email: "other-finance@sportcation.local",
    role: "merchant_owner",
    emailVerified: true,
  })
  await db.insert(merchantProfiles).values({
    id: "merchant-other-finance",
    ownerUserId: "user-other-merchant-finance",
    businessName: "Other Finance Merchant",
    status: "verified",
  })
  await db.insert(merchantMembers).values({
    merchantId: "merchant-other-finance",
    userId: "user-other-merchant-finance",
    role: "owner",
  })
  await db.insert(venues).values({
    id: "venue-other-finance",
    merchantId: "merchant-other-finance",
    categoryId: seedIds.padel,
    name: "Other Merchant Court",
    slug: "other-merchant-court",
    address: "Jl. Other Merchant No. 1",
    city: "Jakarta",
    area: "Jakarta Pusat",
    priceFrom: 200000,
    status: "published",
  })
  await db.insert(courts).values({
    id: "court-other-finance",
    venueId: "venue-other-finance",
    name: "Court Other",
    status: "active",
  })
  await db.insert(slots).values({
    id: "slot-other-finance",
    venueId: "venue-other-finance",
    courtId: "court-other-finance",
    slotDate: "2026-06-18",
    startTime: "18:00",
    endTime: "19:00",
    price: 200000,
    status: "booked",
  })
  await db.insert(bookings).values({
    id: "booking-other-finance",
    bookingCode: "SP-OTHER",
    userId: seedIds.customerUser,
    venueId: "venue-other-finance",
    status: "confirmed",
    subtotal: 200000,
    platformFee: 15000,
    totalAmount: 215000,
  })
  await db.insert(bookingItems).values({
    id: "booking-item-other-finance",
    bookingId: "booking-other-finance",
    slotId: "slot-other-finance",
    courtName: "Court Other",
    slotDate: "2026-06-18",
    startTime: "18:00",
    endTime: "19:00",
    price: 200000,
  })
  await db.insert(payments).values({
    id: "payment-other-finance",
    bookingId: "booking-other-finance",
    userId: seedIds.customerUser,
    method: "manual",
    status: "paid",
    amount: 215000,
    providerReference: "SIM-MANUAL-SP-OTHER",
    paidAt: "2026-06-12T08:00:00.000Z",
  })
}

function deterministicOptions(label: string) {
  let counter = 0
  return {
    newId: () => `${label}-id-${counter++}`,
    now: () => new Date("2026-06-15T09:00:00.000Z"),
    bookingCode: () => `SP-${label.replaceAll("-", "").slice(0, 8).toUpperCase()}`,
  }
}
