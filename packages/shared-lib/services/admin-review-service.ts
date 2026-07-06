import { desc, eq } from "drizzle-orm"
import type { SportcationDbExecutor } from "@/lib/db"
import { bookingItems, bookings, merchantProfiles, payments, slots, users, venues } from "@/lib/db/schema"
import type { AdminBookingReview, AdminPaymentReview } from "@/lib/admin-review/types"
import { DomainError } from "@/lib/domain/errors"
import type { AdminBookingQuery, AdminPaymentQuery } from "@/lib/validation/admin-review"

const defaultImage = "/padel-court-modern.jpg"

export async function listAdminBookings(
  db: SportcationDbExecutor,
  filters: AdminBookingQuery = { q: "", status: "", paymentStatus: "" },
): Promise<AdminBookingReview[]> {
  const rows = await selectAdminBookingRows(db).orderBy(desc(bookings.createdAt))
  const query = filters.q?.trim().toLowerCase()

  return rows
    .map(mapAdminBooking)
    .filter((booking) => !filters.status || booking.status === filters.status)
    .filter((booking) => !filters.paymentStatus || booking.payment.status === filters.paymentStatus)
    .filter((booking) => {
      if (!query) return true
      return [
        booking.bookingCode,
        booking.customer.name,
        booking.customer.email,
        booking.customer.phone,
        booking.merchant.businessName,
        booking.venue.name,
        booking.venue.location,
        booking.item.courtName,
        booking.status,
        booking.payment.status,
        booking.payment.providerReference,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query)
    })
}

export async function getAdminBooking(
  db: SportcationDbExecutor,
  bookingId: string,
): Promise<AdminBookingReview> {
  const row = await selectAdminBookingRows(db).where(eq(bookings.id, bookingId)).get()
  if (!row) throw new DomainError("BOOKING_NOT_FOUND", "Booking tidak ditemukan.", 404)
  return mapAdminBooking(row)
}

export async function listAdminPayments(
  db: SportcationDbExecutor,
  filters: AdminPaymentQuery = { q: "", status: "", method: "" },
): Promise<AdminPaymentReview[]> {
  const rows = await selectAdminPaymentRows(db).orderBy(desc(payments.createdAt))
  const query = filters.q?.trim().toLowerCase()

  return rows
    .map(mapAdminPayment)
    .filter((payment) => !filters.status || payment.status === filters.status)
    .filter((payment) => !filters.method || payment.method === filters.method)
    .filter((payment) => {
      if (!query) return true
      return [
        payment.id,
        payment.bookingCode,
        payment.providerReference,
        payment.customer.name,
        payment.customer.email,
        payment.merchant.businessName,
        payment.venue.name,
        payment.venue.location,
        payment.method,
        payment.status,
        payment.bookingStatus,
      ]
        .filter(Boolean)
        .join(" ")
        .toLowerCase()
        .includes(query)
    })
}

export async function getAdminPayment(
  db: SportcationDbExecutor,
  paymentId: string,
): Promise<AdminPaymentReview> {
  const row = await selectAdminPaymentRows(db).where(eq(payments.id, paymentId)).get()
  if (!row) throw new DomainError("PAYMENT_NOT_FOUND", "Payment tidak ditemukan.", 404)
  return mapAdminPayment(row)
}

function selectAdminBookingRows(db: SportcationDbExecutor) {
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
      merchantId: merchantProfiles.id,
      merchantBusinessName: merchantProfiles.businessName,
      merchantStatus: merchantProfiles.status,
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
      slotStatus: slots.status,
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
    .innerJoin(merchantProfiles, eq(venues.merchantId, merchantProfiles.id))
    .innerJoin(bookingItems, eq(bookingItems.bookingId, bookings.id))
    .innerJoin(slots, eq(bookingItems.slotId, slots.id))
    .innerJoin(payments, eq(payments.bookingId, bookings.id))
}

