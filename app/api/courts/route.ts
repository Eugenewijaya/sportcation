import { eq } from "drizzle-orm"
import { apiError, internalError, invalidRequest, ok } from "@/lib/api/http"
import { MERCHANT_CATALOG_WRITE_ROLES, MERCHANT_READ_ROLES, requireApiActor } from "@/lib/auth-access"
import { getDb } from "@/lib/db"
import { auditLogs, courts, venues } from "@/lib/db/schema"
import { courtInputSchema } from "@/lib/validation/merchant"

export const runtime = "nodejs"

export async function GET(request: Request) {
  try {
    const access = await requireApiActor(request, ["merchant_owner", "merchant_staff"], {
      merchantRequired: true,
      merchantRoles: MERCHANT_READ_ROLES,
    })
    if ("response" in access) return access.response
    const data = await getDb()
      .select({
        id: courts.id,
        venueId: courts.venueId,
        venueName: venues.name,
        name: courts.name,
        surface: courts.surface,
        isIndoor: courts.isIndoor,
        status: courts.status,
      })
      .from(courts)
      .innerJoin(venues, eq(courts.venueId, venues.id))
      .where(eq(venues.merchantId, access.actor.merchantId!))

    return ok(data)
  } catch (error) {
    return internalError(error)
  }
}
export async function POST(request: Request) {
  try {
    const access = await requireApiActor(request, ["merchant_owner", "merchant_staff"], {
      merchantRequired: true,
      merchantRoles: MERCHANT_CATALOG_WRITE_ROLES,
    })
    if ("response" in access) return access.response
    const parsed = courtInputSchema.safeParse(await request.json())
    if (!parsed.success) return invalidRequest(parsed.error)

    const db = getDb()
    const venue = await db.select().from(venues).where(eq(venues.id, parsed.data.venueId)).get()
    if (!venue || venue.merchantId !== access.actor.merchantId) return apiError("VENUE_NOT_FOUND", "Venue tidak ditemukan.", 404)

    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    const [created] = await db
      .insert(courts)
      .values({ id, ...parsed.data, surface: parsed.data.surface || null, createdAt: now, updatedAt: now })
      .returning()

    await db.insert(auditLogs).values({
      id: crypto.randomUUID(),
      actorUserId: access.actor.user.id,
      action: "court.created",
      entityType: "court",
      entityId: id,
      metadata: { venueId: parsed.data.venueId, name: parsed.data.name },
    })

    return ok(created, { status: 201 })
  } catch (error) {
    return internalError(error)
  }
}
