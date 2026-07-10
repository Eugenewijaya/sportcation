import { internalError, ok } from "@/lib/api/http"
import { requireApiActor } from "@/lib/auth-access"
import { getDb } from "@/lib/db"
import { expirePendingCustomerBookings } from "@/lib/services/booking-service"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const access = await requireApiActor(request, ["customer"])
    if ("response" in access) return access.response

    return ok(
      await expirePendingCustomerBookings(getDb(), {
        userId: access.actor.user.id,
      }),
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
