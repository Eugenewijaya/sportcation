import { NextRequest, NextResponse } from "next/server"

// ponytail: CORS middleware — Access-Control-Allow-Origin only accepts
// a single origin when credentials are involved, so we dynamically
// echo the request Origin if it's in our trusted list.
const TRUSTED = new Set(
  (process.env.AUTH_TRUSTED_ORIGINS || "http://localhost:3000,http://localhost:3001,http://localhost:3002")
    .split(",")
    .map((o) => o.trim())
    .filter(Boolean),
)

function corsHeaders(origin: string | null) {
  const headers = new Headers()
  if (origin && TRUSTED.has(origin)) {
    headers.set("Access-Control-Allow-Origin", origin)
    headers.set("Access-Control-Allow-Credentials", "true")
    headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS")
    headers.set("Access-Control-Allow-Headers", "Content-Type,Authorization,X-Requested-With,Cookie")
  }
  return headers
}

export function middleware(request: NextRequest) {
  const origin = request.headers.get("origin")

  // Handle preflight
  if (request.method === "OPTIONS") {
    return new NextResponse(null, { status: 204, headers: corsHeaders(origin) })
  }

  const response = NextResponse.next()
  if (origin && TRUSTED.has(origin)) {
    response.headers.set("Access-Control-Allow-Origin", origin)
    response.headers.set("Access-Control-Allow-Credentials", "true")
    response.headers.set("Access-Control-Allow-Methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS")
    response.headers.set("Access-Control-Allow-Headers", "Content-Type,Authorization,X-Requested-With,Cookie")
  }
  return response
}

export const config = {
  matcher: "/api/:path*",
}
