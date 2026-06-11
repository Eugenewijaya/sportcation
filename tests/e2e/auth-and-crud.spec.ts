import { readFileSync } from "node:fs"
import { expect, test, type Page } from "@playwright/test"
import { e2eContextPath } from "@/tests/e2e/paths"

type Credentials = {
  email: string
  password: string
}

type E2EContext = {
  admin: Credentials
  merchant: Credentials
}

const e2eContext = JSON.parse(readFileSync(e2eContextPath, "utf8")) as E2EContext

async function login(page: Page, credentials: Credentials, next = "/") {
  await page.goto(`/login?next=${encodeURIComponent(next)}`)
  await page.getByLabel("Email", { exact: true }).fill(credentials.email)
  await page.getByLabel("Password", { exact: true }).fill(credentials.password)
  const signInResponse = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      response.url().endsWith("/api/auth/sign-in/email"),
  )
  await page.getByRole("button", { name: "Login", exact: true }).click()
  expect((await signInResponse).status()).toBe(200)
  await expect(page).toHaveURL(next, { timeout: 15_000 })
}

test("protects merchant routes and supports persistent merchant CRUD", async ({ page }) => {
  const healthResponse = await page.request.get("/api/health")
  expect(healthResponse.status()).toBe(200)
  await expect(healthResponse.json()).resolves.toEqual({
    status: "ok",
    service: "sportcation-web",
  })

  const publicResponse = await page.request.get("/")
  expect(publicResponse.headers()["x-content-type-options"]).toBe("nosniff")
  expect(publicResponse.headers()["x-frame-options"]).toBe("DENY")
  expect(publicResponse.headers()["content-security-policy"]).toContain("frame-ancestors 'none'")

  await page.goto("/merchant")
  await expect(page).toHaveURL(/\/login\?next=%2Fmerchant$/)

  await login(page, e2eContext.merchant, "/merchant/venues")
  await expect(page.getByRole("heading", { name: "Venue Catalog", exact: true })).toBeVisible()

  const rejectedOriginResponse = await page.request.post("/api/venues", {
    headers: {
      origin: "https://attacker.example",
    },
    data: {
      categoryId: "category-padel",
      name: "Rejected Origin Venue",
      address: "Jl. Rejected Origin No. 1",
      city: "Jakarta",
      priceFrom: 315000,
      status: "draft",
      defaultCourtName: "Court Rejected",
    },
  })
  expect(rejectedOriginResponse.status()).toBe(403)

  const createResponse = await page.request.post("/api/venues", {
    data: {
      categoryId: "category-padel",
      name: "Playwright Venue",
      description: "Created by the isolated E2E suite.",
      address: "Jl. Playwright No. 1",
      city: "Jakarta",
      area: "Jakarta Selatan",
      priceFrom: 315000,
      imageUrl: "/padel-court-modern.jpg",
      status: "draft",
      defaultCourtName: "Court E2E",
    },
  })
  expect(createResponse.status()).toBe(201)
  const createdPayload = (await createResponse.json()) as { data: { id: string } }

  const patchResponse = await page.request.patch(`/api/venues/${createdPayload.data.id}`, {
    data: {
      name: "Playwright Venue Updated",
      status: "review",
    },
  })
  expect(patchResponse.status()).toBe(200)

  const getResponse = await page.request.get(`/api/venues/${createdPayload.data.id}`)
  expect(getResponse.status()).toBe(200)
  await expect(getResponse.json()).resolves.toMatchObject({
    data: {
      name: "Playwright Venue Updated",
      status: "review",
    },
  })

  const deleteResponse = await page.request.delete(`/api/venues/${createdPayload.data.id}`)
  expect(deleteResponse.status()).toBe(200)
  expect((await page.request.get(`/api/venues/${createdPayload.data.id}`)).status()).toBe(404)
})

test("enforces role boundaries for merchant and admin pages", async ({ browser }) => {
  const merchantContext = await browser.newContext()
  const merchantPage = await merchantContext.newPage()
  await login(merchantPage, e2eContext.merchant, "/merchant")
  await merchantPage.goto("/admin")
  await expect(merchantPage).toHaveURL(/\/unauthorized\?required=admin$/)
  await merchantContext.close()

  const adminContext = await browser.newContext()
  const adminPage = await adminContext.newPage()
  await login(adminPage, e2eContext.admin, "/admin")
  await adminPage.goto("/merchant")
  await expect(adminPage).toHaveURL(/\/unauthorized\?required=merchant_owner%2Cmerchant_staff$/)
  await adminContext.close()
})

test("keeps the merchant navigation usable without horizontal page overflow on mobile", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await login(page, e2eContext.merchant, "/merchant")

  await expect(page.locator('nav.sportcation-scrollbar a[href="/merchant/venues"]')).toBeVisible()
  const metrics = await page.evaluate(() => ({
    viewportWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }))
  expect(metrics.scrollWidth).toBe(metrics.viewportWidth)
})
