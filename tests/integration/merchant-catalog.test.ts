import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { eq } from "drizzle-orm"
import type { SportcationDb } from "@/lib/db"
import { auditLogs, courts, merchantProfiles, slots, sportCategories, users, venues } from "@/lib/db/schema"
import { DomainError, isConstraintError } from "@/lib/domain/errors"
import { listCategories } from "@/lib/services/category-service"
import { createCourt, deleteCourt, listCourts, updateCourt } from "@/lib/services/court-service"
import { createSlot, deleteSlot, listSlots, updateSlot } from "@/lib/services/slot-service"
import { createVenue, deleteVenue, getVenue, listVenues, updateVenue } from "@/lib/services/venue-service"
import { seedIds } from "@/lib/db/seed-data"
import { createTestDatabase } from "@/tests/helpers/database"

describe("merchant catalog services", () => {
  let db: SportcationDb
  let cleanup: () => Promise<void>
  const actor = {
    userId: seedIds.merchantUser,
    merchantId: seedIds.merchant,
  }

  beforeEach(async () => {
    const testDatabase = await createTestDatabase()
    db = testDatabase.db
    cleanup = testDatabase.cleanup
  })

  afterEach(async () => {
    await cleanup()
  })

  it("creates, lists, updates, and deletes a venue with an initial court and audit trail", async () => {
    const created = await createVenue(db, actor, {
      categoryId: seedIds.padel,
      name: "Integration Padel",
      description: "Created by an isolated integration test.",
      address: "Jl. Integration No. 1",
      city: "Jakarta",
      area: "Jakarta Selatan",
      priceFrom: 275000,
      imageUrl: "",
      status: "draft",
      defaultCourtName: "Court Integration",
    })

    const listed = await listVenues(db, actor.merchantId, "integration")
    expect(listed).toHaveLength(1)
    expect(listed[0].courts).toHaveLength(1)

    const updated = await updateVenue(db, actor, created.id, {
      name: "Integration Padel Updated",
      status: "review",
    })
    expect(updated.name).toBe("Integration Padel Updated")
    expect(updated.status).toBe("review")

    await deleteVenue(db, actor, created.id)
    await expect(getVenue(db, actor.merchantId, created.id)).rejects.toMatchObject({
      code: "VENUE_NOT_FOUND",
      status: 404,
    })

    const events = await db
      .select({ action: auditLogs.action })
      .from(auditLogs)
      .where(eq(auditLogs.entityId, created.id))
    expect(events.map((event) => event.action)).toEqual([
      "venue.created",
      "venue.updated",
      "venue.deleted",
    ])
  })

  it("does not expose another merchant's venue", async () => {
    const secondOwnerId = "user-second-owner"
    const secondMerchantId = "merchant-second"
    await db.insert(users).values({
      id: secondOwnerId,
      name: "Second Owner",
      email: "second.owner@example.local",
      role: "merchant_owner",
    })
    await db.insert(merchantProfiles).values({
      id: secondMerchantId,
      ownerUserId: secondOwnerId,
      businessName: "Second Merchant",
      status: "verified",
    })

    await expect(getVenue(db, secondMerchantId, seedIds.venuePadel)).rejects.toBeInstanceOf(DomainError)
  })

  it("rejects unknown categories and protects venues referenced by bookings", async () => {
    await expect(
      createVenue(db, actor, {
        categoryId: "missing-category",
        name: "Unknown Category Venue",
        description: "",
        address: "Jl. Missing Category",
        city: "Jakarta",
        area: "",
        priceFrom: 200000,
        imageUrl: "",
        status: "draft",
        defaultCourtName: "Court 01",
      }),
    ).rejects.toMatchObject({ code: "CATEGORY_NOT_FOUND", status: 404 })

    await expect(deleteVenue(db, actor, seedIds.venuePadel)).rejects.toMatchObject({
      code: "VENUE_IN_USE",
      status: 409,
    })
  })

  it("lists only active categories in configured order", async () => {
    await db.insert(sportCategories).values({
      id: "category-hidden",
      slug: "hidden",
      name: "Hidden",
      sortOrder: 0,
      isActive: false,
    })

    const categories = await listCategories(db)
    expect(categories.map((category) => category.name)).toEqual(["Padel", "Tennis", "Futsal", "Golf"])
  })

  it("creates, updates, lists, and deletes a court with audit records", async () => {
    const court = await createCourt(db, actor, {
      venueId: seedIds.venueTennis,
      name: "Court Lifecycle",
      surface: "",
      isIndoor: false,
      status: "active",
    })
    const listed = await listCourts(db, actor.merchantId)
    expect(listed.some((item) => item.id === court.id)).toBe(true)

    const updated = await updateCourt(db, actor, court.id, {
      surface: "Hard court",
      isIndoor: true,
      status: "maintenance",
    })
    expect(updated.surface).toBe("Hard court")
    expect(updated.status).toBe("maintenance")

    await deleteCourt(db, actor, court.id)
    expect(await db.select().from(courts).where(eq(courts.id, court.id)).get()).toBeUndefined()

    const events = await db
      .select({ action: auditLogs.action })
      .from(auditLogs)
      .where(eq(auditLogs.entityId, court.id))
    expect(events.map((event) => event.action)).toEqual([
      "court.created",
      "court.updated",
      "court.deleted",
    ])
  })

  it("enforces court ownership and foreign-key deletion rules", async () => {
    const court = await createCourt(db, actor, {
      venueId: seedIds.venuePadel,
      name: "Court With Slot",
      surface: "Turf",
      isIndoor: true,
      status: "active",
    })
    await createSlot(db, actor, {
      courtId: court.id,
      slotDate: "2026-07-01",
      startTime: "08:00",
      endTime: "09:00",
      price: 300000,
      status: "available",
    })

    await expect(deleteCourt(db, actor, court.id)).rejects.toMatchObject({
      code: "COURT_IN_USE",
      status: 409,
    })

    await expect(
      createCourt(db, { ...actor, merchantId: "merchant-other" }, {
        venueId: seedIds.venuePadel,
        name: "Unauthorized Court",
        surface: "",
        isIndoor: false,
        status: "active",
      }),
    ).rejects.toMatchObject({ code: "VENUE_NOT_FOUND", status: 404 })
  })

  it("enforces slot conflicts, time ranges, and booked-slot deletion", async () => {
    await expect(
      createSlot(db, actor, {
        courtId: seedIds.courtPadel,
        slotDate: "2026-06-15",
        startTime: "08:00",
        endTime: "09:00",
        price: 350000,
        status: "available",
      }),
    ).rejects.toMatchObject({ code: "SLOT_CONFLICT", status: 409 })

    await expect(
      updateSlot(db, actor, seedIds.slotAvailable, {
        startTime: "12:00",
        endTime: "11:00",
      }),
    ).rejects.toMatchObject({ code: "INVALID_TIME_RANGE", status: 400 })

    await expect(deleteSlot(db, actor, seedIds.slotBooked)).rejects.toMatchObject({
      code: "SLOT_BOOKED",
      status: 409,
    })

    const persistedBookedSlot = await db.select().from(slots).where(eq(slots.id, seedIds.slotBooked)).get()
    expect(persistedBookedSlot).toBeDefined()
  })

  it("creates, searches, updates, and deletes an available slot", async () => {
    const slot = await createSlot(db, actor, {
      courtId: seedIds.courtTennis,
      slotDate: "2026-07-10",
      startTime: "14:00",
      endTime: "15:00",
      price: 250000,
      status: "available",
    })

    const searchResults = await listSlots(db, actor.merchantId, "elite tennis")
    expect(searchResults.some((item) => item.id === slot.id)).toBe(true)

    const updated = await updateSlot(db, actor, slot.id, {
      startTime: "15:00",
      endTime: "16:00",
      price: 265000,
      status: "blocked",
    })
    expect(updated.price).toBe(265000)
    expect(updated.status).toBe("blocked")

    await deleteSlot(db, actor, slot.id)
    expect(await db.select().from(slots).where(eq(slots.id, slot.id)).get()).toBeUndefined()

    const events = await db
      .select({ action: auditLogs.action })
      .from(auditLogs)
      .where(eq(auditLogs.entityId, slot.id))
    expect(events.map((event) => event.action)).toEqual([
      "slot.created",
      "slot.updated",
      "slot.deleted",
    ])
  })

  it("rejects slots on courts owned by another merchant", async () => {
    await expect(
      createSlot(db, { ...actor, merchantId: "merchant-other" }, {
        courtId: seedIds.courtTennis,
        slotDate: "2026-07-11",
        startTime: "14:00",
        endTime: "15:00",
        price: 250000,
        status: "available",
      }),
    ).rejects.toMatchObject({ code: "COURT_NOT_FOUND", status: 404 })
  })

  it("rolls back venue creation when the initial court conflicts", async () => {
    const existingVenueCount = (await db.select().from(venues)).length
    const existingCourt = await db.select().from(courts).where(eq(courts.id, seedIds.courtPadel)).get()
    expect(existingCourt).toBeDefined()

    let call = 0
    await expect(
      createVenue(
        db,
        actor,
        {
          categoryId: seedIds.padel,
          name: "Rollback Venue",
          description: "",
          address: "Jl. Rollback No. 1",
          city: "Jakarta",
          area: "",
          priceFrom: 200000,
          imageUrl: "",
          status: "draft",
          defaultCourtName: "Duplicate Court ID",
        },
        {
          newId: () => {
            call += 1
            return call === 1 ? "venue-transaction-test" : seedIds.courtPadel
          },
        },
      ),
    ).rejects.toBeDefined()

    expect((await db.select().from(venues)).length).toBe(existingVenueCount)
  })

  it("rolls back venue, court, and slot mutations when audit persistence fails", async () => {
    const invalidActor = {
      ...actor,
      userId: "missing-audit-actor",
    }
    const initialVenueCount = (await db.select().from(venues)).length
    const initialCourtCount = (await db.select().from(courts)).length
    const initialSlotCount = (await db.select().from(slots)).length

    await expect(
      createVenue(db, invalidActor, {
        categoryId: seedIds.padel,
        name: "Audit Rollback Venue",
        description: "",
        address: "Jl. Audit Rollback No. 1",
        city: "Jakarta",
        area: "",
        priceFrom: 225000,
        imageUrl: "",
        status: "draft",
        defaultCourtName: "Audit Court",
      }),
    ).rejects.toBeDefined()
    expect((await db.select().from(venues)).length).toBe(initialVenueCount)
    expect((await db.select().from(courts)).length).toBe(initialCourtCount)

    await expect(
      createCourt(db, invalidActor, {
        venueId: seedIds.venueTennis,
        name: "Audit Rollback Court",
        surface: "",
        isIndoor: false,
        status: "active",
      }),
    ).rejects.toBeDefined()
    expect((await db.select().from(courts)).length).toBe(initialCourtCount)

    await expect(
      createSlot(db, invalidActor, {
        courtId: seedIds.courtTennis,
        slotDate: "2026-08-01",
        startTime: "18:00",
        endTime: "19:00",
        price: 250000,
        status: "available",
      }),
    ).rejects.toBeDefined()
    expect((await db.select().from(slots)).length).toBe(initialSlotCount)
  })

  it("detects nested database constraint causes", () => {
    const nested = new Error("outer", {
      cause: new Error("SQLITE_CONSTRAINT: UNIQUE constraint failed"),
    })
    expect(isConstraintError(nested, "UNIQUE")).toBe(true)
    expect(isConstraintError(nested, "FOREIGN KEY")).toBe(false)
  })
})
