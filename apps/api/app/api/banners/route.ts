import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { promoBanners } from "@/lib/db/schema"
import { requireApiActor } from "@/lib/auth-access"
import { desc } from "drizzle-orm"
import { generateId } from "@/lib/utils"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  // Public endpoint for fetching banners, no auth required so landing page can use it
  try {
    const db = getDb()
    const banners = await db.query.promoBanners.findMany({
      orderBy: [desc(promoBanners.sortOrder), desc(promoBanners.createdAt)]
    })
    return NextResponse.json({ banners })
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch banners" }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const access = await requireApiActor(request, ["admin"])
    if ("response" in access) return access.response

    const body = await request.json()
    const db = getDb()

    // Cek jumlah banner
    const currentBanners = await db.query.promoBanners.findMany()
    if (currentBanners.length >= 10) {
      return NextResponse.json({ error: "Maksimal 10 banner diperbolehkan" }, { status: 400 })
    }

    await db.insert(promoBanners).values({
      id: generateId("banner"),
      title: body.title,
      imageUrl: body.imageUrl,
      termsAndConditions: body.termsAndConditions,
      linkUrl: body.linkUrl,
      isActive: body.isActive ?? true,
      sortOrder: body.sortOrder ?? 0,
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[admin-banners-post]", error)
    return NextResponse.json({ error: "Failed to create banner" }, { status: 500 })
  }
}
