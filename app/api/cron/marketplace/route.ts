import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { auctions, resells, bookings, ledgerTransactions, notifications, bookingItems } from "@/lib/db/schema"
import { eq, and, lte, asc } from "drizzle-orm"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  const cronSecret = process.env.CRON_SECRET
  
  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    const db = getDb()
    const now = new Date()

    let processedAuctions = 0
    let processedResells = 0

    await db.transaction(async (tx) => {
      // ==========================================
      // 1. Resolve Ended Auctions
      // ==========================================
      const endedAuctions = await tx.query.auctions.findMany({
        where: and(
          eq(auctions.status, "active"),
          lte(auctions.endTime, now)
        ),
        with: {
          bids: {
            orderBy: [asc(auctions.currentHighestBid)] // We want the highest bid. Wait, we should get highest by amount
          } // We'll just fetch them all for simplicity and pick the highest
        }
      })

      for (const auction of endedAuctions) {
        // Find highest bid
        // Since drizzle relations orderBy might be tricky, let's just reduce
        const highestBid = auction.bids.reduce((prev, current) => (prev.amount > current.amount) ? prev : current, auction.bids[0])

        if (highestBid) {
          // Has winner
          await tx.update(auctions)
            .set({ status: "ended", winnerId: highestBid.bidderId, updatedAt: now })
            .where(eq(auctions.id, auction.id))

          // Transfer ownership
          await tx.update(bookings)
            .set({ userId: highestBid.bidderId })
            .where(eq(bookings.id, auction.bookingId))

          // Credit seller
          const ledgerId = `ldgr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
          await tx.insert(ledgerTransactions).values({
            id: ledgerId,
            userId: auction.sellerId,
            type: "auction_credit",
            amount: highestBid.amount,
            balanceType: "available",
            referenceId: auction.id,
            description: "Credit from completed auction"
          })

          // Notify winner & seller
          const winnerNotif = `notif_${Date.now()}_w_${auction.id.slice(-5)}`
          const sellerNotif = `notif_${Date.now()}_s_${auction.id.slice(-5)}`
          
          await tx.insert(notifications).values([
            {
              id: winnerNotif,
              userId: highestBid.bidderId,
              type: "auction",
              title: "Selamat! Anda memenangkan Lelang!",
              body: `Anda berhasil memenangkan lelang dengan bid Rp ${highestBid.amount.toLocaleString("id-ID")}.`
            },
            {
              id: sellerNotif,
              userId: auction.sellerId,
              type: "auction",
              title: "Lelang Selesai!",
              body: `Lelang tiket Anda telah selesai. Terjual seharga Rp ${highestBid.amount.toLocaleString("id-ID")}.`
            }
          ])
        } else {
          // No bids, cancel auction
          await tx.update(auctions)
            .set({ status: "cancelled", updatedAt: now })
            .where(eq(auctions.id, auction.id))

          // Notify seller
          await tx.insert(notifications).values({
            id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
            userId: auction.sellerId,
            type: "auction",
            title: "Lelang Dibatalkan",
            body: `Lelang Anda telah berakhir tanpa ada penawar. Tiket dikembalikan ke akun Anda.`,
          })
        }
        processedAuctions++
      }

      // ==========================================
      // 2. Cancel Expired Resells
      // ==========================================
      // We need to find active resells where the slot has already started.
      const activeResells = await tx.query.resells.findMany({
        where: eq(resells.status, "active"),
        with: {
          booking: {
            with: { items: true }
          }
        }
      })

      for (const resell of activeResells) {
        // Assume first item determines the slot time
        const firstItem = resell.booking.items[0]
        if (firstItem) {
          const slotDateTime = new Date(`${firstItem.slotDate}T${firstItem.startTime}`)
          if (slotDateTime <= now) {
            // Expired
            await tx.update(resells)
              .set({ status: "cancelled", updatedAt: now })
              .where(eq(resells.id, resell.id))
            
            // Notify seller
            await tx.insert(notifications).values({
              id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
              userId: resell.sellerId,
              type: "booking",
              title: "Tiket Resell Expired",
              body: `Tiket resell Anda telah kedaluwarsa karena waktu main sudah terlewat.`,
            })
            processedResells++
          }
        }
      }
    })

    return NextResponse.json({
      ok: true,
      processedAuctions,
      processedResells,
      timestamp: now.toISOString(),
    })
  } catch (error) {
    console.error("[cron/marketplace]", error)
    return NextResponse.json({ error: "Processing error" }, { status: 500 })
  }
}
