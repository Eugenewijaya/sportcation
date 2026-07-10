"use server"

import { revalidatePath } from "next/cache"
import { apiFetch } from "@/lib/api/fetch"
import { slotInputSchema } from "@/lib/validation/merchant"

export async function createSlotAction(formData: FormData) {
  try {
    const rawData = {
      courtId: formData.get("courtId"),
      slotDate: formData.get("slotDate"),
      startTime: formData.get("startTime"),
      endTime: formData.get("endTime"),
      price: formData.get("price"),
      status: formData.get("status") || "available",
    }

    const validatedData = slotInputSchema.parse(rawData)
    
    await apiFetch("/api/merchant/slots", {
      method: "POST",
      body: JSON.stringify(validatedData)
    })
    
    revalidatePath("/merchant/slots")
    return { success: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Unknown error occurred" }
  }
}

export async function deleteSlotAction(id: string) {
  try {
    await apiFetch(`/api/merchant/slots?id=${id}`, {
      method: "DELETE"
    })
    
    revalidatePath("/merchant/slots")
    return { success: true }
  } catch (error) {
    return { error: "Failed to delete slot" }
  }
}
