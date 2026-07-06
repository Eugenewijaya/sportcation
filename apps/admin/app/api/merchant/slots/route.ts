import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { requireApiActor } from "@/lib/auth-access"
import { slots, venues } from "@/lib/db/schema"
import { eq, and, inArray } from "drizzle-orm"
import { ok, internalError } from "@/lib/api/http"

export const runtime = "nodejs"

export async function GET(request: Request) {
  try {
    const access = await requireApiActor(request, ["merchant_owner", "merchant_staff"], { merchantRequired: true })
    if ("response" in access) return access.response
    
    const db = getDb()
    const merchantId = access.actor.merchantId!
    
    const { searchParams } = new URL(request.url)
    const venueId = searchParams.get("venueId")
    
    let query
    if (venueId) {
      // Ensure the venue belongs to the merchant
      const venue = await db.query.venues.findFirst({
        where: and(eq(venues.id, venueId), eq(venues.merchantId, merchantId))
      })
      if (!venue) {
        return NextResponse.json({ error: "Venue not found or unauthorized" }, { status: 403 })
      }
      query = eq(slots.venueId, venueId)
    } else {
      // Fetch all venue IDs for the merchant
      const merchantVenues = await db.query.venues.findMany({
        where: eq(venues.merchantId, merchantId),
        columns: { id: true }
      })
      const venueIds = merchantVenues.map(v => v.id)
      
      if (venueIds.length === 0) {
        return ok([])
      }
      query = inArray(slots.venueId, venueIds)
    }
    
    const merchantSlots = await db.query.slots.findMany({
      where: query,
      with: {
        court: true,
        venue: true,
      },
      orderBy: (slots, { asc }) => [asc(slots.slotDate), asc(slots.startTime)]
    })
    
    return ok(merchantSlots)
  } catch (error) {
    console.error("[merchant/slots/get]", error)
    return internalError(error)
  }
}

export async function POST(request: Request) {
  try {
    const access = await requireApiActor(request, ["merchant_owner", "merchant_staff"], { merchantRequired: true })
    if ("response" in access) return access.response
    
    const db = getDb()
    const merchantId = access.actor.merchantId!
    
    const body = await request.json()
    const { venueId, courtId, slotDate, startTime, endTime, price } = body
    
    if (!venueId || !courtId || !slotDate || !startTime || !endTime || price === undefined) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }
    
    // Validate venue belongs to merchant
    const venue = await db.query.venues.findFirst({
      where: and(eq(venues.id, venueId), eq(venues.merchantId, merchantId))
    })
    if (!venue) {
      return NextResponse.json({ error: "Venue not found or unauthorized" }, { status: 403 })
    }
    
    const id = crypto.randomUUID()
    
    await db.insert(slots).values({
      id,
      venueId,
      courtId,
      slotDate,
      startTime,
      endTime,
      price: parseInt(price, 10),
      status: "available"
    })
    
    const newSlot = await db.query.slots.findFirst({
      where: eq(slots.id, id),
      with: { court: true, venue: true }
    })
    
    return ok(newSlot, { status: 201 })
  } catch (error) {
    console.error("[merchant/slots/post]", error)
    // could be unique constraint error
    return internalError(error)
  }
}

export async function PUT(request: Request) {
  try {
    const access = await requireApiActor(request, ["merchant_owner", "merchant_staff"], { merchantRequired: true })
    if ("response" in access) return access.response
    
    const db = getDb()
    const merchantId = access.actor.merchantId!
    
    const body = await request.json()
    const { id, status, price } = body
    
    if (!id) {
      return NextResponse.json({ error: "Slot ID required" }, { status: 400 })
    }
    
    const slot = await db.query.slots.findFirst({
      where: eq(slots.id, id),
      with: { venue: true }
    })
    
    if (!slot || slot.venue.merchantId !== merchantId) {
      return NextResponse.json({ error: "Slot not found or unauthorized" }, { status: 403 })
    }
    
    const updateData: any = {}
    if (status) updateData.status = status
    if (price !== undefined) updateData.price = parseInt(price, 10)
      
    if (Object.keys(updateData).length > 0) {
      await db.update(slots).set(updateData).where(eq(slots.id, id))
    }
    
    const updatedSlot = await db.query.slots.findFirst({
      where: eq(slots.id, id),
      with: { court: true, venue: true }
    })
    
    return ok(updatedSlot)
  } catch (error) {
    console.error("[merchant/slots/put]", error)
    return internalError(error)
  }
}

export async function DELETE(request: Request) {
  try {
    const access = await requireApiActor(request, ["merchant_owner", "merchant_staff"], { merchantRequired: true })
    if ("response" in access) return access.response
    
    const db = getDb()
    const merchantId = access.actor.merchantId!
    
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    
    if (!id) {
      return NextResponse.json({ error: "Slot ID required" }, { status: 400 })
    }
    
    const slot = await db.query.slots.findFirst({
      where: eq(slots.id, id),
      with: { venue: true }
    })
    
    if (!slot || slot.venue.merchantId !== merchantId) {
      return NextResponse.json({ error: "Slot not found or unauthorized" }, { status: 403 })
    }
    
    await db.delete(slots).where(eq(slots.id, id))
    
    return ok({ deleted: true })
  } catch (error) {
    console.error("[merchant/slots/delete]", error)
    return internalError(error)
  }
}
