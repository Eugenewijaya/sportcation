import { desc, eq } from "drizzle-orm"
import { apiError, internalError, invalidRequest, ok } from "@/lib/api/http"
import { MERCHANT_READ_ROLES, MERCHANT_SLOT_WRITE_ROLES, requireApiActor } from "@/lib/auth-access"
import { getDb } from "@/lib/db"
import { auditLogs, courts, slots, venues } from "@/lib/db/schema"
import { slotInputSchema } from "@/lib/validation/merchant"

export const runtime = "nodejs"

export async function GET(request: Request) {
  try {
    const access = await requireApiActor(request, ["merchant_owner", "merchant_staff"], {
      merchantRequired: true,
      merchantRoles: MERCHANT_READ_ROLES,
    })
    if ("response" in access) return access.response
    const query = new URL(request.url).searchParams.get("q")?.trim().toLowerCase() ?? ""
    const rows = await getDb()
      .select({
        id: slots.id,
        venueId: slots.venueId,
        venueName: venues.name,
        courtId: slots.courtId,
        courtName: courts.name,
        slotDate: slots.slotDate,
        startTime: slots.startTime,
        endTime: slots.endTime,
        price: slots.price,
        status: slots.status,
        updatedAt: slots.updatedAt,
      })
      .from(slots)
      .innerJoin(courts, eq(slots.courtId, courts.id))
      .innerJoin(venues, eq(slots.venueId, venues.id))
      .where(eq(venues.merchantId, access.actor.merchantId!))
      .orderBy(desc(slots.slotDate), desc(slots.startTime))

    return ok(
      query
        ? rows.filter((slot) =>
            [slot.venueName, slot.courtName, slot.slotDate, slot.startTime, slot.status].join(" ").toLowerCase().includes(query),
          )
        : rows,
    )
  } catch (error) {
    return internalError(error)
  }
}
export async function POST(request: Request) {
  try {
    const access = await requireApiActor(request, ["merchant_owner", "merchant_staff"], {
      merchantRequired: true,
      merchantRoles: MERCHANT_SLOT_WRITE_ROLES,
    })
    if ("response" in access) return access.response
    const parsed = slotInputSchema.safeParse(await request.json())
    if (!parsed.success) return invalidRequest(parsed.error)

    const db = getDb()
    const ownedCourt = await db
      .select({ court: courts, venue: venues })
      .from(courts)
      .innerJoin(venues, eq(courts.venueId, venues.id))
      .where(eq(courts.id, parsed.data.courtId))
      .get()
    if (!ownedCourt || ownedCourt.venue.merchantId !== access.actor.merchantId) {
      return apiError("COURT_NOT_FOUND", "Court tidak ditemukan.", 404)
    }

    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    const [created] = await db
      .insert(slots)
      .values({
        id,
        venueId: ownedCourt.court.venueId,
        ...parsed.data,
        createdAt: now,
        updatedAt: now,
      })
      .returning()

    await db.insert(auditLogs).values({
      id: crypto.randomUUID(),
      actorUserId: access.actor.user.id,
      action: "slot.created",
      entityType: "slot",
      entityId: id,
      metadata: { courtId: parsed.data.courtId, slotDate: parsed.data.slotDate },
    })

    return ok(created, { status: 201 })
  } catch (error) {
    const message = error instanceof Error ? error.message : ""
    if (message.includes("UNIQUE")) return apiError("SLOT_CONFLICT", "Jadwal court tersebut sudah tersedia.", 409)
    return internalError(error)
  }
}
