import type { SportcationDb } from "@/lib/db"
import { auditLogs } from "@/lib/db/schema"
import { DomainError, isConstraintError } from "@/lib/domain/errors"
import { findOwnedCourt } from "@/lib/repositories/court-repository"
import {
  deleteSlot as deleteSlotRecord,
  findOwnedSlot,
  insertSlot,
  listMerchantSlots,
  updateSlot as updateSlotRecord,
} from "@/lib/repositories/slot-repository"
import { createAuditRecord } from "@/lib/services/audit-service"
import type { SlotInput, SlotPatch } from "@/lib/validation/merchant"

type MerchantActor = {
  userId: string
  merchantId: string
}

export async function listSlots(db: SportcationDb, merchantId: string, query = "") {
  const normalizedQuery = query.trim().slice(0, 200).toLowerCase()
  const rows = await listMerchantSlots(db, merchantId)

  return normalizedQuery
    ? rows.filter((slot) =>
        [slot.venueName, slot.courtName, slot.slotDate, slot.startTime, slot.status]
          .join(" ")
          .toLowerCase()
          .includes(normalizedQuery),
      )
    : rows
}

export async function createSlot(db: SportcationDb, actor: MerchantActor, input: SlotInput) {
  try {
    return await db.transaction(async (tx) => {
      const ownedCourt = await findOwnedCourt(tx, input.courtId)
      if (!ownedCourt || ownedCourt.merchantId !== actor.merchantId) {
        throw new DomainError("COURT_NOT_FOUND", "Court tidak ditemukan.", 404)
      }

      const id = crypto.randomUUID()
      const now = new Date().toISOString()
      const [created] = await insertSlot(tx, {
        id,
        venueId: ownedCourt.court.venueId,
        ...input,
        createdAt: now,
        updatedAt: now,
      })

      await tx.insert(auditLogs).values(
        createAuditRecord({
          actorUserId: actor.userId,
          action: "slot.created",
          entityType: "slot",
          entityId: id,
          metadata: { courtId: input.courtId, slotDate: input.slotDate },
        }),
      )

      return created
    })
  } catch (error) {
    if (error instanceof DomainError) throw error
    if (isConstraintError(error, "UNIQUE")) {
      throw new DomainError("SLOT_CONFLICT", "Jadwal court tersebut sudah tersedia.", 409, undefined, {
        cause: error,
      })
    }
    throw error
  }
}

export async function updateSlot(db: SportcationDb, actor: MerchantActor, id: string, input: SlotPatch) {
  try {
    return await db.transaction(async (tx) => {
      const existing = await findOwnedSlot(tx, id)
      if (!existing || existing.merchantId !== actor.merchantId) {
        throw new DomainError("SLOT_NOT_FOUND", "Slot tidak ditemukan.", 404)
      }

      let venueId = existing.slot.venueId
      if (input.courtId) {
        const ownedCourt = await findOwnedCourt(tx, input.courtId)
        if (!ownedCourt || ownedCourt.merchantId !== actor.merchantId) {
          throw new DomainError("COURT_NOT_FOUND", "Court tidak ditemukan.", 404)
        }
        venueId = ownedCourt.court.venueId
      }

      const mergedStart = input.startTime ?? existing.slot.startTime
      const mergedEnd = input.endTime ?? existing.slot.endTime
      if (mergedEnd <= mergedStart) {
        throw new DomainError("INVALID_TIME_RANGE", "Waktu selesai harus setelah waktu mulai.", 400)
      }

      const [updated] = await updateSlotRecord(tx, id, {
        ...input,
        venueId,
        updatedAt: new Date().toISOString(),
      })

      await tx.insert(auditLogs).values(
        createAuditRecord({
          actorUserId: actor.userId,
          action: "slot.updated",
          entityType: "slot",
          entityId: id,
          metadata: { fields: Object.keys(input) },
        }),
      )

      return updated
    })
  } catch (error) {
    if (error instanceof DomainError) throw error
    if (isConstraintError(error, "UNIQUE")) {
      throw new DomainError("SLOT_CONFLICT", "Jadwal court tersebut sudah tersedia.", 409, undefined, {
        cause: error,
      })
    }
    throw error
  }
}

export async function deleteSlot(db: SportcationDb, actor: MerchantActor, id: string) {
  return db.transaction(async (tx) => {
    const existing = await findOwnedSlot(tx, id)
    if (!existing || existing.merchantId !== actor.merchantId) {
      throw new DomainError("SLOT_NOT_FOUND", "Slot tidak ditemukan.", 404)
    }
    if (existing.slot.status === "booked") {
      throw new DomainError("SLOT_BOOKED", "Slot yang sudah dipesan tidak dapat dihapus.", 409)
    }

    await tx.insert(auditLogs).values(
      createAuditRecord({
        actorUserId: actor.userId,
        action: "slot.deleted",
        entityType: "slot",
        entityId: id,
        metadata: { courtId: existing.slot.courtId },
      }),
    )
    await deleteSlotRecord(tx, id)

    return { id }
  })
}
