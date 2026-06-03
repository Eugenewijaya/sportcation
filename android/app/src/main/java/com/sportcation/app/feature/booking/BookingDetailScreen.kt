package com.sportcation.app.feature.booking

import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.sportcation.app.data.mock.MockSportcationData
import com.sportcation.app.ui.components.AppButton
import com.sportcation.app.ui.components.AppButtonStyle
import com.sportcation.app.ui.components.AppTopBar
import com.sportcation.app.ui.components.BookingCard
import com.sportcation.app.ui.components.EmptyState
import com.sportcation.app.ui.components.SectionHeader
import com.sportcation.app.ui.components.SportcationPlaceholderScreen
import com.sportcation.app.ui.theme.AppSpacing

@Composable
fun BookingDetailScreen(
    bookingId: String,
    onBack: () -> Unit,
    onViewTicket: (String) -> Unit
) {
    val booking = MockSportcationData.findBooking(bookingId)

    SportcationPlaceholderScreen(
        title = "Booking Detail",
        description = "Full mock booking summary. Backend booking management is outside this sprint.",
        primaryActionLabel = "View QR Ticket",
        onPrimaryAction = { onViewTicket(booking.id) },
        secondaryActionLabel = "Back",
        onSecondaryAction = onBack,
        extraContent = {
            AppTopBar(
                title = "Booking detail",
                navigationLabel = "Back",
                onNavigationClick = onBack
            )
            Spacer(modifier = Modifier.height(AppSpacing.sm))
            BookingCard(
                venueName = booking.venueName,
                statusLabel = booking.bookingStatus.label,
                scheduleLabel = "${booking.dateLabel} (${booking.date}) - ${booking.timeRange}",
                priceLabel = booking.priceLabel
            )
            Spacer(modifier = Modifier.height(AppSpacing.md))
            SectionHeader(title = "Venue info")
            EmptyState(
                title = "${booking.courtName} - ${booking.sportCategory}",
                message = "${booking.venueName}, ${booking.location}"
            )
            Spacer(modifier = Modifier.height(AppSpacing.md))
            SectionHeader(title = "Payment")
            EmptyState(
                title = booking.paymentStatus.label,
                message = "Payment status placeholder for ${booking.bookingCode}."
            )
            Spacer(modifier = Modifier.height(AppSpacing.md))
            SectionHeader(title = "Booking code")
            EmptyState(
                title = booking.bookingCode,
                message = "Use this code as a ticket fallback if QR is unavailable."
            )
            Spacer(modifier = Modifier.height(AppSpacing.md))
            EmptyState(
                title = "Cancellation placeholder",
                message = "Cancellation rules and backend updates will be handled in a later sprint."
            )
            Spacer(modifier = Modifier.height(AppSpacing.sm))
            AppButton(
                label = "Cancel Booking Placeholder",
                onClick = {},
                style = AppButtonStyle.Secondary
            )
            Spacer(modifier = Modifier.height(AppSpacing.lg))
        }
    )
}
