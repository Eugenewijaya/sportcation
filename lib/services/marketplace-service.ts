import { eq, and } from "drizzle-orm"
import { type SportcationDb } from "@/lib/db"
import { bookings, resells, auctions, auctionBids, auditLogs } from "@/lib/db/schema"
import { createAuditRecord } from "./audit-service"

export async function createResell(db: SportcationDb, userId: string, bookingId: string, price: number) {
  const [booking] = await db.select().from(bookings).where(and(eq(bookings.id, bookingId), eq(bookings.userId, userId)))
  
  if (!booking) {
    throw new Error("Booking tidak ditemukan atau Anda bukan pemiliknya.")
  }

  if (booking.status !== "confirmed") {
    throw new Error("Hanya booking yang sudah dikonfirmasi yang bisa di-resell.")
  }

  const resellId = `RSL-${Date.now()}-${Math.floor(Math.random() * 1000)}`
  await db.insert(resells).values({
    id: resellId,
    bookingId,
    sellerId: userId,
    price,
    status: "active"
  })

  await db.insert(auditLogs).values(createAuditRecord({
    actorUserId: userId,
    action: "create",
    entityType: "resell",
    entityId: resellId,
    metadata: { details: `Created resell listing for booking ${bookingId} at ${price}` }
  }))

  return { resellId, status: "active" }
}

export async function buyResell(db: SportcationDb, buyerId: string, resellId: string) {
  return await db.transaction(async (tx) => {
    const [resell] = await tx.select().from(resells).where(eq(resells.id, resellId))
    if (!resell || resell.status !== "active") {
      throw new Error("Listing resell tidak tersedia.")
    }

    // Pindahkan kepemilikan
    await tx.update(bookings).set({ userId: buyerId }).where(eq(bookings.id, resell.bookingId))
    await tx.update(resells).set({ status: "sold", buyerId }).where(eq(resells.id, resellId))

    await tx.insert(auditLogs).values(createAuditRecord({
      actorUserId: buyerId,
      action: "buy",
      entityType: "resell",
      entityId: resellId,
      metadata: { details: `Bought resell listing ${resellId}` }
    }))

    // sendNotification functionality removed for brevity

    return { success: true, newOwnerId: buyerId }
  })
}

export async function createAuction(db: SportcationDb, userId: string, bookingId: string, startPrice: number, buyNowPrice: number | null, durationHours: number) {
  const [booking] = await db.select().from(bookings).where(and(eq(bookings.id, bookingId), eq(bookings.userId, userId)))
  if (!booking || booking.status !== "confirmed") {
    throw new Error("Booking tidak valid untuk dilelang.")
  }

  const auctionId = `AUC-${Date.now()}-${Math.floor(Math.random() * 1000)}`
  const endTime = new Date(Date.now() + durationHours * 3600000)

  await db.insert(auctions).values({
    id: auctionId,
    bookingId,
    sellerId: userId,
    startPrice,
    buyNowPrice,
    endTime,
    status: "active"
  })

  return { auctionId }
}

export async function placeBid(db: SportcationDb, bidderId: string, auctionId: string, amount: number) {
  return await db.transaction(async (tx) => {
    const [auction] = await tx.select().from(auctions).where(eq(auctions.id, auctionId))
    if (!auction || auction.status !== "active") {
      throw new Error("Lelang tidak aktif.")
    }

    if (auction.endTime < new Date()) {
      throw new Error("Lelang telah berakhir.")
    }

    if (amount <= auction.currentHighestBid || amount < auction.startPrice) {
      throw new Error("Tawaran harus lebih tinggi dari tawaran saat ini dan harga awal.")
    }

    const bidId = `BID-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    await tx.insert(auctionBids).values({
      id: bidId,
      auctionId,
      bidderId,
      amount
    })

    await tx.update(auctions).set({ currentHighestBid: amount, winnerId: bidderId }).where(eq(auctions.id, auctionId))

    // Optional: if amount >= buyNowPrice, auto resolve

    return { success: true, bidId }
  })
}

export async function getPublicResells(db: SportcationDb) {
  return await db.select().from(resells).where(eq(resells.status, "active"))
}

export async function getPublicAuctions(db: SportcationDb) {
  return await db.select().from(auctions).where(eq(auctions.status, "active"))
}

