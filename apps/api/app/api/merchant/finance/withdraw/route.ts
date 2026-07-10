import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { requireApiActor } from "@/lib/auth-access"
import { userWallets, ledgerTransactions, withdrawals, notifications } from "@/lib/db/schema"
import { eq, and } from "drizzle-orm"

export const runtime = "nodejs"

export async function POST(request: Request) {
  try {
    const access = await requireApiActor(request, ["merchant_owner"])
    if ("response" in access) return access.response

    const body = await request.json()
    const { amount, bankName, accountNumber, accountHolder, pinCode } = body

    if (!amount || amount < 50000) {
      return NextResponse.json({ error: "Minimum withdrawal amount is Rp 50.000" }, { status: 400 })
    }

    if (!bankName || !accountNumber || !accountHolder || !pinCode) {
      return NextResponse.json({ error: "Missing required fields (bank details or PIN)" }, { status: 400 })
    }

    const db = getDb()

    // 1. Validate wallet and PIN
    const wallet = await db.query.userWallets.findFirst({
      where: eq(userWallets.userId, access.actor.user.id)
    })

    if (!wallet) {
      return NextResponse.json({ error: "Wallet not found" }, { status: 404 })
    }

    // In a real app, hash the PIN and compare. For MVP, direct comparison.
    if (!wallet.pinCode || wallet.pinCode !== pinCode) {
      return NextResponse.json({ error: "Invalid PIN code" }, { status: 401 })
    }

    const ADMIN_FEE = 2500
    const totalDeduction = amount + ADMIN_FEE

    if (wallet.availableBalance < totalDeduction) {
      return NextResponse.json({ error: `Insufficient balance. Need Rp ${totalDeduction.toLocaleString("id-ID")} (including admin fee)` }, { status: 400 })
    }

    await db.transaction(async (tx) => {
      // 1. Deduct balance from wallet
      await tx.update(userWallets)
        .set({ 
          availableBalance: wallet.availableBalance - totalDeduction,
          updatedAt: new Date()
        })
        .where(eq(userWallets.userId, access.actor.user.id))

      // 2. Create withdrawal request
      const withdrawalId = `wd_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      await tx.insert(withdrawals).values({
        id: withdrawalId,
        userId: access.actor.user.id,
        amount: totalDeduction,
        adminFee: ADMIN_FEE,
        netAmount: amount, // Amount they actually receive in bank
        bankName,
        accountNumber,
        accountHolder,
        status: "pending"
      })

      // 3. Create ledger transaction for history
      const ledgerId = `ldgr_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`
      await tx.insert(ledgerTransactions).values({
        id: ledgerId,
        userId: access.actor.user.id,
        type: "withdrawal",
        amount: -totalDeduction, // negative because it's a deduction
        balanceType: "available",
        referenceId: withdrawalId,
        description: `Penarikan ke ${bankName} (${accountNumber})`
      })
      
      // 4. Notify merchant
      await tx.insert(notifications).values({
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        userId: access.actor.user.id,
        type: "system",
        title: "Penarikan Sedang Diproses",
        body: `Permintaan penarikan dana sebesar Rp ${amount.toLocaleString("id-ID")} sedang diproses oleh admin.`,
      })
    })

    return NextResponse.json({ success: true, message: "Withdrawal requested successfully" }, { status: 200 })
  } catch (error) {
    console.error("[merchant/finance/withdraw] error:", error)
    return NextResponse.json({ error: "Failed to process withdrawal" }, { status: 500 })
  }
}
