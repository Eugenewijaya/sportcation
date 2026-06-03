package com.sportcation.app.feature.booking

import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.rememberScrollState
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.sportcation.app.data.mock.BookingStatus
import com.sportcation.app.data.mock.MockSportcationData
import com.sportcation.app.ui.components.BookingCard
import com.sportcation.app.ui.components.CategoryChip
import com.sportcation.app.ui.components.EmptyState
import com.sportcation.app.ui.components.SectionHeader
import com.sportcation.app.ui.components.SportcationPlaceholderScreen
import com.sportcation.app.ui.theme.AppSpacing

@Composable
fun MyBookingsScreen(
    recentBookingId: String? = null,
    onHome: () -> Unit,
    onBookingDetail: (String) -> Unit
) {
    var selectedStatus by remember { mutableStateOf(BookingStatus.Upcoming) }
    val bookings = remember(recentBookingId) {
        val recentBooking = recentBookingId
            ?.takeIf { it.isNotBlank() }
            ?.let { MockSportcationData.findBooking(it) }

        listOfNotNull(recentBooking) + MockSportcationData.bookings.filterNot { booking ->
            booking.id == recentBooking?.id
        }
    }
    val filteredBookings = bookings.filter { it.bookingStatus == selectedStatus }

    SportcationPlaceholderScreen(
        title = "My Bookings",
        description = "Browse mock upcoming, completed, and cancelled bookings.",
        primaryActionLabel = "Back to Home",
        onPrimaryAction = onHome,
        extraContent = {
            SectionHeader(title = "Filter")
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(AppSpacing.xs)
            ) {
                BookingStatus.values().forEach { status ->
                    CategoryChip(
                        label = status.label,
                        selected = selectedStatus == status,
                        onClick = { selectedStatus = status }
                    )
                }
            }
            Spacer(modifier = Modifier.height(AppSpacing.md))
            SectionHeader(title = "${selectedStatus.label} bookings")
            if (filteredBookings.isEmpty()) {
                EmptyState(
                    title = "No ${selectedStatus.label.lowercase()} bookings",
                    message = "Bookings will appear here after the booking flow is connected."
                )
            } else {
                filteredBookings.forEach { booking ->
                    BookingCard(
                        venueName = booking.venueName,
                        statusLabel = booking.bookingStatus.label,
                        scheduleLabel = "${booking.dateLabel} - ${booking.timeRange}",
                        priceLabel = booking.priceLabel,
                        onClick = { onBookingDetail(booking.id) }
                    )
                    Spacer(modifier = Modifier.height(AppSpacing.sm))
                }
            }
            Spacer(modifier = Modifier.height(AppSpacing.lg))
        }
    )
}
