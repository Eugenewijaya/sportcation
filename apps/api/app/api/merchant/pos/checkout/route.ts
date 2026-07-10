import { NextResponse } from "next/server"
import { internalError } from "@/lib/api/http"
import { requireApiActor } from "@/lib/auth-access"
import { getDb } from "@/lib/db"
import { createPosBooking } from "@/lib/services/pos-service"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function POST(request: Request) {
  try {
    const access = await requireApiActor(request, ["merchant_owner", "merchant_staff"])
    if ("response" in access) return access.response

    const body = await request.json()
    const { venueId, slotIds, paymentMethod } = body

    if (!venueId || !Array.isArray(slotIds) || slotIds.length === 0 || !["Cash", "QRIS"].includes(paymentMethod)) {
      return NextResponse.json({ error: "Invalid input" }, { status: 400 })
    }

    let merchantId = access.actor.merchantId;
    if (!merchantId) {
      const profile = await getDb().query.merchantProfiles.findFirst({
        where: (mp, { eq }) => eq(mp.ownerUserId, access.actor.user.id),
      });
      merchantId = profile?.id || "merchant-1";
    }

    const merchantActor = {
      userId: access.actor.user.id,
      merchantId: merchantId as string,
    }

    const result = await createPosBooking(getDb(), merchantActor, {
      venueId,
      slotIds,
      paymentMethod: paymentMethod as "Cash" | "QRIS",
    })

    return NextResponse.json(result)
  } catch (error: any) {
    if (error.statusCode) {
      return NextResponse.json({ error: error.message }, { status: error.statusCode })
    }
    return internalError(error)
  }
}
