import { internalError, ok } from "@/lib/api/http"
import { requireApiActor } from "@/lib/auth-access"
import { getDb } from "@/lib/db"
import { getCustomerBooking, confirmPaymentFromWebhook } from "@/lib/services/booking-service"
import { checkBayarGgPaymentStatus } from "@/lib/payment-gateway/bayar-gg"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type Context = { params: Promise<{ bookingId: string }> }

export async function GET(request: Request, context: Context) {
  try {
    const access = await requireApiActor(request, ["customer"])
    if ("response" in access) return access.response

    const { bookingId } = await context.params
    const db = getDb()
    const booking = await getCustomerBooking(db, access.actor.user.id, bookingId)

    if (!booking) {
      return ok({ status: "not_found" }, { status: 404, headers: { "Cache-Control": "no-store" } })
    }

    // If already settled, just return current state
    if (booking.payment.status !== "pending") {
      return ok(booking, { headers: { "Cache-Control": "no-store" } })
    }

    // Check with bayar.gg if we have a provider reference
    if (booking.payment.providerReference) {
      try {
        const gatewayStatus = await checkBayarGgPaymentStatus(booking.payment.providerReference)
        if (gatewayStatus.status === "SUCCESS" || gatewayStatus.status === "PAID") {
          await confirmPaymentFromWebhook(db, booking.payment.providerReference, gatewayStatus.status)
          const updated = await getCustomerBooking(db, access.actor.user.id, bookingId)
          return ok(updated, { headers: { "Cache-Control": "no-store" } })
        }
        if (gatewayStatus.status === "EXPIRED" || gatewayStatus.status === "FAILED") {
          await confirmPaymentFromWebhook(db, booking.payment.providerReference, gatewayStatus.status)
          const updated = await getCustomerBooking(db, access.actor.user.id, bookingId)
          return ok(updated, { headers: { "Cache-Control": "no-store" } })
        }
      } catch (err) {
        console.error("[payment-check] bayar.gg check failed:", err)
        // Fall through and return current state
      }
    }

    return ok(booking, { headers: { "Cache-Control": "no-store" } })
  } catch (error) {
    return internalError(error)
  }
}
