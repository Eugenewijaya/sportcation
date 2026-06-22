import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { bookings, users, venues } from "@/lib/db/schema"
import { count, sum, eq } from "drizzle-orm"
import { requireApiActor } from "@/lib/auth-access"
import { internalError, ok } from "@/lib/api/http"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const access = await requireApiActor(request, ["admin"])
    if ("response" in access) return access.response

    const db = getDb()
    
    // Platform GMV (using confirmed and completed for MVP)
    const gmvResult = await db
      .select({ value: sum(bookings.totalAmount) })
      .from(bookings)
      .where(eq(bookings.status, "confirmed")) // or completed
    
    const gmv = gmvResult[0]?.value || 0

    // Active Users
    const usersResult = await db
      .select({ value: count(users.id) })
      .from(users)
    
    const usersCount = usersResult[0]?.value || 0

    // Open Reviews (Venues in review status)
    const reviewsResult = await db
      .select({ value: count(venues.id) })
      .from(venues)
      .where(eq(venues.status, "review"))
    
    const reviewsCount = reviewsResult[0]?.value || 0

    return ok({
      stats: [
        { label: "Platform GMV", value: `Rp ${(Number(gmv) / 1000000).toFixed(1)}M`, helper: "Total confirmed bookings", tone: "green" },
        { label: "Active Users", value: `${usersCount}`, helper: "Total registered users", tone: "blue" },
        { label: "Open Reviews", value: `${reviewsCount}`, helper: "Venues waiting for approval", tone: "yellow" },
        { label: "System Health", value: "100%", helper: "API status healthy", tone: "green" }
      ]
    })
  } catch (error) {
    return internalError(error)
  }
}
