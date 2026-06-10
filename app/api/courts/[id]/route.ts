import { eq } from "drizzle-orm"
import { apiError, internalError, invalidRequest, ok } from "@/lib/api/http"
import { getDb } from "@/lib/db"
import { DEMO_MERCHANT_ID, DEMO_MERCHANT_USER_ID } from "@/lib/db/constants"
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
    const { id } = await context.params
    const parsed = courtPatchSchema.safeParse(await request.json())
    if (!parsed.success) return invalidRequest(parsed.error)
    const existing = await getOwnedCourt(id)
    if (!existing || existing.merchantId !== DEMO_MERCHANT_ID) return apiError("COURT_NOT_FOUND", "Court tidak ditemukan.", 404)

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
      actorUserId: DEMO_MERCHANT_USER_ID,
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

export async function DELETE(_request: Request, context: Context) {
  try {
    const { id } = await context.params
    const existing = await getOwnedCourt(id)
    if (!existing || existing.merchantId !== DEMO_MERCHANT_ID) return apiError("COURT_NOT_FOUND", "Court tidak ditemukan.", 404)
    await getDb().delete(courts).where(eq(courts.id, id))
    return ok({ id })
  } catch (error) {
    const message = error instanceof Error ? error.message : ""
    if (message.includes("FOREIGN KEY")) return apiError("COURT_IN_USE", "Court masih memiliki slot atau booking.", 409)
    return internalError(error)
  }
}
