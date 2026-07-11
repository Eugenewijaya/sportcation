const SAFE_METHODS = new Set(["GET", "HEAD", "OPTIONS"])

export function getConfiguredAuthBaseURL(environment: NodeJS.ProcessEnv = process.env) {
  if (environment.VERCEL_PROJECT_PRODUCTION_URL) {
    return `https://${environment.VERCEL_PROJECT_PRODUCTION_URL}`
  }
  if (environment.VERCEL_URL) {
    return `https://${environment.VERCEL_URL}`
  }
  return environment.BETTER_AUTH_URL ?? environment.NEXT_PUBLIC_APP_URL
}

export function getTrustedAuthOrigins(
  environment: NodeJS.ProcessEnv = process.env,
  fallbackBaseURL = "http://localhost:3000",
) {
  const configured = getConfiguredAuthBaseURL(environment) ?? fallbackBaseURL
  const candidates = [
    configured,
    ...(environment.AUTH_TRUSTED_ORIGINS?.split(",").map((origin) => origin.trim()).filter(Boolean) ?? []),
  ]

  return [...new Set(candidates.map(normalizeOrigin))]
}

export function isTrustedMutationRequest(
  request: Pick<Request, "method" | "headers">,
  trustedOrigins = getTrustedAuthOrigins(),
) {
  if (SAFE_METHODS.has(request.method.toUpperCase())) return true

  const origin = request.headers.get("origin")
  if (origin) {
    try {
      return trustedOrigins.includes(normalizeOrigin(origin))
    } catch {
      return false
    }
  }

  const fetchSite = request.headers.get("sec-fetch-site")
  return !fetchSite || fetchSite === "same-origin" || fetchSite === "none"
}

function normalizeOrigin(value: string) {
  return new URL(value).origin
}
