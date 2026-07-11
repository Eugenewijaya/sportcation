"use client"

import { createAuthClient } from "better-auth/react"
import { inferAdditionalFields } from "better-auth/client/plugins"
import type { auth } from "@/lib/auth"

// ponytail: We must use relative URLs (or undefined) so that auth requests go to the SAME domain
// where the user is currently browsing. If we hardcode NEXT_PUBLIC_API_URL, the browser will make
// cross-origin requests to a different Vercel domain, and cookies won't be saved for the current app.
export const authClient = createAuthClient({
  baseURL: typeof window !== "undefined" ? window.location.origin : undefined,
  plugins: [inferAdditionalFields<typeof auth>()],
})
