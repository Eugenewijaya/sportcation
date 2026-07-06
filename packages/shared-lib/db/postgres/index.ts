import { neon } from "@neondatabase/serverless"
import { drizzle } from "drizzle-orm/neon-http"
import * as schema from "./schema"

function createDbClient(databaseUrl: string) {
  return drizzle(neon(databaseUrl), { schema })
}

export type SportcationDb = ReturnType<typeof createDbClient>

let cachedDb: SportcationDb | undefined

export function getDb() {
  const databaseUrl = process.env.DATABASE_URL

  if (!databaseUrl) {
    throw new Error("DATABASE_URL is required for Sportcation database access.")
  }

  cachedDb ??= createDbClient(databaseUrl)
  return cachedDb
}

export { schema }
