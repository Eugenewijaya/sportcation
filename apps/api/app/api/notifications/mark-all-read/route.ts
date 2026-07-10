import { internalError, ok } from "@/lib/api/http"
import { requireApiActor } from "@/lib/auth-access"
import { getDb } from "@/lib/db"
import { markAllCustomerNotificationsRead } from "@/lib/services/account-service"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const access = await requireApiActor(request, ["customer"])
    if ("response" in access) return access.response

    return ok(await markAllCustomerNotificationsRead(getDb(), access.actor.user.id), {
      headers: {
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    return internalError(error)
  }
}
