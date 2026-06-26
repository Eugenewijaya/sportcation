import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { requireApiActor } from "@/lib/auth-access"
import { auctions, bookings } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const access = await requireApiActor(request, ["customer"])
    if ("response" in access) return access.response

    const body = await request.json()
    const { bookingId, startPrice, buyNowPrice, endTime } = body

    if (!bookingId || !startPrice || !endTime) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const endTimestamp = new Date(endTime).getTime()
    if (isNaN(endTimestamp) || endTimestamp <= Date.now()) {
      return NextResponse.json({ error: "End time must be in the future" }, { status: 400 })
    }

    const db = getDb()

    // 1. Validate booking
    const booking = await db.query.bookings.findFirst({
      where: and(
        eq(bookings.id, bookingId),
        eq(bookings.userId, access.actor.user.id),
        eq(bookings.status, "confirmed")
      )
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found or not eligible for auction" }, { status: 404 })
    }

    // 2. Check if already in auction
    const existingAuction = await db.query.auctions.findFirst({
      where: and(
        eq(auctions.bookingId, bookingId),
        eq(auctions.status, "active")
      )
    })

    if (existingAuction) {
      return NextResponse.json({ error: "Booking is already in active auction" }, { status: 400 })
    }

    // 3. Create auction
    const id = `auc_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    
    await db.insert(auctions).values({
      id,
      bookingId,
      sellerId: access.actor.user.id,
      startPrice,
      buyNowPrice: buyNowPrice || null,
      currentHighestBid: startPrice,
      endTime: new Date(endTime),
      status: "active"
    })

    return NextResponse.json({ success: true, id }, { status: 200 })
  } catch (error) {
    console.error("[marketplace/auction] POST error:", error)
    return NextResponse.json({ error: "Failed to create auction" }, { status: 500 })
  }
}
