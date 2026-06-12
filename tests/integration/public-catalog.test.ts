import { afterEach, beforeEach, describe, expect, it } from "vitest"
import type { SportcationDb } from "@/lib/db"
import { courts, slots, venues } from "@/lib/db/schema"
import { seedIds } from "@/lib/db/seed-data"
import { getPublicCatalog, getPublicVenue } from "@/lib/services/public-catalog-service"
import { createTestDatabase } from "@/tests/helpers/database"

describe("public catalog services", () => {
  let db: SportcationDb
  let cleanup: () => Promise<void>

  beforeEach(async () => {
    const testDatabase = await createTestDatabase()
    db = testDatabase.db
    cleanup = testDatabase.cleanup
  })

  afterEach(async () => {
    await cleanup()
  })

  it("returns only published venues with active courts and available slots", async () => {
    await db.insert(venues).values({
      id: "venue-draft-private",
      merchantId: seedIds.merchant,
      categoryId: seedIds.padel,
      name: "Draft Private Arena",
      slug: "draft-private-arena",
      description: "Should not leak to public catalog.",
      address: "Jl. Private No. 1",
      city: "Jakarta",
      area: "Jakarta Selatan",
      priceFrom: 999000,
      status: "draft",
    })
    await db.insert(courts).values({
      id: "court-draft-private",
      venueId: "venue-draft-private",
      name: "Private Court",
      status: "active",
    })
    await db.insert(slots).values({
      id: "slot-draft-private",
      venueId: "venue-draft-private",
      courtId: "court-draft-private",
      slotDate: "2026-06-20",
      startTime: "12:00",
      endTime: "13:00",
      price: 999000,
      status: "available",
    })
    await db.insert(slots).values({
      id: "slot-padel-blocked-public",
      venueId: seedIds.venuePadel,
      courtId: seedIds.courtPadel,
      slotDate: "2026-06-15",
      startTime: "12:00",
      endTime: "13:00",
      price: 350000,
      status: "blocked",
    })

    const catalog = await getPublicCatalog(db, { pageSize: 10 })
    const venueNames = catalog.venues.map((venue) => venue.name)
    expect(venueNames).toContain("Padel Arena")
    expect(venueNames).toContain("Elite Tennis SCBD")
    expect(venueNames).not.toContain("Draft Private Arena")

    const padel = catalog.venues.find((venue) => venue.id === seedIds.venuePadel)
    expect(padel?.slots.map((slot) => slot.id)).toEqual([seedIds.slotAvailable])
    expect(padel?.slots.every((slot) => slot.status === "available")).toBe(true)
  })

  it("filters public venues by category, search, price, and available date", async () => {
    const tennis = await getPublicCatalog(db, { q: "tennis", category: "tennis", pageSize: 10 })
    expect(tennis.venues.map((venue) => venue.id)).toEqual([seedIds.venueTennis])

    const padel = await getPublicCatalog(db, { category: "padel", maxPrice: 400000, availableDate: "2026-06-15" })
    expect(padel.venues.map((venue) => venue.id)).toEqual([seedIds.venuePadel])
    expect(padel.venues[0].slots.map((slot) => slot.id)).toEqual([seedIds.slotAvailable])

    const unavailableDate = await getPublicCatalog(db, { category: "padel", availableDate: "2026-07-30" })
    expect(unavailableDate.venues[0].slots).toEqual([])
  })

  it("does not return unpublished venue details", async () => {
    await db.insert(venues).values({
      id: "venue-review-hidden",
      merchantId: seedIds.merchant,
      categoryId: seedIds.futsal,
      name: "Review Hidden Arena",
      slug: "review-hidden-arena",
      address: "Jl. Review No. 1",
      city: "Jakarta",
      area: "Jakarta Barat",
      priceFrom: 120000,
      status: "review",
    })

    await expect(getPublicVenue(db, "venue-review-hidden")).resolves.toBeUndefined()

    const publicVenue = await getPublicVenue(db, seedIds.venuePadel)
    expect(publicVenue?.id).toBe(seedIds.venuePadel)
    expect(publicVenue?.slots.map((slot) => slot.id)).toEqual([seedIds.slotAvailable])
  })
})
