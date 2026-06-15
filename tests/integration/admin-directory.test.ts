import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { eq } from "drizzle-orm"
import type { SportcationDb } from "@/lib/db"
import { seedIds } from "@/lib/db/seed-data"
import { userProfiles, users, venues } from "@/lib/db/schema"
import {
  getAdminUser,
  getAdminVenue,
  listAdminUsers,
  listAdminVenues,
} from "@/lib/services/admin-directory-service"
import { createTestDatabase } from "@/tests/helpers/database"

describe("admin directory services", () => {
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

  it("lists and filters persisted users with profile, merchant, booking, and notification context", async () => {
    const platformUsers = await listAdminUsers(db)
    expect(platformUsers).toHaveLength(3)

    const customerUsers = await listAdminUsers(db, {
      q: "alex",
      role: "customer",
      status: "active",
    })
    expect(customerUsers).toHaveLength(1)
    expect(customerUsers[0]).toMatchObject({
      id: seedIds.customerUser,
      name: "Alex Rivera",
      profile: {
        city: "Jakarta",
      },
      stats: {
        bookingCount: 1,
        activeBookings: 1,
        totalSpend: 365000,
        notificationCount: 1,
      },
      review: {
        needsAttention: false,
      },
    })

    await expect(getAdminUser(db, seedIds.merchantUser)).resolves.toMatchObject({
      id: seedIds.merchantUser,
      role: "merchant_owner",
      ownedMerchant: {
        businessName: "Sportcation Venue Partner",
        status: "verified",
      },
      merchantMemberships: [
        {
          merchantId: seedIds.merchant,
          role: "owner",
        },
      ],
    })

    await expect(getAdminUser(db, "missing-user")).rejects.toMatchObject({
      code: "USER_NOT_FOUND",
      status: 404,
    })
  })

  it("flags restricted or unverified users for admin review", async () => {
    await db.insert(users).values({
      id: "user-risk-review",
      name: "Risk Review User",
      email: "risk-review@example.com",
      role: "customer",
      status: "restricted",
      emailVerified: false,
    })
    await db.insert(userProfiles).values({
      userId: "user-risk-review",
      fullName: "Risk Review User",
      city: "Jakarta",
    })

    const flaggedUsers = await listAdminUsers(db, {
      q: "risk-review",
      role: "customer",
      status: "restricted",
    })

    expect(flaggedUsers).toHaveLength(1)
    expect(flaggedUsers[0]).toMatchObject({
      id: "user-risk-review",
      review: {
        needsAttention: true,
        reason: "Account status is restricted.",
      },
    })
  })

  it("lists and filters persisted venues with merchant, inventory, and booking impact", async () => {
    const platformVenues = await listAdminVenues(db)
    expect(platformVenues).toHaveLength(2)

    const padelVenues = await listAdminVenues(db, {
      q: "padel arena",
      status: "published",
      merchantStatus: "verified",
    })
    expect(padelVenues).toHaveLength(1)
    expect(padelVenues[0]).toMatchObject({
      id: seedIds.venuePadel,
      name: "Padel Arena",
      category: {
        id: seedIds.padel,
        name: "Padel",
      },
      merchant: {
        id: seedIds.merchant,
        businessName: "Sportcation Venue Partner",
        owner: {
          id: seedIds.merchantUser,
        },
      },
      stats: {
        courtCount: 1,
        slotCount: 2,
        availableSlots: 1,
        bookedSlots: 1,
        bookingCount: 1,
        totalGmv: 365000,
      },
      review: {
        needsAttention: false,
      },
    })

    await expect(getAdminVenue(db, seedIds.venueTennis)).resolves.toMatchObject({
      id: seedIds.venueTennis,
      category: {
        name: "Tennis",
      },
    })

    await expect(getAdminVenue(db, "missing-venue")).rejects.toMatchObject({
      code: "VENUE_NOT_FOUND",
      status: 404,
    })
  })

  it("flags venues outside the published moderation state", async () => {
    await db.update(venues).set({ status: "review" }).where(eq(venues.id, seedIds.venueTennis))

    const reviewVenues = await listAdminVenues(db, {
      q: "elite tennis",
      status: "review",
      merchantStatus: "verified",
    })

    expect(reviewVenues).toHaveLength(1)
    expect(reviewVenues[0]).toMatchObject({
      id: seedIds.venueTennis,
      status: "review",
      review: {
        needsAttention: true,
        reason: "Venue status is review.",
      },
    })
  })
})
