import { eq, and } from "drizzle-orm"
import { type SportcationDb } from "@/lib/db"
import { bookings, resells, auctions, auctionBids, auditLogs, payments, notifications } from "@/lib/db/schema"
import { createAuditRecord } from "./audit-service"
import { creditAvailableBalance } from "./wallet-service"

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
  let createdPaymentId = ""
  let price = 0
  let bookingId = ""

  await db.transaction(async (tx) => {
    const [resell] = await tx.select().from(resells).where(eq(resells.id, resellId))
    if (!resell || resell.status !== "active") {
      throw new Error("Listing resell tidak tersedia.")
    }

    price = resell.price
    bookingId = resell.bookingId

    // Kunci status resell menjadi awaiting_payment agar tidak dibeli orang lain
    await tx.update(resells).set({ status: "awaiting_payment" }).where(eq(resells.id, resellId))

    createdPaymentId = `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    
    await tx.insert(payments).values({
      id: createdPaymentId,
      bookingId: resell.bookingId,
      resellId: resell.id,
      userId: buyerId,
      method: "qris",
      status: "pending",
      amount: resell.price,
    })

    await tx.insert(auditLogs).values(createAuditRecord({
      actorUserId: buyerId,
      action: "buy_intent",
      entityType: "resell",
      entityId: resellId,
      metadata: { details: `Initiated purchase for resell listing ${resellId}` }
    }))
  })

  // Create Bayar.gg Payment OUTSIDE transaction
  try {
    const { createBayarGgPayment } = await import("@/lib/payment-gateway/bayar-gg")
    const bayarGgResponse = await createBayarGgPayment({
      amount: price,
      description: `Pembelian Resell Booking ${bookingId}`,
      paymentMethod: "qris",
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/bayar-gg`,
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/?screen=payment-success`,
    })

    await db.update(payments).set({
      providerReference: bayarGgResponse.invoice_id,
      paymentUrl: bayarGgResponse.payment_url,
      qrisUrl: bayarGgResponse.qris_url,
    }).where(eq(payments.id, createdPaymentId))

    return { success: true, paymentUrl: bayarGgResponse.payment_url, qrisUrl: bayarGgResponse.qris_url }
  } catch (error) {
    console.error("bayar.gg creation error for resell:", error)
    // Revert status on failure
    await db.update(resells).set({ status: "active" }).where(eq(resells.id, resellId))
    throw new Error("Gagal membuat tagihan pembayaran. Silakan coba lagi.")
  }
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

export async function buyNowAuction(db: SportcationDb, buyerId: string, auctionId: string) {
  let createdPaymentId = ""
  let price = 0
  let bookingId = ""

  await db.transaction(async (tx) => {
    const [auction] = await tx.select().from(auctions).where(eq(auctions.id, auctionId))
    if (!auction || auction.status !== "active") {
      throw new Error("Lelang tidak tersedia.")
    }
    if (!auction.buyNowPrice) {
      throw new Error("Lelang ini tidak memiliki opsi Buy Now.")
    }

    price = auction.buyNowPrice
    bookingId = auction.bookingId

    await tx.update(auctions).set({ status: "awaiting_payment", winnerId: buyerId }).where(eq(auctions.id, auctionId))

    createdPaymentId = `PAY-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    
    await tx.insert(payments).values({
      id: createdPaymentId,
      bookingId: auction.bookingId,
      auctionId: auction.id,
      userId: buyerId,
      method: "qris",
      status: "pending",
      amount: auction.buyNowPrice,
    })

    await tx.insert(auditLogs).values(createAuditRecord({
      actorUserId: buyerId,
      action: "buy_now_intent",
      entityType: "auction",
      entityId: auctionId,
      metadata: { details: `Initiated Buy Now for auction ${auctionId}` }
    }))
  })

  try {
    const { createBayarGgPayment } = await import("@/lib/payment-gateway/bayar-gg")
    const bayarGgResponse = await createBayarGgPayment({
      amount: price,
      description: `Buy Now Lelang Booking ${bookingId}`,
      paymentMethod: "qris",
      callbackUrl: `${process.env.NEXT_PUBLIC_APP_URL}/api/webhook/bayar-gg`,
      redirectUrl: `${process.env.NEXT_PUBLIC_APP_URL}/?screen=payment-success`,
    })

    await db.update(payments).set({
      providerReference: bayarGgResponse.invoice_id,
      paymentUrl: bayarGgResponse.payment_url,
      qrisUrl: bayarGgResponse.qris_url,
    }).where(eq(payments.id, createdPaymentId))

    return { success: true, paymentUrl: bayarGgResponse.payment_url, qrisUrl: bayarGgResponse.qris_url }
  } catch (error) {
    console.error("bayar.gg creation error for buy_now:", error)
    await db.update(auctions).set({ status: "active", winnerId: null }).where(eq(auctions.id, auctionId))
    throw new Error("Gagal membuat tagihan pembayaran Buy Now. Silakan coba lagi.")
  }
}

