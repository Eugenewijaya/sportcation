import { getSessionCookie } from "better-auth/cookies"
import type { NextRequest } from "next/server"
import { NextResponse } from "next/server"

/**
 * Sportcation Proxy (Next.js 16 replaces middleware.ts with proxy.ts)
 *
 * Two responsibilities:
 * 1. Auth Guard — redirect unauthenticated users to the correct login page
 * 2. Deployment Isolation — if DEPLOYMENT_ROLE is set, restrict routes to that role only
 *
 * DEPLOYMENT_ROLE values:
 *   "customer" — Landing page + customer dashboard
 *   "merchant" — Merchant portal
 *   "admin"    — Admin panel
 *   undefined  — All routes (development / single deployment)
 */

// Routes that never require auth
const PUBLIC_PATHS = new Set([
  "/",
  "/login",
  "/register",
  "/unauthorized",
  "/merchant/login",
  "/merchant/register",
  "/admin/login",
])

// Prefixes that never require auth
const PUBLIC_PREFIXES = [
  "/api/",
  "/_next/",
  "/favicon",
]

// Route allowlists per deployment role
const ROLE_ALLOWED_PREFIXES: Record<string, string[]> = {
  customer: [
    "/",
    "/app",
    "/login",
    "/register",
    "/unauthorized",
    "/api/",
    "/_next/",
    "/favicon",
  ],
  merchant: [
    "/merchant",
    "/unauthorized",
    "/api/",
    "/_next/",
    "/favicon",
  ],
  admin: [
    "/admin",
    "/unauthorized",
    "/api/",
    "/_next/",
    "/favicon",
  ],
}

function isPublicPath(pathname: string): boolean {
  if (PUBLIC_PATHS.has(pathname)) return true
  return PUBLIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))
}

function getLoginRedirect(pathname: string): string {
  if (pathname.startsWith("/merchant")) return "/merchant/login"
  if (pathname.startsWith("/admin")) return "/admin/login"
  return "/login"
}

function isAllowedForRole(pathname: string, role: string): boolean {
  const allowed = ROLE_ALLOWED_PREFIXES[role]
  if (!allowed) return true

  if (pathname === "/") return allowed.includes("/")

  return allowed.some((prefix) => {
    if (prefix === "/") return false
    return pathname === prefix || pathname.startsWith(prefix)
  })
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // --- Deployment Role Isolation ---
  const deploymentRole = process.env.DEPLOYMENT_ROLE
  if (deploymentRole && deploymentRole !== "all" && deploymentRole !== "") {
    if (!isAllowedForRole(pathname, deploymentRole)) {
      return NextResponse.json(
        { error: "Not Found", message: "This route is not available on this deployment." },
        { status: 404 }
      )
    }
  }

  // --- Auth Guard ---
  // Skip auth check for public paths
  if (isPublicPath(pathname)) {
    return NextResponse.next()
  }

  // Protected routes: /app/*, /merchant/*, /admin/*
  const sessionCookie = getSessionCookie(request, {
    cookiePrefix: "sportcation",
  })

  if (!sessionCookie) {
    const loginPath = getLoginRedirect(pathname)
    const loginUrl = new URL(loginPath, request.url)
    loginUrl.searchParams.set("next", pathname)
    return NextResponse.redirect(loginUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except static files with extensions
     */
    "/((?!.*\\.).*)",
  ],
}
