import { SportcationWebApp } from "@/components/sportcation-web-app"
import { getDb } from "@/lib/db"
import { getPublicCatalog } from "@/lib/services/public-catalog-service"
import { promoBanners } from "@/lib/db/schema"
import { eq, asc } from "drizzle-orm"

export const dynamic = "force-dynamic"

export default async function Page() {
  const db = getDb()
  const initialCatalog = await getPublicCatalog(db, { pageSize: 12 })
  const banners = await db
    .select({
      id: promoBanners.id,
      title: promoBanners.title,
      imageUrl: promoBanners.imageUrl,
      termsAndConditions: promoBanners.termsAndConditions,
      linkUrl: promoBanners.linkUrl,
    })
    .from(promoBanners)
    .where(eq(promoBanners.isActive, true))
    .orderBy(asc(promoBanners.sortOrder))
    .limit(10)

  return <SportcationWebApp initialCatalog={initialCatalog} initialBanners={banners} />
}
