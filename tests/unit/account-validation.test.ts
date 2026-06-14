import { describe, expect, it } from "vitest"
import { updateCustomerProfileSchema } from "@/lib/validation/account"

describe("customer account validation", () => {
  it("accepts a partial profile update", () => {
    const result = updateCustomerProfileSchema.safeParse({
      name: "  Alex Customer  ",
      fullName: "Alex Customer Pro",
      phone: "+62 812 3456 7890",
      city: "Jakarta",
      avatarUrl: "",
    })

    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toMatchObject({
        name: "Alex Customer",
        phone: "+62 812 3456 7890",
        avatarUrl: "",
      })
    }
  })

  it("rejects an empty update payload", () => {
    const result = updateCustomerProfileSchema.safeParse({})

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0]?.message).toBe("Minimal satu field profil harus dikirim.")
    }
  })

  it("rejects invalid phone and avatar URL values", () => {
    const result = updateCustomerProfileSchema.safeParse({
      phone: "not a phone",
      avatarUrl: "not-a-url",
    })

    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues.map((issue) => issue.path.join("."))).toEqual(["phone", "avatarUrl"])
    }
  })
})
