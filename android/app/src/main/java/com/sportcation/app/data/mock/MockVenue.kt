package com.sportcation.app.data.mock

typealias MockVenue = Venue

object MockVenueRepository {
    val venues: List<Venue>
        get() = MockSportcationData.venues

    val sportCategories: List<String>
        get() = MockSportcationData.sportCategories

    fun findById(id: String): Venue {
        return MockSportcationData.findVenue(id)
    }
}
