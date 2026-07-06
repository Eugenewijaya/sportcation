import { desc, eq } from "drizzle-orm"
import type { SportcationDbExecutor } from "@/lib/db"
import { courts, slots, venues } from "@/lib/db/schema"

export function listMerchantSlots(db: SportcationDbExecutor, merchantId: string) {
  return db
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
    .where(eq(venues.merchantId, merchantId))
    .orderBy(desc(slots.slotDate), desc(slots.startTime))
}

export function findOwnedSlot(db: SportcationDbExecutor, id: string) {
  return db
    .select({
      slot: slots,
      merchantId: venues.merchantId,
    })
    .from(slots)
    .innerJoin(venues, eq(slots.venueId, venues.id))
    .where(eq(slots.id, id))
    .get()
}

export function insertSlot(db: SportcationDbExecutor, values: typeof slots.$inferInsert) {
  return db.insert(slots).values(values).returning()
}

export function updateSlot(db: SportcationDbExecutor, id: string, values: Partial<typeof slots.$inferInsert>) {
  return db.update(slots).set(values).where(eq(slots.id, id)).returning()
}

export function deleteSlot(db: SportcationDbExecutor, id: string) {
  return db.delete(slots).where(eq(slots.id, id))
}
