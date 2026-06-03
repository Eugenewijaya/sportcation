package com.sportcation.app.navigation

import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.runtime.setValue
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.sportcation.app.feature.auth.LoginScreen
import com.sportcation.app.feature.auth.OnboardingScreen
import com.sportcation.app.feature.auth.OtpVerificationScreen
import com.sportcation.app.feature.auth.RegisterScreen
import com.sportcation.app.feature.auth.SplashScreen
import com.sportcation.app.feature.booking.BookingDetailScreen
import com.sportcation.app.feature.booking.BookingSuccessScreen
import com.sportcation.app.feature.booking.CheckoutScreen
import com.sportcation.app.feature.booking.MyBookingsScreen
import com.sportcation.app.feature.booking.PaymentSimulationScreen
import com.sportcation.app.feature.booking.QrTicketScreen
import com.sportcation.app.feature.explore.ExploreScreen
import com.sportcation.app.feature.explore.SlotSelectionScreen
import com.sportcation.app.feature.explore.VenueDetailScreen
import com.sportcation.app.feature.home.HomeScreen
import com.sportcation.app.feature.notification.NotificationScreen
import com.sportcation.app.feature.profile.EditProfileScreen
import com.sportcation.app.feature.profile.ProfileScreen
import com.sportcation.app.feature.settings.SettingsScreen

