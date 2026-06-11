import { tmpdir } from "node:os"
import path from "node:path"
import { createDatabase, type SportcationDb } from "@/lib/db"
import { migrateDatabase } from "@/lib/db/migration-runner"
import { seedDatabase } from "@/lib/db/seed-data"

type TestDatabase = {
  db: SportcationDb
  cleanup: () => Promise<void>
}

export async function createTestDatabase(options: { seed?: boolean } = {}): Promise<TestDatabase> {
  const databasePath = path
    .join(tmpdir(), `sportcation-test-${crypto.randomUUID()}.db`)
    .replaceAll("\\", "/")
  const db = createDatabase({ url: `file:${databasePath}` })

  await migrateDatabase(db, path.resolve("drizzle"))
  if (options.seed !== false) {
    await seedDatabase(db)
  }

  return {
    db,
    cleanup: async () => {
      await db.$client.close()
    },
  }
}
