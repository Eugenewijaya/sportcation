import { and, asc, desc, eq, gte, inArray, like, lte, or, type SQL } from "drizzle-orm"
import type { SportcationDb, SportcationDbExecutor } from "@/lib/db"
import { courts, slots, sportCategories, venues } from "@/lib/db/schema"
import type { PublicCatalogPayload, PublicCategory, PublicCourt, PublicSlot, PublicVenue } from "@/lib/public-catalog/types"
import { publicCatalogQuerySchema, type PublicCatalogQuery } from "@/lib/validation/public-catalog"

const defaultImage = "/padel-court-modern.jpg"

export async function getPublicCatalog(
  db: SportcationDb,
  input: Partial<PublicCatalogQuery> = {},
): Promise<PublicCatalogPayload> {
  const query = publicCatalogQuerySchema.parse(input)
  const [categories, venueRows] = await Promise.all([
    listPublicCategories(db),
    listPublicVenueRows(db, query),
  ])
  const pageRows = venueRows.slice(0, query.pageSize)
  const venueIds = pageRows.map((venue) => venue.id)
  const [courtRows, slotRows] = await Promise.all([
    listPublicCourts(db, venueIds),
    listPublicSlots(db, venueIds, query.availableDate),
  ])

  return {
    categories,
    venues: mapPublicVenues(pageRows, courtRows, slotRows),
    pagination: {
      page: query.page,
      pageSize: query.pageSize,
      hasMore: venueRows.length > query.pageSize,
    },
    filters: {
      q: query.q,
      category: query.category,
      area: query.area,
      minPrice: query.minPrice,
      maxPrice: query.maxPrice,
      availableDate: query.availableDate,
    },
  }
}

export async function getPublicVenue(
  db: SportcationDb,
  id: string,
  input: Pick<Partial<PublicCatalogQuery>, "availableDate"> = {},
): Promise<PublicVenue | undefined> {
  const query = publicCatalogQuerySchema.pick({ availableDate: true }).parse(input)
  const row = await db
    .select({
      id: venues.id,
      name: venues.name,
      categoryName: sportCategories.name,
      categorySlug: sportCategories.slug,
      description: venues.description,
      address: venues.address,
      city: venues.city,
      area: venues.area,
      priceFrom: venues.priceFrom,
      rating: venues.rating,
      reviewCount: venues.reviewCount,
      imageUrl: venues.imageUrl,
    })
    .from(venues)
    .innerJoin(sportCategories, eq(venues.categoryId, sportCategories.id))
    .where(and(eq(venues.id, id), eq(venues.status, "published"), eq(sportCategories.isActive, true)))
    .get()

  if (!row) return undefined

  const [courtRows, slotRows] = await Promise.all([
    listPublicCourts(db, [row.id]),
    listPublicSlots(db, [row.id], query.availableDate),
  ])

  return mapPublicVenue(row, courtRows, slotRows, 0)
}

async function listPublicCategories(db: SportcationDbExecutor): Promise<PublicCategory[]> {
  return db
    .select({
      id: sportCategories.id,
      slug: sportCategories.slug,
      name: sportCategories.name,
    })
    .from(sportCategories)
    .where(eq(sportCategories.isActive, true))
    .orderBy(asc(sportCategories.sortOrder), asc(sportCategories.name))
}

async function listPublicVenueRows(db: SportcationDbExecutor, query: PublicCatalogQuery) {
  const where = buildVenueWhere(query)
  return db
    .select({
      id: venues.id,
      name: venues.name,
      categoryName: sportCategories.name,
      categorySlug: sportCategories.slug,
      description: venues.description,
      address: venues.address,
      city: venues.city,
      area: venues.area,
      priceFrom: venues.priceFrom,
      rating: venues.rating,
      reviewCount: venues.reviewCount,
      imageUrl: venues.imageUrl,
    })
    .from(venues)
    .innerJoin(sportCategories, eq(venues.categoryId, sportCategories.id))
    .where(where)
    .orderBy(desc(venues.rating), asc(venues.priceFrom), asc(venues.name))
    .limit(query.pageSize + 1)
    .offset((query.page - 1) * query.pageSize)
}

