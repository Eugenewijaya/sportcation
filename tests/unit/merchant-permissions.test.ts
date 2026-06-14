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
    expect(hasMerchantPermission("staff", "catalog:write")).toBe(false)
  })

  it("keeps finance and viewer roles read-only", () => {
    for (const role of ["finance", "viewer"] as const) {
      expect(hasMerchantPermission(role, "catalog:read")).toBe(true)
      expect(hasMerchantPermission(role, "bookings:read")).toBe(true)
      expect(hasMerchantPermission(role, "catalog:write")).toBe(false)
      expect(hasMerchantPermission(role, "slots:write")).toBe(false)
      expect(hasMerchantPermission(role, "bookings:write")).toBe(false)
    }
  })

  it("defines an explicit policy for every membership role", () => {
    for (const role of MERCHANT_MEMBERSHIP_ROLES) {
      expect(MERCHANT_PERMISSIONS.some((permission) => hasMerchantPermission(role, permission))).toBe(true)
    }
  })
})
