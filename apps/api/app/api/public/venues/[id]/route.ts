import { NextResponse } from "next/server"
import { internalError, invalidRequest } from "@/lib/api/http"
import { getDb } from "@/lib/db"
import { getPublicVenue } from "@/lib/services/public-catalog-service"
import { publicCatalogQuerySchema } from "@/lib/validation/public-catalog"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

type Context = { params: Promise<{ id: string }> }

export async function GET(request: Request, context: Context) {
  try {
    const searchParams = new URL(request.url).searchParams
    const parsed = publicCatalogQuerySchema.pick({ availableDate: true }).safeParse({
      availableDate: searchParams.get("availableDate") ?? undefined,
    })
    if (!parsed.success) return invalidRequest(parsed.error)

    const { id } = await context.params
    const venue = await getPublicVenue(getDb(), id, parsed.data)
    if (!venue) {
      return NextResponse.json(
        { error: { code: "VENUE_NOT_FOUND", message: "Venue tidak ditemukan." } },
        {
          status: 404,
          headers: {
            "Cache-Control": "no-store",
          },
        },
      )
    }

    return NextResponse.json(venue, {
      headers: {
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    return internalError(error)
  }
}
