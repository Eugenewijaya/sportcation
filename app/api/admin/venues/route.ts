import { internalError, invalidRequest, ok } from "@/lib/api/http"
import { requireApiActor } from "@/lib/auth-access"
import { getDb } from "@/lib/db"
import { listAdminVenues } from "@/lib/services/admin-directory-service"
import { adminVenueModerationQuerySchema } from "@/lib/validation/admin-directory"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const access = await requireApiActor(request, ["admin"])
    if ("response" in access) return access.response

    const url = new URL(request.url)
    const parsed = adminVenueModerationQuerySchema.safeParse({
      q: url.searchParams.get("q") ?? "",
      status: url.searchParams.get("status") ?? "",
      merchantStatus: url.searchParams.get("merchantStatus") ?? "",
    })
    if (!parsed.success) return invalidRequest(parsed.error)

    return ok(await listAdminVenues(getDb(), parsed.data), {
      headers: {
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    return internalError(error)
  }
}
