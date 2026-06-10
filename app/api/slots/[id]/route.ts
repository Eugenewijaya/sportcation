import { eq } from "drizzle-orm"
import { apiError, internalError, invalidRequest, ok } from "@/lib/api/http"
import { MERCHANT_SLOT_WRITE_ROLES, requireApiActor } from "@/lib/auth-access"
import { getDb } from "@/lib/db"
import { auditLogs, courts, slots, venues } from "@/lib/db/schema"
import { slotPatchSchema } from "@/lib/validation/merchant"

export const runtime = "nodejs"
type Context = { params: Promise<{ id: string }> }

async function getOwnedSlot(id: string) {
  return getDb()
    .select({ slot: slots, merchantId: venues.merchantId })
    .from(slots)
    .innerJoin(venues, eq(slots.venueId, venues.id))
    .where(eq(slots.id, id))
    .get()
}

export async function PATCH(request: Request, context: Context) {
  try {
    const access = await requireApiActor(request, ["merchant_owner", "merchant_staff"], {
      merchantRequired: true,
      merchantRoles: MERCHANT_SLOT_WRITE_ROLES,
    })
    if ("response" in access) return access.response
    const { id } = await context.params
    const parsed = slotPatchSchema.safeParse(await request.json())
    if (!parsed.success) return invalidRequest(parsed.error)
    const existing = await getOwnedSlot(id)
    if (!existing || existing.merchantId !== access.actor.merchantId) return apiError("SLOT_NOT_FOUND", "Slot tidak ditemukan.", 404)

    let venueId = existing.slot.venueId
    if (parsed.data.courtId) {
      const ownedCourt = await getDb()
        .select({ court: courts, merchantId: venues.merchantId })
        .from(courts)
        .innerJoin(venues, eq(courts.venueId, venues.id))
        .where(eq(courts.id, parsed.data.courtId))
        .get()
      if (!ownedCourt || ownedCourt.merchantId !== access.actor.merchantId) return apiError("COURT_NOT_FOUND", "Court tidak ditemukan.", 404)
      venueId = ownedCourt.court.venueId
    }

    const mergedStart = parsed.data.startTime ?? existing.slot.startTime
    const mergedEnd = parsed.data.endTime ?? existing.slot.endTime
    if (mergedEnd <= mergedStart) return apiError("INVALID_TIME_RANGE", "Waktu selesai harus setelah waktu mulai.", 400)

    const [updated] = await getDb()
      .update(slots)
      .set({ ...parsed.data, venueId, updatedAt: new Date().toISOString() })
      .where(eq(slots.id, id))
      .returning()

    await getDb().insert(auditLogs).values({
      id: crypto.randomUUID(),
      actorUserId: access.actor.user.id,
      action: "slot.updated",
      entityType: "slot",
      entityId: id,
      metadata: { fields: Object.keys(parsed.data) },
    })

    return ok(updated)
  } catch (error) {
    const message = error instanceof Error ? error.message : ""
    if (message.includes("UNIQUE")) return apiError("SLOT_CONFLICT", "Jadwal court tersebut sudah tersedia.", 409)
    return internalError(error)
  }
}

export async function DELETE(request: Request, context: Context) {
  try {
    const access = await requireApiActor(request, ["merchant_owner", "merchant_staff"], {
      merchantRequired: true,
      merchantRoles: MERCHANT_SLOT_WRITE_ROLES,
    })
    if ("response" in access) return access.response
    const { id } = await context.params
    const existing = await getOwnedSlot(id)
    if (!existing || existing.merchantId !== access.actor.merchantId) return apiError("SLOT_NOT_FOUND", "Slot tidak ditemukan.", 404)
    if (existing.slot.status === "booked") return apiError("SLOT_BOOKED", "Slot yang sudah dipesan tidak dapat dihapus.", 409)

    await getDb().delete(slots).where(eq(slots.id, id))
    await getDb().insert(auditLogs).values({
      id: crypto.randomUUID(),
      actorUserId: access.actor.user.id,
      action: "slot.deleted",
      entityType: "slot",
      entityId: id,
      metadata: { courtId: existing.slot.courtId },
    })
    return ok({ id })
  } catch (error) {
    return internalError(error)
  }
}
