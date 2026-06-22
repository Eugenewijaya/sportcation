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

test("supports persistent merchant booking management", async ({ page }) => {
  await login(page, e2eContext.merchant, "/merchant/bookings")
  await expect(page.getByRole("heading", { name: "Booking Operations", exact: true })).toBeVisible()
  await expect(page.getByText("SP-77291")).toBeVisible()

  const listResponse = await page.request.get("/api/merchant/bookings")
  expect(listResponse.status()).toBe(200)
  await expect(listResponse.json()).resolves.toMatchObject({
    data: [
      {
        id: "booking-demo-confirmed",
        bookingCode: "SP-77291",
        status: "confirmed",
        actions: {
          canCheckIn: true,
          canComplete: false,
        },
      },
    ],
  })

  const detailResponse = page.waitForResponse(
    (response) =>
      response.request().method() === "GET" &&
      response.url().endsWith("/api/merchant/bookings/booking-demo-confirmed"),
  )
  await page.getByRole("button", { name: "Detail", exact: true }).first().click()
  expect((await detailResponse).status()).toBe(200)
  await expect(page.getByText("Alex Rivera E2E", { exact: true })).toBeVisible()
  await expect(page.getByText("Payment paid")).toBeVisible()

  const checkInResponse = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      response.url().endsWith("/api/merchant/bookings/booking-demo-confirmed/status"),
  )
  await page.getByRole("button", { name: "Mark Checked In", exact: true }).click()
  expect((await checkInResponse).status()).toBe(200)
  await expect(page.getByText("Checked in", { exact: true }).first()).toBeVisible()

  const completeResponse = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      response.url().endsWith("/api/merchant/bookings/booking-demo-confirmed/status"),
  )
  await page.getByRole("button", { name: "Mark Completed", exact: true }).click()
  expect((await completeResponse).status()).toBe(200)
  await expect(page.getByText("Completed", { exact: true }).first()).toBeVisible()

  const persistedDetail = await page.request.get("/api/merchant/bookings/booking-demo-confirmed")
  expect(persistedDetail.status()).toBe(200)
  await expect(persistedDetail.json()).resolves.toMatchObject({
    data: {
      id: "booking-demo-confirmed",
      status: "completed",
      actions: {
        canCheckIn: false,
        canComplete: false,
      },
    },
  })
})

test("supports persistent merchant finance foundation", async ({ page }) => {
  await login(page, e2eContext.merchant, "/merchant/finance")
  await expect(page.getByRole("heading", { name: "Settlement Center", exact: true })).toBeVisible()
  await expect(page.getByText("Read-only payout foundation")).toBeVisible()
  await expect(page.getByText("Padel Arena").first()).toBeVisible()
  await expect(page.getByText("QRIS / OVO").first()).toBeVisible()

  const financeResponse = await page.request.get("/api/merchant/finance")
  expect(financeResponse.status()).toBe(200)
  const financePayload = (await financeResponse.json()) as {
    data: {
      summary: {
        bookingCount: number
        netReceivable: number
        payoutReadyAmount: number
      }
      settlements: Array<{ venue: { id: string; name: string }; status: string; netAmount: number }>
      transactions: Array<{ bookingCode: string; paymentStatus: string; paymentMethod: string; netAmount: number }>
      payoutPolicy: { mutationScope: string }
    }
  }

  expect(financePayload.data.summary.bookingCount).toBeGreaterThanOrEqual(1)
  expect(financePayload.data.summary.netReceivable).toBeGreaterThanOrEqual(350000)
  expect(financePayload.data.summary.payoutReadyAmount).toBeGreaterThanOrEqual(350000)
  expect(financePayload.data.settlements.some((settlement) => settlement.venue.name === "Padel Arena" && settlement.netAmount >= 350000)).toBe(true)
  expect(financePayload.data.transactions.some((transaction) => transaction.bookingCode === "SP-77291" && transaction.paymentStatus === "paid")).toBe(true)
  expect(financePayload.data.payoutPolicy.mutationScope).toContain("Read-only foundation")
})

