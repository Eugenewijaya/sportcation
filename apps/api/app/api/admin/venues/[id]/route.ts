import { internalError, ok } from "@/lib/api/http"
import { requireApiActor } from "@/lib/auth-access"
import { getDb } from "@/lib/db"
import { venues } from "@/lib/db/schema"
import { eq } from "drizzle-orm"
import { getAdminVenue } from "@/lib/services/admin-directory-service"
import { NextResponse } from "next/server"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type Context = { params: Promise<{ id: string }> }

export async function GET(request: Request, context: Context) {
  try {
    const access = await requireApiActor(request, ["admin"])
    if ("response" in access) return access.response

    const { id } = await context.params
    return ok(await getAdminVenue(getDb(), id), {
      headers: { "Cache-Control": "no-store" },
    })
  } catch (error) {
    return internalError(error)
  }
}

export async function POST(request: Request, context: Context) {
  try {
    const access = await requireApiActor(request, ["admin"])
    if ("response" in access) return access.response

    const { id } = await context.params
    const { status } = await request.json() as { status: "published" | "rejected" }

    if (!status || !["published", "rejected"].includes(status)) {
      return NextResponse.json({ error: "Invalid status" }, { status: 400 })
    }

    await getDb().update(venues).set({ status }).where(eq(venues.id, id))
    return ok({ success: true, status })
  } catch (error) {
    return internalError(error)
  }
}
