import { createClient } from "@libsql/client"
import { drizzle } from "drizzle-orm/libsql"
import * as schema from "./schema"

function createDbClient() {
  const url = process.env.TURSO_DATABASE_URL ?? "file:./data/sportcation.db"

  if (process.env.VERCEL && url.startsWith("file:")) {
    throw new Error(
      "TURSO_DATABASE_URL is required on Vercel. A local SQLite file is ephemeral and must not be used for production persistence.",
    )
  }

  const client = createClient({
    url,
    authToken: process.env.TURSO_AUTH_TOKEN || undefined,
  })

  return drizzle(client, { schema })
}

export type SportcationDb = ReturnType<typeof createDbClient>

const globalForDb = globalThis as typeof globalThis & {
  sportcationDb?: SportcationDb
}

export function getDb() {
  globalForDb.sportcationDb ??= createDbClient()
  return globalForDb.sportcationDb
}

export { schema }
