import { internalError, invalidRequest, ok } from "@/lib/api/http"
import { requireApiActor } from "@/lib/auth-access"
import { getDb } from "@/lib/db"
import { deleteVenue, getVenue, updateVenue } from "@/lib/services/venue-service"
import { venuePatchSchema } from "@/lib/validation/merchant"

export const runtime = "nodejs"

type Context = { params: Promise<{ id: string }> }

export async function GET(request: Request, context: Context) {
  try {
    const access = await requireApiActor(request, ["merchant_owner", "merchant_staff"], {
      merchantRequired: true,
      merchantPermission: "catalog:read",
    })
    if ("response" in access) return access.response

    const { id } = await context.params
    return ok(await getVenue(getDb(), access.actor.merchantId!, id))
  } catch (error) {
    return internalError(error)
  }
}

export async function PATCH(request: Request, context: Context) {
  try {
    const access = await requireApiActor(request, ["merchant_owner", "merchant_staff"], {
      merchantRequired: true,
      merchantPermission: "catalog:write",
    })
    if ("response" in access) return access.response

    const parsed = venuePatchSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) return invalidRequest(parsed.error)

    const { id } = await context.params
    return ok(
      await updateVenue(
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
      merchantPermission: "catalog:write",
    })
    if ("response" in access) return access.response

    const { id } = await context.params
    return ok(
      await deleteVenue(
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
