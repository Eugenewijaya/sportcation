import type { CustomerBookingStatus, CustomerPaymentMethod, CustomerPaymentStatus } from "@/lib/customer-bookings/types"

export type MerchantFinanceSettlementStatus = "ready_payout" | "pending_payment" | "refund_hold" | "no_activity"

export type MerchantFinanceSummary = {
  bookingCount: number
  paidBookingCount: number
  grossAmount: number
  paidAmount: number
  pendingAmount: number
  failedAmount: number
  refundedAmount: number
  platformFees: number
  netReceivable: number
  payoutReadyAmount: number
  refundHoldAmount: number
  nextPayoutDate: string
}

export type MerchantFinanceVenueSettlement = {
  id: string
  status: MerchantFinanceSettlementStatus
  venue: {
    id: string
    name: string
    location: string
    image: string
  }
  bookingCount: number
  paidBookingCount: number
  grossAmount: number
  platformFee: number
  netAmount: number
  pendingAmount: number
  refundHoldAmount: number
  lastPaidAt: string | null
}

export type MerchantFinanceTransaction = {
  id: string
  bookingId: string
  bookingCode: string
  bookingStatus: CustomerBookingStatus
  paymentStatus: CustomerPaymentStatus
  paymentMethod: CustomerPaymentMethod
  grossAmount: number
  platformFee: number
  netAmount: number
  providerReference: string | null
  paidAt: string | null
  createdAt: string
  venue: {
    id: string
    name: string
  }
  item: {
    courtName: string
    slotDate: string
    startTime: string
    endTime: string
  }
}

export type MerchantFinancePaymentBreakdown = {
  method: CustomerPaymentMethod
  count: number
  amount: number
}

export type MerchantFinanceDashboard = {
  merchant: {
    id: string
  }
  summary: MerchantFinanceSummary
  settlements: MerchantFinanceVenueSettlement[]
  transactions: MerchantFinanceTransaction[]
  paymentBreakdown: MerchantFinancePaymentBreakdown[]
  payoutPolicy: {
    platformFeeLabel: string
    settlementCadence: string
    mutationScope: string
  }
}
