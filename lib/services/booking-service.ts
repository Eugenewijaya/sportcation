import { and, desc, eq } from "drizzle-orm"
import type { SportcationDb, SportcationDbExecutor } from "@/lib/db"
import { auditLogs, bookingItems, bookings, courts, notifications, payments, slots, venues } from "@/lib/db/schema"
import type { CustomerBooking } from "@/lib/customer-bookings/types"
import { DomainError, isConstraintError } from "@/lib/domain/errors"
import { createAuditRecord } from "@/lib/services/audit-service"
import type { CreateBookingInput, PaymentSimulationInput } from "@/lib/validation/booking"

type CustomerActor = {
  userId: string
}

type BookingServiceOptions = {
  newId?: () => string
  now?: () => Date
  bookingCode?: () => string
}

const defaultImage = "/padel-court-modern.jpg"
const platformFee = 15_000

export async function listCustomerBookings(db: SportcationDbExecutor, userId: string): Promise<CustomerBooking[]> {
  const rows = await selectCustomerBookingRows(db)
    .where(eq(bookings.userId, userId))
    .orderBy(desc(bookings.createdAt))

  return rows.map(mapCustomerBooking)
}

export async function getCustomerBooking(
  db: SportcationDbExecutor,
  userId: string,
  bookingId: string,
): Promise<CustomerBooking | undefined> {
  const row = await selectCustomerBookingRows(db)
    .where(and(eq(bookings.userId, userId), eq(bookings.id, bookingId)))
    .get()

  return row ? mapCustomerBooking(row) : undefined
}

export async function createCustomerBooking(
  db: SportcationDb,
  actor: CustomerActor,
  input: CreateBookingInput,
  options: BookingServiceOptions = {},
) {
  const newId = options.newId ?? (() => crypto.randomUUID())
  const nowDate = options.now ?? (() => new Date())
  const bookingCodeFactory = options.bookingCode ?? createBookingCode

  try {
    return await db.transaction(async (tx) => {
      const now = nowDate().toISOString()
      const selectedSlot = await tx
        .select({
          slotId: slots.id,
          venueId: slots.venueId,
          courtId: slots.courtId,
          courtName: courts.name,
          slotDate: slots.slotDate,
          startTime: slots.startTime,
          endTime: slots.endTime,
          price: slots.price,
          slotStatus: slots.status,
          venueStatus: venues.status,
          courtStatus: courts.status,
        })
        .from(slots)
        .innerJoin(courts, eq(slots.courtId, courts.id))
        .innerJoin(venues, eq(slots.venueId, venues.id))
        .where(eq(slots.id, input.slotId))
        .get()

      if (
        !selectedSlot ||
        selectedSlot.slotStatus !== "available" ||
        selectedSlot.venueStatus !== "published" ||
        selectedSlot.courtStatus !== "active"
      ) {
        throw new DomainError("SLOT_UNAVAILABLE", "Slot sudah tidak tersedia.", 409)
      }

      const [reservedSlot] = await tx
        .update(slots)
        .set({
          status: "booked",
          updatedAt: now,
        })
        .where(and(eq(slots.id, input.slotId), eq(slots.status, "available")))
        .returning({ id: slots.id })

      if (!reservedSlot) {
        throw new DomainError("SLOT_UNAVAILABLE", "Slot baru saja dipesan pengguna lain.", 409)
      }

      const bookingId = newId()
      const bookingCode = bookingCodeFactory()
      const subtotal = selectedSlot.price
      const totalAmount = subtotal + platformFee

      await tx.insert(bookings).values({
        id: bookingId,
        bookingCode,
        userId: actor.userId,
        venueId: selectedSlot.venueId,
        status: "pending_payment",
        subtotal,
        platformFee,
        totalAmount,
        createdAt: now,
        updatedAt: now,
      })

      await tx.insert(bookingItems).values({
        id: newId(),
        bookingId,
        slotId: selectedSlot.slotId,
        courtName: selectedSlot.courtName,
        slotDate: selectedSlot.slotDate,
        startTime: selectedSlot.startTime,
        endTime: selectedSlot.endTime,
        price: selectedSlot.price,
        createdAt: now,
        updatedAt: now,
      })

      await tx.insert(payments).values({
        id: newId(),
        bookingId,
        userId: actor.userId,
        method: input.paymentMethod,
        status: "pending",
        amount: totalAmount,
        providerReference: `SIM-${input.paymentMethod.toUpperCase()}-${bookingCode}`,
        createdAt: now,
        updatedAt: now,
      })

      await tx.insert(notifications).values({
        id: newId(),
        userId: actor.userId,
        type: "payment",
        title: "Payment Pending",
        body: `Booking ${bookingCode} menunggu simulasi pembayaran.`,
        actionUrl: "/?screen=bookings",
        createdAt: now,
      })

      await tx.insert(auditLogs).values(
        createAuditRecord({
          actorUserId: actor.userId,
          action: "booking.created",
          entityType: "booking",
          entityId: bookingId,
          metadata: {
            slotId: selectedSlot.slotId,
            paymentMethod: input.paymentMethod,
            totalAmount,
          },
        }),
      )

      const booking = await getCustomerBooking(tx, actor.userId, bookingId)
      if (!booking) {
        throw new DomainError("BOOKING_NOT_CREATED", "Booking gagal dibuat.", 500)
      }
      return booking
    })
  } catch (error) {
    if (error instanceof DomainError) throw error
    if (isConstraintError(error, "UNIQUE")) {
      throw new DomainError("BOOKING_CONFLICT", "Slot baru saja dipesan. Pilih jadwal lain.", 409, undefined, {
        cause: error,
      })
    }
    throw error
  }
}

