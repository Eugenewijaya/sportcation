import { afterEach, beforeEach, describe, expect, it } from "vitest"
import type { SportcationDb } from "@/lib/db"
import { seedIds } from "@/lib/db/seed-data"
import {
  getAdminBooking,
  getAdminPayment,
  listAdminBookings,
  listAdminPayments,
} from "@/lib/services/admin-review-service"
import { createCustomerBooking } from "@/lib/services/booking-service"
import { createTestDatabase } from "@/tests/helpers/database"

describe("admin review services", () => {
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

  it("lists and filters platform bookings across merchant ownership", async () => {
    const bookings = await listAdminBookings(db)
    expect(bookings).toHaveLength(1)
    expect(bookings[0]).toMatchObject({
      id: seedIds.booking,
      bookingCode: "SP-77291",
      status: "confirmed",
      customer: {
        id: seedIds.customerUser,
        name: "Alex Rivera",
      },
      merchant: {
        id: seedIds.merchant,
        businessName: "Sportcation Venue Partner",
      },
      venue: {
        id: seedIds.venuePadel,
        name: "Padel Arena",
      },
      payment: {
        id: seedIds.payment,
        status: "paid",
      },
      review: {
        needsAttention: false,
      },
    })

    const filtered = await listAdminBookings(db, {
      q: "padel arena",
      status: "confirmed",
      paymentStatus: "paid",
    })
    expect(filtered.map((booking) => booking.id)).toEqual([seedIds.booking])

    await expect(getAdminBooking(db, "missing-booking")).rejects.toMatchObject({
      code: "BOOKING_NOT_FOUND",
      status: 404,
    })
  })

  it("flags pending booking states for admin review", async () => {
    const pending = await createCustomerBooking(
      db,
      { userId: seedIds.customerUser },
      {
        slotId: seedIds.slotAvailable,
        paymentMethod: "virtual_account",
      },
      {
        ...deterministicOptions("admin-pending"),
        bookingCode: () => "SP-ADMINP",
      },
    )

    const pendingBookings = await listAdminBookings(db, {
      q: "SP-ADMINP",
      status: "pending_payment",
      paymentStatus: "pending",
    })

    expect(pendingBookings).toHaveLength(1)
    expect(pendingBookings[0]).toMatchObject({
      id: pending.id,
      bookingCode: "SP-ADMINP",
      review: {
        needsAttention: true,
      },
    })
  })

  it("lists and filters simulated payment records", async () => {
    const payments = await listAdminPayments(db)
    expect(payments).toHaveLength(1)
    expect(payments[0]).toMatchObject({
      id: seedIds.payment,
      bookingId: seedIds.booking,
      bookingCode: "SP-77291",
      status: "paid",
      method: "qris",
      merchant: {
        id: seedIds.merchant,
      },
      review: {
        needsAttention: false,
      },
    })

    const filtered = await listAdminPayments(db, {
      q: "SIM-QRIS-SP-77291",
      status: "paid",
      method: "qris",
    })
    expect(filtered.map((payment) => payment.id)).toEqual([seedIds.payment])

    await expect(getAdminPayment(db, "missing-payment")).rejects.toMatchObject({
      code: "PAYMENT_NOT_FOUND",
      status: 404,
    })
  })

  it("flags pending simulated payments for admin review", async () => {
    const pending = await createCustomerBooking(
      db,
      { userId: seedIds.customerUser },
      {
        slotId: seedIds.slotAvailable,
        paymentMethod: "qris",
      },
      {
        ...deterministicOptions("admin-payment"),
        bookingCode: () => "SP-ADMPAY",
      },
    )

    const pendingPayments = await listAdminPayments(db, {
      q: "SP-ADMPAY",
      status: "pending",
      method: "qris",
    })

    expect(pendingPayments).toHaveLength(1)
    expect(pendingPayments[0]).toMatchObject({
      bookingId: pending.id,
      bookingCode: "SP-ADMPAY",
      providerReference: "SIM-QRIS-SP-ADMPAY",
      review: {
        needsAttention: true,
      },
    })
  })
})

function deterministicOptions(label: string) {
  let counter = 0
  return {
    newId: () => `${label}-id-${counter++}`,
    now: () => new Date("2026-06-15T10:00:00.000Z"),
  }
}
