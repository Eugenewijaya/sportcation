import { createClient } from "@libsql/client"
import { drizzle } from "drizzle-orm/libsql"
import * as schema from "./schema"

type DatabaseOptions = {
  url?: string
  authToken?: string
}

export function createDatabase(options: DatabaseOptions = {}) {
  const url = options.url ?? process.env.TURSO_DATABASE_URL ?? "file:./data/sportcation.db"

  if (process.env.VERCEL && url.startsWith("file:")) {
    throw new Error(
      "TURSO_DATABASE_URL is required on Vercel. A local SQLite file is ephemeral and must not be used for production persistence.",
    )
  }

  const client = createClient({
    url,
    authToken: options.authToken ?? process.env.TURSO_AUTH_TOKEN ?? undefined,
  })

  return drizzle(client, { schema })
}

export type SportcationDb = ReturnType<typeof createDatabase>
export type SportcationTransaction = Parameters<Parameters<SportcationDb["transaction"]>[0]>[0]
export type SportcationDbExecutor = SportcationDb | SportcationTransaction

const globalForDb = globalThis as typeof globalThis & {
  sportcationDb?: SportcationDb
}

export function getDb() {
  globalForDb.sportcationDb ??= createDatabase()
  return globalForDb.sportcationDb
}

export { schema }
