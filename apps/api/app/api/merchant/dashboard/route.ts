import { getDb } from "@/lib/db";
import { requireApiActor } from "@/lib/auth-access";
import { getMerchantDashboard } from "@/lib/services/merchant-dashboard-service";
import { ok, internalError } from "@/lib/api/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const access = await requireApiActor(request, ["merchant_owner", "merchant_staff"]);
    if ("response" in access) return access.response;

    // Note: The app uses access.actor.merchantId if available, but for now we might need to fallback
    // In the db users relation, we can fetch their merchant_profile
    const db = getDb();
    let merchantId = access.actor.merchantId;
    
    if (!merchantId) {
       const profile = await db.query.merchantProfiles.findFirst({ where: (mp, { eq }) => eq(mp.ownerUserId, access.actor.user.id) });
       merchantId = profile?.id;
    }

    if (!merchantId) {
       return ok({ error: "Merchant profile not found" }, { status: 404 });
    }

    const data = await getMerchantDashboard(db, merchantId);
    return ok(data);
  } catch (error) {
    return internalError(error);
  }
}

