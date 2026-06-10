import { desc, eq } from "drizzle-orm"
import { apiError, internalError, invalidRequest, ok } from "@/lib/api/http"
import { DEMO_MERCHANT_ID, DEMO_MERCHANT_USER_ID } from "@/lib/db/constants"
import { getDb } from "@/lib/db"
import { auditLogs, courts, sportCategories, venues } from "@/lib/db/schema"
import { slugify, venueInputSchema } from "@/lib/validation/merchant"

export const runtime = "nodejs"

export async function GET(request: Request) {
  try {
    const query = new URL(request.url).searchParams.get("q")?.trim().toLowerCase() ?? ""
    const db = getDb()
    const venueRows = await db
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
      .where(eq(venues.merchantId, DEMO_MERCHANT_ID))
      .orderBy(desc(venues.updatedAt))

    const courtRows = await db
      .select({ id: courts.id, venueId: courts.venueId, name: courts.name, status: courts.status })
      .from(courts)

    const data = venueRows
      .map((venue) => ({
        ...venue,
        courts: courtRows.filter((court) => court.venueId === venue.id),
      }))
      .filter((venue) =>
        query
          ? [venue.name, venue.categoryName, venue.city, venue.area, venue.status]
              .filter(Boolean)
              .join(" ")
              .toLowerCase()
              .includes(query)
          : true,
      )

    return ok(data)
  } catch (error) {
    return internalError(error)
  }
}
export async function POST(request: Request) {
  try {
    const parsed = venueInputSchema.safeParse(await request.json())
    if (!parsed.success) return invalidRequest(parsed.error)

    const db = getDb()
    const category = await db
      .select({ id: sportCategories.id })
      .from(sportCategories)
      .where(eq(sportCategories.id, parsed.data.categoryId))
      .get()
    if (!category) return apiError("CATEGORY_NOT_FOUND", "Kategori olahraga tidak ditemukan.", 404)

    const venueId = crypto.randomUUID()
    const courtId = crypto.randomUUID()
    const now = new Date().toISOString()
    const baseSlug = slugify(parsed.data.name) || "venue"
    const slug = `${baseSlug}-${venueId.slice(0, 8)}`

    const [created] = await db.transaction(async (tx) => {
      const createdVenues = await tx
        .insert(venues)
        .values({
          id: venueId,
          merchantId: DEMO_MERCHANT_ID,
          categoryId: parsed.data.categoryId,
          name: parsed.data.name,
          slug,
          description: parsed.data.description || null,
          address: parsed.data.address,
          city: parsed.data.city,
          area: parsed.data.area || null,
          priceFrom: parsed.data.priceFrom,
          imageUrl: parsed.data.imageUrl || null,
          status: parsed.data.status,
          createdAt: now,
          updatedAt: now,
        })
        .returning()

      await tx.insert(courts).values({
        id: courtId,
        venueId,
        name: parsed.data.defaultCourtName,
        status: "active",
        createdAt: now,
        updatedAt: now,
      })

      await tx.insert(auditLogs).values({
        id: crypto.randomUUID(),
        actorUserId: DEMO_MERCHANT_USER_ID,
        action: "venue.created",
        entityType: "venue",
        entityId: venueId,
        metadata: { name: parsed.data.name },
      })

      return createdVenues
    })

    return ok(created, { status: 201 })
  } catch (error) {
    return internalError(error)
  }
}
