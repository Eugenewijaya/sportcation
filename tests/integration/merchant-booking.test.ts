import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { eq } from "drizzle-orm"
import type { SportcationDb } from "@/lib/db"
import { seedIds } from "@/lib/db/seed-data"
import { auditLogs, notifications, slots } from "@/lib/db/schema"
import {
  getMerchantBooking,
  listMerchantBookings,
  updateMerchantBookingStatus,
} from "@/lib/services/merchant-booking-service"
import { createCustomerBooking } from "@/lib/services/booking-service"
import { createTestDatabase } from "@/tests/helpers/database"

describe("merchant booking service", () => {
  let db: SportcationDb
  let cleanup: () => Promise<void>
  const actor = {
    userId: seedIds.merchantUser,
    merchantId: seedIds.merchant,
  }

  beforeEach(async () => {
    const testDatabase = await createTestDatabase()
    db = testDatabase.db
    cleanup = testDatabase.cleanup
  })

  afterEach(async () => {
    await cleanup()
  })

  it("lists persisted bookings for the merchant with operational actions", async () => {
    const bookings = await listMerchantBookings(db, actor.merchantId)

    expect(bookings).toHaveLength(1)
    expect(bookings[0]).toMatchObject({
      id: seedIds.booking,
      bookingCode: "SP-77291",
      status: "confirmed",
      customer: {
        id: seedIds.customerUser,
        name: "Alex Rivera",
      },
      venue: {
        id: seedIds.venuePadel,
        name: "Padel Arena",
      },
      item: {
        slotId: seedIds.slotBooked,
        courtName: "Court 04",
        startTime: "10:00",
      },
      payment: {
        status: "paid",
      },
      actions: {
        canCheckIn: true,
        canComplete: false,
      },
    })
  })

  it("filters merchant bookings by query and status without exposing other merchants", async () => {
    const confirmed = await listMerchantBookings(db, actor.merchantId, {
      q: "padel arena",
      status: "confirmed",
    })
    expect(confirmed.map((booking) => booking.id)).toEqual([seedIds.booking])

    const completed = await listMerchantBookings(db, actor.merchantId, { status: "completed" })
    expect(completed).toEqual([])

    await expect(getMerchantBooking(db, "merchant-other", seedIds.booking)).rejects.toMatchObject({
      code: "BOOKING_NOT_FOUND",
      status: 404,
    })
  })

  it("checks in and completes a paid booking with audit trail and customer notifications", async () => {
    const checkedIn = await updateMerchantBookingStatus(
      db,
      actor,
      seedIds.booking,
      { status: "checked_in", note: "Customer arrived at desk." },
      deterministicOptions("checkin"),
    )

    expect(checkedIn.status).toBe("checked_in")
    expect(checkedIn.actions).toEqual({
      canCheckIn: false,
      canComplete: true,
    })

    const completed = await updateMerchantBookingStatus(
      db,
      actor,
      seedIds.booking,
      { status: "completed", note: "Session completed normally." },
      deterministicOptions("complete"),
    )

    expect(completed.status).toBe("completed")
    expect(completed.actions).toEqual({
      canCheckIn: false,
      canComplete: false,
    })
    expect((await db.select().from(slots).where(eq(slots.id, seedIds.slotBooked)).get())?.status).toBe("expired")

    const events = await db
      .select({ action: auditLogs.action })
      .from(auditLogs)
      .where(eq(auditLogs.entityId, seedIds.booking))
    expect(events.map((event) => event.action)).toEqual(["booking.checked_in", "booking.completed"])

    const customerNotifications = await db
      .select({ title: notifications.title })
      .from(notifications)
      .where(eq(notifications.userId, seedIds.customerUser))
    expect(customerNotifications.map((notification) => notification.title)).toEqual([
      "Booking Confirmed",
      "Booking Checked In",
      "Booking Completed",
    ])
  })

  it("rejects unsafe status jumps and unpaid booking operations", async () => {
    await expect(
      updateMerchantBookingStatus(
        db,
        actor,
        seedIds.booking,
        { status: "completed" },
        deterministicOptions("direct-complete"),
      ),
    ).rejects.toMatchObject({
      code: "BOOKING_STATUS_INVALID",
      status: 409,
    })

    const pendingBooking = await createCustomerBooking(
      db,
      { userId: seedIds.customerUser },
      {
        slotId: seedIds.slotAvailable,
        paymentMethod: "qris",
      },
      {
        ...deterministicOptions("pending"),
        bookingCode: () => "SP-PENDING",
      },
    )

    await expect(
      updateMerchantBookingStatus(
        db,
        actor,
        pendingBooking.id,
        { status: "checked_in" },
        deterministicOptions("unpaid-checkin"),
      ),
    ).rejects.toMatchObject({
      code: "BOOKING_STATUS_INVALID",
      status: 409,
    })
  })
})

function deterministicOptions(label: string) {
  let counter = 0
  return {
    newId: () => `${label}-merchant-booking-id-${counter++}`,
    now: () => new Date("2026-06-15T10:30:00.000Z"),
  }
}
