import { describe, expect, it } from "vitest"
import {
  courtPatchSchema,
  slugify,
  slotInputSchema,
  slotPatchSchema,
  venueInputSchema,
  venuePatchSchema,
} from "@/lib/validation/merchant"

describe("merchant validation", () => {
  it("normalizes venue names into stable slugs", () => {
    expect(slugify("Padel Árena Jakarta!")).toBe("padel-arena-jakarta")
  })

  it("rejects empty patches", () => {
    expect(venuePatchSchema.safeParse({}).success).toBe(false)
    expect(courtPatchSchema.safeParse({}).success).toBe(false)
    expect(slotPatchSchema.safeParse({}).success).toBe(false)
  })

  it("rejects invalid slot time ranges", () => {
    const result = slotInputSchema.safeParse({
      courtId: "court-1",
      slotDate: "2026-06-20",
      startTime: "10:00",
      endTime: "09:00",
      price: 250000,
      status: "available",
    })

    expect(result.success).toBe(false)
  })

  it("coerces valid venue prices and applies defaults", () => {
    const result = venueInputSchema.parse({
      categoryId: "padel",
      name: "QA Padel",
      address: "Jl. Test No. 1",
      city: "Jakarta",
      priceFrom: "350000",
    })

    expect(result.priceFrom).toBe(350000)
    expect(result.status).toBe("draft")
    expect(result.defaultCourtName).toBe("Court 01")
  })

  it("allows local or HTTPS images and rejects executable or insecure schemes", () => {
    const baseVenue = {
      categoryId: "padel",
      name: "Secure Image Venue",
      address: "Jl. Test No. 1",
      city: "Jakarta",
      priceFrom: 350000,
    }

    expect(venueInputSchema.safeParse({ ...baseVenue, imageUrl: "/venues/padel.jpg" }).success).toBe(true)
    expect(venueInputSchema.safeParse({ ...baseVenue, imageUrl: "https://cdn.example/padel.jpg" }).success).toBe(true)
    expect(venueInputSchema.safeParse({ ...baseVenue, imageUrl: "javascript:alert(1)" }).success).toBe(false)
    expect(venueInputSchema.safeParse({ ...baseVenue, imageUrl: "http://insecure.example/padel.jpg" }).success).toBe(false)
    expect(venueInputSchema.safeParse({ ...baseVenue, imageUrl: "//attacker.example/padel.jpg" }).success).toBe(false)
  })
})
