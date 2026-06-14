import type { CustomerBookingStatus, CustomerPaymentMethod, CustomerPaymentStatus } from "@/lib/customer-bookings/types"

export type MerchantBookingStatus = CustomerBookingStatus
export type MerchantBookingPaymentMethod = CustomerPaymentMethod
export type MerchantBookingPaymentStatus = CustomerPaymentStatus

export type MerchantBooking = {
  id: string
  bookingCode: string
  status: MerchantBookingStatus
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
  }
  payment: {
    id: string
    method: MerchantBookingPaymentMethod
    status: MerchantBookingPaymentStatus
    amount: number
    providerReference: string | null
    paidAt: string | null
  }
  actions: {
    canCheckIn: boolean
    canComplete: boolean
  }
}
