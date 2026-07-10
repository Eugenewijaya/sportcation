import { getDb } from "@/lib/db";
import { requireApiActor } from "@/lib/auth-access";
import { getAdminDashboard } from "@/lib/services/admin-dashboard-service";
import { ok, internalError } from "@/lib/api/http";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  try {
    const access = await requireApiActor(request, ["admin"]);
    if ("response" in access) return access.response;

    const db = getDb();
    const data = await getAdminDashboard(db);
    return ok(data);
  } catch (error) {
    return internalError(error);
  }
}

