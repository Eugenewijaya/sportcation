import { ok, internalError } from "@/lib/api/http"
import { requireApiActor } from "@/lib/auth-access"
import { getDb } from "@/lib/db"
import { eq } from "drizzle-orm"
import { merchantProfiles } from "@/lib/db/schema"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type Context = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, context: Context) {
  try {
    const access = await requireApiActor(request, ["admin"])
    if ("response" in access) return access.response

    const { id } = await context.params
    const body = await request.json()
    const status = body.status

    if (!["verified", "draft", "suspended", "review", "rejected"].includes(status)) {
      return internalError(new Error("Invalid status"))
    }

    const db = getDb()

    await db.update(merchantProfiles)
      .set({ status })
      .where(eq(merchantProfiles.id, id))

    return ok({ success: true })
  } catch (error) {
    return internalError(error)
  }
}
