"use server"

import { revalidatePath } from "next/cache"
import { apiFetch } from "@sportcation/shared-lib/api/fetch"

export async function processWithdrawalAction(id: string, action: "completed" | "rejected") {
  try {
    await apiFetch(`/api/admin/finance/withdraw/${id}`, {
      method: "POST",
      body: JSON.stringify({ action })
    })
    revalidatePath("/admin/finance")
    return { success: true }
  } catch (error) {
    return { error: error instanceof Error ? error.message : "Failed to process withdrawal" }
  }
}

