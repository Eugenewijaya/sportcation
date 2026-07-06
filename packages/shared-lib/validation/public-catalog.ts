import { z } from "zod"

export const publicCatalogQuerySchema = z.object({
  q: z.string().trim().max(120).optional().default(""),
  category: z.string().trim().max(80).optional().default(""),
  area: z.string().trim().max(120).optional().default(""),
  minPrice: z.coerce.number().int().min(0).optional(),
  maxPrice: z.coerce.number().int().min(0).optional(),
  availableDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).optional(),
  page: z.coerce.number().int().min(1).optional().default(1),
  pageSize: z.coerce.number().int().min(1).max(24).optional().default(12),
})

export type PublicCatalogQuery = z.infer<typeof publicCatalogQuerySchema>
