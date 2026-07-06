import { migrate } from "drizzle-orm/libsql/migrator"
import type { SportcationDb } from "./index"

export function migrateDatabase(db: SportcationDb, migrationsFolder = "./drizzle") {
  return migrate(db, { migrationsFolder })
}
