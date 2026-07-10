import { internalError, ok } from "@/lib/api/http"
import { getDb } from "@/lib/db"
import { merchantProfiles } from "@/lib/db/schema"
import { requireApiActor } from "@/lib/auth-access"
import { desc } from "drizzle-orm"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const access = await requireApiActor(request, ["admin"])
    if ("response" in access) return access.response

    const db = getDb()
    const merchants = await db.query.merchantProfiles.findMany({
      orderBy: [desc(merchantProfiles.createdAt)]
    })

    return ok(merchants)
  } catch (error) {
    console.error("[admin-merchants-get]", error)
    return internalError(error)
  }
}
