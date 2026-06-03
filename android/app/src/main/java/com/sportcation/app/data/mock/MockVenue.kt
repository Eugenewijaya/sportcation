package com.sportcation.app.data.mock

data class MockVenue(
    val id: String,
    val name: String,
    val sportCategory: String,
    val location: String,
    val priceRange: String,
    val rating: Double,
    val imagePlaceholder: String,
    val availableStatus: String,
    val facilities: List<String>,
    val featured: Boolean = false
)

object MockVenueRepository {
    val venues = listOf(
        MockVenue(
            id = "padelhub-jakarta",
            name = "PadelHub Jakarta",
            sportCategory = "Padel",
            location = "Jakarta Selatan",
            priceRange = "Rp 350.000 - 450.000/hour",
            rating = 4.9,
            imagePlaceholder = "Padel court image",
            availableStatus = "Available today",
            facilities = listOf("Indoor", "Parking", "Locker", "Shower"),
            featured = true
        ),
        MockVenue(
            id = "arena-soccer-park",
            name = "Arena Soccer Park",
            sportCategory = "Futsal",
            location = "Tebet",
            priceRange = "Rp 275.000 - 325.000/hour",
            rating = 4.7,
            imagePlaceholder = "Futsal field image",
            availableStatus = "Few slots left",
            facilities = listOf("Outdoor", "Parking", "Cafe")
        ),
        MockVenue(
            id = "rally-tennis-club",
            name = "Rally Tennis Club",
            sportCategory = "Tennis",
            location = "Senayan",
            priceRange = "Rp 220.000 - 300.000/hour",
            rating = 4.8,
            imagePlaceholder = "Tennis court image",
            availableStatus = "Available today",
            facilities = listOf("Coach", "Locker", "Lighting"),
            featured = true
        ),
        MockVenue(
            id = "smash-badminton-house",
            name = "Smash Badminton House",
            sportCategory = "Badminton",
            location = "Kelapa Gading",
            priceRange = "Rp 120.000 - 180.000/hour",
            rating = 4.6,
            imagePlaceholder = "Badminton court image",
            availableStatus = "Available tomorrow",
            facilities = listOf("Indoor", "Shop", "Shower")
        ),
        MockVenue(
            id = "hooplab-senayan",
            name = "HoopLab Senayan",
            sportCategory = "Basketball",
            location = "Senayan",
            priceRange = "Rp 300.000 - 500.000/hour",
            rating = 4.5,
            imagePlaceholder = "Basketball court image",
            availableStatus = "Limited availability",
            facilities = listOf("Indoor", "Lighting", "Parking")
        )
    )

    val sportCategories = listOf("All") + venues.map { it.sportCategory }.distinct()

    fun findById(id: String): MockVenue {
        return venues.firstOrNull { it.id == id } ?: venues.first()
    }
}
