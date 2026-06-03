package com.sportcation.app.data.mock

typealias MockCourt = Court
typealias MockSlot = Slot
typealias MockSlotStatus = SlotAvailability

object MockSlotRepository {
    val dateLabels: List<String>
        get() = MockSportcationData.dateLabels

    fun courtsForVenue(venueId: String): List<Court> {
        return MockSportcationData.courtsForVenue(venueId)
    }

    fun slotsForVenue(
        venueId: String,
        courtId: String,
        dateLabel: String
    ): List<Slot> {
        return MockSportcationData.slotsForVenue(
            venueId = venueId,
            courtId = courtId,
            dateLabel = dateLabel
        )
    }

    fun previewSlotsForVenue(venueId: String): List<Slot> {
        return MockSportcationData.previewSlotsForVenue(venueId)
    }
}
