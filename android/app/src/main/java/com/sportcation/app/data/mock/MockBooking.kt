package com.sportcation.app.data.mock

typealias MockBooking = Booking
typealias MockBookingStatus = BookingStatus
typealias MockPaymentStatus = PaymentStatus

object MockBookingRepository {
    val bookings: List<Booking>
        get() = MockSportcationData.bookings

    val latestBooking: Booking
        get() = MockSportcationData.latestBooking

    fun findById(id: String): Booking {
        return MockSportcationData.findBooking(id)
    }

    fun byStatus(status: BookingStatus): List<Booking> {
        return MockSportcationData.bookingsByStatus(status)
    }
}
