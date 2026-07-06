import { and, eq } from "drizzle-orm"
import type { SportcationDb } from "@/lib/db"
import { merchantMembers, merchantProfiles } from "@/lib/db/schema"
import type { MerchantMembershipRole } from "@/lib/domain/merchant-permissions"

export type MerchantContext = {
  merchantId: string
  role: MerchantMembershipRole
}

export async function findMerchantContext(db: SportcationDb, userId: string): Promise<MerchantContext | undefined> {
  const ownedMerchant = await db
    .select({ id: merchantProfiles.id })
    .from(merchantProfiles)
    .where(and(eq(merchantProfiles.ownerUserId, userId), eq(merchantProfiles.status, "verified")))
    .get()

  if (ownedMerchant) {
    return {
      merchantId: ownedMerchant.id,
      role: "owner",
    }
  }

  return db
    .select({
      merchantId: merchantMembers.merchantId,
      role: merchantMembers.role,
    })
    .from(merchantMembers)
    .innerJoin(merchantProfiles, eq(merchantMembers.merchantId, merchantProfiles.id))
    .where(and(eq(merchantMembers.userId, userId), eq(merchantProfiles.status, "verified")))
    .get()
}
