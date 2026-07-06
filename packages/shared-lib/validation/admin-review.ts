import { z } from "zod"

export const adminBookingQuerySchema = z.object({
  q: z.string().trim().max(120).optional().default(""),
  status: z
    .enum(["pending_payment", "confirmed", "checked_in", "completed", "cancelled", "refunded"])
    .or(z.literal(""))
    .optional()
    .default(""),
  paymentStatus: z
    .enum(["pending", "paid", "failed", "expired", "refunded"])
    .or(z.literal(""))
    .optional()
    .default(""),
})

export const adminPaymentQuerySchema = z.object({
  q: z.string().trim().max(120).optional().default(""),
  status: z
    .enum(["pending", "paid", "failed", "expired", "refunded"])
    .or(z.literal(""))
    .optional()
    .default(""),
  method: z
    .enum(["qris", "virtual_account", "wallet", "manual"])
    .or(z.literal(""))
    .optional()
    .default(""),
})

export type AdminBookingQuery = z.infer<typeof adminBookingQuerySchema>
export type AdminPaymentQuery = z.infer<typeof adminPaymentQuerySchema>
