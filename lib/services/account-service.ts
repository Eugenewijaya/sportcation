import { and, desc, eq, isNull } from "drizzle-orm"
import type { SportcationDb, SportcationDbExecutor } from "@/lib/db"
import { auditLogs, bookings, notifications, userProfiles, users } from "@/lib/db/schema"
import type { CustomerNotification, CustomerProfile } from "@/lib/customer-account/types"
import { DomainError } from "@/lib/domain/errors"
import { createAuditRecord } from "@/lib/services/audit-service"
import type { UpdateCustomerProfileInput } from "@/lib/validation/account"

type AccountServiceOptions = {
  now?: () => Date
}

const customerPointsPlaceholder = 8_400

export async function getCustomerProfile(
  db: SportcationDbExecutor,
  userId: string,
): Promise<CustomerProfile> {
  const row = await selectCustomerProfileRow(db, userId)
  if (!row) throw new DomainError("PROFILE_NOT_FOUND", "Profil pengguna tidak ditemukan.", 404)

  const profile = await ensureProfileExists(db, row, userId)
  return mapCustomerProfile(profile)
}

export async function updateCustomerProfile(
  db: SportcationDb,
  userId: string,
  input: UpdateCustomerProfileInput,
  options: AccountServiceOptions = {},
): Promise<CustomerProfile> {
  return db.transaction(async (tx) => {
    const existing = await selectCustomerProfileRow(tx, userId)
    if (!existing) throw new DomainError("PROFILE_NOT_FOUND", "Profil pengguna tidak ditemukan.", 404)

    const now = (options.now ?? (() => new Date()))().toISOString()
    const nextName = normalizeOptional(input.name) ?? existing.name
    const nextFullName = normalizeOptional(input.fullName) ?? existing.fullName ?? nextName
    const nextPhone = normalizeOptional(input.phone)
    const nextCity = normalizeOptional(input.city)
    const nextAvatarUrl = normalizeOptional(input.avatarUrl)

    await tx
      .update(users)
      .set({
        name: nextName,
        phone: typeof input.phone === "undefined" ? existing.phone : nextPhone,
        image: typeof input.avatarUrl === "undefined" ? existing.image : nextAvatarUrl,
        updatedAt: now,
      })
      .where(eq(users.id, userId))

    await tx
      .insert(userProfiles)
      .values({
        userId,
        fullName: nextFullName,
        avatarUrl: typeof input.avatarUrl === "undefined" ? existing.avatarUrl : nextAvatarUrl,
        city: typeof input.city === "undefined" ? existing.city : nextCity,
        createdAt: existing.profileCreatedAt ?? now,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: userProfiles.userId,
        set: {
          fullName: nextFullName,
          avatarUrl: typeof input.avatarUrl === "undefined" ? existing.avatarUrl : nextAvatarUrl,
          city: typeof input.city === "undefined" ? existing.city : nextCity,
          updatedAt: now,
        },
      })

    await tx.insert(auditLogs).values(
      createAuditRecord({
        actorUserId: userId,
        action: "profile.updated",
        entityType: "user",
        entityId: userId,
        metadata: {
          fields: Object.keys(input),
        },
      }),
    )

    return getCustomerProfile(tx, userId)
  })
}

export async function listCustomerNotifications(
  db: SportcationDbExecutor,
  userId: string,
): Promise<CustomerNotification[]> {
  const rows = await db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))

  return rows.map(mapCustomerNotification)
}

export async function markCustomerNotificationRead(
  db: SportcationDb,
  userId: string,
  notificationId: string,
  options: AccountServiceOptions = {},
): Promise<CustomerNotification> {
  return db.transaction(async (tx) => {
    const existing = await tx
      .select()
      .from(notifications)
      .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)))
      .get()

    if (!existing) {
      throw new DomainError("NOTIFICATION_NOT_FOUND", "Notifikasi tidak ditemukan.", 404)
    }

    if (!existing.readAt) {
      const readAt = (options.now ?? (() => new Date()))().toISOString()
      await tx
        .update(notifications)
        .set({ readAt })
        .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)))

      await tx.insert(auditLogs).values(
        createAuditRecord({
          actorUserId: userId,
          action: "notification.read",
          entityType: "notification",
          entityId: notificationId,
        }),
      )
    }

    const updated = await tx
      .select()
      .from(notifications)
      .where(and(eq(notifications.id, notificationId), eq(notifications.userId, userId)))
      .get()

    if (!updated) {
      throw new DomainError("NOTIFICATION_NOT_FOUND", "Notifikasi tidak ditemukan.", 404)
    }
    return mapCustomerNotification(updated)
  })
}

