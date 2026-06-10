import { eq } from "drizzle-orm"
import { apiError, internalError, invalidRequest, ok } from "@/lib/api/http"
import { getDb } from "@/lib/db"
import { DEMO_MERCHANT_ID, DEMO_MERCHANT_USER_ID } from "@/lib/db/constants"
import { auditLogs, venues } from "@/lib/db/schema"
import { slugify, venuePatchSchema } from "@/lib/validation/merchant"

export const runtime = "nodejs"

type Context = { params: Promise<{ id: string }> }

export async function GET(_request: Request, context: Context) {
  try {
    const { id } = await context.params
    const data = await getDb().select().from(venues).where(eq(venues.id, id)).get()
    if (!data || data.merchantId !== DEMO_MERCHANT_ID) return apiError("VENUE_NOT_FOUND", "Venue tidak ditemukan.", 404)
    return ok(data)
  } catch (error) {
    return internalError(error)
  }
}
export async function PATCH(request: Request, context: Context) {
  try {
    const { id } = await context.params
    const parsed = venuePatchSchema.safeParse(await request.json())
    if (!parsed.success) return invalidRequest(parsed.error)

    const db = getDb()
    const existing = await db.select().from(venues).where(eq(venues.id, id)).get()
    if (!existing || existing.merchantId !== DEMO_MERCHANT_ID) return apiError("VENUE_NOT_FOUND", "Venue tidak ditemukan.", 404)

    const updatedAt = new Date().toISOString()
    const [updated] = await db
      .update(venues)
      .set({
        ...parsed.data,
        description: parsed.data.description === "" ? null : parsed.data.description,
        area: parsed.data.area === "" ? null : parsed.data.area,
        imageUrl: parsed.data.imageUrl === "" ? null : parsed.data.imageUrl,
        ...(parsed.data.name ? { slug: `${slugify(parsed.data.name)}-${id.slice(0, 8)}` } : {}),
        updatedAt,
      })
      .where(eq(venues.id, id))
      .returning()

    await db.insert(auditLogs).values({
      id: crypto.randomUUID(),
      actorUserId: DEMO_MERCHANT_USER_ID,
      action: "venue.updated",
      entityType: "venue",
      entityId: id,
      metadata: { fields: Object.keys(parsed.data) },
    })

    return ok(updated)
  } catch (error) {
    return internalError(error)
  }
}

export async function DELETE(_request: Request, context: Context) {
  try {
    const { id } = await context.params
    const db = getDb()
    const existing = await db.select().from(venues).where(eq(venues.id, id)).get()
    if (!existing || existing.merchantId !== DEMO_MERCHANT_ID) return apiError("VENUE_NOT_FOUND", "Venue tidak ditemukan.", 404)

    await db.delete(venues).where(eq(venues.id, id))
    await db.insert(auditLogs).values({
      id: crypto.randomUUID(),
      actorUserId: DEMO_MERCHANT_USER_ID,
      action: "venue.deleted",
      entityType: "venue",
      entityId: id,
      metadata: { name: existing.name },
    })

    return ok({ id })
  } catch (error) {
    const message = error instanceof Error ? error.message : ""
    if (message.includes("FOREIGN KEY")) {
      return apiError("VENUE_IN_USE", "Venue memiliki booking dan tidak dapat dihapus. Arsipkan venue sebagai gantinya.", 409)
    }
    return internalError(error)
  }
}
