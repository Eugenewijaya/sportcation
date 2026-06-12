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
  customer: Credentials
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

test("serves the public catalog from persisted venue and slot data", async ({ page }) => {
  const catalogResponse = await page.request.get("/api/public/catalog?q=Padel")
  expect(catalogResponse.status()).toBe(200)
  await expect(catalogResponse.json()).resolves.toMatchObject({
    venues: [
      {
        id: "venue-padel-arena",
        name: "Padel Arena",
        slots: [
          {
            id: "slot-padel-available",
            status: "available",
          },
        ],
      },
    ],
  })

  const hiddenResponse = await page.request.get("/api/public/catalog?q=Draft")
  expect(hiddenResponse.status()).toBe(200)
  await expect(hiddenResponse.json()).resolves.toMatchObject({
    venues: [],
  })

  await page.goto("/?screen=explore")
  await expect(page.getByRole("heading", { name: "Find Your Next Arena.", exact: true })).toBeVisible()
  await page.getByPlaceholder("Search venues, sports, or areas...").fill("Padel")
  await expect(page.getByRole("heading", { name: "Padel Arena", exact: true })).toBeVisible()
  await page.getByRole("button", { name: /Padel Arena/ }).first().click()

  await expect(page.getByRole("heading", { name: "Padel Arena", exact: true }).first()).toBeVisible()
  await expect(page.getByRole("button", { name: /08:00 (Selected|Available)/ })).toBeVisible()
  await page.getByRole("button", { name: /Book Now/ }).click()
  await expect(page.getByRole("heading", { name: "Review & Checkout", exact: true })).toBeVisible()
  await expect(page.getByText("08:00 - 09:00")).toBeVisible()
})

test("creates a persisted customer booking and payment simulation", async ({ page }) => {
  const unauthenticatedBookingResponse = await page.request.post("/api/bookings", {
    data: {
      slotId: "slot-padel-available",
      paymentMethod: "qris",
    },
  })
  expect(unauthenticatedBookingResponse.status()).toBe(401)

  await login(page, e2eContext.customer, "/?screen=explore")
  await expect(page.getByRole("heading", { name: "Find Your Next Arena.", exact: true })).toBeVisible()

  await page.getByPlaceholder("Search venues, sports, or areas...").fill("Padel")
  await expect(page.getByRole("heading", { name: "Padel Arena", exact: true })).toBeVisible()
  await page.getByRole("button", { name: /Padel Arena/ }).first().click()
  await expect(page.getByRole("button", { name: /08:00 (Selected|Available)/ })).toBeVisible()

  await page.getByRole("button", { name: /Book Now/ }).click()
  await expect(page.getByRole("heading", { name: "Review & Checkout", exact: true })).toBeVisible()

  const bookingResponse = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      response.url().endsWith("/api/bookings"),
  )
  await page.getByRole("button", { name: /Pay Now/ }).click()
  expect((await bookingResponse).status()).toBe(201)

  const bookingCodeText = await page.getByText(/SP-[A-Z0-9]+/).first().textContent()
  const bookingCode = bookingCodeText?.match(/SP-[A-Z0-9]+/)?.[0]
  expect(bookingCode).toBeTruthy()
  await expect(page.getByText(bookingCode!)).toBeVisible()
  await expect(page.getByText("Status: pending")).toBeVisible()

  const paymentResponse = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      response.url().includes("/api/payments/") &&
      response.url().endsWith("/simulate"),
  )
  await page.getByRole("button", { name: /Selesai membayar/ }).click()
  expect((await paymentResponse).status()).toBe(200)

  await expect(page.getByRole("heading", { name: "Pemesanan Berhasil!", exact: true })).toBeVisible()
  await expect(page.getByText("Padel Arena")).toBeVisible()
  await page.getByRole("button", { name: "Lihat Tiket" }).click()

  await expect(page.getByRole("heading", { name: "My Bookings", exact: true })).toBeVisible()
  const persistedBookingCard = page.getByRole("article").filter({ hasText: bookingCode! })
  await expect(persistedBookingCard.getByRole("heading", { name: "Padel Arena", exact: true })).toBeVisible()
  await expect(persistedBookingCard.getByText("08:00 - 09:00")).toBeVisible()

  const cancellationResponse = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      response.url().includes(`/api/bookings/`) &&
      response.url().endsWith("/cancel"),
  )
  await persistedBookingCard.getByRole("button", { name: "Cancel", exact: true }).click()
  expect((await cancellationResponse).status()).toBe(200)

  await page.getByRole("button", { name: "Cancelled", exact: true }).click()
  const cancelledBookingCard = page.getByRole("article").filter({ hasText: bookingCode! })
  await expect(cancelledBookingCard.getByText("Cancelled")).toBeVisible()
  await expect(cancelledBookingCard.getByText("refunded")).toBeVisible()
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
