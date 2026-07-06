export const MERCHANT_MEMBERSHIP_ROLES = ["owner", "manager", "staff", "finance", "viewer"] as const
export type MerchantMembershipRole = (typeof MERCHANT_MEMBERSHIP_ROLES)[number]

export const MERCHANT_PERMISSIONS = ["catalog:read", "catalog:write", "slots:write", "bookings:read", "bookings:write", "finance:read"] as const
export type MerchantPermission = (typeof MERCHANT_PERMISSIONS)[number]

const permissionsByRole: Record<MerchantMembershipRole, readonly MerchantPermission[]> = {
  owner: MERCHANT_PERMISSIONS,
  manager: MERCHANT_PERMISSIONS,
  staff: ["catalog:read", "slots:write", "bookings:read", "bookings:write"],
  finance: ["catalog:read", "bookings:read", "finance:read"],
  viewer: ["catalog:read", "bookings:read"],
}

export function hasMerchantPermission(role: MerchantMembershipRole, permission: MerchantPermission) {
  return permissionsByRole[role].includes(permission)
}
