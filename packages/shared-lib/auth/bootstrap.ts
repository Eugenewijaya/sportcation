import { loadCliEnvironment } from "@/lib/env/load-cli-environment"

loadCliEnvironment()

async function main() {
  const { getDb } = await import("@/lib/db")
  const { bootstrapAccounts, readBootstrapAccounts } = await import("@/lib/auth/bootstrap-service")
  const accounts = readBootstrapAccounts()
  if (!accounts.length) {
    throw new Error(
      "No bootstrap credentials configured. Set AUTH_BOOTSTRAP_ADMIN_EMAIL/PASSWORD or AUTH_BOOTSTRAP_MERCHANT_EMAIL/PASSWORD.",
    )
  }

  const db = getDb()
  await bootstrapAccounts(db, accounts)
  await db.$client.close()
  for (const account of accounts) {
    console.log(`Bootstrapped ${account.role}: ${account.email}`)
  }
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
