import { internalError, invalidRequest, ok } from "@/lib/api/http"
import { requireApiActor } from "@/lib/auth-access"
import { getDb } from "@/lib/db"
import { listAdminPayments } from "@/lib/services/admin-review-service"
import { adminPaymentQuerySchema } from "@/lib/validation/admin-review"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const access = await requireApiActor(request, ["admin"])
    if ("response" in access) return access.response

    const url = new URL(request.url)
    const parsed = adminPaymentQuerySchema.safeParse({
      q: url.searchParams.get("q") ?? "",
      status: url.searchParams.get("status") ?? "",
      method: url.searchParams.get("method") ?? "",
    })
    if (!parsed.success) return invalidRequest(parsed.error)

    return ok(await listAdminPayments(getDb(), parsed.data), {
      headers: {
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    return internalError(error)
  }
}
