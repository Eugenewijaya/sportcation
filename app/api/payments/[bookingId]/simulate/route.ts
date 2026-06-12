import { internalError, invalidRequest, ok } from "@/lib/api/http"
import { requireApiActor } from "@/lib/auth-access"
import { getDb } from "@/lib/db"
import { simulateCustomerPayment } from "@/lib/services/booking-service"
import { paymentSimulationSchema } from "@/lib/validation/booking"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type Context = { params: Promise<{ bookingId: string }> }

export async function POST(request: Request, context: Context) {
  try {
    const access = await requireApiActor(request, ["customer"])
    if ("response" in access) return access.response

    const parsed = paymentSimulationSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) return invalidRequest(parsed.error)

    const { bookingId } = await context.params
    return ok(
      await simulateCustomerPayment(
        getDb(),
        {
          userId: access.actor.user.id,
        },
        bookingId,
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
