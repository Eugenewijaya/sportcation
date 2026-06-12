export type CustomerBookingStatus =
  | "pending_payment"
  | "confirmed"
  | "checked_in"
  | "completed"
  | "cancelled"
  | "refunded"

export type CustomerPaymentMethod = "qris" | "virtual_account" | "wallet" | "manual"
export type CustomerPaymentStatus = "pending" | "paid" | "failed" | "expired" | "refunded"

export type CustomerBooking = {
  id: string
  bookingCode: string
  status: CustomerBookingStatus
  subtotal: number
  platformFee: number
  totalAmount: number
  createdAt: string
  updatedAt: string
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
    method: CustomerPaymentMethod
    status: CustomerPaymentStatus
    amount: number
    providerReference: string | null
    paidAt: string | null
  }
}
