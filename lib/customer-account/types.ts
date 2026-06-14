export type CustomerNotificationType = "booking" | "payment" | "promo" | "system" | "auction"

export type CustomerProfile = {
  id: string
  name: string
  email: string | null
  phone: string | null
  image: string | null
  role: "customer" | "merchant_owner" | "merchant_staff" | "admin"
  status: "active" | "pending" | "restricted" | "disabled"
  profile: {
    fullName: string
    avatarUrl: string | null
    city: string | null
  }
  stats: {
    bookings: number
    unreadNotifications: number
    points: number
  }
}

export type CustomerNotification = {
  id: string
  type: CustomerNotificationType
  title: string
  body: string
  actionUrl: string | null
  readAt: string | null
  createdAt: string
}