export async function simulateCustomerPayment(
  db: SportcationDb,
  actor: CustomerActor,
  bookingId: string,
  input: PaymentSimulationInput,
  options: BookingServiceOptions = {},
) {
  const newId = options.newId ?? (() => crypto.randomUUID())
  const nowDate = options.now ?? (() => new Date())

  return db.transaction(async (tx) => {
    const current = await getCustomerBooking(tx, actor.userId, bookingId)
    if (!current) {
      throw new DomainError("BOOKING_NOT_FOUND", "Booking tidak ditemukan.", 404)
    }

    if (input.status === "paid") {
      if (current.status === "confirmed" && current.payment.status === "paid") {
        return current
      }
      if (current.status !== "pending_payment" || current.payment.status !== "pending") {
        throw new DomainError("PAYMENT_FINALIZED", "Status pembayaran tidak dapat diubah lagi.", 409)
      }

      const now = nowDate().toISOString()
      await tx
        .update(payments)
        .set({
          status: "paid",
          paidAt: now,
          updatedAt: now,
        })
        .where(eq(payments.id, current.payment.id))
      await tx
        .update(bookings)
        .set({
          status: "confirmed",
          updatedAt: now,
        })
        .where(eq(bookings.id, current.id))
      await tx
        .update(slots)
        .set({
          status: "booked",
          updatedAt: now,
        })
        .where(eq(slots.id, current.item.slotId))
      await tx.insert(notifications).values({
        id: newId(),
        userId: actor.userId,
        type: "booking",
        title: "Booking Confirmed",
        body: `Booking ${current.bookingCode} sudah dikonfirmasi.`,
        actionUrl: "/?screen=bookings",
        createdAt: now,
      })
      await tx.insert(auditLogs).values(
        createAuditRecord({
          actorUserId: actor.userId,
          action: "payment.simulated_paid",
          entityType: "payment",
          entityId: current.payment.id,
          metadata: { bookingId: current.id },
        }),
      )

      const booking = await getCustomerBooking(tx, actor.userId, bookingId)
      if (!booking) throw new DomainError("BOOKING_NOT_FOUND", "Booking tidak ditemukan.", 404)
      return booking
    }

    if (current.status === "cancelled" && current.payment.status === "failed") {
      return current
    }
    if (current.payment.status === "paid" || current.status === "confirmed") {
      throw new DomainError("PAYMENT_FINALIZED", "Booking yang sudah terkonfirmasi tidak dapat digagalkan.", 409)
    }
    if (current.status !== "pending_payment" || current.payment.status !== "pending") {
      throw new DomainError("PAYMENT_FINALIZED", "Status pembayaran tidak dapat diubah lagi.", 409)
    }

    const now = nowDate().toISOString()
    await tx
      .update(payments)
      .set({
        status: "failed",
        updatedAt: now,
      })
      .where(eq(payments.id, current.payment.id))
    await tx
      .update(bookings)
      .set({
        status: "cancelled",
        updatedAt: now,
      })
      .where(eq(bookings.id, current.id))
    await tx
      .update(slots)
      .set({
        status: "available",
        updatedAt: now,
      })
      .where(eq(slots.id, current.item.slotId))
    await tx.insert(notifications).values({
      id: newId(),
      userId: actor.userId,
      type: "payment",
      title: "Payment Failed",
      body: `Pembayaran untuk booking ${current.bookingCode} gagal. Slot sudah dilepas kembali.`,
      actionUrl: "/?screen=bookings",
      createdAt: now,
    })
    await tx.insert(auditLogs).values(
      createAuditRecord({
        actorUserId: actor.userId,
        action: "payment.simulated_failed",
        entityType: "payment",
        entityId: current.payment.id,
        metadata: { bookingId: current.id },
      }),
    )

    const booking = await getCustomerBooking(tx, actor.userId, bookingId)
    if (!booking) throw new DomainError("BOOKING_NOT_FOUND", "Booking tidak ditemukan.", 404)
    return booking
  })
}

