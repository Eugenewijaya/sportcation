import "dotenv/config"
import { mkdirSync } from "node:fs"
import { migrate } from "drizzle-orm/libsql/migrator"
import { getDb } from "./index"

const databaseUrl = process.env.TURSO_DATABASE_URL ?? "file:./data/sportcation.db"

async function main() {
  if (databaseUrl.startsWith("file:")) {
    mkdirSync("./data", { recursive: true })
  }

  await migrate(getDb(), { migrationsFolder: "./drizzle" })
  console.log(`Sportcation database migrated: ${databaseUrl.startsWith("file:") ? "local SQLite" : "remote libSQL"}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
