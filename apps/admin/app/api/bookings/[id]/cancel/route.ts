import { internalError, invalidRequest, ok } from "@/lib/api/http"
import { requireApiActor } from "@/lib/auth-access"
import { getDb } from "@/lib/db"
import { cancelCustomerBooking } from "@/lib/services/booking-service"
import { cancelBookingSchema } from "@/lib/validation/booking"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type Context = { params: Promise<{ id: string }> }

export async function POST(request: Request, context: Context) {
  try {
    const access = await requireApiActor(request, ["customer"])
    if ("response" in access) return access.response

    const parsed = cancelBookingSchema.safeParse(await request.json().catch(() => ({})))
    if (!parsed.success) return invalidRequest(parsed.error)

    const { id } = await context.params
    return ok(
      await cancelCustomerBooking(
        getDb(),
        {
          userId: access.actor.user.id,
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
