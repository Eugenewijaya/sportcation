import { internalError, invalidRequest, ok } from "@/lib/api/http"
import { requireApiActor } from "@/lib/auth-access"
import { getDb } from "@/lib/db"
import { createCourt, listCourts } from "@/lib/services/court-service"
import { courtInputSchema } from "@/lib/validation/merchant"

export const runtime = "nodejs"

export async function GET(request: Request) {
  try {
    const access = await requireApiActor(request, ["merchant_owner", "merchant_staff"], {
      merchantRequired: true,
      merchantPermission: "catalog:read",
    })
    if ("response" in access) return access.response

    return ok(await listCourts(getDb(), access.actor.merchantId!))
  } catch (error) {
    return internalError(error)
  }
}

export async function POST(request: Request) {
  try {
    const access = await requireApiActor(request, ["merchant_owner", "merchant_staff"], {
      merchantRequired: true,
      merchantPermission: "catalog:write",
    })
    if ("response" in access) return access.response

    const parsed = courtInputSchema.safeParse(await request.json().catch(() => null))
    if (!parsed.success) return invalidRequest(parsed.error)

    return ok(
      await createCourt(
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
