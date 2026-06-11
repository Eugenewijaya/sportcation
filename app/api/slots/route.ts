import { internalError, invalidRequest, ok } from "@/lib/api/http"
import { requireApiActor } from "@/lib/auth-access"
import { getDb } from "@/lib/db"
import { createSlot, listSlots } from "@/lib/services/slot-service"
import { slotInputSchema } from "@/lib/validation/merchant"

export const runtime = "nodejs"

export async function GET(request: Request) {
  try {
    const access = await requireApiActor(request, ["merchant_owner", "merchant_staff"], {
      merchantRequired: true,
      merchantPermission: "catalog:read",
    })
    if ("response" in access) return access.response

    const query = new URL(request.url).searchParams.get("q") ?? ""
    return ok(await listSlots(getDb(), access.actor.merchantId!, query))
  } catch (error) {
    return internalError(error)
  }
}

export async function POST(request: Request) {
  try {
    const access = await requireApiActor(request, ["merchant_owner", "merchant_staff"], {
      merchantRequired: true,
      merchantPermission: "slots:write",
    })
    if ("response" in access) return access.response

    const parsed = slotInputSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) return invalidRequest(parsed.error)

    return ok(
      await createSlot(
        getDb(),
        {
          userId: access.actor.user.id,
          merchantId: access.actor.merchantId!,
        },
        parsed.data,
      ),
      { status: 201 },
    )
  } catch (error) {
    return internalError(error)
  }
}
