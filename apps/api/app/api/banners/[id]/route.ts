import { NextResponse } from "next/server"
import { getDb } from "@/lib/db"
import { promoBanners } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { requireApiActor } from "@/lib/auth-access"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const access = await requireApiActor(request, ["admin"])
    if ("response" in access) return access.response

    const { id } = await params
    const body = await request.json()
    const db = getDb()

    await db.update(promoBanners)
      .set({
        title: body.title,
        imageUrl: body.imageUrl,
        termsAndConditions: body.termsAndConditions,
        linkUrl: body.linkUrl,
        isActive: body.isActive,
        sortOrder: body.sortOrder,
      })
      .where(eq(promoBanners.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[admin-banners-patch]", error)
    return NextResponse.json({ error: "Failed to update banner" }, { status: 500 })
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const access = await requireApiActor(request, ["admin"])
    if ("response" in access) return access.response

    const { id } = await params
    const db = getDb()

    await db.delete(promoBanners).where(eq(promoBanners.id, id))

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[admin-banners-delete]", error)
    return NextResponse.json({ error: "Failed to delete banner" }, { status: 500 })
  }
}