export async function getPublicResells(db: SportcationDb) {
  return await db.select().from(resells).where(eq(resells.status, "active"))
}

export async function getPublicAuctions(db: SportcationDb) {
  return await db.select().from(auctions).where(eq(auctions.status, "active"))
}

export async function confirmMarketplacePayment(
  tx: SportcationDb,
  payment: { id: string; userId: string; amount: number; resellId: string | null; auctionId: string | null; status: string; bookingId: string },
  webhookStatus: string,
  now: string
) {
  const isSuccess = webhookStatus === "SUCCESS" || webhookStatus === "PAID"
  const isFailed = webhookStatus === "EXPIRED" || webhookStatus === "FAILED"

  if (isSuccess && payment.status !== "paid") {
    // 1. Mark payment as paid
    await tx.update(payments)
      .set({ status: "paid", paidAt: now, updatedAt: now })
      .where(eq(payments.id, payment.id))
    
    if (payment.resellId) {
      const [resell] = await tx.select().from(resells).where(eq(resells.id, payment.resellId))
      
      // 2. Transfer ownership
      await tx.update(bookings).set({ userId: payment.userId, updatedAt: now }).where(eq(bookings.id, payment.bookingId))
      
      // 3. Mark resell as sold
      await tx.update(resells).set({ status: "sold", buyerId: payment.userId, updatedAt: now }).where(eq(resells.id, payment.resellId))
      
      // 4. Credit Seller Wallet
      await creditAvailableBalance(
        tx,
        resell.sellerId,
        payment.amount,
        resell.id,
        `Penjualan tiket melalui Resell (${payment.bookingId})`,
        "resell_credit"
      )

      await tx.insert(notifications).values({
        id: crypto.randomUUID(),
        userId: resell.sellerId,
        type: "system",
        title: "Tiket Terjual!",
        body: `Tiket Anda (Resell) telah terjual seharga Rp${payment.amount.toLocaleString("id-ID")}. Saldo telah ditambahkan ke Wallet Anda.`,
        actionUrl: "/merchant?screen=finance",
        createdAt: now,
      })

      await tx.insert(notifications).values({
        id: crypto.randomUUID(),
        userId: payment.userId,
        type: "system",
        title: "Pembelian Resell Berhasil",
        body: `Pembayaran tiket (Resell) Anda berhasil.`,
        actionUrl: "/?screen=bookings",
        createdAt: now,
      })
    } else if (payment.auctionId) {
      const [auction] = await tx.select().from(auctions).where(eq(auctions.id, payment.auctionId))
      
      // 2. Transfer ownership
      await tx.update(bookings).set({ userId: payment.userId, updatedAt: now }).where(eq(bookings.id, payment.bookingId))
      
      // 3. Mark auction as ended
      await tx.update(auctions).set({ status: "ended", winnerId: payment.userId, updatedAt: now }).where(eq(auctions.id, payment.auctionId))
      
      // 4. Credit Seller Wallet
      await creditAvailableBalance(
        tx,
        auction.sellerId,
        payment.amount,
        auction.id,
        `Penjualan tiket melalui Lelang (${payment.bookingId})`,
        "auction_credit"
      )
    }

  } else if (isFailed && payment.status === "pending") {
    await tx.update(payments)
      .set({ status: "failed", updatedAt: now })
      .where(eq(payments.id, payment.id))
      
    if (payment.resellId) {
      await tx.update(resells).set({ status: "active", updatedAt: now }).where(eq(resells.id, payment.resellId))
      
      await tx.insert(notifications).values({
        id: crypto.randomUUID(),
        userId: payment.userId,
        type: "system",
        title: "Pembayaran Resell Gagal",
        body: `Pembayaran tiket Resell gagal/expired.`,
        createdAt: now,
      })
    } else if (payment.auctionId) {
      // Logic if auction payment fails
      await tx.update(auctions).set({ status: "active", updatedAt: now }).where(eq(auctions.id, payment.auctionId))
    }
  }
}
