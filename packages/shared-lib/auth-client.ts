"use client"

import { createAuthClient } from "better-auth/react"
import { inferAdditionalFields } from "better-auth/client/plugins"
import type { auth } from "@/lib/auth"

// ponytail: NEXT_PUBLIC_API_URL is inlined at build time by Next.js.
// Without baseURL, auth requests go to the current origin which has no /api/auth route.
export const authClient = createAuthClient({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:3004",
  plugins: [inferAdditionalFields<typeof auth>()],
})