export async function markAllCustomerNotificationsRead(
  db: SportcationDb,
  userId: string,
  options: AccountServiceOptions = {},
): Promise<CustomerNotification[]> {
  return db.transaction(async (tx) => {
    const readAt = (options.now ?? (() => new Date()))().toISOString()
    await tx
      .update(notifications)
      .set({ readAt })
      .where(and(eq(notifications.userId, userId), isNull(notifications.readAt)))

    await tx.insert(auditLogs).values(
      createAuditRecord({
        actorUserId: userId,
        action: "notification.read_all",
        entityType: "notification",
        metadata: {
          scope: "customer",
        },
      }),
    )

    return listCustomerNotifications(tx, userId)
  })
}

function normalizeOptional(value: string | undefined) {
  if (typeof value === "undefined") return undefined
  const trimmed = value.trim()
  return trimmed.length ? trimmed : null
}

async function selectCustomerProfileRow(db: SportcationDbExecutor, userId: string) {
  const user = await db
    .select({
      id: users.id,
      name: users.name,
      email: users.email,
      phone: users.phone,
      image: users.image,
      role: users.role,
      status: users.status,
      fullName: userProfiles.fullName,
      avatarUrl: userProfiles.avatarUrl,
      city: userProfiles.city,
      profileCreatedAt: userProfiles.createdAt,
      bookingId: bookings.id,
      notificationId: notifications.id,
    })
    .from(users)
    .leftJoin(userProfiles, eq(userProfiles.userId, users.id))
    .leftJoin(bookings, eq(bookings.userId, users.id))
    .leftJoin(notifications, and(eq(notifications.userId, users.id), isNull(notifications.readAt)))
    .where(eq(users.id, userId))

  if (!user.length) return undefined

  const first = user[0]
  return {
    ...first,
    bookingCount: new Set(user.map((row) => row.bookingId).filter(Boolean)).size,
    unreadNotificationCount: new Set(user.map((row) => row.notificationId).filter(Boolean)).size,
  }
}

async function ensureProfileExists(
  db: SportcationDbExecutor,
  row: NonNullable<Awaited<ReturnType<typeof selectCustomerProfileRow>>>,
  userId: string,
) {
  if (row.fullName) return row

  const now = new Date().toISOString()
  await db.insert(userProfiles).values({
    userId,
    fullName: row.name,
    city: "Jakarta",
    createdAt: now,
    updatedAt: now,
  })

  return {
    ...row,
    fullName: row.name,
    avatarUrl: null,
    city: "Jakarta",
    profileCreatedAt: now,
  }
}

function mapCustomerProfile(row: NonNullable<Awaited<ReturnType<typeof selectCustomerProfileRow>>>): CustomerProfile {
  return {
    id: row.id,
    name: row.name,
    email: row.email,
    phone: row.phone,
    image: row.image,
    role: row.role,
    status: row.status,
    profile: {
      fullName: row.fullName ?? row.name,
      avatarUrl: row.avatarUrl,
      city: row.city,
    },
    stats: {
      bookings: row.bookingCount,
      unreadNotifications: row.unreadNotificationCount,
      points: customerPointsPlaceholder,
    },
  }
}

function mapCustomerNotification(row: typeof notifications.$inferSelect): CustomerNotification {
  return {
    id: row.id,
    type: row.type,
    title: row.title,
    body: row.body,
    actionUrl: row.actionUrl,
    readAt: row.readAt,
    createdAt: row.createdAt,
  }
}
