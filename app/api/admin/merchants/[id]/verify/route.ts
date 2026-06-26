import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { requireApiActor } from "@/lib/auth-access"
import { merchantProfiles, notifications } from "@/lib/db/schema"
import { eq } from "drizzle-orm"

export const runtime = "nodejs"

type Context = { params: Promise<{ id: string }> }

export async function POST(request: Request, context: Context) {
  try {
    const access = await requireApiActor(request, ["admin"])
    if ("response" in access) return access.response

    const { id: merchantId } = await context.params
    const body = await request.json()
    const { action, reason } = body

    if (!["approve", "reject"].includes(action)) {
      return NextResponse.json({ error: "Invalid action. Must be approve or reject" }, { status: 400 })
    }

    const db = getDb()

    const merchant = await db.query.merchantProfiles.findFirst({
      where: eq(merchantProfiles.id, merchantId)
    })

    if (!merchant) {
      return NextResponse.json({ error: "Merchant not found" }, { status: 404 })
    }

    if (merchant.status !== "review") {
      return NextResponse.json({ error: `Cannot verify merchant in status ${merchant.status}` }, { status: 400 })
    }

    const newStatus = action === "approve" ? "verified" : "draft"

    await db.transaction(async (tx) => {
      // 1. Update merchant status
      await tx.update(merchantProfiles)
        .set({ status: newStatus, updatedAt: new Date().toISOString() })
        .where(eq(merchantProfiles.id, merchantId))

      // 2. Notify the owner
      const title = action === "approve" ? "Verifikasi Disetujui! 🎉" : "Verifikasi Ditolak"
      const messageBody = action === "approve" 
        ? "Selamat, akun merchant Anda telah diverifikasi! Anda kini bisa mulai menerima pesanan."
        : `Mohon maaf, pengajuan KYC Anda ditolak. Alasan: ${reason || "Dokumen tidak valid/kurang jelas"}. Silakan ajukan ulang.`

      await tx.insert(notifications).values({
        id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
        userId: merchant.ownerUserId,
        type: "system",
        title,
        body: messageBody,
      })
    })

    return NextResponse.json({ success: true, status: newStatus }, { status: 200 })
  } catch (error) {
    console.error("[admin/merchant/verify] error:", error)
    return NextResponse.json({ error: "Failed to process verification" }, { status: 500 })
  }
}
