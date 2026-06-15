import { z } from "zod"

export const adminUserQuerySchema = z.object({
  q: z.string().trim().max(120).optional().default(""),
  role: z
    .enum(["customer", "merchant_owner", "merchant_staff", "admin"])
    .or(z.literal(""))
    .optional()
    .default(""),
  status: z
    .enum(["active", "pending", "restricted", "disabled"])
    .or(z.literal(""))
    .optional()
    .default(""),
})

export const adminVenueModerationQuerySchema = z.object({
  q: z.string().trim().max(120).optional().default(""),
  status: z
    .enum(["draft", "review", "published", "rejected", "archived"])
    .or(z.literal(""))
    .optional()
    .default(""),
  merchantStatus: z
    .enum(["draft", "review", "verified", "suspended"])
    .or(z.literal(""))
    .optional()
    .default(""),
})

export type AdminUserQuery = z.infer<typeof adminUserQuerySchema>
export type AdminVenueModerationQuery = z.infer<typeof adminVenueModerationQuerySchema>
