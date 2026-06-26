import { desc } from "drizzle-orm";
import { SportcationDb } from "@/lib/db";
import { users, venues, bookings, payments, sportCategories } from "@/lib/db/schema";

export async function getAdminDashboard(db: SportcationDb) {
  // 1. Users
  const recentUsers = await db.query.users.findMany({
    orderBy: [desc(users.authCreatedAt)],
    limit: 5,
  });

  // 2. Venues
  const recentVenues = await db.query.venues.findMany({
    with: { merchant: true },
    orderBy: [desc(venues.createdAt)],
    limit: 5,
  });

  // 3. Bookings
  const recentBookings = await db.query.bookings.findMany({
    with: { venue: true, user: true },
    orderBy: [desc(bookings.createdAt)],
    limit: 5,
  });

  // 4. Payments
  const recentPayments = await db.query.payments.findMany({
    with: { booking: { with: { venue: true, user: true } } },
    orderBy: [desc(payments.createdAt)],
    limit: 5,
  });

  // 5. Reports (mock for now as we don't have reports table)
  const reports = [
    { id: "RPT-01", title: "GMV Performance", subtitle: "Daily revenue and take rate", stat1: "Updated 09:00", stat2: "Rp 8.2B", status: "Healthy", color: "green" },
  ];

  // 6. Content (Categories)
  const categories = await db.query.sportCategories.findMany({
    orderBy: [desc(sportCategories.createdAt)],
    limit: 5,
  });

  return { users: recentUsers, venues: recentVenues, bookings: recentBookings, payments: recentPayments, reports, categories };
}

