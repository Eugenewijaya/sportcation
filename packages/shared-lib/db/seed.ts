import { loadCliEnvironment } from "@/lib/env/load-cli-environment"

loadCliEnvironment()

async function main() {
  const { getDb } = await import("./index")
  const { seedDatabase } = await import("./seed-data")
  const db = getDb()
  await seedDatabase(db)
  await db.$client.close()
  console.log("Sportcation local/libSQL seed completed.")
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