function selectAdminPaymentRows(db: SportcationDbExecutor) {
  return db
    .select({
      id: payments.id,
      bookingId: bookings.id,
      bookingCode: bookings.bookingCode,
      bookingStatus: bookings.status,
      method: payments.method,
      status: payments.status,
      amount: payments.amount,
      providerReference: payments.providerReference,
      paidAt: payments.paidAt,
      createdAt: payments.createdAt,
      updatedAt: payments.updatedAt,
      customerId: users.id,
      customerName: users.name,
      customerEmail: users.email,
      merchantId: merchantProfiles.id,
      merchantBusinessName: merchantProfiles.businessName,
      venueId: venues.id,
      venueName: venues.name,
      venueArea: venues.area,
      venueCity: venues.city,
      venueImage: venues.imageUrl,
    })
    .from(payments)
    .innerJoin(bookings, eq(payments.bookingId, bookings.id))
    .innerJoin(users, eq(payments.userId, users.id))
    .innerJoin(venues, eq(bookings.venueId, venues.id))
    .innerJoin(merchantProfiles, eq(venues.merchantId, merchantProfiles.id))
}

function mapAdminBooking(row: Awaited<ReturnType<ReturnType<typeof selectAdminBookingRows>["get"]>>): AdminBookingReview {
  if (!row) throw new DomainError("BOOKING_NOT_FOUND", "Booking tidak ditemukan.", 404)
  const paymentReview = getPaymentReview(row.paymentStatus)
  const bookingReview = getBookingReview(row.status)
  const needsAttention = paymentReview.needsAttention || bookingReview.needsAttention

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
    merchant: {
      id: row.merchantId,
      businessName: row.merchantBusinessName,
      status: row.merchantStatus,
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
      slotStatus: row.slotStatus,
    },
    payment: {
      id: row.paymentId,
      method: row.paymentMethod,
      status: row.paymentStatus,
      amount: row.paymentAmount,
      providerReference: row.providerReference,
      paidAt: row.paidAt,
    },
    review: {
      needsAttention,
      reason: needsAttention ? `${bookingReview.reason}; ${paymentReview.reason}` : "Healthy booking and payment state.",
    },
  }
}

function mapAdminPayment(row: Awaited<ReturnType<ReturnType<typeof selectAdminPaymentRows>["get"]>>): AdminPaymentReview {
  if (!row) throw new DomainError("PAYMENT_NOT_FOUND", "Payment tidak ditemukan.", 404)
  const paymentReview = getPaymentReview(row.status)
  const bookingReview = getBookingReview(row.bookingStatus)
  const needsAttention = paymentReview.needsAttention || bookingReview.needsAttention

  return {
    id: row.id,
    bookingId: row.bookingId,
    bookingCode: row.bookingCode,
    bookingStatus: row.bookingStatus,
    method: row.method,
    status: row.status,
    amount: row.amount,
    providerReference: row.providerReference,
    paidAt: row.paidAt,
    createdAt: row.createdAt,
    updatedAt: row.updatedAt,
    customer: {
      id: row.customerId,
      name: row.customerName,
      email: row.customerEmail,
    },
    merchant: {
      id: row.merchantId,
      businessName: row.merchantBusinessName,
    },
    venue: {
      id: row.venueId,
      name: row.venueName,
      location: [row.venueArea, row.venueCity].filter(Boolean).join(", "),
      image: row.venueImage || defaultImage,
    },
    review: {
      needsAttention,
      reason: needsAttention ? `${bookingReview.reason}; ${paymentReview.reason}` : "Payment state is aligned with booking state.",
    },
  }
}

function getBookingReview(status: AdminBookingReview["status"]) {
  if (status === "pending_payment") return { needsAttention: true, reason: "Booking is still waiting for payment" }
  if (status === "cancelled" || status === "refunded") return { needsAttention: true, reason: "Booking has cancellation/refund state" }
  return { needsAttention: false, reason: "Booking state is operationally normal" }
}

function getPaymentReview(status: AdminPaymentReview["status"]) {
  if (status === "pending") return { needsAttention: true, reason: "Payment remains pending" }
  if (status === "failed" || status === "expired" || status === "refunded") return { needsAttention: true, reason: "Payment requires reconciliation review" }
  return { needsAttention: false, reason: "Payment state is settled" }
}
