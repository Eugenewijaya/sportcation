import { inArray, eq } from "drizzle-orm"
import type { SportcationDb } from "@/lib/db"
import { auditLogs, bookingItems, bookings, notifications, payments, slots, courts } from "@/lib/db/schema"
import { DomainError } from "@/lib/domain/errors"
import { createAuditRecord } from "@/lib/services/audit-service"
import { createBookingCode } from "@/lib/services/booking-service"
import { createBayarGgPayment } from "@/lib/payment-gateway/bayar-gg"

type MerchantActor = {
  userId: string
  merchantId: string
}

export type PosCheckoutInput = {
  venueId: string
  slotIds: string[]
  paymentMethod: "Cash" | "QRIS"
}

export async function createPosBooking(
  db: SportcationDb,
  actor: MerchantActor,
  input: PosCheckoutInput
) {
  const newId = () => crypto.randomUUID()
  const now = new Date().toISOString()
  const bookingCode = createBookingCode()
  
  const createdBooking = await db.transaction(async (tx) => {
    // Lock and get slots
    const selectedSlots = await tx
      .select({
        slotId: slots.id,
        venueId: slots.venueId,
        courtId: slots.courtId,
        courtName: courts.name,
        slotDate: slots.slotDate,
        startTime: slots.startTime,
        endTime: slots.endTime,
        price: slots.price,
        status: slots.status,
      })
      .from(slots)
      .innerJoin(courts, eq(slots.courtId, courts.id))
      .where(inArray(slots.id, input.slotIds))

    if (selectedSlots.length !== input.slotIds.length) {
      throw new DomainError("INVALID_SLOT", "Beberapa slot tidak valid", 400)
    }

    // Ensure all slots belong to the given venue
    if (selectedSlots.some((s) => s.venueId !== input.venueId)) {
      throw new DomainError("INVALID_VENUE", "Slot tidak sesuai dengan venue", 400)
    }

    // Ensure all slots are available
    if (selectedSlots.some((s) => s.status !== "available")) {
      throw new DomainError("SLOT_UNAVAILABLE", "Beberapa slot sudah tidak tersedia", 409)
    }

    // Calculate totals
    const subtotal = selectedSlots.reduce((sum, s) => sum + s.price, 0)
    const platformFee = 0 // POS transactions have no platform fee typically, or merchant handles it
    const totalAmount = subtotal + platformFee

    const bookingId = newId()
    
    // Create booking
    await tx.insert(bookings).values({
      id: bookingId,
      bookingCode,
      userId: actor.userId, // Action performed by merchant staff
      venueId: input.venueId,
      status: input.paymentMethod === "Cash" ? "confirmed" : "pending_payment",
      source: "pos",
      subtotal,
      platformFee,
      totalAmount,
      createdAt: now,
      updatedAt: now,
    })

    // Create booking items and update slot status
    for (const slot of selectedSlots) {
      await tx.insert(bookingItems).values({
        id: newId(),
        bookingId,
        slotId: slot.slotId,
        courtName: slot.courtName,
        slotDate: slot.slotDate,
        startTime: slot.startTime,
        endTime: slot.endTime,
        price: slot.price,
        createdAt: now,
        updatedAt: now,
      })

      await tx
        .update(slots)
        .set({ 
          status: "booked",
          updatedAt: now,
        })
        .where(eq(slots.id, slot.slotId))
    }

    // Create payment
    await tx.insert(payments).values({
      id: newId(),
      bookingId,
      userId: actor.userId,
      method: input.paymentMethod === "QRIS" ? "qris" : "manual",
      status: input.paymentMethod === "Cash" ? "paid" : "pending",
      amount: totalAmount,
      paidAt: input.paymentMethod === "Cash" ? now : null,
      createdAt: now,
      updatedAt: now,
    })

    // Audit log
    await tx.insert(auditLogs).values(
      createAuditRecord({
        actorUserId: actor.userId,
        action: "pos.booking_created",
        entityType: "booking",
        entityId: bookingId,
        metadata: {
          slotIds: input.slotIds,
          paymentMethod: input.paymentMethod,
          totalAmount,
        },
      })
    )

    return { bookingId, totalAmount, bookingCode }
  })

  // If QRIS, integrate with bayar.gg outside transaction
  if (input.paymentMethod === "QRIS") {
    try {
      const bayarGgResponse = await createBayarGgPayment({
        amount: createdBooking.totalAmount,
        description: `POS QRIS for ${createdBooking.bookingCode}`,
        paymentMethod: "qris",
        callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/bayar-gg`,
        redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/merchant`,
      })

      // Update payment record with bayar.gg details
      await db
        .update(payments)
        .set({
          providerReference: bayarGgResponse.invoice_id,
          paymentUrl: bayarGgResponse.payment_url,
          qrisUrl: bayarGgResponse.qris_url,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(payments.bookingId, createdBooking.bookingId))

      return { ...createdBooking, qrisUrl: bayarGgResponse.qris_url || bayarGgResponse.payment_url }
    } catch (error) {
      console.error("[pos-service] Bayar.gg error:", error)
      // Continue anyway, UI can show fallback or retry
    }
  }

  return createdBooking
}
