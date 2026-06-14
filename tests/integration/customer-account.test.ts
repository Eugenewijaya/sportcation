import { afterEach, beforeEach, describe, expect, it } from "vitest"
import { eq } from "drizzle-orm"
import type { SportcationDb } from "@/lib/db"
import { seedIds } from "@/lib/db/seed-data"
import { auditLogs, notifications, userProfiles, users } from "@/lib/db/schema"
import {
  getCustomerProfile,
  listCustomerNotifications,
  markAllCustomerNotificationsRead,
  markCustomerNotificationRead,
  updateCustomerProfile,
} from "@/lib/services/account-service"
import { createTestDatabase } from "@/tests/helpers/database"

describe("customer account service", () => {
  let db: SportcationDb
  let cleanup: () => Promise<void>
  const userId = seedIds.customerUser

  beforeEach(async () => {
    const testDatabase = await createTestDatabase()
    db = testDatabase.db
    cleanup = testDatabase.cleanup
  })

  afterEach(async () => {
    await cleanup()
  })

  it("returns persisted profile data with account stats", async () => {
    const profile = await getCustomerProfile(db, userId)

    expect(profile).toMatchObject({
      id: userId,
      name: "Alex Rivera",
      email: "customer@sportcation.local",
      profile: {
        fullName: "Alex Rivera",
        city: "Jakarta",
      },
      stats: {
        bookings: 1,
        unreadNotifications: 1,
      },
    })
  })

  it("creates a profile row when an authenticated user has no profile record", async () => {
    await db.delete(userProfiles).where(eq(userProfiles.userId, userId))

    const profile = await getCustomerProfile(db, userId)

    expect(profile).toMatchObject({
      id: userId,
      profile: {
        fullName: "Alex Rivera",
        city: "Jakarta",
      },
    })
    await expect(db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).get()).resolves.toMatchObject({
      fullName: "Alex Rivera",
      city: "Jakarta",
    })
  })

  it("returns not found when the profile user does not exist", async () => {
    await expect(getCustomerProfile(db, "missing-user")).rejects.toMatchObject({
      code: "PROFILE_NOT_FOUND",
      status: 404,
    })
  })

  it("updates user and profile fields with an audit log", async () => {
    const updated = await updateCustomerProfile(
      db,
      userId,
      {
        name: "Alex Customer",
        fullName: "Alex Customer Pro",
        phone: "+62 812 3456 7890",
        city: "Bandung",
      },
      fixedOptions(),
    )

    expect(updated).toMatchObject({
      name: "Alex Customer",
      phone: "+62 812 3456 7890",
      profile: {
        fullName: "Alex Customer Pro",
        city: "Bandung",
      },
    })

    await expect(db.select().from(users).where(eq(users.id, userId)).get()).resolves.toMatchObject({
      name: "Alex Customer",
      phone: "+62 812 3456 7890",
      updatedAt: "2026-06-15T09:00:00.000Z",
    })
    await expect(db.select().from(userProfiles).where(eq(userProfiles.userId, userId)).get()).resolves.toMatchObject({
      fullName: "Alex Customer Pro",
      city: "Bandung",
      updatedAt: "2026-06-15T09:00:00.000Z",
    })
    await expect(
      db.select().from(auditLogs).where(eq(auditLogs.action, "profile.updated")).get(),
    ).resolves.toMatchObject({
      actorUserId: userId,
      entityType: "user",
      entityId: userId,
    })
  })

  it("lists and marks a customer notification as read", async () => {
    const items = await listCustomerNotifications(db, userId)
    expect(items).toHaveLength(1)
    expect(items[0]).toMatchObject({
      id: seedIds.notification,
      readAt: null,
    })

    const updated = await markCustomerNotificationRead(db, userId, seedIds.notification, fixedOptions())

    expect(updated).toMatchObject({
      id: seedIds.notification,
      readAt: "2026-06-15T09:00:00.000Z",
    })
    await expect(db.select().from(auditLogs).where(eq(auditLogs.action, "notification.read")).get()).resolves.toMatchObject({
      actorUserId: userId,
      entityType: "notification",
      entityId: seedIds.notification,
    })

    const idempotent = await markCustomerNotificationRead(
      db,
      userId,
      seedIds.notification,
      {
        now: () => new Date("2026-06-16T09:00:00.000Z"),
      },
    )
    expect(idempotent.readAt).toBe("2026-06-15T09:00:00.000Z")
  })

  it("does not let a customer mark another user's notification", async () => {
    await db.insert(notifications).values({
      id: "notification-admin-only",
      userId: seedIds.adminUser,
      type: "system",
      title: "Admin only",
      body: "This notification belongs to a different user.",
    })

    await expect(markCustomerNotificationRead(db, userId, "notification-admin-only", fixedOptions())).rejects.toMatchObject({
      code: "NOTIFICATION_NOT_FOUND",
      status: 404,
    })
  })

  it("marks all unread customer notifications as read", async () => {
    await db.insert(notifications).values({
      id: "notification-customer-promo",
      userId,
      type: "promo",
      title: "Flash Sale",
      body: "A new customer deal is available.",
    })

    const updated = await markAllCustomerNotificationsRead(db, userId, fixedOptions())

    expect(updated).toHaveLength(2)
    expect(updated.every((item) => item.readAt === "2026-06-15T09:00:00.000Z")).toBe(true)
  })
})

function fixedOptions() {
  return {
    now: () => new Date("2026-06-15T09:00:00.000Z"),
  }
}
