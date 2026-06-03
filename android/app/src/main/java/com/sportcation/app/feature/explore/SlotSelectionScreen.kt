package com.sportcation.app.feature.explore

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
import com.sportcation.app.data.mock.MockSlot
import com.sportcation.app.data.mock.MockSlotRepository
import com.sportcation.app.data.mock.MockVenueRepository
import com.sportcation.app.data.mock.SlotAvailability
import com.sportcation.app.ui.components.AppTopBar
import com.sportcation.app.ui.components.CategoryChip
import com.sportcation.app.ui.components.EmptyState
import com.sportcation.app.ui.components.ErrorState
import com.sportcation.app.ui.components.SectionHeader
import com.sportcation.app.ui.components.SlotCard
import com.sportcation.app.ui.components.SlotStatus
import com.sportcation.app.ui.components.SportcationPlaceholderScreen
import com.sportcation.app.ui.components.VenueCard
import com.sportcation.app.ui.theme.AppSpacing

@Composable
fun SlotSelectionScreen(
    venueId: String,
    onBack: () -> Unit,
    onCheckout: (String) -> Unit
) {
    val venue = MockVenueRepository.findById(venueId)
    val courts = MockSlotRepository.courtsForVenue(venue.id)
    val initialCourtId = courts.firstOrNull()?.id.orEmpty()
    var selectedDateLabel by remember { mutableStateOf(MockSlotRepository.dateLabels.first()) }
    var selectedCourtId by remember { mutableStateOf(initialCourtId) }
    var selectedSlotId by remember { mutableStateOf<String?>(null) }
    var slotMessage by remember { mutableStateOf<String?>(null) }
    val slots = MockSlotRepository.slotsForVenue(
        venueId = venue.id,
        courtId = selectedCourtId,
        dateLabel = selectedDateLabel
    )
    val selectedCourt = courts.firstOrNull { it.id == selectedCourtId }
    val selectedSlot = slots.firstOrNull { it.id == selectedSlotId }

    SportcationPlaceholderScreen(
        title = "Select Slot",
        description = "Choose a mock date and available time for ${venue.name}. No booking is created in this sprint.",
        primaryActionLabel = "Continue to Checkout",
        onPrimaryAction = {
            selectedSlot?.let { onCheckout(it.id) }
        },
        primaryActionEnabled = selectedSlot != null,
        secondaryActionLabel = "Back",
        onSecondaryAction = onBack,
        extraContent = {
            AppTopBar(
                title = "Slot selection",
                navigationLabel = "Back",
                onNavigationClick = onBack
            )
            Spacer(modifier = Modifier.height(AppSpacing.sm))
            VenueCard(
                name = venue.name,
                sport = venue.sportCategory,
                location = venue.location,
                priceLabel = venue.priceRange,
                ratingLabel = "${venue.rating} rating",
                imageLabel = venue.imagePlaceholder,
                availableStatus = venue.availableStatus,
                facilities = venue.facilities
            )
            Spacer(modifier = Modifier.height(AppSpacing.md))
            SectionHeader(title = "Choose date")
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(AppSpacing.xs)
            ) {
                MockSlotRepository.dateLabels.forEach { dateLabel ->
                    CategoryChip(
                        label = dateLabel,
                        selected = selectedDateLabel == dateLabel,
                        onClick = {
                            selectedDateLabel = dateLabel
                            selectedSlotId = null
                            slotMessage = null
                        }
                    )
                }
            }
            Spacer(modifier = Modifier.height(AppSpacing.md))
            SectionHeader(title = "Choose court")
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(AppSpacing.xs)
            ) {
                courts.forEach { court ->
                    CategoryChip(
                        label = "${court.name} - ${court.surfaceLabel}",
                        selected = selectedCourtId == court.id,
                        onClick = {
                            selectedCourtId = court.id
                            selectedSlotId = null
                            slotMessage = null
                        }
                    )
                }
            }
            Spacer(modifier = Modifier.height(AppSpacing.md))
            SectionHeader(title = "Choose time")
            slots.chunked(2).forEach { rowSlots ->
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(AppSpacing.sm)
                ) {
                    rowSlots.forEach { slot ->
                        SlotCard(
                            timeRange = slot.timeRange,
                            priceLabel = slot.priceLabel,
                            status = slot.toSlotStatus(selectedSlotId),
                            modifier = Modifier.weight(1f),
                            onClick = {
                                selectedSlotId = slot.id
                                slotMessage = null
                            },
                            onUnavailableClick = {
                                slotMessage = "This slot is unavailable. Choose another available time."
                            }
                        )
                    }
                    if (rowSlots.size == 1) {
                        Spacer(modifier = Modifier.weight(1f))
                    }
                }
                Spacer(modifier = Modifier.height(AppSpacing.sm))
            }
            SectionHeader(title = "Selected slot")
            if (selectedSlot == null) {
                EmptyState(
                    title = "No slot selected",
                    message = "Tap an available time to preview your booking summary."
                )
            } else {
                EmptyState(
                    title = "${selectedCourt?.name ?: "Court"} - ${selectedSlot.timeRange}",
                    message = "${selectedSlot.dateLabel} (${selectedSlot.date}) at ${venue.name}. Estimated court fee ${selectedSlot.priceLabel}."
                )
            }
            if (slotMessage != null) {
                Spacer(modifier = Modifier.height(AppSpacing.sm))
                ErrorState(
                    title = "Slot unavailable",
                    message = slotMessage ?: ""
                )
            }
            Spacer(modifier = Modifier.height(AppSpacing.lg))
        }
    )
}

private fun MockSlot.toSlotStatus(selectedSlotId: String?): SlotStatus {
    if (id == selectedSlotId) {
        return SlotStatus.Selected
    }

    return when (status) {
        SlotAvailability.Available -> SlotStatus.Available
        SlotAvailability.Unavailable -> SlotStatus.Unavailable
    }
}
