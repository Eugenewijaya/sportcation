package com.sportcation.app.feature.explore

import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.rememberScrollState
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.sportcation.app.data.mock.MockSlotAvailability
import com.sportcation.app.data.mock.MockSlotRepository
import com.sportcation.app.data.mock.MockVenueRepository
import com.sportcation.app.ui.components.AppTopBar
import com.sportcation.app.ui.components.CategoryChip
import com.sportcation.app.ui.components.EmptyState
import com.sportcation.app.ui.components.SectionHeader
import com.sportcation.app.ui.components.SlotCard
import com.sportcation.app.ui.components.SlotStatus
import com.sportcation.app.ui.components.SportcationPlaceholderScreen
import com.sportcation.app.ui.components.VenueCard
import com.sportcation.app.ui.theme.AppSpacing

@Composable
fun VenueDetailScreen(
    venueId: String,
    onBack: () -> Unit,
    onSelectSlot: () -> Unit
) {
    val venue = MockVenueRepository.findById(venueId)
    val previewSlots = MockSlotRepository.previewSlotsForVenue(venue.id)

    SportcationPlaceholderScreen(
        title = venue.name,
        description = "${venue.sportCategory} venue in ${venue.location}. Review venue info before choosing a mock slot.",
        primaryActionLabel = "Select Slot",
        onPrimaryAction = onSelectSlot,
        extraContent = {
            AppTopBar(
                title = "Venue overview",
                navigationLabel = "Back",
                onNavigationClick = onBack
            )
            Spacer(modifier = Modifier.height(AppSpacing.sm))
            EmptyState(
                title = venue.imagePlaceholder,
                message = "Image placeholder for ${venue.name}."
            )
            Spacer(modifier = Modifier.height(AppSpacing.md))
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
            SectionHeader(title = "About")
            EmptyState(
                title = "Venue overview",
                message = "${venue.name} offers ${venue.sportCategory.lowercase()} sessions with ${venue.availableStatus.lowercase()} and ${venue.priceRange}."
            )
            Spacer(modifier = Modifier.height(AppSpacing.md))
            SectionHeader(title = "Facilities")
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(AppSpacing.xs)
            ) {
                venue.facilities.forEachIndexed { index, facility ->
                    CategoryChip(label = facility, selected = index == 0, onClick = {})
                }
            }
            Spacer(modifier = Modifier.height(AppSpacing.md))
            SectionHeader(title = "Location")
            EmptyState(
                title = venue.location,
                message = "Map and exact address placeholder. Real map integration is outside this sprint."
            )
            Spacer(modifier = Modifier.height(AppSpacing.md))
            SectionHeader(title = "Available slots preview")
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(AppSpacing.sm)
            ) {
                previewSlots.take(2).forEach { slot ->
                    SlotCard(
                        timeRange = slot.timeRange,
                        priceLabel = slot.priceLabel,
                        status = slot.availability.toSlotStatus(),
                        modifier = Modifier.weight(1f)
                    )
                }
            }
            Spacer(modifier = Modifier.height(AppSpacing.lg))
        }
    )
}

private fun MockSlotAvailability.toSlotStatus(): SlotStatus {
    return when (this) {
        MockSlotAvailability.Available -> SlotStatus.Available
        MockSlotAvailability.Unavailable -> SlotStatus.Unavailable
    }
}
