import { defineConfig } from "drizzle-kit"
import { loadEnvConfig } from "@next/env"

loadEnvConfig(process.cwd(), process.env.NODE_ENV !== "production")

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "turso",
  dbCredentials: {
    url: process.env.TURSO_DATABASE_URL ?? "file:./data/sportcation.db",
    authToken: process.env.TURSO_AUTH_TOKEN || undefined,
  },
  strict: true,
  verbose: true,
})
