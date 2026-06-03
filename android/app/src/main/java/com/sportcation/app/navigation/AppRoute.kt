package com.sportcation.app.navigation

sealed class AppRoute(val route: String) {
    data object Splash : AppRoute("splash")
    data object Onboarding : AppRoute("onboarding")
    data object Login : AppRoute("login")
    data object Register : AppRoute("register")
    data object OtpVerification : AppRoute("otp_verification")
    data object Home : AppRoute("home")
    data object Explore : AppRoute("explore")
    data object VenueDetail : AppRoute("venue_detail/{venueId}") {
        fun createRoute(venueId: String): String = "venue_detail/$venueId"
    }
    data object SlotSelection : AppRoute("slot_selection/{venueId}") {
        fun createRoute(venueId: String): String = "slot_selection/$venueId"
    }
    data object Checkout : AppRoute("checkout/{slotId}") {
        fun createRoute(slotId: String): String = "checkout/$slotId"
    }
    data object PaymentSimulation : AppRoute("payment_simulation/{slotId}/{paymentMethodId}") {
        fun createRoute(slotId: String, paymentMethodId: String): String = "payment_simulation/$slotId/$paymentMethodId"
    }
    data object BookingSuccess : AppRoute("booking_success/{bookingId}") {
        fun createRoute(bookingId: String): String = "booking_success/$bookingId"
    }
    data object QrTicket : AppRoute("qr_ticket/{bookingId}") {
        fun createRoute(bookingId: String): String = "qr_ticket/$bookingId"
    }
    data object MyBookings : AppRoute("my_bookings")
    data object BookingDetail : AppRoute("booking_detail/{bookingId}") {
        fun createRoute(bookingId: String): String = "booking_detail/$bookingId"
    }
    data object Notification : AppRoute("notification")
    data object Profile : AppRoute("profile")
    data object EditProfile : AppRoute("edit_profile")
    data object Settings : AppRoute("settings")
}
