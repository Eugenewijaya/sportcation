import { eq } from "drizzle-orm"
import { apiError, internalError, invalidRequest, ok } from "@/lib/api/http"
import { MERCHANT_CATALOG_WRITE_ROLES, requireApiActor } from "@/lib/auth-access"
import { getDb } from "@/lib/db"
import { auditLogs, courts, venues } from "@/lib/db/schema"
import { courtPatchSchema } from "@/lib/validation/merchant"

export const runtime = "nodejs"
type Context = { params: Promise<{ id: string }> }

async function getOwnedCourt(id: string) {
  return getDb()
    .select({ court: courts, merchantId: venues.merchantId })
    .from(courts)
    .innerJoin(venues, eq(courts.venueId, venues.id))
    .where(eq(courts.id, id))
    .get()
}
export async function PATCH(request: Request, context: Context) {
  try {
    const access = await requireApiActor(request, ["merchant_owner", "merchant_staff"], {
      merchantRequired: true,
      merchantRoles: MERCHANT_CATALOG_WRITE_ROLES,
    })
    if ("response" in access) return access.response
    const { id } = await context.params
    const parsed = courtPatchSchema.safeParse(await request.json())
    if (!parsed.success) return invalidRequest(parsed.error)
    const existing = await getOwnedCourt(id)
    if (!existing || existing.merchantId !== access.actor.merchantId) return apiError("COURT_NOT_FOUND", "Court tidak ditemukan.", 404)

    const [updated] = await getDb()
      .update(courts)
      .set({
        ...parsed.data,
        surface: parsed.data.surface === "" ? null : parsed.data.surface,
        updatedAt: new Date().toISOString(),
      })
      .where(eq(courts.id, id))
      .returning()

    await getDb().insert(auditLogs).values({
      id: crypto.randomUUID(),
      actorUserId: access.actor.user.id,
      action: "court.updated",
      entityType: "court",
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
    const existing = await getOwnedCourt(id)
    if (!existing || existing.merchantId !== access.actor.merchantId) return apiError("COURT_NOT_FOUND", "Court tidak ditemukan.", 404)
    await getDb().delete(courts).where(eq(courts.id, id))
    return ok({ id })
  } catch (error) {
    const message = error instanceof Error ? error.message : ""
    if (message.includes("FOREIGN KEY")) return apiError("COURT_IN_USE", "Court masih memiliki slot atau booking.", 409)
    return internalError(error)
  }
}
