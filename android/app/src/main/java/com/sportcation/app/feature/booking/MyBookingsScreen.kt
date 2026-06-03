package com.sportcation.app.feature.booking

import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.sportcation.app.ui.components.BookingCard
import com.sportcation.app.ui.components.SectionHeader
import com.sportcation.app.ui.components.SportcationPlaceholderScreen
import com.sportcation.app.ui.theme.AppSpacing

@Composable
fun MyBookingsScreen(onHome: () -> Unit) {
    SportcationPlaceholderScreen(
        title = "My Bookings Screen",
        description = "Placeholder for upcoming, past, and cancelled booking tabs.",
        primaryActionLabel = "Back to Home",
        onPrimaryAction = onHome,
        extraContent = {
            SectionHeader(title = "Upcoming")
            BookingCard(
                venueName = "PadelHub Jakarta",
                statusLabel = "Confirmed",
                scheduleLabel = "Sat, 24 Oct - 10:00 to 11:00",
                priceLabel = "Rp 365.000"
            )
            Spacer(modifier = Modifier.height(AppSpacing.lg))
        }
    )
}
