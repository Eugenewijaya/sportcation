import { getDb } from "@/lib/db"
import { requireApiActor } from "@/lib/auth-access"
import { ok, internalError, invalidRequest } from "@/lib/api/http"
import { createSlot, deleteSlot } from "@/lib/services/slot-service"
import { slotInputSchema } from "@/lib/validation/merchant"
import { slots, venues } from "@/lib/db/schema"
import { eq, inArray, and } from "drizzle-orm"

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
      const venue = await db.query.venues.findFirst({
        where: and(eq(venues.id, venueId), eq(venues.merchantId, merchantId))
      })
      if (!venue) {
        return internalError(new Error("Venue not found or unauthorized"))
      }
      query = eq(slots.venueId, venueId)
    } else {
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
    return internalError(error)
  }
}

export async function POST(request: Request) {
  try {
    const access = await requireApiActor(request, ["merchant_owner", "merchant_staff"], { merchantRequired: true })
    if ("response" in access) return access.response
    
    const body = await request.json()
    const parsed = slotInputSchema.safeParse(body)
    if (!parsed.success) return invalidRequest(parsed.error)
    
    const merchantActor = {
      userId: access.actor.user.id,
      merchantId: access.actor.merchantId!
    }
    
    const newSlot = await createSlot(getDb(), merchantActor, parsed.data)
    return ok(newSlot, { status: 201 })
  } catch (error) {
    return internalError(error)
  }
}

export async function DELETE(request: Request) {
  try {
    const access = await requireApiActor(request, ["merchant_owner", "merchant_staff"], { merchantRequired: true })
    if ("response" in access) return access.response
    
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")
    if (!id) return internalError(new Error("Slot ID required"))
    
    const merchantActor = {
      userId: access.actor.user.id,
      merchantId: access.actor.merchantId!
    }
    
    await deleteSlot(getDb(), merchantActor, id)
    return ok({ deleted: true })
  } catch (error) {
    return internalError(error)
  }
}
