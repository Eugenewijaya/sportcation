import { loadEnvConfig } from "@next/env"

export function loadCliEnvironment(options: { production?: boolean } = {}) {
  const production = options.production ?? process.env.NODE_ENV === "production"
  loadEnvConfig(process.cwd(), !production)
}