test("supports persistent admin booking and payment review", async ({ page }) => {
  await login(page, e2eContext.admin, "/admin/bookings")
  await expect(page.getByRole("heading", { name: "Admin Booking Review", exact: true })).toBeVisible()
  await expect(page.getByText("SP-77291")).toBeVisible()

  const bookingListResponse = await page.request.get("/api/admin/bookings")
  expect(bookingListResponse.status()).toBe(200)
  await expect(bookingListResponse.json()).resolves.toMatchObject({
    data: [
      {
        id: "booking-demo-confirmed",
        bookingCode: "SP-77291",
        merchant: {
          businessName: "Sportcation Venue Partner",
        },
        payment: {
          id: "payment-demo-paid",
          status: "paid",
        },
      },
    ],
  })

  const bookingDetailResponse = page.waitForResponse(
    (response) =>
      response.request().method() === "GET" &&
      response.url().endsWith("/api/admin/bookings/booking-demo-confirmed"),
  )
  await page.getByRole("button", { name: "Detail", exact: true }).first().click()
  expect((await bookingDetailResponse).status()).toBe(200)
  await expect(page.getByText("Sportcation Venue Partner").first()).toBeVisible()
  await expect(page.getByText("Healthy booking and payment state.")).toBeVisible()

  await page.goto("/admin/payments")
  await expect(page.getByRole("heading", { name: "Payment Review", exact: true })).toBeVisible()
  await expect(page.getByText("SIM-QRIS-SP-77291")).toBeVisible()

  const paymentListResponse = await page.request.get("/api/admin/payments")
  expect(paymentListResponse.status()).toBe(200)
  await expect(paymentListResponse.json()).resolves.toMatchObject({
    data: [
      {
        id: "payment-demo-paid",
        bookingCode: "SP-77291",
        status: "paid",
        method: "qris",
      },
    ],
  })

  const paymentDetailResponse = page.waitForResponse(
    (response) =>
      response.request().method() === "GET" &&
      response.url().endsWith("/api/admin/payments/payment-demo-paid"),
  )
  await page.getByRole("button", { name: "Detail", exact: true }).first().click()
  expect((await paymentDetailResponse).status()).toBe(200)
  await expect(page.getByText("Payment ID payment-demo-paid")).toBeVisible()
  await expect(page.getByText("Booking status Completed")).toBeVisible()
})

