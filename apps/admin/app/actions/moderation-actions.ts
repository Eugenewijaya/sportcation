"use server"

import { revalidatePath } from "next/cache"
import { apiFetch } from "@sportcation/shared-lib/api/fetch"

export async function updateMerchantStatusAction(id: string, status: "verified" | "suspended") {
  try {
    const action = status === "verified" ? "approve" : "reject"
    await apiFetch(`/api/admin/merchants/${id}/verify`, {
      method: "POST",
      body: JSON.stringify({ action })
    })
    revalidatePath("/admin/merchants")
    return { success: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to update merchant" }
  }
}

export async function updateVenueStatusAction(id: string, status: "published" | "rejected") {
  try {
    await apiFetch(`/api/admin/venues/${id}`, {
      method: "POST",
      body: JSON.stringify({ status })
    })
    revalidatePath("/admin/venues")
    return { success: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to update venue" }
  }
}

