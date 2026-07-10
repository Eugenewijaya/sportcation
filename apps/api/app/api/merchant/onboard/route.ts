import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { users, merchantProfiles } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { auth } from "@/lib/auth"
import { headers } from "next/headers"
import { generateId } from "@/lib/utils"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    })

    if (!session || !session.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const userId = session.user.id
    const db = getDb()

    // Cek apakah sudah jadi merchant
    const existingMerchant = await db.query.merchantProfiles.findFirst({
      where: eq(merchantProfiles.ownerUserId, userId)
    })

    if (existingMerchant) {
      return NextResponse.json({ success: true, merchantId: existingMerchant.id })
    }

    // Buat transaction untuk update role dan insert merchant profile
    await db.transaction(async (tx) => {
      await tx.update(users).set({ role: "merchant_owner" }).where(eq(users.id, userId))
      
      await tx.insert(merchantProfiles).values({
        id: generateId("merchant"),
        ownerUserId: userId,
        businessName: session.user.name || "Toko Baru",
        status: "draft",
      })
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[onboard-merchant]", error)
    return NextResponse.json({ error: "Failed to onboard merchant" }, { status: 500 })
  }
}
