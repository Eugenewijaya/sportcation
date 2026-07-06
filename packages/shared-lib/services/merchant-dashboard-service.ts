import { eq, inArray, desc, sql } from "drizzle-orm";
import { SportcationDb } from "@/lib/db";
import { venues, courts, slots, bookings, payments, users } from "@/lib/db/schema";

export async function getMerchantDashboard(db: SportcationDb, merchantId: string) {
  // 1. Venues
  const merchantVenues = await db.query.venues.findMany({
    where: eq(venues.merchantId, merchantId),
    with: { courts: true },
    orderBy: [desc(venues.createdAt)],
    limit: 5,
  });

  const venueIds = merchantVenues.map((v) => v.id);
  
  // 2. Slots (recent upcoming)
  const upcomingSlots = venueIds.length > 0 ? await db.query.slots.findMany({
    where: inArray(slots.venueId, venueIds),
    with: { venue: true, court: true },
    orderBy: [desc(slots.slotDate), desc(slots.startTime)],
    limit: 5,
  }) : [];

  // 3. Bookings (recent)
  const recentBookings = venueIds.length > 0 ? await db.query.bookings.findMany({
    where: inArray(bookings.venueId, venueIds),
    with: { venue: true, user: true, items: { with: { slot: { with: { court: true } } } } },
    orderBy: [desc(bookings.createdAt)],
    limit: 5,
  }) : [];

  // 4. Finance (recent payments)
  const recentPayments = venueIds.length > 0 ? await db
    .select({
      payment: payments,
      booking: bookings,
      venue: venues,
    })
    .from(payments)
    .innerJoin(bookings, eq(payments.bookingId, bookings.id))
    .innerJoin(venues, eq(bookings.venueId, venues.id))
    .where(inArray(venues.merchantId, [merchantId]))
    .orderBy(desc(payments.createdAt))
    .limit(5) : [];

  return { venues: merchantVenues, slots: upcomingSlots, bookings: recentBookings, payments: recentPayments };
}

