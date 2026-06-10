import { z } from "zod"

const venueStatuses = ["draft", "review", "published", "rejected", "archived"] as const
const courtStatuses = ["active", "maintenance", "hidden"] as const
const slotStatuses = ["available", "booked", "blocked", "expired"] as const

export const venueInputSchema = z.object({
  categoryId: z.string().min(1, "Kategori wajib dipilih."),
  name: z.string().trim().min(3, "Nama venue minimal 3 karakter.").max(180),
  description: z.string().trim().max(2000).optional().default(""),
  address: z.string().trim().min(5, "Alamat wajib diisi.").max(500),
  city: z.string().trim().min(2, "Kota wajib diisi.").max(120),
  area: z.string().trim().max(120).optional().default(""),
  priceFrom: z.coerce.number().int().min(0, "Harga tidak boleh negatif."),
  imageUrl: z.string().trim().max(500).optional().default(""),
  status: z.enum(venueStatuses).default("draft"),
  defaultCourtName: z.string().trim().min(2).max(120).optional().default("Court 01"),
})

export const venuePatchSchema = z
  .object({
    categoryId: z.string().min(1, "Kategori wajib dipilih."),
    name: z.string().trim().min(3, "Nama venue minimal 3 karakter.").max(180),
    description: z.string().trim().max(2000),
    address: z.string().trim().min(5, "Alamat wajib diisi.").max(500),
    city: z.string().trim().min(2, "Kota wajib diisi.").max(120),
    area: z.string().trim().max(120),
    priceFrom: z.coerce.number().int().min(0, "Harga tidak boleh negatif."),
    imageUrl: z.string().trim().max(500),
    status: z.enum(venueStatuses),
  })
  .partial()
  .refine((value) => Object.keys(value).length > 0, "Tidak ada perubahan yang dikirim.")

export const courtInputSchema = z.object({
  venueId: z.string().min(1, "Venue wajib dipilih."),
  name: z.string().trim().min(2, "Nama court wajib diisi.").max(120),
  surface: z.string().trim().max(120).optional().default(""),
  isIndoor: z.coerce.boolean().default(false),
  status: z.enum(courtStatuses).default("active"),
})

export const courtPatchSchema = z
  .object({
    name: z.string().trim().min(2, "Nama court wajib diisi.").max(120),
    surface: z.string().trim().max(120),
    isIndoor: z.coerce.boolean(),
    status: z.enum(courtStatuses),
  })
  .partial()
  .refine((value) => Object.keys(value).length > 0, "Tidak ada perubahan yang dikirim.")

export const slotInputSchema = z
  .object({
    courtId: z.string().min(1, "Court wajib dipilih."),
    slotDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Tanggal harus berformat YYYY-MM-DD."),
    startTime: z.string().regex(/^\d{2}:\d{2}$/, "Waktu mulai harus berformat HH:mm."),
    endTime: z.string().regex(/^\d{2}:\d{2}$/, "Waktu selesai harus berformat HH:mm."),
    price: z.coerce.number().int().positive("Harga harus lebih dari nol."),
    status: z.enum(slotStatuses).default("available"),
  })
  .refine((value) => value.endTime > value.startTime, {
    message: "Waktu selesai harus setelah waktu mulai.",
    path: ["endTime"],
  })

export const slotPatchSchema = z
  .object({
    courtId: z.string().min(1).optional(),
    slotDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
    startTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    endTime: z.string().regex(/^\d{2}:\d{2}$/).optional(),
    price: z.coerce.number().int().positive().optional(),
    status: z.enum(slotStatuses).optional(),
  })
  .refine((value) => Object.keys(value).length > 0, "Tidak ada perubahan yang dikirim.")

export function slugify(value: string) {
  return value
    .toLowerCase()
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
}
