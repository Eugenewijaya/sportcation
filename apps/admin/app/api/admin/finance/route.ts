import { ok, internalError } from "@/lib/api/http"
import { requireApiActor } from "@/lib/auth-access"
import { getDb } from "@/lib/db"
import { eq, desc } from "drizzle-orm"
import { ledgerTransactions, withdrawals, users } from "@/lib/db/schema"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const access = await requireApiActor(request, ["admin"])
    if ("response" in access) return access.response

    const db = getDb()

    const platformFees = await db.select()
      .from(ledgerTransactions)
      .where(eq(ledgerTransactions.type, "fee_deduction"))
      .orderBy(desc(ledgerTransactions.createdAt))
      .limit(50)

    const recentWithdrawals = await db.select({
      id: withdrawals.id,
      amount: withdrawals.amount,
      adminFee: withdrawals.adminFee,
      netAmount: withdrawals.netAmount,
      bankName: withdrawals.bankName,
      accountNumber: withdrawals.accountNumber,
      accountHolder: withdrawals.accountHolder,
      status: withdrawals.status,
      createdAt: withdrawals.createdAt,
      merchantName: users.name,
    })
    .from(withdrawals)
    .innerJoin(users, eq(withdrawals.userId, users.id))
    .orderBy(desc(withdrawals.createdAt))
    .limit(50)

    return ok({
      platformFees,
      withdrawals: recentWithdrawals
    }, { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    return internalError(error)
  }
}
