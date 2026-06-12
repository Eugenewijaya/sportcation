import { readFileSync } from "node:fs"
import { defineConfig, devices } from "@playwright/test"
import { e2eContextPath, e2eDatabasePath, toLibsqlFileUrl } from "./tests/e2e/paths"

type E2EContext = {
  authSecret: string
  admin: { email: string; password: string }
  merchant: { email: string; password: string }
  customer: { email: string; password: string }
}

const e2eContext = JSON.parse(readFileSync(e2eContextPath, "utf8")) as E2EContext
const baseURL = "http://127.0.0.1:3100"

export default defineConfig({
  testDir: "./tests/e2e",
  testMatch: "**/*.spec.ts",
  fullyParallel: false,
  workers: 1,
  retries: process.env.CI ? 2 : 0,
  reporter: process.env.CI ? [["github"], ["html", { open: "never" }]] : "list",
  use: {
    baseURL,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: {
        ...devices["Desktop Chrome"],
      },
    },
  ],
  webServer: process.env.E2E_EXTERNAL_SERVER
    ? undefined
    : {
        command: "node node_modules/next/dist/bin/next dev --hostname 127.0.0.1 -p 3100",
        url: baseURL,
        reuseExistingServer: false,
        timeout: 120_000,
        env: {
          BETTER_AUTH_SECRET: e2eContext.authSecret,
          BETTER_AUTH_URL: baseURL,
          AUTH_TRUSTED_ORIGINS: baseURL,
          NEXT_PUBLIC_APP_URL: baseURL,
          TURSO_DATABASE_URL: toLibsqlFileUrl(e2eDatabasePath),
        },
      },
})
