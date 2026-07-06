import { internalError, ok } from "@/lib/api/http"
import { requireApiActor } from "@/lib/auth-access"
import { getDb } from "@/lib/db"
import { getAdminPayment } from "@/lib/services/admin-review-service"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type Context = { params: Promise<{ id: string }> }

export async function GET(request: Request, context: Context) {
  try {
    const access = await requireApiActor(request, ["admin"])
    if ("response" in access) return access.response

    const { id } = await context.params
    return ok(await getAdminPayment(getDb(), id), {
      headers: {
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    return internalError(error)
  }
}
