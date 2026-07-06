import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { requireApiActor } from "@/lib/auth-access"
import { resells, bookings, ledgerTransactions, notifications } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export const runtime = "nodejs"

type Context = { params: Promise<{ id: string }> }

export async function POST(request: Request, context: Context) {
  try {
    const access = await requireApiActor(request, ["customer"])
    if ("response" in access) return access.response

    const { id: resellId } = await context.params
    const db = getDb()

    const resell = await db.query.resells.findFirst({
      where: eq(resells.id, resellId),
      with: {
        booking: true
      }
    })

    if (!resell || resell.status !== "active") {
      return NextResponse.json({ error: "Resell listing not active or not found" }, { status: 404 })
    }

    if (resell.sellerId === access.actor.user.id) {
      return NextResponse.json({ error: "Cannot buy your own resell listing" }, { status: 400 })
    }

    // For MVP: We assume the buyer pays immediately via gateway or wallet. 
    // Here we simulate the direct purchase and transfer of ownership.
    
    await db.transaction(async (tx) => {
      // 1. Update resell status
      await tx.update(resells)
        .set({ status: "sold", buyerId: access.actor.user.id, updatedAt: new Date() })
        .where(eq(resells.id, resellId))

      // 2. Transfer booking ownership
      await tx.update(bookings)
        .set({ userId: access.actor.user.id })
        .where(eq(bookings.id, resell.bookingId))

      // 3. Create ledger transaction for seller (credit)
      const ledgerId = `ldgr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      await tx.insert(ledgerTransactions).values({
        id: ledgerId,
        userId: resell.sellerId,
        type: "resell_credit",
        amount: resell.price, // in real app, deduct platform fee
        balanceType: "available",
        referenceId: resellId,
        description: "Credit from sold resell listing"
      })

      // 4. Notify seller
      await tx.insert(notifications).values({
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        userId: resell.sellerId,
        type: "booking",
        title: "Tiket Terjual!",
        body: `Tiket resell Anda telah terjual seharga Rp ${resell.price.toLocaleString("id-ID")}.`,
      })
    })

    return NextResponse.json({ success: true, message: "Booking purchased successfully" }, { status: 200 })
  } catch (error) {
    console.error("[marketplace/resell/buy] POST error:", error)
    return NextResponse.json({ error: "Failed to process purchase" }, { status: 500 })
  }
}
