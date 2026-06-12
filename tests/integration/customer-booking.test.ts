import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { eq } from "drizzle-orm"
import type { SportcationDb } from "@/lib/db"
import { seedIds } from "@/lib/db/seed-data"
import { bookings, payments, slots } from "@/lib/db/schema"
import {
  cancelCustomerBooking,
  createCustomerBooking,
  expirePendingCustomerBookings,
  listCustomerBookings,
  simulateCustomerPayment,
} from "@/lib/services/booking-service"
import { createTestDatabase } from "@/tests/helpers/database"

describe("customer booking service", () => {
  let db: SportcationDb
  let cleanup: () => Promise<void>
  const actor = { userId: seedIds.customerUser }

  beforeEach(async () => {
    const testDatabase = await createTestDatabase()
    db = testDatabase.db
    cleanup = testDatabase.cleanup
  })

  afterEach(async () => {
    await cleanup()
  })

  it("creates a pending booking and reserves the selected slot atomically", async () => {
    const booking = await createCustomerBooking(
      db,
      actor,
      {
        slotId: seedIds.slotAvailable,
        paymentMethod: "qris",
      },
      deterministicOptions("reserve"),
    )

    expect(booking).toMatchObject({
      bookingCode: "SP-RESERVE",
      status: "pending_payment",
      totalAmount: 365000,
      item: {
        slotId: seedIds.slotAvailable,
        startTime: "08:00",
      },
      payment: {
        method: "qris",
        status: "pending",
        providerReference: "SIM-QRIS-SP-RESERVE",
      },
    })

    const reservedSlot = await db.select().from(slots).where(eq(slots.id, seedIds.slotAvailable)).get()
    expect(reservedSlot?.status).toBe("booked")
  })

  it("prevents double booking for a reserved slot", async () => {
    await createCustomerBooking(
      db,
      actor,
      {
        slotId: seedIds.slotAvailable,
        paymentMethod: "qris",
      },
      deterministicOptions("first"),
    )

    await expect(
      createCustomerBooking(
        db,
        actor,
        {
          slotId: seedIds.slotAvailable,
          paymentMethod: "qris",
        },
        deterministicOptions("second"),
      ),
    ).rejects.toMatchObject({
      code: "SLOT_UNAVAILABLE",
      status: 409,
    })
  })

  it("confirms payment simulation and returns persisted customer booking data", async () => {
    const booking = await createCustomerBooking(
      db,
      actor,
      {
        slotId: seedIds.slotAvailable,
        paymentMethod: "virtual_account",
      },
      deterministicOptions("confirm"),
    )

    const confirmed = await simulateCustomerPayment(
      db,
      actor,
      booking.id,
      { status: "paid" },
      deterministicOptions("paid"),
    )

    expect(confirmed.status).toBe("confirmed")
    expect(confirmed.payment.status).toBe("paid")
    expect(confirmed.payment.paidAt).toBe("2026-06-15T09:00:00.000Z")

    const listed = await listCustomerBookings(db, actor.userId)
    expect(listed.some((item) => item.id === confirmed.id && item.bookingCode === "SP-CONFIRM")).toBe(true)
  })

  it("marks failed payment as cancelled and releases the slot for another booking", async () => {
    const booking = await createCustomerBooking(
      db,
      actor,
      {
        slotId: seedIds.slotAvailable,
        paymentMethod: "qris",
      },
      deterministicOptions("failed"),
    )

    const failed = await simulateCustomerPayment(
      db,
      actor,
      booking.id,
      { status: "failed" },
      deterministicOptions("fail"),
    )

    expect(failed.status).toBe("cancelled")
    expect(failed.payment.status).toBe("failed")
    expect((await db.select().from(slots).where(eq(slots.id, seedIds.slotAvailable)).get())?.status).toBe("available")

    const replacement = await createCustomerBooking(
      db,
      actor,
      {
        slotId: seedIds.slotAvailable,
        paymentMethod: "qris",
      },
      deterministicOptions("retry"),
    )
    expect(replacement.bookingCode).toBe("SP-RETRY")
  })

  it("rejects payment mutation after a booking is finalized", async () => {
    const booking = await createCustomerBooking(
      db,
      actor,
      {
        slotId: seedIds.slotAvailable,
        paymentMethod: "qris",
      },
      deterministicOptions("final"),
    )
    const confirmed = await simulateCustomerPayment(
      db,
      actor,
      booking.id,
      { status: "paid" },
      deterministicOptions("paid-final"),
    )

    await expect(
      simulateCustomerPayment(
        db,
        actor,
        confirmed.id,
        { status: "failed" },
        deterministicOptions("late-fail"),
      ),
    ).rejects.toMatchObject({
      code: "PAYMENT_FINALIZED",
      status: 409,
    })
  })

  it("cancels a pending booking and releases the slot", async () => {
    const booking = await createCustomerBooking(
      db,
      actor,
      {
        slotId: seedIds.slotAvailable,
        paymentMethod: "qris",
      },
      deterministicOptions("pending-cancel"),
    )

    const cancelled = await cancelCustomerBooking(
      db,
      actor,
      booking.id,
      { reason: "Changed schedule" },
      deterministicOptions("cancel-pending"),
    )

    expect(cancelled.status).toBe("cancelled")
    expect(cancelled.payment.status).toBe("failed")
    expect((await db.select().from(slots).where(eq(slots.id, seedIds.slotAvailable)).get())?.status).toBe("available")
  })

  it("cancels a confirmed booking as refunded and releases the slot", async () => {
    const booking = await createCustomerBooking(
      db,
      actor,
      {
        slotId: seedIds.slotAvailable,
        paymentMethod: "qris",
      },
      deterministicOptions("confirm-cancel"),
    )
    const confirmed = await simulateCustomerPayment(
      db,
      actor,
      booking.id,
      { status: "paid" },
      deterministicOptions("confirm-paid"),
    )

    const cancelled = await cancelCustomerBooking(
      db,
      actor,
      confirmed.id,
      { reason: "Weather issue" },
      deterministicOptions("cancel-paid"),
    )

    expect(cancelled.status).toBe("cancelled")
    expect(cancelled.payment.status).toBe("refunded")
    expect((await db.select().from(slots).where(eq(slots.id, seedIds.slotAvailable)).get())?.status).toBe("available")
  })

  it("rejects cancellation after a booking reaches completed state", async () => {
    await db.update(bookings).set({ status: "completed" }).where(eq(bookings.id, seedIds.booking))
    await db.update(payments).set({ status: "paid" }).where(eq(payments.bookingId, seedIds.booking))

    await expect(
      cancelCustomerBooking(
        db,
        actor,
        seedIds.booking,
        { reason: "Too late" },
        deterministicOptions("late-cancel"),
      ),
    ).rejects.toMatchObject({
      code: "BOOKING_CANNOT_CANCEL",
      status: 409,
    })
  })

  it("expires overdue pending payments and releases slots", async () => {
    const booking = await createCustomerBooking(
      db,
      actor,
      {
        slotId: seedIds.slotAvailable,
        paymentMethod: "qris",
      },
      deterministicOptions("old-book", "2026-06-15T09:00:00.000Z"),
    )

    const result = await expirePendingCustomerBookings(
      db,
      actor,
      deterministicOptions("expire-old", "2026-06-15T09:20:00.000Z"),
    )

    expect(result).toEqual({
      expiredCount: 1,
      bookingIds: [booking.id],
    })

    const listed = await listCustomerBookings(db, actor.userId)
    const expiredBooking = listed.find((item) => item.id === booking.id)
    expect(expiredBooking?.status).toBe("cancelled")
    expect(expiredBooking?.payment.status).toBe("expired")
    expect((await db.select().from(slots).where(eq(slots.id, seedIds.slotAvailable)).get())?.status).toBe("available")
  })

  it("keeps fresh pending payments reserved before the expiry window", async () => {
    await createCustomerBooking(
      db,
      actor,
      {
        slotId: seedIds.slotAvailable,
        paymentMethod: "qris",
      },
      deterministicOptions("fresh-book", "2026-06-15T09:00:00.000Z"),
    )

    const result = await expirePendingCustomerBookings(
      db,
      actor,
      deterministicOptions("expire-fresh", "2026-06-15T09:05:00.000Z"),
    )

    expect(result.expiredCount).toBe(0)
    expect((await db.select().from(slots).where(eq(slots.id, seedIds.slotAvailable)).get())?.status).toBe("booked")
  })
})

function deterministicOptions(label: string, now = "2026-06-15T09:00:00.000Z") {
  let counter = 0
  return {
    newId: () => `${label}-id-${counter++}`,
    now: () => new Date(now),
    bookingCode: () => `SP-${label.replaceAll("-", "").slice(0, 8).toUpperCase()}`,
  }
}
