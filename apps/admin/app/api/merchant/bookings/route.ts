import { internalError, invalidRequest, ok } from "@/lib/api/http"
import { requireApiActor } from "@/lib/auth-access"
import { getDb } from "@/lib/db"
import { listMerchantBookings } from "@/lib/services/merchant-booking-service"
import { merchantBookingQuerySchema } from "@/lib/validation/booking"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const access = await requireApiActor(request, ["merchant_owner", "merchant_staff"], {
      merchantRequired: true,
      merchantPermission: "bookings:read",
    })
    if ("response" in access) return access.response

    const url = new URL(request.url)
    const parsed = merchantBookingQuerySchema.safeParse({
      q: url.searchParams.get("q") ?? "",
      status: url.searchParams.get("status") ?? "",
    })
    if (!parsed.success) return invalidRequest(parsed.error)

    return ok(await listMerchantBookings(getDb(), access.actor.merchantId!, parsed.data), {
      headers: {
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    return internalError(error)
  }
}
