import { eq, sql } from "drizzle-orm"
import { type SportcationDb } from "@/lib/db"
import { userWallets, ledgerTransactions } from "@/lib/db/schema"
import { DomainError } from "@/lib/domain/errors"

export async function ensureWalletExists(db: SportcationDb, userId: string) {
  const [wallet] = await db.select().from(userWallets).where(eq(userWallets.userId, userId))
  if (wallet) return wallet

  const [newWallet] = await db.insert(userWallets).values({
    userId,
    availableBalance: 0,
    pendingBalance: 0,
  }).returning()
  return newWallet
}

export async function creditAvailableBalance(
  db: SportcationDb, 
  userId: string, 
  amount: number, 
  referenceId: string, 
  description: string, 
  type: "resell_credit" | "auction_credit" | "booking_credit" | "refund"
) {
  return await db.transaction(async (tx) => {
    await ensureWalletExists(tx as any, userId)

    await tx.update(userWallets)
      .set({
        availableBalance: sql`${userWallets.availableBalance} + ${amount}`,
        updatedAt: sql`(strftime('%s', 'now'))`
      })
      .where(eq(userWallets.userId, userId))

    await tx.insert(ledgerTransactions).values({
      id: `LDG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId,
      type,
      amount,
      balanceType: "available",
      referenceId,
      description
    })
  })
}

export async function deductAvailableBalance(
  db: SportcationDb,
  userId: string,
  amount: number,
  referenceId: string,
  description: string,
  type: "fee_deduction" | "withdrawal"
) {
  return await db.transaction(async (tx) => {
    const wallet = await ensureWalletExists(tx as any, userId)
    if (wallet.availableBalance < amount) {
      throw new DomainError("INSUFFICIENT_FUNDS", "Saldo tidak mencukupi.", 400)
    }

    await tx.update(userWallets)
      .set({
        availableBalance: sql`${userWallets.availableBalance} - ${amount}`,
        updatedAt: sql`(strftime('%s', 'now'))`
      })
      .where(eq(userWallets.userId, userId))

    await tx.insert(ledgerTransactions).values({
      id: `LDG-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      userId,
      type,
      amount: -amount,
      balanceType: "available",
      referenceId,
      description
    })
  })
}
