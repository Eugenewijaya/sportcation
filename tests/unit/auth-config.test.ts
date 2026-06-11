import { describe, expect, it } from "vitest"
import {
  getConfiguredAuthBaseURL,
  getTrustedAuthOrigins,
  isTrustedMutationRequest,
} from "@/lib/auth-config"

describe("auth origin policy", () => {
  const environment: NodeJS.ProcessEnv = {
    NODE_ENV: "test",
    BETTER_AUTH_URL: "https://sportcation.example",
    AUTH_TRUSTED_ORIGINS: "https://admin.sportcation.example, https://sportcation.example/",
  }
  const trustedOrigins = getTrustedAuthOrigins(environment)

  it("normalizes and deduplicates configured origins", () => {
    expect(getConfiguredAuthBaseURL(environment)).toBe("https://sportcation.example")
    expect(trustedOrigins).toEqual([
      "https://sportcation.example",
      "https://admin.sportcation.example",
    ])
  })

  it("allows safe methods and trusted mutation origins", () => {
    expect(
      isTrustedMutationRequest(
        new Request("https://sportcation.example/api/venues", {
          method: "GET",
          headers: { origin: "https://attacker.example" },
        }),
        trustedOrigins,
      ),
    ).toBe(true)
    expect(
      isTrustedMutationRequest(
        new Request("https://sportcation.example/api/venues", {
          method: "POST",
          headers: { origin: "https://admin.sportcation.example" },
        }),
        trustedOrigins,
      ),
    ).toBe(true)
  })

  it("rejects foreign or malformed browser mutation origins", () => {
    expect(
      isTrustedMutationRequest(
        new Request("https://sportcation.example/api/venues", {
          method: "POST",
          headers: { origin: "https://attacker.example" },
        }),
        trustedOrigins,
      ),
    ).toBe(false)
    expect(
      isTrustedMutationRequest(
        new Request("https://sportcation.example/api/venues", {
          method: "DELETE",
          headers: { origin: "not-a-url" },
        }),
        trustedOrigins,
      ),
    ).toBe(false)
  })

  it("allows non-browser clients without origin metadata but rejects cross-site browser requests", () => {
    expect(
      isTrustedMutationRequest(
        new Request("https://sportcation.example/api/venues", { method: "PATCH" }),
        trustedOrigins,
      ),
    ).toBe(true)
    expect(
      isTrustedMutationRequest(
        new Request("https://sportcation.example/api/venues", {
          method: "PATCH",
          headers: { "sec-fetch-site": "cross-site" },
        }),
        trustedOrigins,
      ),
    ).toBe(false)
  })
})
