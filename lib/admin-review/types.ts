import type { CustomerBookingStatus, CustomerPaymentMethod, CustomerPaymentStatus } from "@/lib/customer-bookings/types"

export type AdminBookingStatus = CustomerBookingStatus
export type AdminPaymentMethod = CustomerPaymentMethod
export type AdminPaymentStatus = CustomerPaymentStatus

export type AdminBookingReview = {
  id: string
  bookingCode: string
  status: AdminBookingStatus
  subtotal: number
  platformFee: number
  totalAmount: number
  createdAt: string
  updatedAt: string
  customer: {
    id: string
    name: string
    email: string | null
    phone: string | null
  }
  merchant: {
    id: string
    businessName: string
    status: string
  }
  venue: {
    id: string
    name: string
    location: string
    image: string
  }
  item: {
    id: string
    slotId: string
    courtName: string
    slotDate: string
    startTime: string
    endTime: string
    price: number
    slotStatus: string
  }
  payment: {
    id: string
    method: AdminPaymentMethod
    status: AdminPaymentStatus
    amount: number
    providerReference: string | null
    paidAt: string | null
  }
  review: {
    needsAttention: boolean
    reason: string
  }
}

export type AdminPaymentReview = {
  id: string
  bookingId: string
  bookingCode: string
  bookingStatus: AdminBookingStatus
  method: AdminPaymentMethod
  status: AdminPaymentStatus
  amount: number
  providerReference: string | null
  paidAt: string | null
  createdAt: string
  updatedAt: string
  customer: {
    id: string
    name: string
    email: string | null
  }
  merchant: {
    id: string
    businessName: string
  }
  venue: {
    id: string
    name: string
    location: string
    image: string
  }
  review: {
    needsAttention: boolean
    reason: string
  }
}
