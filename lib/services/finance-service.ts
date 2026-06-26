import { eq, and } from "drizzle-orm"
import { type SportcationDb } from "@/lib/db"
import { userWallets, ledgerTransactions, withdrawals, bookings } from "@/lib/db/schema"

export const PLATFORM_FEE_PERCENTAGE = 0.05
export const PLATFORM_FEE_MIN = 5000
export const PLATFORM_FEE_MAX = 25000
export const WITHDRAWAL_FEE = 2500

export function calculatePlatformFee(grossAmount: number): number {
  let fee = Math.floor(grossAmount * PLATFORM_FEE_PERCENTAGE)
  if (fee < PLATFORM_FEE_MIN) fee = PLATFORM_FEE_MIN
  if (fee > PLATFORM_FEE_MAX) fee = PLATFORM_FEE_MAX
  // if gross amount is smaller than minimum fee, just take everything
  if (grossAmount < PLATFORM_FEE_MIN) fee = grossAmount 
  return fee
}

export async function processBookingPayment(db: SportcationDb, bookingId: string, merchantUserId: string, grossAmount: number) {
  return await db.transaction(async (tx) => {
    // 1. Ensure wallet exists
    let [wallet] = await tx.select().from(userWallets).where(eq(userWallets.userId, merchantUserId))
    if (!wallet) {
      await tx.insert(userWallets).values({ userId: merchantUserId })
      ;[wallet] = await tx.select().from(userWallets).where(eq(userWallets.userId, merchantUserId))
    }

    const platformFee = calculatePlatformFee(grossAmount)
    const netAmount = grossAmount - platformFee

    // 2. Add pending balance to wallet (pending until game is finished to prevent hit and run)
    await tx.update(userWallets)
      .set({ pendingBalance: wallet.pendingBalance + netAmount })
      .where(eq(userWallets.userId, merchantUserId))

    // 3. Create ledger records
    const txIdBase = `LDG-${Date.now()}-${Math.floor(Math.random() * 1000)}`
    
    // Credit gross
    await tx.insert(ledgerTransactions).values({
      id: `${txIdBase}-CR`,
      userId: merchantUserId,
      type: "booking_credit",
      amount: grossAmount,
      balanceType: "pending",
      referenceId: bookingId,
      description: `Penerimaan booking ${bookingId}`
    })

    // Deduct fee
    await tx.insert(ledgerTransactions).values({
      id: `${txIdBase}-FEE`,
      userId: merchantUserId,
      type: "fee_deduction",
      amount: -platformFee,
      balanceType: "pending",
      referenceId: bookingId,
      description: `Potongan platform fee untuk ${bookingId}`
    })

    return { netAmount, platformFee }
  })
}

export async function clearPendingBalance(db: SportcationDb, merchantUserId: string, amount: number, referenceId: string) {
  return await db.transaction(async (tx) => {
    const [wallet] = await tx.select().from(userWallets).where(eq(userWallets.userId, merchantUserId))
    if (!wallet || wallet.pendingBalance < amount) {
      throw new Error("Saldo tertahan tidak mencukupi untuk dicairkan ke saldo tersedia.")
    }

    await tx.update(userWallets)
      .set({ 
        pendingBalance: wallet.pendingBalance - amount,
        availableBalance: wallet.availableBalance + amount
      })
      .where(eq(userWallets.userId, merchantUserId))
  })
}

export async function requestWithdrawal(db: SportcationDb, userId: string, amount: number, bankName: string, accountNumber: string, accountHolder: string, pinCode: string) {
  return await db.transaction(async (tx) => {
    const [wallet] = await tx.select().from(userWallets).where(eq(userWallets.userId, userId))
    if (!wallet) {
      throw new Error("Wallet tidak ditemukan.")
    }

    // Security check: verify PIN (In a real app, use bcrypt to compare `wallet.pinCode` with `pinCode`)
    // For now we check if it matches exactly if a PIN is set.
    if (wallet.pinCode && wallet.pinCode !== pinCode) {
      throw new Error("PIN Keamanan salah.")
    }

    if (amount < 10000) {
      throw new Error("Minimal penarikan adalah Rp 10.000")
    }

    const totalDeduction = amount + WITHDRAWAL_FEE

    if (wallet.availableBalance < totalDeduction) {
      throw new Error(`Saldo tidak mencukupi. Saldo tersedia: Rp ${wallet.availableBalance}, Total dengan admin: Rp ${totalDeduction}`)
    }

    // Deduct balance immediately to prevent double spending
    await tx.update(userWallets)
      .set({ availableBalance: wallet.availableBalance - totalDeduction })
      .where(eq(userWallets.userId, userId))

    const withdrawalId = `WD-${Date.now()}-${Math.floor(Math.random() * 1000)}`

    await tx.insert(withdrawals).values({
      id: withdrawalId,
      userId,
      amount: totalDeduction,
      adminFee: WITHDRAWAL_FEE,
      netAmount: amount,
      bankName,
      accountNumber,
      accountHolder,
      status: "pending"
    })

    await tx.insert(ledgerTransactions).values({
      id: `LDG-${withdrawalId}`,
      userId,
      type: "withdrawal",
      amount: -totalDeduction,
      balanceType: "available",
      referenceId: withdrawalId,
      description: `Penarikan dana ke ${bankName} (${accountNumber})`
    })

    return { withdrawalId, status: "pending", netAmount: amount }
  })
}
