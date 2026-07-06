import { internalError, ok } from "@/lib/api/http"
import { requireApiActor } from "@/lib/auth-access"
import { getDb } from "@/lib/db"
import { markCustomerNotificationRead } from "@/lib/services/account-service"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type Context = { params: Promise<{ id: string }> }

export async function POST(request: Request, context: Context) {
  try {
    const access = await requireApiActor(request, ["customer"])
    if ("response" in access) return access.response

    const { id } = await context.params
    return ok(await markCustomerNotificationRead(getDb(), access.actor.user.id, id), {
      headers: {
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    return internalError(error)
  }
}
