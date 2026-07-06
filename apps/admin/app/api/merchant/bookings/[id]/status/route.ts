import { internalError, invalidRequest, ok } from "@/lib/api/http"
import { requireApiActor } from "@/lib/auth-access"
import { getDb } from "@/lib/db"
import { updateMerchantBookingStatus } from "@/lib/services/merchant-booking-service"
import { merchantBookingStatusActionSchema } from "@/lib/validation/booking"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type Context = { params: Promise<{ id: string }> }

export async function POST(request: Request, context: Context) {
  try {
    const access = await requireApiActor(request, ["merchant_owner", "merchant_staff"], {
      merchantRequired: true,
      merchantPermission: "bookings:write",
    })
    if ("response" in access) return access.response

    const parsed = merchantBookingStatusActionSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) return invalidRequest(parsed.error)

    const { id } = await context.params
    return ok(
      await updateMerchantBookingStatus(
        getDb(),
        {
          userId: access.actor.user.id,
          merchantId: access.actor.merchantId!,
        },
        id,
        parsed.data,
      ),
      {
        headers: {
          "Cache-Control": "no-store",
        },
      },
    )
  } catch (error) {
    return internalError(error)
  }
}
