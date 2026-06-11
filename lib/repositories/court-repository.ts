import { eq } from "drizzle-orm"
import type { SportcationDbExecutor } from "@/lib/db"
import { courts, slots, venues } from "@/lib/db/schema"

export function listMerchantCourts(db: SportcationDbExecutor, merchantId: string) {
  return db
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
    .where(eq(venues.merchantId, merchantId))
}

export function findOwnedCourt(db: SportcationDbExecutor, id: string) {
  return db
    .select({
      court: courts,
      merchantId: venues.merchantId,
    })
    .from(courts)
    .innerJoin(venues, eq(courts.venueId, venues.id))
    .where(eq(courts.id, id))
    .get()
}

export function findCourtSlot(db: SportcationDbExecutor, courtId: string) {
  return db.select({ id: slots.id }).from(slots).where(eq(slots.courtId, courtId)).get()
}

export function insertCourt(db: SportcationDbExecutor, values: typeof courts.$inferInsert) {
  return db.insert(courts).values(values).returning()
}

export function updateCourt(db: SportcationDbExecutor, id: string, values: Partial<typeof courts.$inferInsert>) {
  return db.update(courts).set(values).where(eq(courts.id, id)).returning()
}

export function deleteCourt(db: SportcationDbExecutor, id: string) {
  return db.delete(courts).where(eq(courts.id, id))
}
