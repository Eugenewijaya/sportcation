import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { requireApiActor } from "@/lib/auth-access"
import { resells, bookings } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const access = await requireApiActor(request, ["customer"])
    if ("response" in access) return access.response

    const body = await request.json()
    const { bookingId, price } = body

    if (!bookingId || !price || price <= 0) {
      return NextResponse.json({ error: "Invalid payload" }, { status: 400 })
    }

    const db = getDb()

    // 1. Validate booking exists, belongs to user, and is confirmed
    const booking = await db.query.bookings.findFirst({
      where: and(
        eq(bookings.id, bookingId),
        eq(bookings.userId, access.actor.user.id),
        eq(bookings.status, "confirmed")
      )
    })

    if (!booking) {
      return NextResponse.json({ error: "Booking not found or not eligible for resell" }, { status: 404 })
    }

    // 2. Check if already listed
    const existingResell = await db.query.resells.findFirst({
      where: and(
        eq(resells.bookingId, bookingId),
        eq(resells.status, "active")
      )
    })

    if (existingResell) {
      return NextResponse.json({ error: "Booking is already listed for resell" }, { status: 400 })
    }

    // 3. Create resell listing
    const id = `rsl_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
    
    await db.insert(resells).values({
      id,
      bookingId,
      sellerId: access.actor.user.id,
      price: price,
      status: "active"
    })

    return NextResponse.json({ success: true, id }, { status: 200 })
  } catch (error) {
    console.error("[marketplace/resell] POST error:", error)
    return NextResponse.json({ error: "Failed to list booking for resell" }, { status: 500 })
  }
}
