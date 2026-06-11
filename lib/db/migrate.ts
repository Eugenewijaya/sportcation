import { mkdirSync } from "node:fs"
import { loadCliEnvironment } from "@/lib/env/load-cli-environment"

loadCliEnvironment()

async function main() {
  const { getDb } = await import("./index")
  const { migrateDatabase } = await import("./migration-runner")
  const databaseUrl = process.env.TURSO_DATABASE_URL ?? "file:./data/sportcation.db"

  if (databaseUrl.startsWith("file:")) {
    mkdirSync("./data", { recursive: true })
  }

  const db = getDb()
  await migrateDatabase(db)
  await db.$client.close()
  console.log(`Sportcation database migrated: ${databaseUrl.startsWith("file:") ? "local SQLite" : "remote libSQL"}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
