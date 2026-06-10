import { eq } from "drizzle-orm"
import { apiError, internalError, invalidRequest, ok } from "@/lib/api/http"
import { MERCHANT_CATALOG_WRITE_ROLES, MERCHANT_READ_ROLES, requireApiActor } from "@/lib/auth-access"
import { getDb } from "@/lib/db"
import { auditLogs, venues } from "@/lib/db/schema"
import { slugify, venuePatchSchema } from "@/lib/validation/merchant"

export const runtime = "nodejs"

type Context = { params: Promise<{ id: string }> }

export async function GET(request: Request, context: Context) {
  try {
    const access = await requireApiActor(request, ["merchant_owner", "merchant_staff"], {
      merchantRequired: true,
      merchantRoles: MERCHANT_READ_ROLES,
    })
    if ("response" in access) return access.response
    const { id } = await context.params
    const data = await getDb().select().from(venues).where(eq(venues.id, id)).get()
    if (!data || data.merchantId !== access.actor.merchantId) return apiError("VENUE_NOT_FOUND", "Venue tidak ditemukan.", 404)
    return ok(data)
  } catch (error) {
    return internalError(error)
  }
}
export async function PATCH(request: Request, context: Context) {
  try {
    const access = await requireApiActor(request, ["merchant_owner", "merchant_staff"], {
      merchantRequired: true,
      merchantRoles: MERCHANT_CATALOG_WRITE_ROLES,
    })
    if ("response" in access) return access.response
    const { id } = await context.params
    const parsed = venuePatchSchema.safeParse(await request.json())
    if (!parsed.success) return invalidRequest(parsed.error)

    const db = getDb()
    const existing = await db.select().from(venues).where(eq(venues.id, id)).get()
    if (!existing || existing.merchantId !== access.actor.merchantId) return apiError("VENUE_NOT_FOUND", "Venue tidak ditemukan.", 404)

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
      actorUserId: access.actor.user.id,
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

export async function DELETE(request: Request, context: Context) {
  try {
    const access = await requireApiActor(request, ["merchant_owner", "merchant_staff"], {
      merchantRequired: true,
      merchantRoles: MERCHANT_CATALOG_WRITE_ROLES,
    })
    if ("response" in access) return access.response
    const { id } = await context.params
    const db = getDb()
    const existing = await db.select().from(venues).where(eq(venues.id, id)).get()
    if (!existing || existing.merchantId !== access.actor.merchantId) return apiError("VENUE_NOT_FOUND", "Venue tidak ditemukan.", 404)

    await db.delete(venues).where(eq(venues.id, id))
    await db.insert(auditLogs).values({
      id: crypto.randomUUID(),
      actorUserId: access.actor.user.id,
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
