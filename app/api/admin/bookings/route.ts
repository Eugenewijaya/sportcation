import { internalError, invalidRequest, ok } from "@/lib/api/http"
import { requireApiActor } from "@/lib/auth-access"
import { getDb } from "@/lib/db"
import { listAdminBookings } from "@/lib/services/admin-review-service"
import { adminBookingQuerySchema } from "@/lib/validation/admin-review"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const access = await requireApiActor(request, ["admin"])
    if ("response" in access) return access.response

    const url = new URL(request.url)
    const parsed = adminBookingQuerySchema.safeParse({
      q: url.searchParams.get("q") ?? "",
      status: url.searchParams.get("status") ?? "",
      paymentStatus: url.searchParams.get("paymentStatus") ?? "",
    })
    if (!parsed.success) return invalidRequest(parsed.error)

    return ok(await listAdminBookings(getDb(), parsed.data), {
      headers: {
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    return internalError(error)
  }
}
