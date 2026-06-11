import { defineConfig } from "drizzle-kit"
import { loadEnvConfig } from "@next/env"

loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production")

const databaseUrl =
  process.env.DIRECT_DATABASE_URL ??
  process.env.DATABASE_URL

if (!databaseUrl) {
  throw new Error("DIRECT_DATABASE_URL or DATABASE_URL is required for PostgreSQL schema generation.")
}

export default defineConfig({
  schema: "./lib/db/postgres/schema.ts",
  out: "./drizzle-postgres",
  dialect: "postgresql",
  dbCredentials: {
    url: databaseUrl,
  },
  strict: true,
  verbose: true,
})
