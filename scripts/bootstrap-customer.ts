import { loadCliEnvironment } from "@/lib/env/load-cli-environment"

loadCliEnvironment()

async function main() {
  const { getDb } = await import("@/lib/db")
  const { bootstrapAccounts } = await import("@/lib/auth/bootstrap-service")

  const db = getDb()
  await bootstrapAccounts(db, [
    {
      email: "customer@sportcation.com",
      password: "Password123!",
      name: "Customer Demo",
      role: "customer",
    },
  ])
  await db.$client.close()
  console.log("Bootstrapped customer: customer@sportcation.com")
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
