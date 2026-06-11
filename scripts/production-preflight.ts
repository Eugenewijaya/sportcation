import { sql } from "drizzle-orm"
import { pathToFileURL } from "node:url"
import { loadCliEnvironment } from "@/lib/env/load-cli-environment"

loadCliEnvironment({ production: true })

const REQUIRED_TABLES = [
  "users",
  "auth_sessions",
  "merchant_profiles",
  "merchant_members",
  "sport_categories",
  "venues",
  "courts",
  "slots",
  "audit_logs",
] as const

async function main() {
  const environment = validateProductionEnvironment(process.env)
  const { createDatabase } = await import("@/lib/db")
  const db = createDatabase({
    url: environment.databaseUrl,
    authToken: environment.databaseToken,
  })

  try {
    await db.run(sql`select 1`)
    const rows = await db.all<{ name: string }>(
      sql`select name from sqlite_master where type = 'table'`,
    )
    const existingTables = new Set(rows.map((row) => row.name))
    const missingTables = REQUIRED_TABLES.filter((table) => !existingTables.has(table))
    if (missingTables.length) {
      throw new Error(`Production database is missing migrations: ${missingTables.join(", ")}`)
    }
  } finally {
    await db.$client.close()
  }

  console.log("Sportcation production preflight passed.")
}

export function validateProductionEnvironment(environment: NodeJS.ProcessEnv) {
  const databaseUrl = requireValue(environment.TURSO_DATABASE_URL, "TURSO_DATABASE_URL")
  const databaseToken = requireValue(environment.TURSO_AUTH_TOKEN, "TURSO_AUTH_TOKEN")
  const authSecret = requireValue(
    environment.BETTER_AUTH_SECRET ?? environment.AUTH_SECRET,
    "BETTER_AUTH_SECRET",
  )
  const appUrl = requireHttpsUrl(
    environment.BETTER_AUTH_URL ?? environment.NEXT_PUBLIC_APP_URL,
    "BETTER_AUTH_URL",
  )

  if (databaseUrl.startsWith("file:")) {
    throw new Error("Production must use remote libSQL/Turso; local SQLite files are not durable on Vercel.")
  }
  if (!databaseUrl.startsWith("libsql://") && !databaseUrl.startsWith("https://")) {
    throw new Error("TURSO_DATABASE_URL must use libsql:// or https://.")
  }
  if (authSecret.length < 32 || authSecret.includes("replace-with")) {
    throw new Error("BETTER_AUTH_SECRET must be a non-placeholder secret with at least 32 characters.")
  }

  const trustedOrigins = [
    appUrl,
    ...(environment.AUTH_TRUSTED_ORIGINS?.split(",").map((value) => value.trim()).filter(Boolean) ?? []),
  ].map((value) => requireHttpsUrl(value, "AUTH_TRUSTED_ORIGINS"))

  if (!trustedOrigins.includes(appUrl)) {
    throw new Error("AUTH_TRUSTED_ORIGINS must include BETTER_AUTH_URL.")
  }

  return {
    databaseUrl,
    databaseToken,
    authSecret,
    appUrl,
    trustedOrigins,
  }
}

function requireValue(value: string | undefined, name: string) {
  if (!value?.trim()) throw new Error(`${name} is required for production.`)
  return value.trim()
}

function requireHttpsUrl(value: string | undefined, name: string) {
  const parsed = new URL(requireValue(value, name))
  if (parsed.protocol !== "https:") {
    throw new Error(`${name} must use HTTPS in production.`)
  }
  return parsed.origin
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch((error) => {
    console.error(error instanceof Error ? error.message : error)
    process.exitCode = 1
  })
}
