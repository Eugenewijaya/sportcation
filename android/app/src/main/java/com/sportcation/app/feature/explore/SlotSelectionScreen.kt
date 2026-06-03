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
import com.sportcation.app.data.mock.MockSlotAvailability
import com.sportcation.app.data.mock.MockSlotRepository
import com.sportcation.app.data.mock.MockVenueRepository
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
    onCheckout: () -> Unit
) {
    val venue = MockVenueRepository.findById(venueId)
    var selectedDateLabel by remember { mutableStateOf(MockSlotRepository.dateLabels.first()) }
    var selectedSlotId by remember { mutableStateOf<String?>(null) }
    var selectionError by remember { mutableStateOf<String?>(null) }
    val slots = MockSlotRepository.slotsForVenue(
        venueId = venue.id,
        dateLabel = selectedDateLabel
    )
    val selectedSlot = slots.firstOrNull { it.id == selectedSlotId }

    SportcationPlaceholderScreen(
        title = "Select Slot",
        description = "Choose a mock date and available time for ${venue.name}. No booking is created in this sprint.",
        primaryActionLabel = "Continue to Checkout",
        onPrimaryAction = {
            if (selectedSlot != null) {
                onCheckout()
            } else {
                selectionError = "Select an available slot before continuing."
            }
        },
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
                            selectionError = null
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
                                if (slot.availability == MockSlotAvailability.Available) {
                                    selectedSlotId = slot.id
                                    selectionError = null
                                }
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
                    message = "Tap an available time to preview your checkout summary."
                )
            } else {
                EmptyState(
                    title = selectedSlot.timeRange,
                    message = "$selectedDateLabel at ${venue.name}. Estimated court fee ${selectedSlot.priceLabel}."
                )
            }
            if (selectionError != null) {
                Spacer(modifier = Modifier.height(AppSpacing.sm))
                ErrorState(
                    title = "Slot required",
                    message = selectionError ?: ""
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

    return when (availability) {
        MockSlotAvailability.Available -> SlotStatus.Available
        MockSlotAvailability.Unavailable -> SlotStatus.Unavailable
    }
}
