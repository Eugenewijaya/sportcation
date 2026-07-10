import { internalError, ok } from "@/lib/api/http"
import { requireApiActor } from "@/lib/auth-access"
import { getDb } from "@/lib/db"
import { userWallets } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { z } from "zod"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

const pinSchema = z.object({
  pin: z.string().length(6).regex(/^\d+$/),
  currentPin: z.string().length(6).regex(/^\d+$/).optional(),
})

export async function POST(request: Request) {
  try {
    const access = await requireApiActor(request, ["merchant_owner"], {
      merchantRequired: true,
      merchantPermission: "finance:read",
    })
    if ("response" in access) return access.response

    const body = await request.json()
    const { pin, currentPin } = pinSchema.parse(body)
    
    const db = getDb()
    const userId = access.actor.user.id

    await db.transaction(async (tx) => {
      let [wallet] = await tx.select().from(userWallets).where(eq(userWallets.userId, userId))
      
      if (!wallet) {
        await tx.insert(userWallets).values({ userId })
        ;[wallet] = await tx.select().from(userWallets).where(eq(userWallets.userId, userId))
      }

      if (wallet.pinCode && wallet.pinCode !== currentPin) {
        throw new Error("PIN saat ini tidak cocok")
      }

      await tx.update(userWallets).set({ pinCode: pin }).where(eq(userWallets.userId, userId))
    })

    return ok({ success: true })
  } catch (error) {
    if (error instanceof Error && error.message === "PIN saat ini tidak cocok") {
      return new Response(JSON.stringify({ error: { message: error.message } }), { status: 400, headers: { "Content-Type": "application/json" } })
    }
    return internalError(error)
  }
}
