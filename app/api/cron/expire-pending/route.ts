import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { expirePendingCustomerBookings } from "@/lib/services/booking-service"
import { eq } from "drizzle-orm"
import { bookings, payments } from "@/lib/db/schema"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const db = getDb()
    
    // Find all users with pending bookings and expire them
    const pendingPayments = await db
      .select({ userId: payments.userId })
      .from(payments)
      .innerJoin(bookings, eq(payments.bookingId, bookings.id))
      .where(eq(payments.status, "pending"))
      .groupBy(payments.userId)

    let totalExpired = 0
    for (const row of pendingPayments) {
      const result = await expirePendingCustomerBookings(db, { userId: row.userId })
      totalExpired += result.expiredCount
    }

    return NextResponse.json({
      ok: true,
      expiredCount: totalExpired,
      checkedUsers: pendingPayments.length,
      timestamp: new Date().toISOString(),
    })
  } catch (error) {
    console.error("[cron/expire-pending]", error)
    return NextResponse.json({ error: "Processing error" }, { status: 500 })
  }
}
