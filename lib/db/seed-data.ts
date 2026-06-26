import type { SportcationDb } from "./index"
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

export const seedIds = {
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
} as const

export async function seedDatabase(db: SportcationDb) {
  const ids = seedIds

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
    .insert(sportCategories)
    .values([
      { id: ids.padel, slug: "padel", name: "Padel", sortOrder: 1 },
      { id: ids.tennis, slug: "tennis", name: "Tennis", sortOrder: 2 },
      { id: ids.futsal, slug: "futsal", name: "Futsal", sortOrder: 3 },
      { id: ids.golf, slug: "golf", name: "Golf", sortOrder: 4 },
    ])
    .onConflictDoNothing()
}
