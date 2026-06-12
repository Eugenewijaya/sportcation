import { SportcationWebApp } from "@/components/sportcation-web-app"
import { getDb } from "@/lib/db"
import { getPublicCatalog } from "@/lib/services/public-catalog-service"

export const dynamic = "force-dynamic"

export default async function Page() {
  const initialCatalog = await getPublicCatalog(getDb(), { pageSize: 12 })

  return <SportcationWebApp initialCatalog={initialCatalog} />
}
