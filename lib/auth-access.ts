import "server-only"

import { and, eq } from "drizzle-orm"
import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { apiError } from "@/lib/api/http"
import { auth, type AuthSession } from "@/lib/auth"
import { getDb } from "@/lib/db"
import { merchantMembers, merchantProfiles } from "@/lib/db/schema"

export const APP_ROLES = ["customer", "merchant_owner", "merchant_staff", "admin"] as const
export type AppRole = (typeof APP_ROLES)[number]
export const MERCHANT_READ_ROLES = ["owner", "manager", "staff", "finance", "viewer"] as const
export const MERCHANT_CATALOG_WRITE_ROLES = ["owner", "manager"] as const
export const MERCHANT_SLOT_WRITE_ROLES = ["owner", "manager", "staff"] as const
export type MerchantMembershipRole = (typeof MERCHANT_READ_ROLES)[number]

type ApiActor = {
  session: AuthSession
  user: AuthSession["user"] & { role: AppRole; status: string }
  merchantId?: string
  merchantRole?: MerchantMembershipRole
}

export async function getServerSession() {
  return auth.api.getSession({ headers: await headers() })
}

export async function requirePageRole(allowedRoles: readonly AppRole[], destination: string) {
  const session = await getServerSession()

  if (!session) {
    redirect(`/login?next=${encodeURIComponent(destination)}`)
  }

  const role = session.user.role as AppRole
  if (session.user.status !== "active" || !allowedRoles.includes(role)) {
    redirect(`/unauthorized?required=${encodeURIComponent(allowedRoles.join(","))}`)
  }

  return session as AuthSession & {
    user: AuthSession["user"] & { role: AppRole; status: "active" }
  }
}

export async function requireApiActor(
  request: Request,
  allowedRoles: readonly AppRole[],
  options: {
    merchantRequired?: boolean
    merchantRoles?: readonly MerchantMembershipRole[]
  } = {},
): Promise<{ actor: ApiActor } | { response: Response }> {
  const session = await auth.api.getSession({ headers: request.headers })
  if (!session) {
    return { response: apiError("UNAUTHENTICATED", "Silakan login untuk melanjutkan.", 401) }
  }

  const role = session.user.role as AppRole
  if (session.user.status !== "active") {
    return { response: apiError("ACCOUNT_RESTRICTED", "Akun tidak aktif atau sedang dibatasi.", 403) }
  }
  if (!allowedRoles.includes(role)) {
    return { response: apiError("FORBIDDEN", "Anda tidak memiliki izin untuk aksi ini.", 403) }
  }

  const actor: ApiActor = {
    session,
    user: {
      ...session.user,
      role,
      status: session.user.status,
    },
  }

  if (options.merchantRequired) {
    const merchantContext = await resolveMerchantContext(session.user.id)
    if (!merchantContext) {
      return { response: apiError("MERCHANT_MEMBERSHIP_REQUIRED", "Akun tidak terhubung ke merchant aktif.", 403) }
    }
    if (options.merchantRoles && !options.merchantRoles.includes(merchantContext.role)) {
      return { response: apiError("MERCHANT_PERMISSION_DENIED", "Role merchant Anda tidak dapat menjalankan aksi ini.", 403) }
    }
    actor.merchantId = merchantContext.merchantId
    actor.merchantRole = merchantContext.role
  }

  return { actor }
}

async function resolveMerchantContext(userId: string) {
  const ownedMerchant = await getDb()
    .select({ id: merchantProfiles.id })
    .from(merchantProfiles)
    .where(and(eq(merchantProfiles.ownerUserId, userId), eq(merchantProfiles.status, "verified")))
    .get()

  if (ownedMerchant) {
    return {
      merchantId: ownedMerchant.id,
      role: "owner" as const,
    }
  }

  const membership = await getDb()
    .select({
      merchantId: merchantMembers.merchantId,
      role: merchantMembers.role,
    })
    .from(merchantMembers)
    .innerJoin(merchantProfiles, eq(merchantMembers.merchantId, merchantProfiles.id))
    .where(and(eq(merchantMembers.userId, userId), eq(merchantProfiles.status, "verified")))
    .get()

  return membership
}
