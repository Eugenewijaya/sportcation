import { and, desc, eq } from "drizzle-orm"
import type { SportcationDb, SportcationDbExecutor } from "@/lib/db"
import { auditLogs, bookingItems, bookings, notifications, payments, slots, users, venues } from "@/lib/db/schema"
import { DomainError } from "@/lib/domain/errors"
import type { MerchantBooking } from "@/lib/merchant-bookings/types"
import { createAuditRecord } from "@/lib/services/audit-service"
import type { MerchantBookingStatusActionInput } from "@/lib/validation/booking"

type MerchantActor = {
  userId: string
  merchantId: string
}

type MerchantBookingServiceOptions = {
  now?: () => Date
  newId?: () => string
}

const defaultImage = "/padel-court-modern.jpg"

export async function listMerchantBookings(
  db: SportcationDbExecutor,
  merchantId: string,
  filters: { q?: string; status?: MerchantBooking["status"] | "" } = {},
): Promise<MerchantBooking[]> {
  const rows = await selectMerchantBookingRows(db)
    .where(eq(venues.merchantId, merchantId))
    .orderBy(desc(bookings.createdAt))

  const query = filters.q?.trim().toLowerCase()
  return rows
    .map(mapMerchantBooking)
    .filter((booking) => !filters.status || booking.status === filters.status)
    .filter((booking) => {
      if (!query) return true
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
        .includes(query)
    })
}

export async function getMerchantBooking(
  db: SportcationDbExecutor,
  merchantId: string,
  bookingId: string,
): Promise<MerchantBooking> {
  const row = await selectMerchantBookingRows(db)
    .where(and(eq(bookings.id, bookingId), eq(venues.merchantId, merchantId)))
    .get()

  if (!row) {
    throw new DomainError("BOOKING_NOT_FOUND", "Booking tidak ditemukan untuk merchant ini.", 404)
  }
  return mapMerchantBooking(row)
}

export async function updateMerchantBookingStatus(
  db: SportcationDb,
  actor: MerchantActor,
  bookingId: string,
  input: MerchantBookingStatusActionInput,
  options: MerchantBookingServiceOptions = {},
): Promise<MerchantBooking> {
  const nowDate = options.now ?? (() => new Date())
  const newId = options.newId ?? (() => crypto.randomUUID())

  return db.transaction(async (tx) => {
    const current = await getMerchantBooking(tx, actor.merchantId, bookingId)
    const nextStatus = input.status

    if (current.status === nextStatus) {
      return current
    }
    if (nextStatus === "checked_in" && current.status !== "confirmed") {
      throw new DomainError("BOOKING_STATUS_INVALID", "Hanya booking confirmed yang dapat di-check-in.", 409)
    }
    if (nextStatus === "completed" && current.status !== "checked_in") {
      throw new DomainError("BOOKING_STATUS_INVALID", "Hanya booking checked-in yang dapat diselesaikan.", 409)
    }
    if (current.payment.status !== "paid") {
      throw new DomainError("BOOKING_PAYMENT_REQUIRED", "Booking harus berstatus paid sebelum operasional lapangan.", 409)
    }

    const now = nowDate().toISOString()
    await tx
      .update(bookings)
      .set({
        status: nextStatus,
        updatedAt: now,
      })
      .where(eq(bookings.id, current.id))

    if (nextStatus === "completed") {
      await tx
        .update(slots)
        .set({
          status: "expired",
          updatedAt: now,
        })
        .where(eq(slots.id, current.item.slotId))
    }

    await tx.insert(notifications).values({
      id: newId(),
      userId: current.customer.id,
      type: "booking",
      title: nextStatus === "checked_in" ? "Booking Checked In" : "Booking Completed",
      body:
        nextStatus === "checked_in"
          ? `Booking ${current.bookingCode} sudah check-in di ${current.venue.name}.`
          : `Sesi booking ${current.bookingCode} sudah selesai. Terima kasih sudah bermain.`,
      actionUrl: "/?screen=bookings",
      createdAt: now,
    })

    await tx.insert(auditLogs).values(
      createAuditRecord({
        actorUserId: actor.userId,
        action: nextStatus === "checked_in" ? "booking.checked_in" : "booking.completed",
        entityType: "booking",
        entityId: current.id,
        metadata: {
          merchantId: actor.merchantId,
          previousStatus: current.status,
          nextStatus,
          note: input.note,
          slotId: current.item.slotId,
        },
      }),
    )

    return getMerchantBooking(tx, actor.merchantId, current.id)
  })
}

function selectMerchantBookingRows(db: SportcationDbExecutor) {
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
      customerId: users.id,
      customerName: users.name,
      customerEmail: users.email,
      customerPhone: users.phone,
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
    .innerJoin(users, eq(bookings.userId, users.id))
    .innerJoin(venues, eq(bookings.venueId, venues.id))
    .innerJoin(bookingItems, eq(bookingItems.bookingId, bookings.id))
    .innerJoin(payments, eq(payments.bookingId, bookings.id))
}

function mapMerchantBooking(row: Awaited<ReturnType<ReturnType<typeof selectMerchantBookingRows>["get"]>>): MerchantBooking {
  if (!row) {
    throw new DomainError("BOOKING_NOT_FOUND", "Booking tidak ditemukan untuk merchant ini.", 404)
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
    customer: {
      id: row.customerId,
      name: row.customerName,
      email: row.customerEmail,
      phone: row.customerPhone,
    },
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
    actions: {
      canCheckIn: row.status === "confirmed" && row.paymentStatus === "paid",
      canComplete: row.status === "checked_in" && row.paymentStatus === "paid",
    },
  }
}
