import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { requireApiActor } from "@/lib/auth-access"
import { auctions, auctionBids, notifications } from "@/lib/db/schema"
import { eq, desc } from "drizzle-orm"

export const runtime = "nodejs"

type Context = { params: Promise<{ id: string }> }

export async function POST(request: Request, context: Context) {
  try {
    const access = await requireApiActor(request, ["customer"])
    if ("response" in access) return access.response

    const body = await request.json()
    const { amount } = body

    if (!amount || amount <= 0) {
      return NextResponse.json({ error: "Invalid bid amount" }, { status: 400 })
    }

    const { id: auctionId } = await context.params
    const db = getDb()

    const auction = await db.query.auctions.findFirst({
      where: eq(auctions.id, auctionId),
      with: {
        bids: {
          orderBy: [desc(auctionBids.amount)],
          limit: 1
        }
      }
    })

    if (!auction || auction.status !== "active") {
      return NextResponse.json({ error: "Auction not active or not found" }, { status: 404 })
    }

    if (auction.sellerId === access.actor.user.id) {
      return NextResponse.json({ error: "Cannot bid on your own auction" }, { status: 400 })
    }

    if (new Date() > new Date(auction.endTime)) {
      return NextResponse.json({ error: "Auction has already ended" }, { status: 400 })
    }

    if (amount <= auction.currentHighestBid) {
      return NextResponse.json({ error: `Bid must be higher than current highest bid (Rp ${auction.currentHighestBid})` }, { status: 400 })
    }

    const previousHighestBidder = auction.bids[0]?.bidderId

    await db.transaction(async (tx) => {
      // 1. Insert new bid
      const bidId = `bid_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      await tx.insert(auctionBids).values({
        id: bidId,
        auctionId,
        bidderId: access.actor.user.id,
        amount
      })

      // 2. Update auction highest bid
      await tx.update(auctions)
        .set({ currentHighestBid: amount, updatedAt: new Date() })
        .where(eq(auctions.id, auctionId))

      // 3. Notify previous highest bidder if they were outbid
      if (previousHighestBidder && previousHighestBidder !== access.actor.user.id) {
        await tx.insert(notifications).values({
          id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          userId: previousHighestBidder,
          type: "auction",
          title: "Anda kalah bid!",
          body: `Tawaran Anda di lelang dikalahkan oleh penawar lain dengan nominal Rp ${amount.toLocaleString("id-ID")}.`,
        })
      }
    })

    return NextResponse.json({ success: true, message: "Bid placed successfully" }, { status: 200 })
  } catch (error) {
    console.error("[marketplace/auction/bid] POST error:", error)
    return NextResponse.json({ error: "Failed to place bid" }, { status: 500 })
  }
}
