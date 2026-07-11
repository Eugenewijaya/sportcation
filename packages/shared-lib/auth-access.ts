import "server-only"

import { headers } from "next/headers"
import { redirect } from "next/navigation"
import { apiError } from "@/lib/api/http"
import { auth, type AuthSession } from "@/lib/auth"
import { isTrustedMutationRequest } from "@/lib/auth-config"
import { getDb } from "@/lib/db"
import {
  hasMerchantPermission,
  type MerchantMembershipRole,
  type MerchantPermission,
} from "@/lib/domain/merchant-permissions"
import { findMerchantContext } from "@/lib/repositories/merchant-repository"

export const APP_ROLES = ["customer", "merchant_owner", "merchant_staff", "admin"] as const
export type AppRole = (typeof APP_ROLES)[number]

type ApiActor = {
  session: AuthSession
  user: AuthSession["user"] & { role: AppRole; status: string }
  merchantId?: string
  merchantRole?: MerchantMembershipRole
}

import { getConfiguredAuthBaseURL } from "@/lib/auth-config"

export async function getServerSession() {
  const reqHeaders = await headers()
  const customHeaders = new Headers(reqHeaders)
  
  // Vercel multi-host hack: Force Host to match baseURL so better-auth doesn't drop the cookie
  const configuredBaseURL = getConfiguredAuthBaseURL(process.env)
  if (configuredBaseURL) {
    try {
      const url = new URL(configuredBaseURL)
      customHeaders.set("Host", url.host)
      customHeaders.set("X-Forwarded-Host", url.host)
    } catch {}
  }
  
  return auth.api.getSession({ headers: customHeaders })
}

export async function requirePageRole(allowedRoles: readonly AppRole[], destination: string) {
  const session = await getServerSession()

  if (!session) {
    if (destination.startsWith("/merchant")) {
      redirect(`/merchant/login?next=${encodeURIComponent(destination)}`)
    } else if (destination.startsWith("/admin")) {
      redirect(`/admin/login?next=${encodeURIComponent(destination)}`)
    } else {
      redirect(`/login?next=${encodeURIComponent(destination)}`)
    }
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
    merchantPermission?: MerchantPermission
  } = {},
): Promise<{ actor: ApiActor } | { response: Response }> {
  if (!isTrustedMutationRequest(request)) {
    return {
      response: apiError("UNTRUSTED_ORIGIN", "Origin request tidak diizinkan.", 403),
    }
  }

  const customHeaders = new Headers(request.headers)
  const configuredBaseURL = getConfiguredAuthBaseURL(process.env)
  if (configuredBaseURL) {
    try {
      const url = new URL(configuredBaseURL)
      customHeaders.set("Host", url.host)
      customHeaders.set("X-Forwarded-Host", url.host)
    } catch {}
  }

  const session = await auth.api.getSession({ headers: customHeaders })
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
    const merchantContext = await findMerchantContext(getDb(), session.user.id)
    if (!merchantContext) {
      return { response: apiError("MERCHANT_MEMBERSHIP_REQUIRED", "Akun tidak terhubung ke merchant aktif.", 403) }
    }
    if (options.merchantPermission && !hasMerchantPermission(merchantContext.role, options.merchantPermission)) {
      return { response: apiError("MERCHANT_PERMISSION_DENIED", "Role merchant Anda tidak dapat menjalankan aksi ini.", 403) }
    }
    actor.merchantId = merchantContext.merchantId
    actor.merchantRole = merchantContext.role
  }

  return { actor }
}
