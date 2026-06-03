package com.sportcation.app.feature.booking

import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.sportcation.app.ui.components.BookingCard
import com.sportcation.app.ui.components.EmptyState
import com.sportcation.app.ui.components.SportcationPlaceholderScreen
import com.sportcation.app.ui.theme.AppSpacing

@Composable
fun BookingSuccessScreen(
    onViewBookings: () -> Unit,
    onBackHome: () -> Unit
) {
    SportcationPlaceholderScreen(
        title = "Booking Success Screen",
        description = "Placeholder for confirmed booking ID, schedule summary, total payment, and ticket entry point.",
        primaryActionLabel = "View My Bookings",
        onPrimaryAction = onViewBookings,
        secondaryActionLabel = "Back to Home",
        onSecondaryAction = onBackHome,
        extraContent = {
            BookingCard(
                venueName = "PadelHub Jakarta",
                statusLabel = "Confirmed",
                scheduleLabel = "Sat, 24 Oct - 10:00 to 11:00",
                priceLabel = "SP-77291"
            )
            Spacer(modifier = Modifier.height(AppSpacing.md))
            EmptyState(
                title = "Ticket preview",
                message = "Booking code and QR ticket foundation will be expanded in the booking sprint."
            )
            Spacer(modifier = Modifier.height(AppSpacing.lg))
        }
    )
}
