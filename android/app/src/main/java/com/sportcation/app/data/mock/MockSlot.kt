package com.sportcation.app.data.mock

enum class MockSlotAvailability {
    Available,
    Unavailable
}

data class MockSlot(
    val id: String,
    val venueId: String,
    val dateLabel: String,
    val timeRange: String,
    val priceLabel: String,
    val availability: MockSlotAvailability
)

object MockSlotRepository {
    val dateLabels = listOf("Today", "Tomorrow", "Jun 5")

    fun slotsForVenue(venueId: String, dateLabel: String): List<MockSlot> {
        val priceLabel = priceLabelForVenue(venueId)
        val template = when (dateLabel) {
            "Tomorrow" -> listOf(
                "08:00 - 09:00" to MockSlotAvailability.Available,
                "09:00 - 10:00" to MockSlotAvailability.Available,
                "10:00 - 11:00" to MockSlotAvailability.Available,
                "16:00 - 17:00" to MockSlotAvailability.Unavailable,
                "17:00 - 18:00" to MockSlotAvailability.Available,
                "18:00 - 19:00" to MockSlotAvailability.Available
            )
            "Jun 5" -> listOf(
                "07:00 - 08:00" to MockSlotAvailability.Available,
                "08:00 - 09:00" to MockSlotAvailability.Unavailable,
                "14:00 - 15:00" to MockSlotAvailability.Available,
                "15:00 - 16:00" to MockSlotAvailability.Available,
                "19:00 - 20:00" to MockSlotAvailability.Unavailable,
                "20:00 - 21:00" to MockSlotAvailability.Available
            )
            else -> listOf(
                "08:00 - 09:00" to MockSlotAvailability.Available,
                "09:00 - 10:00" to MockSlotAvailability.Unavailable,
                "10:00 - 11:00" to MockSlotAvailability.Available,
                "11:00 - 12:00" to MockSlotAvailability.Available,
                "15:00 - 16:00" to MockSlotAvailability.Unavailable,
                "16:00 - 17:00" to MockSlotAvailability.Available
            )
        }

        return template.mapIndexed { index, (timeRange, availability) ->
            MockSlot(
                id = "$venueId-${dateLabel.lowercase().replace(" ", "-")}-$index",
                venueId = venueId,
                dateLabel = dateLabel,
                timeRange = timeRange,
                priceLabel = priceLabel,
                availability = availability
            )
        }
    }

    fun previewSlotsForVenue(venueId: String): List<MockSlot> {
        return slotsForVenue(venueId = venueId, dateLabel = dateLabels.first()).take(3)
    }

    private fun priceLabelForVenue(venueId: String): String {
        return when (venueId) {
            "padelhub-jakarta" -> "Rp 350k"
            "arena-soccer-park" -> "Rp 275k"
            "rally-tennis-club" -> "Rp 220k"
            "smash-badminton-house" -> "Rp 120k"
            "hooplab-senayan" -> "Rp 300k"
            else -> "Rp 250k"
        }
    }
}
