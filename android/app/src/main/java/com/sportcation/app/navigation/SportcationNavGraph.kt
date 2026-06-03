package com.sportcation.app.navigation

import androidx.compose.runtime.Composable
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
import com.sportcation.app.feature.booking.BookingSuccessScreen
import com.sportcation.app.feature.booking.CheckoutScreen
import com.sportcation.app.feature.booking.MyBookingsScreen
import com.sportcation.app.feature.explore.ExploreScreen
import com.sportcation.app.feature.explore.SlotSelectionScreen
import com.sportcation.app.feature.explore.VenueDetailScreen
import com.sportcation.app.feature.home.HomeScreen
import com.sportcation.app.feature.notification.NotificationScreen
import com.sportcation.app.feature.profile.ProfileScreen
import com.sportcation.app.feature.settings.SettingsScreen

@Composable
fun SportcationNavGraph() {
    val navController = rememberNavController()

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
                onCheckout = { navController.navigate(AppRoute.Checkout.route) }
            )
        }
        composable(AppRoute.Checkout.route) {
            CheckoutScreen(
                onBack = { navController.popBackStack() },
                onConfirm = { navController.navigate(AppRoute.BookingSuccess.route) }
            )
        }
        composable(AppRoute.BookingSuccess.route) {
            BookingSuccessScreen(
                onViewBookings = { navController.navigate(AppRoute.MyBookings.route) },
                onBackHome = { navController.navigate(AppRoute.Home.route) }
            )
        }
        composable(AppRoute.MyBookings.route) {
            MyBookingsScreen(
                onHome = { navController.navigate(AppRoute.Home.route) }
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
                onSettings = { navController.navigate(AppRoute.Settings.route) }
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
