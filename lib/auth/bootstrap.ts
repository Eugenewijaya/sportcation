import "dotenv/config"
import { and, eq } from "drizzle-orm"
import { hashPassword } from "better-auth/crypto"
import { getDb } from "@/lib/db"
import { authAccounts, merchantMembers, merchantProfiles, userProfiles, users } from "@/lib/db/schema"
import type { AppRole } from "@/lib/auth-access"

type BootstrapAccount = {
  email: string
  password: string
  name: string
  role: AppRole
}

async function main() {
  const accounts = readBootstrapAccounts()
  if (!accounts.length) {
    throw new Error(
      "No bootstrap credentials configured. Set AUTH_BOOTSTRAP_ADMIN_EMAIL/PASSWORD or AUTH_BOOTSTRAP_MERCHANT_EMAIL/PASSWORD.",
    )
  }

  for (const account of accounts) {
    await upsertCredentialAccount(account)
    console.log(`Bootstrapped ${account.role}: ${account.email}`)
  }
}

function readBootstrapAccounts() {
  const accounts: BootstrapAccount[] = []
  const adminEmail = process.env.AUTH_BOOTSTRAP_ADMIN_EMAIL?.trim().toLowerCase()
  const adminPassword = process.env.AUTH_BOOTSTRAP_ADMIN_PASSWORD
  const merchantEmail = process.env.AUTH_BOOTSTRAP_MERCHANT_EMAIL?.trim().toLowerCase()
  const merchantPassword = process.env.AUTH_BOOTSTRAP_MERCHANT_PASSWORD

  if (adminEmail || adminPassword) {
    accounts.push({
      email: requireValue(adminEmail, "AUTH_BOOTSTRAP_ADMIN_EMAIL"),
      password: validatePassword(requireValue(adminPassword, "AUTH_BOOTSTRAP_ADMIN_PASSWORD")),
      name: process.env.AUTH_BOOTSTRAP_ADMIN_NAME?.trim() || "Sportcation Admin",
      role: "admin",
    })
  }

  if (merchantEmail || merchantPassword) {
    accounts.push({
      email: requireValue(merchantEmail, "AUTH_BOOTSTRAP_MERCHANT_EMAIL"),
      password: validatePassword(requireValue(merchantPassword, "AUTH_BOOTSTRAP_MERCHANT_PASSWORD")),
      name: process.env.AUTH_BOOTSTRAP_MERCHANT_NAME?.trim() || "Sportcation Merchant",
      role: "merchant_owner",
    })
  }

  return accounts
}

async function upsertCredentialAccount(account: BootstrapAccount) {
  const db = getDb()
  const now = new Date()
  const existingUser = await db.select().from(users).where(eq(users.email, account.email)).get()
  const userId = existingUser?.id ?? crypto.randomUUID()

  if (existingUser) {
    await db
      .update(users)
      .set({
        name: account.name,
        role: account.role,
        status: "active",
        emailVerified: true,
        authUpdatedAt: now,
        updatedAt: now.toISOString(),
      })
      .where(eq(users.id, userId))
  } else {
    await db.insert(users).values({
      id: userId,
      name: account.name,
      email: account.email,
      emailVerified: true,
      role: account.role,
      status: "active",
      authCreatedAt: now,
      authUpdatedAt: now,
      createdAt: now.toISOString(),
      updatedAt: now.toISOString(),
    })
  }

  await db
    .insert(userProfiles)
    .values({
      userId,
      fullName: account.name,
      city: "Jakarta",
    })
    .onConflictDoUpdate({
      target: userProfiles.userId,
      set: {
        fullName: account.name,
        updatedAt: now.toISOString(),
      },
    })

  const passwordHash = await hashPassword(account.password)
  const existingAccount = await db
    .select({ id: authAccounts.id })
    .from(authAccounts)
    .where(and(eq(authAccounts.userId, userId), eq(authAccounts.providerId, "credential")))
    .get()

  if (existingAccount) {
    await db
      .update(authAccounts)
      .set({
        accountId: userId,
        password: passwordHash,
        updatedAt: now,
      })
      .where(eq(authAccounts.id, existingAccount.id))
  } else {
    await db.insert(authAccounts).values({
      id: crypto.randomUUID(),
      accountId: userId,
      providerId: "credential",
      userId,
      password: passwordHash,
      createdAt: now,
      updatedAt: now,
    })
  }

  if (account.role === "merchant_owner") {
    const ownedMerchant = await db
      .select({ id: merchantProfiles.id })
      .from(merchantProfiles)
      .where(eq(merchantProfiles.ownerUserId, userId))
      .get()

    const merchantId = ownedMerchant?.id ?? crypto.randomUUID()
    if (!ownedMerchant) {
      await db.insert(merchantProfiles).values({
        id: merchantId,
        ownerUserId: userId,
        businessName: `${account.name} Partner`,
        status: "verified",
      })
    }

    await db
      .insert(merchantMembers)
      .values({
        merchantId,
        userId,
        role: "owner",
      })
      .onConflictDoNothing()
  }
}

function requireValue(value: string | undefined, name: string) {
  if (!value) throw new Error(`${name} is required when bootstrapping that account.`)
  return value
}

function validatePassword(password: string) {
  if (password.length < 12) {
    throw new Error("Bootstrap passwords must contain at least 12 characters.")
  }
  return password
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
