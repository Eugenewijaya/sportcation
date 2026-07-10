import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { eq, lt, and } from "drizzle-orm"
import { auctions, payments, notifications } from "@/lib/db/schema"
import { createBayarGgPayment } from "@/lib/payment-gateway/bayar-gg"

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

    // Cari lelang yang sudah berakhir tapi masih active
    const expiredAuctions = await db.select()
      .from(auctions)
      .where(and(eq(auctions.status, "active"), lt(auctions.endTime, now)))

    let processedCount = 0

    for (const auction of expiredAuctions) {
      if (!auction.winnerId || auction.currentHighestBid === 0) {
        // Tidak ada yang bid, batalkan
        await db.update(auctions).set({ status: "cancelled", updatedAt: now }).where(eq(auctions.id, auction.id))
      } else {
        // Ada pemenang, buat tagihan
        const paymentId = `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`
        
        await db.transaction(async (tx) => {
          await tx.update(auctions).set({ status: "awaiting_payment", updatedAt: now }).where(eq(auctions.id, auction.id))
          await tx.insert(payments).values({
            id: paymentId,
            bookingId: auction.bookingId,
            auctionId: auction.id,
            userId: auction.winnerId!,
            method: "qris",
            status: "pending",
            amount: auction.currentHighestBid,
          })
        })

        try {
          const bayarGgResponse = await createBayarGgPayment({
            amount: auction.currentHighestBid,
            description: `Kemenangan Lelang Booking ${auction.bookingId}`,
            paymentMethod: "qris",
            callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/bayar-gg`,
            redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/?screen=payment-success`,
          })

          await db.update(payments).set({
            providerReference: bayarGgResponse.invoice_id,
            paymentUrl: bayarGgResponse.payment_url,
            qrisUrl: bayarGgResponse.qris_url,
          }).where(eq(payments.id, paymentId))

          // Beritahu pemenang
          await db.insert(notifications).values({
            id: crypto.randomUUID(),
            userId: auction.winnerId,
            type: "auction",
            title: "Anda Memenangkan Lelang!",
            body: `Selamat! Anda memenangkan lelang. Silakan selesaikan pembayaran dalam 15 menit melalui tautan ini: ${bayarGgResponse.payment_url}`,
            actionUrl: bayarGgResponse.payment_url,
            createdAt: now.toISOString(),
          })

        } catch (paymentErr) {
          console.error("Gagal membuat invoice untuk pemenang lelang:", paymentErr)
          // Fallback, mungkin diulangi cron berikutnya
          await db.update(auctions).set({ status: "active", updatedAt: now }).where(eq(auctions.id, auction.id))
        }
      }
      processedCount++
    }

    return NextResponse.json({
      ok: true,
      processed: processedCount,
      timestamp: now.toISOString(),
    })
  } catch (error) {
    console.error("[cron/resolve-auctions]", error)
    return NextResponse.json({ error: "Processing error" }, { status: 500 })
  }
}
