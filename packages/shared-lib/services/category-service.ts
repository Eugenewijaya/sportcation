import type { SportcationDb } from "@/lib/db"
import { listActiveCategories } from "@/lib/repositories/venue-repository"

export function listCategories(db: SportcationDb) {
  return listActiveCategories(db)
}