function buildVenueWhere(query: PublicCatalogQuery) {
  const conditions: SQL[] = [eq(venues.status, "published"), eq(sportCategories.isActive, true)]

  if (query.category && query.category !== "all") {
    conditions.push(eq(sportCategories.slug, query.category))
  }
  if (query.area) {
    conditions.push(like(venues.area, `%${query.area}%`))
  }
  if (typeof query.minPrice === "number") {
    conditions.push(gte(venues.priceFrom, query.minPrice))
  }
  if (typeof query.maxPrice === "number") {
    conditions.push(lte(venues.priceFrom, query.maxPrice))
  }
  if (query.q) {
    const pattern = `%${query.q}%`
    const search = or(
      like(venues.name, pattern),
      like(venues.city, pattern),
      like(venues.area, pattern),
      like(sportCategories.name, pattern),
    )
    if (search) conditions.push(search)
  }

  return and(...conditions)
}

async function listPublicCourts(db: SportcationDbExecutor, venueIds: string[]): Promise<Array<PublicCourt & { venueId: string }>> {
  if (!venueIds.length) return []

  return db
    .select({
      id: courts.id,
      venueId: courts.venueId,
      name: courts.name,
      surface: courts.surface,
      isIndoor: courts.isIndoor,
    })
    .from(courts)
    .where(and(inArray(courts.venueId, venueIds), eq(courts.status, "active")))
    .orderBy(asc(courts.name))
}

async function listPublicSlots(db: SportcationDbExecutor, venueIds: string[], availableDate?: string): Promise<PublicSlot[]> {
  if (!venueIds.length) return []

  const conditions: SQL[] = [
    inArray(slots.venueId, venueIds),
    eq(slots.status, "available"),
    eq(courts.status, "active"),
  ]

  if (availableDate) {
    conditions.push(eq(slots.slotDate, availableDate))
  }

  const rows = await db
    .select({
      id: slots.id,
      venueId: slots.venueId,
      courtId: slots.courtId,
      courtName: courts.name,
      slotDate: slots.slotDate,
      startTime: slots.startTime,
      endTime: slots.endTime,
      price: slots.price,
      status: slots.status,
    })
    .from(slots)
    .innerJoin(courts, eq(slots.courtId, courts.id))
    .where(and(...conditions))
    .orderBy(asc(slots.slotDate), asc(slots.startTime))

  return rows.map((slot) => ({
    ...slot,
    status: "available" as const,
  }))
}

function mapPublicVenues(
  venueRows: Awaited<ReturnType<typeof listPublicVenueRows>>,
  courtRows: Array<PublicCourt & { venueId: string }>,
  slotRows: PublicSlot[],
) {
  return venueRows.map((row, index) => mapPublicVenue(row, courtRows, slotRows, index))
}

function mapPublicVenue(
  venue: Awaited<ReturnType<typeof listPublicVenueRows>>[number],
  courtRows: Array<PublicCourt & { venueId: string }>,
  slotRows: PublicSlot[],
  index: number,
): PublicVenue {
  const venueCourts = courtRows.filter((court) => court.venueId === venue.id)
  const venueSlots = slotRows.filter((slot) => slot.venueId === venue.id)
  const facilities = buildFacilities(venueCourts)
  const price = venueSlots[0]?.price ?? venue.priceFrom

  return {
    id: venue.id,
    name: venue.name,
    category: venue.categoryName,
    categorySlug: venue.categorySlug,
    location: [venue.area, venue.city].filter(Boolean).join(", "),
    city: venue.city,
    area: venue.area ?? "",
    price,
    oldPrice: price > 100000 ? Math.round(price * 1.4) : undefined,
    rating: venue.rating / 100,
    reviewCount: venue.reviewCount,
    distance: `${(1.8 + index * 1.2).toFixed(1)} km away`,
    image: venue.imageUrl || defaultImage,
    tag: index === 0 ? "Premium Venue" : venueSlots.length ? "Available" : "Featured",
    description: venue.description ?? "Verified Sportcation venue with curated facilities and bookable court slots.",
    facilities,
    courts: venueCourts.map((court) => ({
      id: court.id,
      name: court.name,
      surface: court.surface,
      isIndoor: court.isIndoor,
    })),
    slots: venueSlots,
  }
}

function buildFacilities(courtsForVenue: Array<PublicCourt & { venueId: string }>) {
  const values = new Set(["Parking", "Locker", "Shower"])
  if (courtsForVenue.some((court) => court.isIndoor)) values.add("Indoor")
  if (courtsForVenue.length > 1) values.add("Multi Court")
  return [...values]
}
