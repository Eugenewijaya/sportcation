import { betterAuth } from "better-auth"
import { drizzleAdapter } from "better-auth/adapters/drizzle"
import { getDb } from "@/lib/db"
import * as schema from "@/lib/db/schema"

const configuredBaseURL = process.env.BETTER_AUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL
const secret = process.env.BETTER_AUTH_SECRET ?? process.env.AUTH_SECRET

if (secret && secret.length < 32) {
  throw new Error("BETTER_AUTH_SECRET must contain at least 32 characters.")
}
if (process.env.NODE_ENV === "production" && !secret) {
  throw new Error("BETTER_AUTH_SECRET is required in production.")
}
if (process.env.NODE_ENV === "production" && !configuredBaseURL) {
  throw new Error("BETTER_AUTH_URL or NEXT_PUBLIC_APP_URL is required in production.")
}

const baseURL = configuredBaseURL ?? "http://localhost:3000"
const trustedOrigins = [
  baseURL,
  ...(process.env.AUTH_TRUSTED_ORIGINS?.split(",").map((origin) => origin.trim()).filter(Boolean) ?? []),
]

export const auth = betterAuth({
  appName: "Sportcation",
  baseURL,
  secret,
  trustedOrigins,
  database: drizzleAdapter(getDb(), {
    provider: "sqlite",
    schema,
  }),
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    autoSignIn: true,
  },
  user: {
    modelName: "users",
    fields: {
      createdAt: "authCreatedAt",
      updatedAt: "authUpdatedAt",
    },
    additionalFields: {
      role: {
        type: ["customer", "merchant_owner", "merchant_staff", "admin"],
        required: false,
        defaultValue: "customer",
        input: false,
      },
      status: {
        type: ["active", "pending", "restricted", "disabled"],
        required: false,
        defaultValue: "active",
        input: false,
      },
    },
  },
  session: {
    modelName: "authSessions",
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
  account: {
    modelName: "authAccounts",
    encryptOAuthTokens: true,
  },
  verification: {
    modelName: "authVerifications",
    storeIdentifier: "hashed",
  },
  rateLimit: {
    enabled: true,
    storage: "database",
    modelName: "authRateLimits",
    window: 60,
    max: 100,
    customRules: {
      "/sign-in/email": {
        window: 60,
        max: 5,
      },
      "/sign-up/email": {
        window: 60,
        max: 3,
      },
    },
  },
  databaseHooks: {
    user: {
      create: {
        after: async (user) => {
          await getDb()
            .insert(schema.userProfiles)
            .values({
              userId: user.id,
              fullName: user.name,
            })
            .onConflictDoNothing()
        },
      },
    },
  },
  advanced: {
    cookiePrefix: "sportcation",
    useSecureCookies: process.env.NODE_ENV === "production",
  },
})

export type AuthSession = typeof auth.$Infer.Session