test("supports persistent admin user and venue moderation", async ({ page }) => {
  await login(page, e2eContext.admin, "/admin/users")
  await expect(page.getByRole("heading", { name: "Admin User Directory", exact: true })).toBeVisible()
  await expect(page.getByText(e2eContext.customer.email)).toBeVisible()

  const userListResponse = await page.request.get("/api/admin/users")
  expect(userListResponse.status()).toBe(200)
  const userListPayload = (await userListResponse.json()) as { data: Array<{ id: string; email: string | null; role: string; stats: { bookingCount: number } }> }
  const customer = userListPayload.data.find((item) => item.email === e2eContext.customer.email)
  expect(customer).toBeTruthy()
  expect(customer).toMatchObject({
    email: e2eContext.customer.email,
    role: "customer",
  })
  expect(customer!.stats.bookingCount).toBeGreaterThanOrEqual(1)

  const customerCard = page.getByRole("article").filter({ hasText: e2eContext.customer.email })
  const userDetailResponse = page.waitForResponse(
    (response) =>
      response.request().method() === "GET" &&
      response.url().endsWith(`/api/admin/users/${customer!.id}`),
  )
  await customerCard.getByRole("button", { name: "Detail", exact: true }).click()
  expect((await userDetailResponse).status()).toBe(200)
  await expect(page.getByText("Booking count")).toBeVisible()
  await expect(page.getByText("User identity and merchant links are operationally healthy.")).toBeVisible()

  await page.goto("/admin/venues")
  await expect(page.getByRole("heading", { name: "Venue Moderation", exact: true })).toBeVisible()
  await expect(page.getByText("Padel Arena")).toBeVisible()

  const venueListResponse = await page.request.get("/api/admin/venues")
  expect(venueListResponse.status()).toBe(200)
  const venueListPayload = (await venueListResponse.json()) as { data: Array<{ id: string; name: string; status: string; stats: { courtCount: number; bookingCount: number } }> }
  const padelVenue = venueListPayload.data.find((item) => item.name === "Padel Arena")
  expect(padelVenue).toBeTruthy()
  expect(padelVenue).toMatchObject({
    name: "Padel Arena",
    status: "published",
    stats: {
      courtCount: 1,
    },
  })
  expect(padelVenue!.stats.bookingCount).toBeGreaterThanOrEqual(1)

  const venueCard = page.getByRole("article").filter({ hasText: "Padel Arena" }).first()
  const venueDetailResponse = page.waitForResponse(
    (response) =>
      response.request().method() === "GET" &&
      response.url().endsWith(`/api/admin/venues/${padelVenue!.id}`),
  )
  await venueCard.getByRole("button", { name: "Detail", exact: true }).click()
  expect((await venueDetailResponse).status()).toBe(200)
  await expect(page.getByText("Sportcation Venue Partner").first()).toBeVisible()
  await expect(page.getByText("Venue ownership, moderation, and court inventory are healthy.")).toBeVisible()
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

test("supports persisted customer profile and notification management", async ({ page }) => {
  await login(page, e2eContext.customer, "/?screen=profile")

  await expect(page.getByRole("heading", { name: "Alex Rivera E2E", exact: true })).toBeVisible()
  await expect(page.getByText(e2eContext.customer.email)).toBeVisible()

  await page.getByRole("button", { name: /Edit Profile/ }).click()
  await expect(page.getByRole("heading", { name: "Personal Info", exact: true })).toBeVisible()
  await page.getByLabel("Account name").fill("Alex Profile E2E")
  await page.getByLabel("Full name").fill("Alex Profile E2E")
  await page.getByLabel("Phone").fill("+62 812 0000 9000")
  await page.getByLabel("City").fill("Jakarta")

  const profileUpdateResponse = page.waitForResponse(
    (response) =>
      response.request().method() === "PATCH" &&
      response.url().endsWith("/api/profile"),
  )
  await page.getByRole("button", { name: "Save Profile", exact: true }).click()
  expect((await profileUpdateResponse).status()).toBe(200)

  await expect(page.getByRole("heading", { name: "Alex Profile E2E", exact: true })).toBeVisible()
  await expect(page.getByText("+62 812 0000 9000")).toBeVisible()

  await page.getByRole("button", { name: /Notifications/ }).click()
  await expect(page.getByRole("heading", { name: "Updates", exact: true })).toBeVisible()
  await expect(page.getByText("Booking Confirmed").first()).toBeVisible()

  const markAllResponse = page.waitForResponse(
    (response) =>
      response.request().method() === "POST" &&
      response.url().endsWith("/api/notifications/mark-all-read"),
  )
  await page.getByRole("button", { name: "Mark all as read", exact: true }).click()
  expect((await markAllResponse).status()).toBe(200)
  await expect(page.getByText("Read").first()).toBeVisible()

  const profileResponse = await page.request.get("/api/profile")
  expect(profileResponse.status()).toBe(200)
  await expect(profileResponse.json()).resolves.toMatchObject({
    data: {
      name: "Alex Profile E2E",
      phone: "+62 812 0000 9000",
      stats: {
        unreadNotifications: 0,
      },
    },
  })
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
  expect((await adminPage.request.get("/api/merchant/finance")).status()).toBe(403)
  await adminContext.close()

  const customerContext = await browser.newContext()
  const customerPage = await customerContext.newPage()
  await login(customerPage, e2eContext.customer, "/")
  expect((await customerPage.request.get("/api/admin/bookings")).status()).toBe(403)
  expect((await customerPage.request.get("/api/admin/payments")).status()).toBe(403)
  expect((await customerPage.request.get("/api/admin/users")).status()).toBe(403)
  expect((await customerPage.request.get("/api/admin/venues")).status()).toBe(403)
  expect((await customerPage.request.get("/api/merchant/finance")).status()).toBe(403)
  await customerContext.close()
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
