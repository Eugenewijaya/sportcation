import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { promoBanners } from "@/lib/db/schema"
import { eq, asc } from "drizzle-orm"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET() {
  try {
    const db = getDb()
    const banners = await db
      .select({
        id: promoBanners.id,
        title: promoBanners.title,
        imageUrl: promoBanners.imageUrl,
        termsAndConditions: promoBanners.termsAndConditions,
        linkUrl: promoBanners.linkUrl,
      })
      .from(promoBanners)
      .where(eq(promoBanners.isActive, true))
      .orderBy(asc(promoBanners.sortOrder))
      .limit(10)

    return NextResponse.json(banners)
  } catch (error) {
    console.error("[public/promo-banners]", error)
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 })
  }
}
