import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { requireApiActor } from "@/lib/auth-access"
import { venues, courts } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { ok, internalError } from "@/lib/api/http"

export const runtime = "nodejs"

export async function GET(request: Request) {
  try {
    const access = await requireApiActor(request, ["merchant_owner", "merchant_staff"], { merchantRequired: true })
    if ("response" in access) return access.response
    
    const db = getDb()
    const merchantId = access.actor.merchantId!
    
    const merchantVenues = await db.query.venues.findMany({
      where: eq(venues.merchantId, merchantId),
      with: {
        category: true,
        courts: true,
      }
    })
    
    return ok(merchantVenues)
  } catch (error) {
    console.error("[merchant/venues/get]", error)
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
    const { categoryId, name, description, address, city, area, imageUrl, defaultCourtName } = body
    
    if (!name || !categoryId) {
      return NextResponse.json({ error: "Name and Category ID are required" }, { status: 400 })
    }
    
    const id = crypto.randomUUID()
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + id.slice(0, 4)
    
    await db.insert(venues).values({
      id,
      merchantId,
      categoryId,
      name,
      slug,
      description: description || null,
      address: address || "",
      city: city || "",
      area: area || null,
      imageUrl: imageUrl || null,
      status: "draft"
    })
    
    if (defaultCourtName) {
      const courtId = crypto.randomUUID()
      await db.insert(courts).values({
        id: courtId,
        venueId: id,
        name: defaultCourtName,
        status: "active"
      })
    }
    
    const newVenue = await db.query.venues.findFirst({
      where: eq(venues.id, id),
      with: { courts: true, category: true }
    })
    
    return ok(newVenue, { status: 201 })
  } catch (error) {
    console.error("[merchant/venues/post]", error)
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
    const { id, categoryId, name, description, address, city, area, imageUrl, priceFrom, status } = body
    
    if (!id) {
      return NextResponse.json({ error: "Venue ID required" }, { status: 400 })
    }
    
    const venue = await db.query.venues.findFirst({
      where: eq(venues.id, id)
    })
    
    if (!venue || venue.merchantId !== merchantId) {
      return NextResponse.json({ error: "Venue not found or unauthorized" }, { status: 403 })
    }
    
    const updateData: any = {}
    if (categoryId) updateData.categoryId = categoryId
    if (name) {
      updateData.name = name
      updateData.slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-') + '-' + id.slice(0, 4)
    }
    if (description !== undefined) updateData.description = description || null
    if (address !== undefined) updateData.address = address
    if (city !== undefined) updateData.city = city
    if (area !== undefined) updateData.area = area || null
    if (imageUrl !== undefined) updateData.imageUrl = imageUrl || null
    if (priceFrom !== undefined) updateData.priceFrom = Number(priceFrom)
    if (status !== undefined) updateData.status = status
      
    if (Object.keys(updateData).length > 0) {
      await db.update(venues).set(updateData).where(eq(venues.id, id))
    }
    
    const updatedVenue = await db.query.venues.findFirst({
      where: eq(venues.id, id),
      with: { courts: true, category: true }
    })
    
    return ok(updatedVenue)
  } catch (error) {
    console.error("[merchant/venues/put]", error)
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
      return NextResponse.json({ error: "Venue ID required" }, { status: 400 })
    }
    
    const venue = await db.query.venues.findFirst({
      where: eq(venues.id, id)
    })
    
    if (!venue || venue.merchantId !== merchantId) {
      return NextResponse.json({ error: "Venue not found or unauthorized" }, { status: 403 })
    }
    
    await db.delete(venues).where(eq(venues.id, id))
    
    return ok({ deleted: true })
  } catch (error) {
    console.error("[merchant/venues/delete]", error)
    return internalError(error)
  }
}
