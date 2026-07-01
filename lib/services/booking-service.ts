import { and, desc, eq, lte } from "drizzle-orm"
import type { SportcationDb, SportcationDbExecutor } from "@/lib/db"
import { auditLogs, bookingItems, bookings, courts, notifications, payments, slots, venues } from "@/lib/db/schema"
import type { CustomerBooking } from "@/lib/customer-bookings/types"
import { DomainError, isConstraintError } from "@/lib/domain/errors"
import { createAuditRecord } from "@/lib/services/audit-service"
import type { CancelBookingInput, CreateBookingInput, PaymentSimulationInput } from "@/lib/validation/booking"
import { createBayarGgPayment } from "@/lib/payment-gateway/bayar-gg"

type CustomerActor = {
  userId: string
}

type BookingServiceOptions = {
  newId?: () => string
  now?: () => Date
  bookingCode?: () => string
  paymentExpiresInMinutes?: number
}

const defaultImage = "/padel-court-modern.jpg"
function calculatePlatformFee(subtotal: number): number {
  return Math.min(25000, Math.max(5000, Math.floor(subtotal * 0.05)))
}
const defaultPaymentExpiresInMinutes = 15

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
    const createdBooking = await db.transaction(async (tx) => {
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
      const platformFee = calculatePlatformFee(subtotal)
      const totalAmount = subtotal // Platform fee is deducted from merchant balance

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
        providerReference: null,
        paymentUrl: null,
        qrisUrl: null,
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

    // 2. Call bayar.gg API
    try {
      const paymentMethodMapping: Record<string, string> = {
        qris: "qris",
        virtual_account: "qris",
        wallet: "qris",
        manual: "qris",
      }
      const mappedMethod = paymentMethodMapping[input.paymentMethod] || "qris"

      const bayarGgResponse = await createBayarGgPayment({
        amount: createdBooking.totalAmount,
        description: `Booking ${createdBooking.bookingCode} for ${createdBooking.item.courtName}`,
        paymentMethod: mappedMethod,
        callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/bayar-gg`,
        redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/?screen=payment-success`,
      })

      // 3. Update payment record with bayar.gg response
      await db.update(payments).set({
        providerReference: bayarGgResponse.invoice_id,
        paymentUrl: bayarGgResponse.payment_url,
        qrisUrl: bayarGgResponse.qris_url,
      }).where(eq(payments.id, createdBooking.payment.id))

      const refreshedBooking = await getCustomerBooking(db as SportcationDbExecutor, actor.userId, createdBooking.id)
      return refreshedBooking || createdBooking

    } catch (paymentError) {
      console.error("bayar.gg creation error:", paymentError)
      return createdBooking
    }

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

export async function cancelCustomerBooking(
  db: SportcationDb,
  actor: CustomerActor,
  bookingId: string,
  input: CancelBookingInput = {},
  options: BookingServiceOptions = {},
) {
  const nowDate = options.now ?? (() => new Date())
  const newId = options.newId ?? (() => crypto.randomUUID())

  return db.transaction(async (tx) => {
    const current = await getCustomerBooking(tx, actor.userId, bookingId)
    if (!current) {
      throw new DomainError("BOOKING_NOT_FOUND", "Booking tidak ditemukan.", 404)
    }
    if (current.status === "cancelled") {
      return current
    }
    if (!["pending_payment", "confirmed"].includes(current.status)) {
      throw new DomainError("BOOKING_CANNOT_CANCEL", "Booking tidak dapat dibatalkan pada status ini.", 409)
    }

    const now = nowDate().toISOString()
    const paymentStatus = current.payment.status === "paid" ? "refunded" : "failed"

    await tx
      .update(payments)
      .set({
        status: paymentStatus,
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
      type: "booking",
      title: "Booking Cancelled",
      body: `Booking ${current.bookingCode} sudah dibatalkan.`,
      actionUrl: "/?screen=bookings",
      createdAt: now,
    })
    await tx.insert(auditLogs).values(
      createAuditRecord({
        actorUserId: actor.userId,
        action: "booking.cancelled",
        entityType: "booking",
        entityId: current.id,
        metadata: {
          paymentStatus,
          reason: input.reason ?? null,
          slotId: current.item.slotId,
        },
      }),
    )

    const booking = await getCustomerBooking(tx, actor.userId, bookingId)
    if (!booking) throw new DomainError("BOOKING_NOT_FOUND", "Booking tidak ditemukan.", 404)
    return booking
  })
}

export async function expirePendingCustomerBookings(
  db: SportcationDb,
  actor: CustomerActor,
  options: BookingServiceOptions = {},
) {
  const newId = options.newId ?? (() => crypto.randomUUID())
  const nowDate = options.now ?? (() => new Date())
  const expiresInMinutes = options.paymentExpiresInMinutes ?? defaultPaymentExpiresInMinutes
  const nowDateValue = nowDate()
  const now = nowDateValue.toISOString()
  const cutoff = new Date(nowDateValue.getTime() - expiresInMinutes * 60_000).toISOString()

  return db.transaction(async (tx) => {
    const expired = await selectCustomerBookingRows(tx)
      .where(
        and(
          eq(bookings.userId, actor.userId),
          eq(bookings.status, "pending_payment"),
          eq(payments.status, "pending"),
          lte(payments.createdAt, cutoff),
        ),
      )
      .orderBy(desc(bookings.createdAt))

    const expiredBookings = expired.map(mapCustomerBooking)

    for (const booking of expiredBookings) {
      await tx
        .update(payments)
        .set({
          status: "expired",
          updatedAt: now,
        })
        .where(eq(payments.id, booking.payment.id))
      await tx
        .update(bookings)
        .set({
          status: "cancelled",
          updatedAt: now,
        })
        .where(eq(bookings.id, booking.id))
      await tx
        .update(slots)
        .set({
          status: "available",
          updatedAt: now,
        })
        .where(eq(slots.id, booking.item.slotId))
      await tx.insert(notifications).values({
        id: newId(),
        userId: actor.userId,
        type: "payment",
        title: "Payment Expired",
        body: `Booking ${booking.bookingCode} kedaluwarsa dan slot sudah dilepas kembali.`,
        actionUrl: "/?screen=bookings",
        createdAt: now,
      })
      await tx.insert(auditLogs).values(
        createAuditRecord({
          actorUserId: actor.userId,
          action: "payment.expired",
          entityType: "booking",
          entityId: booking.id,
          metadata: {
            cutoff,
            slotId: booking.item.slotId,
          },
        }),
      )
    }

    return {
      expiredCount: expiredBookings.length,
      bookingIds: expiredBookings.map((booking) => booking.id),
    }
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
      paymentUrl: payments.paymentUrl,
      qrisUrl: payments.qrisUrl,
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
      paymentUrl: row.paymentUrl,
      qrisUrl: row.qrisUrl,
      paidAt: row.paidAt,
    },
  }
}

export function createBookingCode() {
  return `SP-${crypto.randomUUID().replaceAll("-", "").slice(0, 8).toUpperCase()}`
}

export async function confirmPaymentFromWebhook(
  db: SportcationDb,
  invoiceId: string,
  webhookStatus: string,
) {
  const now = new Date().toISOString()
  
  return db.transaction(async (tx) => {
    const payment = await tx
      .select({
        id: payments.id,
        bookingId: payments.bookingId,
        resellId: payments.resellId,
        auctionId: payments.auctionId,
        status: payments.status,
        userId: payments.userId,
        amount: payments.amount,
      })
      .from(payments)
      .where(eq(payments.providerReference, invoiceId))
      .get()

    if (!payment) return

    if (payment.resellId || payment.auctionId) {
      const { confirmMarketplacePayment } = await import("@/lib/services/marketplace-service")
      await confirmMarketplacePayment(tx as any, payment, webhookStatus, now)
      return
    }

    const booking = await tx
      .select({
        id: bookings.id,
        bookingCode: bookings.bookingCode,
        status: bookings.status,
      })
      .from(bookings)
      .where(eq(bookings.id, payment.bookingId))
      .get()

    if (!booking) return

    const bookingItem = await tx
      .select({ slotId: bookingItems.slotId })
      .from(bookingItems)
      .where(eq(bookingItems.bookingId, booking.id))
      .get()

    if (!bookingItem) return

    const isSuccess = webhookStatus === "SUCCESS" || webhookStatus === "PAID"
    const isFailed = webhookStatus === "EXPIRED" || webhookStatus === "FAILED"

    if (isSuccess && payment.status !== "paid") {
      await tx
        .update(payments)
        .set({ status: "paid", paidAt: now, updatedAt: now })
        .where(eq(payments.id, payment.id))
      
      await tx
        .update(bookings)
        .set({ status: "confirmed", updatedAt: now })
        .where(eq(bookings.id, booking.id))
      
      await tx
        .update(slots)
        .set({ status: "booked", updatedAt: now })
        .where(eq(slots.id, bookingItem.slotId))
      
      await tx.insert(notifications).values({
        id: crypto.randomUUID(),
        userId: payment.userId,
        type: "booking",
        title: "Booking Confirmed",
        body: `Booking ${booking.bookingCode} sudah dikonfirmasi via Bayar.gg.`,
        actionUrl: "/?screen=bookings",
        createdAt: now,
      })

      await tx.insert(auditLogs).values(
        createAuditRecord({
          actorUserId: payment.userId,
          action: "payment.webhook_paid",
          entityType: "payment",
          entityId: payment.id,
          metadata: { bookingId: booking.id, webhookStatus },
        }),
      )
    } else if (isFailed && payment.status === "pending") {
      await tx
        .update(payments)
        .set({ status: "failed", updatedAt: now })
        .where(eq(payments.id, payment.id))
      
      await tx
        .update(bookings)
        .set({ status: "cancelled", updatedAt: now })
        .where(eq(bookings.id, booking.id))
      
      await tx
        .update(slots)
        .set({ status: "available", updatedAt: now })
        .where(eq(slots.id, bookingItem.slotId))
      
      await tx.insert(notifications).values({
        id: crypto.randomUUID(),
        userId: payment.userId,
        type: "payment",
        title: "Payment Failed",
        body: `Pembayaran untuk booking ${booking.bookingCode} gagal/expired. Slot sudah dilepas kembali.`,
        actionUrl: "/?screen=bookings",
        createdAt: now,
      })

      await tx.insert(auditLogs).values(
        createAuditRecord({
          actorUserId: payment.userId,
          action: "payment.webhook_failed",
          entityType: "payment",
          entityId: payment.id,
          metadata: { bookingId: booking.id, webhookStatus },
        }),
      )
    }
  })
}


