import { NextResponse } from "next/server"
import { internalError, invalidRequest } from "@/lib/api/http"
import { getDb } from "@/lib/db"
import { getPublicCatalog } from "@/lib/services/public-catalog-service"
import { publicCatalogQuerySchema } from "@/lib/validation/public-catalog"

export const runtime = "nodejs"
export const dynamic = "force-dynamic"

export async function GET(request: Request) {
  try {
    const searchParams = new URL(request.url).searchParams
    const parsed = publicCatalogQuerySchema.safeParse({
      q: searchParams.get("q") ?? undefined,
      category: searchParams.get("category") ?? undefined,
      area: searchParams.get("area") ?? undefined,
      minPrice: searchParams.get("minPrice") ?? undefined,
      maxPrice: searchParams.get("maxPrice") ?? undefined,
      availableDate: searchParams.get("availableDate") ?? undefined,
      page: searchParams.get("page") ?? undefined,
      pageSize: searchParams.get("pageSize") ?? undefined,
    })

    if (!parsed.success) return invalidRequest(parsed.error)

    return NextResponse.json(await getPublicCatalog(getDb(), parsed.data), {
      headers: {
        "Cache-Control": "no-store",
      },
    })
  } catch (error) {
    return internalError(error)
  }
}
