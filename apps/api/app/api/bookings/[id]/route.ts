import { NextResponse } from "next/server"
import { internalError, ok } from "@/lib/api/http"
import { requireApiActor } from "@/lib/auth-access"
import { getDb } from "@/lib/db"
import { getCustomerBooking } from "@/lib/services/booking-service"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type Context = { params: Promise<{ id: string }> }

export async function GET(request: Request, context: Context) {
  try {
    const access = await requireApiActor(request, ["customer"])
    if ("response" in access) return access.response

    const { id } = await context.params
    const booking = await getCustomerBooking(getDb(), access.actor.user.id, id)
    if (!booking) {
      return NextResponse.json(
        { error: { code: "BOOKING_NOT_FOUND", message: "Booking tidak ditemukan." } },
        {
          status: 404,
          headers: {
            "Cache-Control": "no-store",
          },
        },
      )
    }

    return ok(booking, {
      headers: {
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    return internalError(error)
  }
}
