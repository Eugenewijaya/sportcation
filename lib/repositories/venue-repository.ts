import { asc, desc, eq } from "drizzle-orm"
import type { SportcationDbExecutor } from "@/lib/db"
import { courts, sportCategories, venues } from "@/lib/db/schema"

export function listMerchantVenueRows(db: SportcationDbExecutor, merchantId: string) {
  return db
    .select({
      id: venues.id,
      categoryId: venues.categoryId,
      categoryName: sportCategories.name,
      name: venues.name,
      slug: venues.slug,
      description: venues.description,
      address: venues.address,
      city: venues.city,
      area: venues.area,
      priceFrom: venues.priceFrom,
      rating: venues.rating,
      reviewCount: venues.reviewCount,
      imageUrl: venues.imageUrl,
      status: venues.status,
      updatedAt: venues.updatedAt,
    })
    .from(venues)
    .innerJoin(sportCategories, eq(venues.categoryId, sportCategories.id))
    .where(eq(venues.merchantId, merchantId))
    .orderBy(desc(venues.updatedAt))
}

export function listMerchantVenueCourts(db: SportcationDbExecutor, merchantId: string) {
  return db
    .select({
      id: courts.id,
      venueId: courts.venueId,
      name: courts.name,
      status: courts.status,
    })
    .from(courts)
    .innerJoin(venues, eq(courts.venueId, venues.id))
    .where(eq(venues.merchantId, merchantId))
}

export function findVenueById(db: SportcationDbExecutor, id: string) {
  return db.select().from(venues).where(eq(venues.id, id)).get()
}

export function findCategoryById(db: SportcationDbExecutor, id: string) {
  return db.select({ id: sportCategories.id }).from(sportCategories).where(eq(sportCategories.id, id)).get()
}

export function listActiveCategories(db: SportcationDbExecutor) {
  return db
    .select()
    .from(sportCategories)
    .where(eq(sportCategories.isActive, true))
    .orderBy(asc(sportCategories.sortOrder), asc(sportCategories.name))
}

export function insertVenue(db: SportcationDbExecutor, values: typeof venues.$inferInsert) {
  return db.insert(venues).values(values).returning()
}

export function updateVenue(db: SportcationDbExecutor, id: string, values: Partial<typeof venues.$inferInsert>) {
  return db.update(venues).set(values).where(eq(venues.id, id)).returning()
}

export function deleteVenue(db: SportcationDbExecutor, id: string) {
  return db.delete(venues).where(eq(venues.id, id))
}
