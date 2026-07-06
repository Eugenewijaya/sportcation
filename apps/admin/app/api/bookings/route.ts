import { internalError, invalidRequest, ok } from "@/lib/api/http"
import { requireApiActor } from "@/lib/auth-access"
import { getDb } from "@/lib/db"
import { createCustomerBooking, listCustomerBookings } from "@/lib/services/booking-service"
import { createBookingSchema } from "@/lib/validation/booking"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const access = await requireApiActor(request, ["customer"])
    if ("response" in access) return access.response

    return ok(await listCustomerBookings(getDb(), access.actor.user.id), {
      headers: {
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    return internalError(error)
  }
}

export async function POST(request: Request) {
  try {
    const access = await requireApiActor(request, ["customer"])
    if ("response" in access) return access.response

    const parsed = createBookingSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) return invalidRequest(parsed.error)

    return ok(
      await createCustomerBooking(
        getDb(),
        {
          userId: access.actor.user.id,
        },
        parsed.data,
      ),
      {
        status: 201,
        headers: {
          "Cache-Control": "no-store",
        },
      },
    )
  } catch (error) {
    return internalError(error)
  }
}
