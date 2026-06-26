import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { requireApiActor } from "@/lib/auth-access"
import { withdrawals, userWallets, ledgerTransactions, notifications } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export const runtime = "nodejs"

type Context = { params: Promise<{ id: string }> }

export async function POST(request: Request, context: Context) {
  try {
    const access = await requireApiActor(request, ["admin"])
    if ("response" in access) return access.response

    const { id: withdrawalId } = await context.params
    const body = await request.json()
    const { action, rejectedReason } = body

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid action. Must be approve or reject" }, { status: 400 })
    }

    const db = getDb()

    const withdrawal = await db.query.withdrawals.findFirst({
      where: eq(withdrawals.id, withdrawalId)
    })

    if (!withdrawal) {
      return NextResponse.json({ error: "Withdrawal not found" }, { status: 404 })
    }

    if (withdrawal.status !== "pending") {
      return NextResponse.json({ error: `Cannot process withdrawal in status ${withdrawal.status}` }, { status: 400 })
    }

    const now = new Date()

    await db.transaction(async (tx) => {
      if (action === "approve") {
        // Just mark as completed, money was already deducted when requested
        await tx.update(withdrawals)
          .set({ 
            status: "completed", 
            processedAt: now,
            updatedAt: now
          })
          .where(eq(withdrawals.id, withdrawalId))

        // Notify merchant
        await tx.insert(notifications).values({
          id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          userId: withdrawal.userId,
          type: "system",
          title: "Penarikan Berhasil 🎉",
          body: `Dana sebesar Rp ${withdrawal.netAmount.toLocaleString("id-ID")} telah berhasil ditransfer ke rekening ${withdrawal.bankName} Anda.`,
        })

      } else {
        // Action is Reject -> Return the money
        await tx.update(withdrawals)
          .set({ 
            status: "rejected", 
            rejectedReason: rejectedReason || "Tidak memenuhi syarat / Rekening salah",
            processedAt: now,
            updatedAt: now
          })
          .where(eq(withdrawals.id, withdrawalId))

        // Get current wallet balance
        const wallet = await tx.query.userWallets.findFirst({
          where: eq(userWallets.userId, withdrawal.userId)
        })

        if (wallet) {
          // Refund balance (Total deduction: Net amount + Admin Fee)
          await tx.update(userWallets)
            .set({ 
              availableBalance: wallet.availableBalance + withdrawal.amount,
              updatedAt: now
            })
            .where(eq(userWallets.userId, withdrawal.userId))

          // Create refund ledger entry
          const ledgerId = `ldgr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
          await tx.insert(ledgerTransactions).values({
            id: ledgerId,
            userId: withdrawal.userId,
            type: "refund",
            amount: withdrawal.amount,
            balanceType: "available",
            referenceId: withdrawalId,
            description: `Pengembalian dana (Refund) Penarikan yang Ditolak`
          })
        }

        // Notify merchant
        await tx.insert(notifications).values({
          id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
          userId: withdrawal.userId,
          type: "system",
          title: "Penarikan Ditolak",
          body: `Penarikan dana Rp ${withdrawal.netAmount.toLocaleString("id-ID")} ditolak. Alasan: ${rejectedReason}. Dana dikembalikan ke saldo Anda.`,
        })
      }
    })

    return NextResponse.json({ success: true, status: action === "approve" ? "completed" : "rejected" }, { status: 200 })
  } catch (error) {
    console.error("[admin/finance/withdraw] error:", error)
    return NextResponse.json({ error: "Failed to process withdrawal" }, { status: 500 })
  }
}
