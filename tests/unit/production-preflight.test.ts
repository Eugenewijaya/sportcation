import { describe, expect, it } from "vitest"
import { validateProductionEnvironment } from "@/scripts/production-preflight"

describe("production deployment preflight", () => {
  const validEnvironment: NodeJS.ProcessEnv = {
    NODE_ENV: "production",
    TURSO_DATABASE_URL: "libsql://sportcation-production.turso.io",
    TURSO_AUTH_TOKEN: "remote-database-token",
    BETTER_AUTH_SECRET: "a-production-secret-with-more-than-32-characters",
    BETTER_AUTH_URL: "https://sportcation.example",
    AUTH_TRUSTED_ORIGINS: "https://sportcation.example,https://www.sportcation.example",
  }

  it("accepts a remote database and HTTPS application origin", () => {
    expect(validateProductionEnvironment(validEnvironment)).toMatchObject({
      databaseUrl: "libsql://sportcation-production.turso.io",
      appUrl: "https://sportcation.example",
    })
  })

  it("rejects local SQLite for Vercel production", () => {
    expect(() =>
      validateProductionEnvironment({
        ...validEnvironment,
        TURSO_DATABASE_URL: "file:./data/sportcation.db",
      }),
    ).toThrow(/remote libSQL\/Turso/)
  })

  it("rejects insecure URLs and placeholder secrets", () => {
    expect(() =>
      validateProductionEnvironment({
        ...validEnvironment,
        BETTER_AUTH_URL: "http://sportcation.example",
      }),
    ).toThrow(/HTTPS/)

    expect(() =>
      validateProductionEnvironment({
        ...validEnvironment,
        BETTER_AUTH_SECRET: "replace-with-a-long-random-secret",
      }),
    ).toThrow(/non-placeholder/)
  })
})
