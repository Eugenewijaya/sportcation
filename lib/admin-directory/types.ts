export type AdminUserRole = "customer" | "merchant_owner" | "merchant_staff" | "admin"
export type AdminUserStatus = "active" | "pending" | "restricted" | "disabled"
export type AdminVenueStatus = "draft" | "review" | "published" | "rejected" | "archived"
export type AdminMerchantStatus = "draft" | "review" | "verified" | "suspended"

export type AdminUserReview = {
  id: string
  name: string
  email: string | null
  phone: string | null
  image: string | null
  role: AdminUserRole
  status: AdminUserStatus
  emailVerified: boolean
  createdAt: string
  updatedAt: string
  profile: {
    fullName: string | null
    avatarUrl: string | null
    city: string | null
  }
  merchantMemberships: Array<{
    merchantId: string
    businessName: string
    merchantStatus: AdminMerchantStatus
    role: "owner" | "manager" | "staff" | "finance" | "viewer"
  }>
  ownedMerchant: {
    id: string
    businessName: string
    legalName: string | null
    status: AdminMerchantStatus
  } | null
  stats: {
    bookingCount: number
    activeBookings: number
    totalSpend: number
    notificationCount: number
  }
  review: {
    needsAttention: boolean
    reason: string
  }
}

export type AdminVenueModeration = {
  id: string
  name: string
  slug: string
  description: string | null
  address: string
  city: string
  area: string | null
  priceFrom: number
  rating: number
  reviewCount: number
  image: string
  status: AdminVenueStatus
  createdAt: string
  updatedAt: string
  category: {
    id: string
    name: string
    slug: string
  }
  merchant: {
    id: string
    businessName: string
    legalName: string | null
    status: AdminMerchantStatus
    owner: {
      id: string
      name: string
      email: string | null
    }
  }
  stats: {
    courtCount: number
    slotCount: number
    availableSlots: number
    bookedSlots: number
    bookingCount: number
    totalGmv: number
  }
  review: {
    needsAttention: boolean
    reason: string
  }
}
