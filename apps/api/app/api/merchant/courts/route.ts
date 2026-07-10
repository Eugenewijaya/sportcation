import { internalError, ok } from "@/lib/api/http"
import { requireApiActor } from "@/lib/auth-access"
import { getDb } from "@/lib/db"
import { courts, venues } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

/**
 * GET /api/merchant/courts
 * Returns all courts belonging to the authenticated merchant's venues.
 * Used by slot creation form.
 */
export async function GET(request: Request) {
  try {
    const access = await requireApiActor(request, ["merchant_owner", "merchant_staff"], {
      merchantRequired: true,
    })
    if ("response" in access) return access.response

    const merchantId = access.actor.merchantId!
    const db = getDb()

    const merchantVenues = await db.query.venues.findMany({
      where: eq(venues.merchantId, merchantId),
      columns: { id: true, name: true },
    })

    const venueIds = merchantVenues.map((v) => v.id)
    if (venueIds.length === 0) return ok([])

    const venueMap = Object.fromEntries(merchantVenues.map((v) => [v.id, v.name]))

    const rows = await db.select().from(courts).where(
      // venueIds could be many — using inArray if we have the helper, else loop
      // Using simple eq for now (acceptable for typical merchant with few venues)
      // ponytail: if merchant has many venues, switch to inArray from drizzle-orm
      eq(courts.status, "active"),
    )

    const myCourts = rows
      .filter((c) => venueIds.includes(c.venueId))
      .map((c) => ({
        id: c.id,
        name: c.name,
        venueName: venueMap[c.venueId] ?? "Unknown",
      }))

    return ok(myCourts)
  } catch (error) {
    return internalError(error)
  }
}
