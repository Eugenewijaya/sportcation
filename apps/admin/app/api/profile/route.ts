import { internalError, invalidRequest, ok } from "@/lib/api/http"
import { requireApiActor } from "@/lib/auth-access"
import { getDb } from "@/lib/db"
import { getCustomerProfile, updateCustomerProfile } from "@/lib/services/account-service"
import { updateCustomerProfileSchema } from "@/lib/validation/account"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const access = await requireApiActor(request, ["customer"])
    if ("response" in access) return access.response

    return ok(await getCustomerProfile(getDb(), access.actor.user.id), {
      headers: {
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    return internalError(error)
  }
}

export async function PATCH(request: Request) {
  try {
    const access = await requireApiActor(request, ["customer"])
    if ("response" in access) return access.response

    const parsed = updateCustomerProfileSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) return invalidRequest(parsed.error)

    return ok(await updateCustomerProfile(getDb(), access.actor.user.id, parsed.data), {
      headers: {
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    return internalError(error)
  }
}
