import { asc, eq } from "drizzle-orm"
import { ok, internalError } from "@/lib/api/http"
import { getDb } from "@/lib/db"
import { sportCategories } from "@/lib/db/schema"

export const runtime = "nodejs"

export async function GET() {
  try {
    const data = await getDb()
      .select()
      .from(sportCategories)
      .where(eq(sportCategories.isActive, true))
      .orderBy(asc(sportCategories.sortOrder), asc(sportCategories.name))

    return ok(data)
  } catch (error) {
    return internalError(error)
  }
}
