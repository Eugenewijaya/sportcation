import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { eq } from "drizzle-orm"
import type { SportcationDb } from "@/lib/db"
import { seedIds } from "@/lib/db/seed-data"
import { slots } from "@/lib/db/schema"
import {
  createCustomerBooking,
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
})

function deterministicOptions(label: string) {
  let counter = 0
  return {
    newId: () => `${label}-id-${counter++}`,
    now: () => new Date("2026-06-15T09:00:00.000Z"),
    bookingCode: () => `SP-${label.replaceAll("-", "").slice(0, 8).toUpperCase()}`,
  }
}
