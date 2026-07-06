import { internalError, ok } from "@/lib/api/http"
import { getDb } from "@/lib/db"
import { listCategories } from "@/lib/services/category-service"

export const runtime = "nodejs"

export async function GET() {
  try {
    return ok(await listCategories(getDb()))
  } catch (error) {
    return internalError(error)
  }
}