@Composable
fun SportcationNavGraph() {
    val navController = rememberNavController()
    var recentBookingId by rememberSaveable { mutableStateOf<String?>(null) }

    NavHost(
        navController = navController,
        startDestination = AppRoute.Splash.route
    ) {
        composable(AppRoute.Splash.route) {
            SplashScreen(
                onOnboarding = { navController.navigate(AppRoute.Onboarding.route) },
                onLogin = { navController.navigate(AppRoute.Login.route) }
            )
        }
        composable(AppRoute.Onboarding.route) {
            OnboardingScreen(
                onGetStarted = { navController.navigate(AppRoute.Login.route) },
                onSkip = { navController.navigate(AppRoute.Login.route) }
            )
        }
        composable(AppRoute.Login.route) {
            LoginScreen(
                onLoginSuccess = {
                    navController.navigate(AppRoute.Home.route) {
                        popUpTo(AppRoute.Splash.route) { inclusive = true }
                    }
                },
                onOtpRequest = { navController.navigate(AppRoute.OtpVerification.route) },
                onRegister = { navController.navigate(AppRoute.Register.route) }
            )
        }
        composable(AppRoute.Register.route) {
            RegisterScreen(
                onContinue = { navController.navigate(AppRoute.OtpVerification.route) },
                onLogin = { navController.navigate(AppRoute.Login.route) }
            )
        }
        composable(AppRoute.OtpVerification.route) {
            OtpVerificationScreen(
                onVerified = {
                    navController.navigate(AppRoute.Home.route) {
                        popUpTo(AppRoute.Splash.route) { inclusive = true }
                    }
                }
            )
        }
        composable(AppRoute.Home.route) {
            HomeScreen(
                onExplore = { navController.navigate(AppRoute.Explore.route) },
                onVenueDetail = { venueId ->
                    navController.navigate(AppRoute.VenueDetail.createRoute(venueId))
                },
                onBookings = { navController.navigate(AppRoute.MyBookings.route) },
                onNotifications = { navController.navigate(AppRoute.Notification.route) },
                onProfile = { navController.navigate(AppRoute.Profile.route) },
                onSettings = { navController.navigate(AppRoute.Settings.route) }
            )
        }
        composable(AppRoute.Explore.route) {
            ExploreScreen(
                onVenueDetail = { venueId ->
                    navController.navigate(AppRoute.VenueDetail.createRoute(venueId))
                }
            )
        }
        composable(
            route = AppRoute.VenueDetail.route,
            arguments = listOf(navArgument("venueId") { type = NavType.StringType })
        ) { backStackEntry ->
            val venueId = backStackEntry.arguments?.getString("venueId").orEmpty()

            VenueDetailScreen(
                venueId = venueId,
                onBack = { navController.popBackStack() },
                onSelectSlot = {
                    navController.navigate(AppRoute.SlotSelection.createRoute(venueId))
                }
            )
        }
        composable(
            route = AppRoute.SlotSelection.route,
            arguments = listOf(navArgument("venueId") { type = NavType.StringType })
        ) { backStackEntry ->
            val venueId = backStackEntry.arguments?.getString("venueId").orEmpty()

            SlotSelectionScreen(
                venueId = venueId,
                onBack = { navController.popBackStack() },
                onCheckout = { slotId ->
                    navController.navigate(AppRoute.Checkout.createRoute(slotId))
                }
            )
        }
        composable(
            route = AppRoute.Checkout.route,
            arguments = listOf(navArgument("slotId") { type = NavType.StringType })
        ) { backStackEntry ->
            val slotId = backStackEntry.arguments?.getString("slotId").orEmpty()

            CheckoutScreen(
                slotId = slotId,
                onBack = { navController.popBackStack() },
                onContinuePayment = { selectedSlotId, paymentMethodId ->
                    navController.navigate(
                        AppRoute.PaymentSimulation.createRoute(
                            slotId = selectedSlotId,
                            paymentMethodId = paymentMethodId
                        )
                    )
                }
            )
        }
        composable(
            route = AppRoute.PaymentSimulation.route,
            arguments = listOf(
                navArgument("slotId") { type = NavType.StringType },
                navArgument("paymentMethodId") { type = NavType.StringType }
            )
        ) { backStackEntry ->
            val slotId = backStackEntry.arguments?.getString("slotId").orEmpty()
            val paymentMethodId = backStackEntry.arguments?.getString("paymentMethodId").orEmpty()

            PaymentSimulationScreen(
                slotId = slotId,
                paymentMethodId = paymentMethodId,
                onBack = { navController.popBackStack() },
                onPaymentSuccess = { bookingId ->
                    recentBookingId = bookingId
                    navController.navigate(AppRoute.BookingSuccess.createRoute(bookingId))
                }
            )
        }
        composable(
            route = AppRoute.BookingSuccess.route,
            arguments = listOf(navArgument("bookingId") { type = NavType.StringType })
        ) { backStackEntry ->
            val bookingId = backStackEntry.arguments?.getString("bookingId").orEmpty()

            BookingSuccessScreen(
                bookingId = bookingId,
                onViewTicket = { bookingId ->
                    navController.navigate(AppRoute.QrTicket.createRoute(bookingId))
                },
                onViewBookings = { navController.navigate(AppRoute.MyBookings.route) }
            )
        }
        composable(
            route = AppRoute.QrTicket.route,
            arguments = listOf(navArgument("bookingId") { type = NavType.StringType })
        ) { backStackEntry ->
            val bookingId = backStackEntry.arguments?.getString("bookingId").orEmpty()

            QrTicketScreen(
                bookingId = bookingId,
                onBack = { navController.popBackStack() },
                onMyBookings = { navController.navigate(AppRoute.MyBookings.route) }
            )
        }
        composable(AppRoute.MyBookings.route) {
            MyBookingsScreen(
                recentBookingId = recentBookingId,
                onHome = { navController.navigate(AppRoute.Home.route) },
                onBookingDetail = { bookingId ->
                    navController.navigate(AppRoute.BookingDetail.createRoute(bookingId))
                }
            )
        }
        composable(
            route = AppRoute.BookingDetail.route,
            arguments = listOf(navArgument("bookingId") { type = NavType.StringType })
        ) { backStackEntry ->
            val bookingId = backStackEntry.arguments?.getString("bookingId").orEmpty()

            BookingDetailScreen(
                bookingId = bookingId,
                onBack = { navController.popBackStack() },
                onViewTicket = { selectedBookingId ->
                    navController.navigate(AppRoute.QrTicket.createRoute(selectedBookingId))
                }
            )
        }
        composable(AppRoute.Notification.route) {
            NotificationScreen(
                onHome = { navController.navigate(AppRoute.Home.route) }
            )
        }
        composable(AppRoute.Profile.route) {
            ProfileScreen(
                onHome = { navController.navigate(AppRoute.Home.route) },
                onEditProfile = { navController.navigate(AppRoute.EditProfile.route) },
                onBookings = { navController.navigate(AppRoute.MyBookings.route) },
                onSettings = { navController.navigate(AppRoute.Settings.route) },
                onLogout = { navController.navigate(AppRoute.Login.route) }
            )
        }
        composable(AppRoute.EditProfile.route) {
            EditProfileScreen(
                onBack = { navController.popBackStack() }
            )
        }
        composable(AppRoute.Settings.route) {
            SettingsScreen(
                onHome = { navController.navigate(AppRoute.Home.route) },
                onLogin = { navController.navigate(AppRoute.Login.route) }
            )
        }
    }
}
