import "dotenv/config"
import { getDb } from "./index"
import {
  bookingItems,
  bookings,
  courts,
  merchantMembers,
  merchantProfiles,
  notifications,
  payments,
  slots,
  sportCategories,
  userProfiles,
  users,
  venues,
} from "./schema"

const ids = {
  adminUser: "user-admin-demo",
  merchantUser: "user-merchant-demo",
  customerUser: "user-customer-demo",
  merchant: "merchant-sportcation-demo",
  padel: "category-padel",
  tennis: "category-tennis",
  futsal: "category-futsal",
  golf: "category-golf",
  venuePadel: "venue-padel-arena",
  venueTennis: "venue-elite-tennis",
  courtPadel: "court-padel-04",
  courtTennis: "court-tennis-01",
  slotAvailable: "slot-padel-available",
  slotBooked: "slot-padel-booked",
  booking: "booking-demo-confirmed",
  bookingItem: "booking-item-demo",
  payment: "payment-demo-paid",
  notification: "notification-demo-booking",
}

async function main() {
  const db = getDb()

  await db
  .insert(users)
  .values([
    { id: ids.adminUser, name: "Sportcation Admin", email: "admin@sportcation.local", role: "admin", emailVerified: true },
    { id: ids.merchantUser, name: "Nadya Venue Ops", email: "merchant@sportcation.local", role: "merchant_owner", emailVerified: true },
    { id: ids.customerUser, name: "Alex Rivera", email: "customer@sportcation.local", role: "customer", emailVerified: true },
  ])
  .onConflictDoNothing()

  await db
  .insert(userProfiles)
  .values([
    { userId: ids.adminUser, fullName: "Sportcation Admin", city: "Jakarta" },
    { userId: ids.merchantUser, fullName: "Nadya Venue Ops", city: "Jakarta" },
    { userId: ids.customerUser, fullName: "Alex Rivera", city: "Jakarta" },
  ])
  .onConflictDoNothing()

  await db
  .insert(merchantProfiles)
  .values({
    id: ids.merchant,
    ownerUserId: ids.merchantUser,
    businessName: "Sportcation Venue Partner",
    legalName: "PT Sportcation Partner Indonesia",
    status: "verified",
  })
  .onConflictDoNothing()

  await db
    .insert(merchantMembers)
    .values({ merchantId: ids.merchant, userId: ids.merchantUser, role: "owner" })
    .onConflictDoNothing()

  await db
  .insert(sportCategories)
  .values([
    { id: ids.padel, slug: "padel", name: "Padel", sortOrder: 1 },
    { id: ids.tennis, slug: "tennis", name: "Tennis", sortOrder: 2 },
    { id: ids.futsal, slug: "futsal", name: "Futsal", sortOrder: 3 },
    { id: ids.golf, slug: "golf", name: "Golf", sortOrder: 4 },
  ])
  .onConflictDoNothing()

  await db
  .insert(venues)
  .values([
    {
      id: ids.venuePadel,
      merchantId: ids.merchant,
      categoryId: ids.padel,
      name: "Padel Arena",
      slug: "padel-arena-kebayoran-baru",
      description: "Premium indoor padel venue prepared for the Sportcation web MVP.",
      address: "Jl. Suryo No. 12, Kebayoran Baru",
      city: "Jakarta",
      area: "Jakarta Selatan",
      priceFrom: 350000,
      rating: 490,
      reviewCount: 124,
      imageUrl: "/padel-court-modern.jpg",
      status: "published",
    },
    {
      id: ids.venueTennis,
      merchantId: ids.merchant,
      categoryId: ids.tennis,
      name: "Elite Tennis SCBD",
      slug: "elite-tennis-scbd",
      description: "Blue hard court in the center of Jakarta.",
      address: "Jl. Jenderal Sudirman, SCBD",
      city: "Jakarta",
      area: "Jakarta Selatan",
      priceFrom: 250000,
      rating: 480,
      reviewCount: 89,
      imageUrl: "/tennis-court-blue.jpg",
      status: "published",
    },
  ])
  .onConflictDoNothing()

  await db
  .insert(courts)
  .values([
    { id: ids.courtPadel, venueId: ids.venuePadel, name: "Court 04", surface: "Premium indoor turf", isIndoor: true },
    { id: ids.courtTennis, venueId: ids.venueTennis, name: "Court 01", surface: "Hard court", isIndoor: false },
  ])
  .onConflictDoNothing()

  await db
  .insert(slots)
  .values([
    {
      id: ids.slotAvailable,
      venueId: ids.venuePadel,
      courtId: ids.courtPadel,
      slotDate: "2026-06-15",
      startTime: "08:00",
      endTime: "09:00",
      price: 350000,
      status: "available",
    },
    {
      id: ids.slotBooked,
      venueId: ids.venuePadel,
      courtId: ids.courtPadel,
      slotDate: "2026-06-15",
      startTime: "10:00",
      endTime: "11:00",
      price: 350000,
      status: "booked",
    },
  ])
  .onConflictDoNothing()

  await db
  .insert(bookings)
  .values({
    id: ids.booking,
    bookingCode: "SP-77291",
    userId: ids.customerUser,
    venueId: ids.venuePadel,
    status: "confirmed",
    subtotal: 350000,
    platformFee: 15000,
    totalAmount: 365000,
  })
  .onConflictDoNothing()

  await db
  .insert(bookingItems)
  .values({
    id: ids.bookingItem,
    bookingId: ids.booking,
    slotId: ids.slotBooked,
    courtName: "Court 04",
    slotDate: "2026-06-15",
    startTime: "10:00",
    endTime: "11:00",
    price: 350000,
  })
  .onConflictDoNothing()

  await db
  .insert(payments)
  .values({
    id: ids.payment,
    bookingId: ids.booking,
    userId: ids.customerUser,
    method: "qris",
    status: "paid",
    amount: 365000,
    providerReference: "SIM-QRIS-SP-77291",
    paidAt: "2026-06-10T08:00:00.000Z",
  })
  .onConflictDoNothing()

  await db
  .insert(notifications)
  .values({
    id: ids.notification,
    userId: ids.customerUser,
    type: "booking",
    title: "Booking Confirmed",
    body: "Your session at Padel Arena is confirmed.",
    actionUrl: "/?screen=bookings",
  })
  .onConflictDoNothing()

  console.log("Sportcation local/libSQL seed completed.")
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
