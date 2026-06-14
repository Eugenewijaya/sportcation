import { z } from "zod"

export const paymentMethodSchema = z.enum(["qris", "virtual_account", "wallet", "manual"])

export const createBookingSchema = z.object({
  slotId: z.string().trim().min(1).max(160),
  paymentMethod: paymentMethodSchema.default("qris"),
})

export const paymentSimulationSchema = z.object({
  status: z.enum(["paid", "failed"]),
})

export const cancelBookingSchema = z.object({
  reason: z.string().trim().max(240).optional(),
})

export const merchantBookingStatusActionSchema = z.object({
  status: z.enum(["checked_in", "completed"]),
  note: z.string().trim().max(240).optional(),
})

export const merchantBookingQuerySchema = z.object({
  q: z.string().trim().max(120).optional().default(""),
  status: z
    .enum(["pending_payment", "confirmed", "checked_in", "completed", "cancelled", "refunded"])
    .or(z.literal(""))
    .optional()
    .default(""),
})

export type CreateBookingInput = z.infer<typeof createBookingSchema>
export type PaymentSimulationInput = z.infer<typeof paymentSimulationSchema>
export type CancelBookingInput = z.infer<typeof cancelBookingSchema>
export type MerchantBookingStatusActionInput = z.infer<typeof merchantBookingStatusActionSchema>
export type MerchantBookingQuery = z.infer<typeof merchantBookingQuerySchema>
