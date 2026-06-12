import { z } from "zod"

export const paymentMethodSchema = z.enum(["qris", "virtual_account", "wallet", "manual"])

export const createBookingSchema = z.object({
  slotId: z.string().trim().min(1).max(160),
  paymentMethod: paymentMethodSchema.default("qris"),
})

export const paymentSimulationSchema = z.object({
  status: z.enum(["paid", "failed"]),
})

export type CreateBookingInput = z.infer<typeof createBookingSchema>
export type PaymentSimulationInput = z.infer<typeof paymentSimulationSchema>
