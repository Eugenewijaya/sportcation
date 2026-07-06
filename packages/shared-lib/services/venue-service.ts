import type { SportcationDb, SportcationDbExecutor } from "@/lib/db"
import { auditLogs } from "@/lib/db/schema"
import { DomainError, isConstraintError } from "@/lib/domain/errors"
import {
  deleteVenue as deleteVenueRecord,
  findCategoryById,
  findVenueById,
  insertVenue,
  listMerchantVenueCourts,
  listMerchantVenueRows,
  updateVenue as updateVenueRecord,
} from "@/lib/repositories/venue-repository"
import { insertCourt } from "@/lib/repositories/court-repository"
import { createAuditRecord } from "@/lib/services/audit-service"
import { slugify, type VenueInput, type VenuePatch } from "@/lib/validation/merchant"

type MerchantActor = {
  userId: string
  merchantId: string
}

type VenueServiceOptions = {
  newId?: () => string
  now?: () => Date
}

export async function listVenues(db: SportcationDb, merchantId: string, query = "") {
  const normalizedQuery = query.trim().slice(0, 200).toLowerCase()
  const [venueRows, courtRows] = await Promise.all([
    listMerchantVenueRows(db, merchantId),
    listMerchantVenueCourts(db, merchantId),
  ])

  return venueRows
    .map((venue) => ({
      ...venue,
      courts: courtRows.filter((court) => court.venueId === venue.id),
    }))
    .filter((venue) =>
      normalizedQuery
        ? [venue.name, venue.categoryName, venue.city, venue.area, venue.status]
            .filter(Boolean)
            .join(" ")
            .toLowerCase()
            .includes(normalizedQuery)
        : true,
    )
}

export async function getVenue(db: SportcationDbExecutor, merchantId: string, id: string) {
  const venue = await findVenueById(db, id)
  if (!venue || venue.merchantId !== merchantId) {
    throw new DomainError("VENUE_NOT_FOUND", "Venue tidak ditemukan.", 404)
  }
  return venue
}

export async function createVenue(
  db: SportcationDb,
  actor: MerchantActor,
  input: VenueInput,
  options: VenueServiceOptions = {},
) {
  if (!(await findCategoryById(db, input.categoryId))) {
    throw new DomainError("CATEGORY_NOT_FOUND", "Kategori olahraga tidak ditemukan.", 404)
  }

  const newId = options.newId ?? (() => crypto.randomUUID())
  const venueId = newId()
  const courtId = newId()
  const now = (options.now ?? (() => new Date()))().toISOString()
  const slug = `${slugify(input.name) || "venue"}-${venueId.slice(0, 8)}`

  return db.transaction(async (tx) => {
    const [created] = await insertVenue(tx, {
      id: venueId,
      merchantId: actor.merchantId,
      categoryId: input.categoryId,
      name: input.name,
      slug,
      description: input.description || null,
      address: input.address,
      city: input.city,
      area: input.area || null,
      priceFrom: input.priceFrom,
      imageUrl: input.imageUrl || null,
      status: input.status,
      createdAt: now,
      updatedAt: now,
    })

    await insertCourt(tx, {
      id: courtId,
      venueId,
      name: input.defaultCourtName,
      status: "active",
      createdAt: now,
      updatedAt: now,
    })

    await tx.insert(auditLogs).values(
      createAuditRecord({
        actorUserId: actor.userId,
        action: "venue.created",
        entityType: "venue",
        entityId: venueId,
        metadata: { name: input.name },
      }),
    )

    return created
  })
}

export async function updateVenue(db: SportcationDb, actor: MerchantActor, id: string, input: VenuePatch) {
  return db.transaction(async (tx) => {
    await getVenue(tx, actor.merchantId, id)

    if (input.categoryId && !(await findCategoryById(tx, input.categoryId))) {
      throw new DomainError("CATEGORY_NOT_FOUND", "Kategori olahraga tidak ditemukan.", 404)
    }

    const [updated] = await updateVenueRecord(tx, id, {
      ...input,
      description: input.description === "" ? null : input.description,
      area: input.area === "" ? null : input.area,
      imageUrl: input.imageUrl === "" ? null : input.imageUrl,
      ...(input.name ? { slug: `${slugify(input.name)}-${id.slice(0, 8)}` } : {}),
      updatedAt: new Date().toISOString(),
    })

    await tx.insert(auditLogs).values(
      createAuditRecord({
        actorUserId: actor.userId,
        action: "venue.updated",
        entityType: "venue",
        entityId: id,
        metadata: { fields: Object.keys(input) },
      }),
    )

    return updated
  })
}

export async function deleteVenue(db: SportcationDb, actor: MerchantActor, id: string) {
  return db.transaction(async (tx) => {
    const existing = await getVenue(tx, actor.merchantId, id)
    await tx.insert(auditLogs).values(
      createAuditRecord({
        actorUserId: actor.userId,
        action: "venue.deleted",
        entityType: "venue",
        entityId: id,
        metadata: { name: existing.name },
      }),
    )

    try {
      await deleteVenueRecord(tx, id)
    } catch (error) {
      if (isConstraintError(error, "FOREIGN KEY")) {
        throw new DomainError(
          "VENUE_IN_USE",
          "Venue memiliki booking dan tidak dapat dihapus. Arsipkan venue sebagai gantinya.",
          409,
          undefined,
          { cause: error },
        )
      }
      throw error
    }

    return { id }
  })
}
