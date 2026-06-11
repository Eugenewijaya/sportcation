import type { SportcationDb } from "@/lib/db"
import { auditLogs } from "@/lib/db/schema"
import { DomainError, isConstraintError } from "@/lib/domain/errors"
import {
  deleteCourt as deleteCourtRecord,
  findCourtSlot,
  findOwnedCourt,
  insertCourt,
  listMerchantCourts,
  updateCourt as updateCourtRecord,
} from "@/lib/repositories/court-repository"
import { findVenueById } from "@/lib/repositories/venue-repository"
import { createAuditRecord } from "@/lib/services/audit-service"
import type { CourtInput, CourtPatch } from "@/lib/validation/merchant"

type MerchantActor = {
  userId: string
  merchantId: string
}

export function listCourts(db: SportcationDb, merchantId: string) {
  return listMerchantCourts(db, merchantId)
}

export async function createCourt(db: SportcationDb, actor: MerchantActor, input: CourtInput) {
  return db.transaction(async (tx) => {
    const venue = await findVenueById(tx, input.venueId)
    if (!venue || venue.merchantId !== actor.merchantId) {
      throw new DomainError("VENUE_NOT_FOUND", "Venue tidak ditemukan.", 404)
    }

    const id = crypto.randomUUID()
    const now = new Date().toISOString()
    const [created] = await insertCourt(tx, {
      id,
      ...input,
      surface: input.surface || null,
      createdAt: now,
      updatedAt: now,
    })

    await tx.insert(auditLogs).values(
      createAuditRecord({
        actorUserId: actor.userId,
        action: "court.created",
        entityType: "court",
        entityId: id,
        metadata: { venueId: input.venueId, name: input.name },
      }),
    )

    return created
  })
}

export async function updateCourt(db: SportcationDb, actor: MerchantActor, id: string, input: CourtPatch) {
  return db.transaction(async (tx) => {
    const existing = await findOwnedCourt(tx, id)
    if (!existing || existing.merchantId !== actor.merchantId) {
      throw new DomainError("COURT_NOT_FOUND", "Court tidak ditemukan.", 404)
    }

    const [updated] = await updateCourtRecord(tx, id, {
      ...input,
      surface: input.surface === "" ? null : input.surface,
      updatedAt: new Date().toISOString(),
    })

    await tx.insert(auditLogs).values(
      createAuditRecord({
        actorUserId: actor.userId,
        action: "court.updated",
        entityType: "court",
        entityId: id,
        metadata: { fields: Object.keys(input) },
      }),
    )

    return updated
  })
}

export async function deleteCourt(db: SportcationDb, actor: MerchantActor, id: string) {
  return db.transaction(async (tx) => {
    const existing = await findOwnedCourt(tx, id)
    if (!existing || existing.merchantId !== actor.merchantId) {
      throw new DomainError("COURT_NOT_FOUND", "Court tidak ditemukan.", 404)
    }
    if (await findCourtSlot(tx, id)) {
      throw new DomainError("COURT_IN_USE", "Court masih memiliki slot atau booking.", 409)
    }

    await tx.insert(auditLogs).values(
      createAuditRecord({
        actorUserId: actor.userId,
        action: "court.deleted",
        entityType: "court",
        entityId: id,
        metadata: { venueId: existing.court.venueId },
      }),
    )

    try {
      await deleteCourtRecord(tx, id)
    } catch (error) {
      if (isConstraintError(error, "FOREIGN KEY")) {
        throw new DomainError("COURT_IN_USE", "Court masih memiliki slot atau booking.", 409, undefined, {
          cause: error,
        })
      }
      throw error
    }

    return { id }
  })
}
