package com.sportcation.app.feature.booking

import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.sportcation.app.data.mock.MockSportcationData
import com.sportcation.app.ui.components.BookingCard
import com.sportcation.app.ui.components.EmptyState
import com.sportcation.app.ui.components.SectionHeader
import com.sportcation.app.ui.components.SportcationPlaceholderScreen
import com.sportcation.app.ui.theme.AppSpacing

@Composable
fun BookingSuccessScreen(
    bookingId: String,
    onViewTicket: (String) -> Unit,
    onViewBookings: () -> Unit
) {
    val booking = MockSportcationData.findBooking(bookingId)

    SportcationPlaceholderScreen(
        title = "Booking Confirmed",
        description = "Your mock booking has been confirmed. Use the booking code or ticket placeholder for check-in.",
        primaryActionLabel = "View Ticket",
        onPrimaryAction = { onViewTicket(booking.id) },
        secondaryActionLabel = "My Bookings",
        onSecondaryAction = onViewBookings,
        extraContent = {
            SectionHeader(title = "Booking code")
            EmptyState(
                title = booking.bookingCode,
                message = "Keep this code available at check-in."
            )
            Spacer(modifier = Modifier.height(AppSpacing.md))
            BookingCard(
                venueName = booking.venueName,
                statusLabel = booking.bookingStatus.label,
                scheduleLabel = "${booking.dateLabel} (${booking.date}) - ${booking.timeRange}",
                priceLabel = booking.paymentStatus.label
            )
            Spacer(modifier = Modifier.height(AppSpacing.md))
            EmptyState(
                title = "Payment ${booking.paymentStatus.label}",
                message = "Ticket access is available from the QR Ticket placeholder."
            )
            Spacer(modifier = Modifier.height(AppSpacing.lg))
        }
    )
}
