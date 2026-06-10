import { eq } from "drizzle-orm"
import { apiError, internalError, invalidRequest, ok } from "@/lib/api/http"
import { getDb } from "@/lib/db"
import { DEMO_MERCHANT_ID, DEMO_MERCHANT_USER_ID } from "@/lib/db/constants"
import { auditLogs, courts, venues } from "@/lib/db/schema"
import { courtInputSchema } from "@/lib/validation/merchant"

export const runtime = "nodejs"

export async function GET() {
  try {
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
      .where(eq(venues.merchantId, DEMO_MERCHANT_ID))

    return ok(data)
  } catch (error) {
    return internalError(error)
  }
}
export async function POST(request: Request) {
  try {
    const parsed = courtInputSchema.safeParse(await request.json())
    if (!parsed.success) return invalidRequest(parsed.error)

    const db = getDb()
    const venue = await db.select().from(venues).where(eq(venues.id, parsed.data.venueId)).get()
    if (!venue || venue.merchantId !== DEMO_MERCHANT_ID) return apiError("VENUE_NOT_FOUND", "Venue tidak ditemukan.", 404)

    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    const [created] = await db
      .insert(courts)
      .values({ id, ...parsed.data, surface: parsed.data.surface || null, createdAt: now, updatedAt: now })
      .returning()

    await db.insert(auditLogs).values({
      id: crypto.randomUUID(),
      actorUserId: DEMO_MERCHANT_USER_ID,
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
