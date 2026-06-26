import { internalError, ok } from "@/lib/api/http"
import { requireApiActor } from "@/lib/auth-access"
import { getDb } from "@/lib/db"
import { requestWithdrawal } from "@/lib/services/finance-service"
import { z } from "zod"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const withdrawSchema = z.object({
  amount: z.number().min(10000),
  bankName: z.string().min(1),
  accountNumber: z.string().min(1),
  accountHolder: z.string().min(1),
  pinCode: z.string().length(6).regex(/^\d+$/),
})

export async function POST(request: Request) {
  try {
    const access = await requireApiActor(request, ["merchant_owner"], {
      merchantRequired: true,
      merchantPermission: "finance:read",
    })
    if ("response" in access) return access.response

    const body = await request.json()
    const { amount, bankName, accountNumber, accountHolder, pinCode } = withdrawSchema.parse(body)
    
    const db = getDb()
    const userId = access.actor.user.id

    const result = await requestWithdrawal(db, userId, amount, bankName, accountNumber, accountHolder, pinCode)

    return ok({ success: true, withdrawal: result })
  } catch (error) {
    if (error instanceof Error && (error.message.includes("Saldo tidak mencukupi") || error.message.includes("PIN") || error.message.includes("Minimal penarikan"))) {
      return new Response(JSON.stringify({ error: { message: error.message } }), { status: 400, headers: { "Content-Type": "application/json" } })
    }
    return internalError(error)
  }
}
