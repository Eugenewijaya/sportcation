import { describe, expect, it } from "vitest"
import {
  hasMerchantPermission,
  MERCHANT_MEMBERSHIP_ROLES,
  MERCHANT_PERMISSIONS,
} from "@/lib/domain/merchant-permissions"

describe("merchant permissions", () => {
  it("grants every permission to owners and managers", () => {
    for (const role of ["owner", "manager"] as const) {
      for (const permission of MERCHANT_PERMISSIONS) {
        expect(hasMerchantPermission(role, permission)).toBe(true)
      }
    }
  })

  it("allows staff to manage slots and booking operations but not venue catalog mutations", () => {
    expect(hasMerchantPermission("staff", "catalog:read")).toBe(true)
    expect(hasMerchantPermission("staff", "slots:write")).toBe(true)
    expect(hasMerchantPermission("staff", "bookings:read")).toBe(true)
    expect(hasMerchantPermission("staff", "bookings:write")).toBe(true)
    expect(hasMerchantPermission("staff", "finance:read")).toBe(false)
    expect(hasMerchantPermission("staff", "catalog:write")).toBe(false)
  })

  it("keeps finance read-only with finance visibility", () => {
    expect(hasMerchantPermission("finance", "catalog:read")).toBe(true)
    expect(hasMerchantPermission("finance", "bookings:read")).toBe(true)
    expect(hasMerchantPermission("finance", "finance:read")).toBe(true)
    expect(hasMerchantPermission("finance", "catalog:write")).toBe(false)
    expect(hasMerchantPermission("finance", "slots:write")).toBe(false)
    expect(hasMerchantPermission("finance", "bookings:write")).toBe(false)
  })

  it("keeps viewer read-only without finance visibility", () => {
    expect(hasMerchantPermission("viewer", "catalog:read")).toBe(true)
    expect(hasMerchantPermission("viewer", "bookings:read")).toBe(true)
    expect(hasMerchantPermission("viewer", "finance:read")).toBe(false)
    expect(hasMerchantPermission("viewer", "catalog:write")).toBe(false)
    expect(hasMerchantPermission("viewer", "slots:write")).toBe(false)
    expect(hasMerchantPermission("viewer", "bookings:write")).toBe(false)
  })

  it("defines an explicit policy for every membership role", () => {
    for (const role of MERCHANT_MEMBERSHIP_ROLES) {
      expect(MERCHANT_PERMISSIONS.some((permission) => hasMerchantPermission(role, permission))).toBe(true)
    }
  })
})
