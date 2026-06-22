import { requireApiActor } from "@/lib/auth-access"
import { internalError, ok } from "@/lib/api/http"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const access = await requireApiActor(request, ["admin", "merchant_owner", "merchant_staff"])
    if ("response" in access) return access.response

    // Mock settings for MVP. In a real app, fetch from a `platform_settings` table.
    return ok({
      settings: {
        platformFee: 5000,
        requireApproval: true,
        maintenanceMode: false,
      }
    })
  } catch (error) {
    return internalError(error)
  }
}

export async function POST(request: Request) {
  try {
    const access = await requireApiActor(request, ["admin", "merchant_owner", "merchant_staff"])
    if ("response" in access) return access.response

    const body = await request.json()
    // Mock save settings
    console.log("Saving settings", body)

    return ok({ success: true, message: "Settings saved" })
  } catch (error) {
    return internalError(error)
  }
}
