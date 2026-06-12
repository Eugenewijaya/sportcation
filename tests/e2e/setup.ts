import { mkdir, rm, writeFile } from "node:fs/promises"
import { pathToFileURL } from "node:url"
import { bootstrapAccounts } from "@/lib/auth/bootstrap-service"
import { createDatabase } from "@/lib/db"
import { migrateDatabase } from "@/lib/db/migration-runner"
import { seedDatabase } from "@/lib/db/seed-data"
import {
  e2eContextPath,
  e2eDatabasePath,
  e2eDirectory,
  toLibsqlFileUrl,
} from "@/tests/e2e/paths"

export async function prepareE2E() {
  await mkdir(e2eDirectory, { recursive: true })
  await Promise.all([
    rm(e2eDatabasePath, { force: true }),
    rm(`${e2eDatabasePath}-shm`, { force: true }),
    rm(`${e2eDatabasePath}-wal`, { force: true }),
    rm(e2eContextPath, { force: true }),
  ])

  const context = {
    authSecret: `${crypto.randomUUID()}${crypto.randomUUID()}`,
    admin: {
      email: "admin@sportcation.local",
      password: `Admin-E2E-${crypto.randomUUID()}`,
    },
    merchant: {
      email: "merchant@sportcation.local",
      password: `Merchant-E2E-${crypto.randomUUID()}`,
    },
    customer: {
      email: "customer@sportcation.local",
      password: `Customer-E2E-${crypto.randomUUID()}`,
    },
  }

  const db = createDatabase({ url: toLibsqlFileUrl(e2eDatabasePath) })
  await migrateDatabase(db)
  await seedDatabase(db)
  await bootstrapAccounts(db, [
    {
      email: context.admin.email,
      password: context.admin.password,
      name: "Sportcation Admin E2E",
      role: "admin",
    },
    {
      email: context.merchant.email,
      password: context.merchant.password,
      name: "Sportcation Merchant E2E",
      role: "merchant_owner",
    },
    {
      email: context.customer.email,
      password: context.customer.password,
      name: "Alex Rivera E2E",
      role: "customer",
    },
  ])
  await db.$client.close()

  await writeFile(e2eContextPath, JSON.stringify(context), {
    encoding: "utf8",
    flag: "wx",
  })
  console.log("Prepared isolated Sportcation E2E database.")
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  prepareE2E().catch((error) => {
    console.error(error)
    process.exitCode = 1
  })
}
