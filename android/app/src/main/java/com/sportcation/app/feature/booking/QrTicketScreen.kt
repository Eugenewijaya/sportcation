package com.sportcation.app.feature.booking

import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.sportcation.app.data.mock.MockSportcationData
import com.sportcation.app.ui.components.AppTopBar
import com.sportcation.app.ui.components.BookingCard
import com.sportcation.app.ui.components.EmptyState
import com.sportcation.app.ui.components.SectionHeader
import com.sportcation.app.ui.components.SportcationPlaceholderScreen
import com.sportcation.app.ui.theme.AppSpacing

@Composable
fun QrTicketScreen(
    bookingId: String,
    onBack: () -> Unit,
    onMyBookings: () -> Unit
) {
    val booking = MockSportcationData.findBooking(bookingId)

    SportcationPlaceholderScreen(
        title = "QR Ticket",
        description = "Ticket placeholder for venue check-in. No real QR generation is implemented in this sprint.",
        primaryActionLabel = "My Bookings",
        onPrimaryAction = onMyBookings,
        secondaryActionLabel = "Back",
        onSecondaryAction = onBack,
        extraContent = {
            AppTopBar(
                title = "Ticket",
                navigationLabel = "Back",
                onNavigationClick = onBack
            )
            Spacer(modifier = Modifier.height(AppSpacing.sm))
            EmptyState(
                title = booking.bookingCode,
                message = "QR placeholder\n[ ${booking.bookingCode} ]"
            )
            Spacer(modifier = Modifier.height(AppSpacing.md))
            BookingCard(
                venueName = booking.venueName,
                statusLabel = booking.bookingStatus.label,
                scheduleLabel = "${booking.dateLabel} (${booking.date}) - ${booking.timeRange}",
                priceLabel = booking.paymentStatus.label
            )
            Spacer(modifier = Modifier.height(AppSpacing.md))
            SectionHeader(title = "Instruction")
            EmptyState(
                title = "Show this code at check-in",
                message = "Venue staff can use the booking code placeholder to validate this mock booking."
            )
            Spacer(modifier = Modifier.height(AppSpacing.lg))
        }
    )
}
