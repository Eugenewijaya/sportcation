import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { merchantProfiles } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { requireApiActor } from "@/lib/auth-access"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const access = await requireApiActor(request, ["merchant_owner", "merchant_staff"])
    if ("response" in access) return access.response

    const db = getDb()
    const merchant = await db.query.merchantProfiles.findFirst({
      where: eq(merchantProfiles.ownerUserId, access.actor.user.id)
    })

    return NextResponse.json({ merchant })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch merchant profile" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const access = await requireApiActor(request, ["merchant_owner"])
    if ("response" in access) return access.response

    const body = await request.json()
    const { ktpUrl, npwpUrl, businessLicenseUrl, legalName } = body

    if (!ktpUrl || !npwpUrl || !businessLicenseUrl || !legalName) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const db = getDb()
    const merchant = await db.query.merchantProfiles.findFirst({
      where: eq(merchantProfiles.ownerUserId, access.actor.user.id)
    })

    if (!merchant) {
      return NextResponse.json({ error: "Merchant not found" }, { status: 404 })
    }

    await db.update(merchantProfiles)
      .set({
        ktpUrl,
        npwpUrl,
        businessLicenseUrl,
        legalName,
        status: "review"
      })
      .where(eq(merchantProfiles.id, merchant.id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[merchant-verification]", error)
    return NextResponse.json({ error: "Failed to submit verification" }, { status: 500 })
  }
}
