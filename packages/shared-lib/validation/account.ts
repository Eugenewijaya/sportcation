import { z } from "zod"

const optionalTrimmedText = (maxLength: number, label: string) =>
  z
    .string()
    .trim()
    .max(maxLength, `${label} maksimal ${maxLength} karakter.`)
    .optional()

export const updateCustomerProfileSchema = z
  .object({
    name: optionalTrimmedText(80, "Nama akun"),
    fullName: optionalTrimmedText(120, "Nama lengkap"),
    phone: z
      .string()
      .trim()
      .regex(/^[0-9+()\-\s]{6,30}$/, "Nomor telepon tidak valid.")
      .or(z.literal(""))
      .optional(),
    city: optionalTrimmedText(80, "Kota"),
    avatarUrl: z.string().trim().url("URL avatar tidak valid.").or(z.literal("")).optional(),
  })
  .refine(
    (value) =>
      typeof value.name !== "undefined" ||
      typeof value.fullName !== "undefined" ||
      typeof value.phone !== "undefined" ||
      typeof value.city !== "undefined" ||
      typeof value.avatarUrl !== "undefined",
    "Minimal satu field profil harus dikirim.",
  )

export type UpdateCustomerProfileInput = z.infer<typeof updateCustomerProfileSchema>
