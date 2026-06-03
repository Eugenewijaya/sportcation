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
    data object Checkout : AppRoute("checkout")
    data object BookingSuccess : AppRoute("booking_success")
    data object MyBookings : AppRoute("my_bookings")
    data object Notification : AppRoute("notification")
    data object Profile : AppRoute("profile")
    data object Settings : AppRoute("settings")
}
