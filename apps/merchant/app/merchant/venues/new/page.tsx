import { requirePageRole } from "@/lib/auth-access"
import { apiFetch } from "@/lib/api/fetch"
import { VenueForm } from "./venue-form"

type Category = { id: string; name: string; icon: string | null }

export default async function NewVenuePage() {
  await requirePageRole(["merchant_owner", "merchant_staff"], "/merchant")

  const { categories } = await apiFetch<{ categories: Category[] }>("/api/categories")

  return (
    <div className="p-8 max-w-2xl mx-auto">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">Tambah Venue Baru</h1>
        <p className="text-gray-600 mt-1">Lengkapi informasi venue dan lapangan Anda.</p>
      </div>
      
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <VenueForm categories={categories} />
      </div>
    </div>
  )
}
