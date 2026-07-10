/**
 * Server-side API fetch helper.
 * Semua requests dari admin/merchant/client ke apps/api memakai helper ini.
 * Cookies session dari user diteruskan secara otomatis.
 *
 * Otomatis unwrap `{ data: T }` yang direturn oleh ok() helper di apps/api.
 */
import "server-only"
import { cookies, headers } from "next/headers"

function getApiUrl() {
  const base = process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3004"
  return base.replace(/\/$/, "")
}

type FetchOptions = Omit<RequestInit, "headers"> & {
  headers?: Record<string, string>
}

export async function apiFetch<T = unknown>(
  path: string,
  options: FetchOptions = {},
): Promise<T> {
  const url = `${getApiUrl()}${path}`

  // Forward cookies untuk session auth
  const cookieStore = await cookies()
  const headerStore = await headers()

  const requestHeaders: Record<string, string> = {
    "Content-Type": "application/json",
    Cookie: cookieStore.toString(),
    // Forward origin agar isTrustedMutationRequest lulus
    Origin: headerStore.get("origin") ?? (process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3004"),
    ...options.headers,
  }

  const res = await fetch(url, {
    ...options,
    headers: requestHeaders,
    cache: options.cache ?? "no-store",
  })

  if (!res.ok) {
    const text = await res.text().catch(() => res.statusText)
    throw new Error(`API ${path} failed [${res.status}]: ${text}`)
  }

  const json = await res.json()
  // Unwrap the { data: T } envelope from ok() helper
  return (json?.data !== undefined ? json.data : json) as T
}

