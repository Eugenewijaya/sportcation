import { internalError, invalidRequest, ok } from "@/lib/api/http"
import { requireApiActor } from "@/lib/auth-access"
import { getDb } from "@/lib/db"
import { deleteSlot, updateSlot } from "@/lib/services/slot-service"
import { slotPatchSchema } from "@/lib/validation/merchant"

export const runtime = "nodejs"

type Context = { params: Promise<{ id: string }> }

export async function PATCH(request: Request, context: Context) {
  try {
    const access = await requireApiActor(request, ["merchant_owner", "merchant_staff"], {
      merchantRequired: true,
      merchantPermission: "slots:write",
    })
    if ("response" in access) return access.response

    const parsed = slotPatchSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) return invalidRequest(parsed.error)

    const { id } = await context.params
    return ok(
      await updateSlot(
        getDb(),
        {
          userId: access.actor.user.id,
          merchantId: access.actor.merchantId!,
        },
        id,
        parsed.data,
      ),
    )
  } catch (error) {
    return internalError(error)
  }
}

export async function DELETE(request: Request, context: Context) {
  try {
    const access = await requireApiActor(request, ["merchant_owner", "merchant_staff"], {
      merchantRequired: true,
      merchantPermission: "slots:write",
    })
    if ("response" in access) return access.response

    const { id } = await context.params
    return ok(
      await deleteSlot(
        getDb(),
        {
          userId: access.actor.user.id,
          merchantId: access.actor.merchantId!,
        },
        id,
      ),
    )
  } catch (error) {
    return internalError(error)
  }
}
