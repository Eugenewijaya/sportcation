"use server"

import { revalidatePath } from "next/cache"
import { apiFetch } from "@/lib/api/fetch"
import { venueInputSchema } from "@/lib/validation/merchant"

export async function createVenueAction(formData: FormData) {
  try {
    const rawData = {
      name: formData.get("name"),
      categoryId: formData.get("categoryId"),
      city: formData.get("city"),
      address: formData.get("address"),
      priceFrom: formData.get("priceFrom") || "0",
      status: formData.get("status") || "draft",
    }

    const validatedData = venueInputSchema.parse(rawData)
    
    await apiFetch("/api/merchant/venues", {
      method: "POST",
      body: JSON.stringify(validatedData)
    })
    
    revalidatePath("/merchant/venues")
    return { success: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unknown error occurred" }
  }
}

export async function deleteVenueAction(id: string) {
  try {
    await apiFetch(`/api/merchant/venues?id=${id}`, {
      method: "DELETE"
    })
    
    revalidatePath("/merchant/venues")
    return { success: true }
  } catch (error) {
    return { error: "Failed to delete venue" }
  }
}
