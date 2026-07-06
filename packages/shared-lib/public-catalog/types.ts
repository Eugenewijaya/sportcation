export type PublicCategory = {
  id: string
  slug: string
  name: string
}

export type PublicCourt = {
  id: string
  name: string
  surface: string | null
  isIndoor: boolean
}

export type PublicSlot = {
  id: string
  venueId: string
  courtId: string
  courtName: string
  slotDate: string
  startTime: string
  endTime: string
  price: number
  status: "available"
}

export type PublicVenue = {
  id: string
  name: string
  category: string
  categorySlug: string
  location: string
  coordinates?: { lat: number; lng: number }
  city: string
  area: string
  price: number
  oldPrice?: number
  rating: number
  reviewCount: number
  distance: string
  image: string
  tag: string
  description: string
  facilities: string[]
  courts: PublicCourt[]
  slots: PublicSlot[]
}

export type PublicCatalogPayload = {
  categories: PublicCategory[]
  venues: PublicVenue[]
  pagination: {
    page: number
    pageSize: number
    hasMore: boolean
  }
  filters: {
    q: string
    category: string
    area: string
    minPrice?: number
    maxPrice?: number
    availableDate?: string
  }
}