function selectCustomerBookingRows(db: SportcationDbExecutor) {
  return db
    .select({
      id: bookings.id,
      bookingCode: bookings.bookingCode,
      status: bookings.status,
      subtotal: bookings.subtotal,
      platformFee: bookings.platformFee,
      totalAmount: bookings.totalAmount,
      createdAt: bookings.createdAt,
      updatedAt: bookings.updatedAt,
      venueId: venues.id,
      venueName: venues.name,
      venueArea: venues.area,
      venueCity: venues.city,
      venueImage: venues.imageUrl,
      itemId: bookingItems.id,
      slotId: bookingItems.slotId,
      courtName: bookingItems.courtName,
      slotDate: bookingItems.slotDate,
      startTime: bookingItems.startTime,
      endTime: bookingItems.endTime,
      price: bookingItems.price,
      paymentId: payments.id,
      paymentMethod: payments.method,
      paymentStatus: payments.status,
      paymentAmount: payments.amount,
      providerReference: payments.providerReference,
      paidAt: payments.paidAt,
    })
    .from(bookings)
    .innerJoin(venues, eq(bookings.venueId, venues.id))
    .innerJoin(bookingItems, eq(bookingItems.bookingId, bookings.id))
    .innerJoin(payments, eq(payments.bookingId, bookings.id))
}

function mapCustomerBooking(row: Awaited<ReturnType<ReturnType<typeof selectCustomerBookingRows>["get"]>>): CustomerBooking {
  if (!row) {
    throw new DomainError("BOOKING_NOT_FOUND", "Booking tidak ditemukan.", 404)
  }

  return {
    id: row.id,
    bookingCode: row.bookingCode,
    status: row.status,
    subtotal: row.subtotal,
    platformFee: row.platformFee,
    totalAmount: row.totalAmount,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    venue: {
      id: row.venueId,
      name: row.venueName,
      location: [row.venueArea, row.venueCity].filter(Boolean).join(", "),
      image: row.venueImage || defaultImage,
    },
    item: {
      id: row.itemId,
      slotId: row.slotId,
      courtName: row.courtName,
      slotDate: row.slotDate,
      startTime: row.startTime,
      endTime: row.endTime,
      price: row.price,
    },
    payment: {
      id: row.paymentId,
      method: row.paymentMethod,
      status: row.paymentStatus,
      amount: row.paymentAmount,
      providerReference: row.providerReference,
      paidAt: row.paidAt,
    },
  }
}

function createBookingCode() {
  return `SP-${crypto.randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase()}`
}
