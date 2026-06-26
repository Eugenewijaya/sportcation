import { ok, internalError } from "@/lib/api/http"
import { requireApiActor } from "@/lib/auth-access"
import { getDb } from "@/lib/db"
import { eq } from "drizzle-orm"
import { ledgerTransactions, userWallets, withdrawals } from "@/lib/db/schema"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type Context = { params: Promise<{ id: string }> }

export async function POST(request: Request, context: Context) {
  try {
    const access = await requireApiActor(request, ["admin"])
    if ("response" in access) return access.response

    const { id } = await context.params
    const body = await request.json()
    const action = body.action // "approve" or "reject"

    if (action !== "approve" && action !== "reject") {
      return internalError(new Error("Invalid action"))
    }

    const db = getDb()

    await db.transaction(async (tx) => {
      const [withdrawal] = await tx.select().from(withdrawals).where(eq(withdrawals.id, id))
      if (!withdrawal) throw new Error("Withdrawal not found")
      if (withdrawal.status !== "pending") throw new Error(`Withdrawal is already ${withdrawal.status}`)

      if (action === "approve") {
        await tx.update(withdrawals).set({ status: "completed" }).where(eq(withdrawals.id, id))
      } else if (action === "reject") {
        await tx.update(withdrawals).set({ status: "rejected" }).where(eq(withdrawals.id, id))

        // Refund the balance
        const [wallet] = await tx.select().from(userWallets).where(eq(userWallets.userId, withdrawal.userId))
        if (wallet) {
          await tx.update(userWallets)
            .set({ availableBalance: wallet.availableBalance + withdrawal.amount })
            .where(eq(userWallets.userId, withdrawal.userId))
        }

        // Add ledger record for the refund
        await tx.insert(ledgerTransactions).values({
          id: `LDG-REF-${id}`,
          userId: withdrawal.userId,
          type: "refund",
          amount: withdrawal.amount,
          balanceType: "available",
          referenceId: id,
          description: `Pengembalian dana penarikan yang ditolak`
        })
      }
    })

    return ok({ success: true })
  } catch (error) {
    return internalError(error)
  }
}
