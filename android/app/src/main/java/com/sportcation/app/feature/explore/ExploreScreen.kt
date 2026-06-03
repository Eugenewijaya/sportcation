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
import com.sportcation.app.data.mock.MockVenueRepository
import com.sportcation.app.ui.components.CategoryChip
import com.sportcation.app.ui.components.EmptyState
import com.sportcation.app.ui.components.SearchBar
import com.sportcation.app.ui.components.SectionHeader
import com.sportcation.app.ui.components.SportcationPlaceholderScreen
import com.sportcation.app.ui.components.VenueCard
import com.sportcation.app.ui.theme.AppSpacing

@Composable
fun ExploreScreen(onVenueDetail: (String) -> Unit) {
    var query by remember { mutableStateOf("") }
    var selectedSport by remember { mutableStateOf("All") }
    val filteredVenues = remember(query, selectedSport) {
        val normalizedQuery = query.trim().lowercase()
        MockVenueRepository.venues.filter { venue ->
            val matchesQuery = normalizedQuery.isBlank() ||
                venue.name.lowercase().contains(normalizedQuery) ||
                venue.sportCategory.lowercase().contains(normalizedQuery)
            val matchesSport = selectedSport == "All" || venue.sportCategory == selectedSport

            matchesQuery && matchesSport
        }
    }

    SportcationPlaceholderScreen(
        title = "Explore Venues",
        description = "Search and filter local mock venues by venue name or sport category.",
        primaryActionLabel = null,
        onPrimaryAction = null,
        extraContent = {
            SearchBar(
                query = query,
                onQueryChange = { query = it },
                placeholder = "Search venues, sports, or areas"
            )
            Spacer(modifier = Modifier.height(AppSpacing.md))
            SectionHeader(title = "Sport category")
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(AppSpacing.xs)
            ) {
                MockVenueRepository.sportCategories.forEach { category ->
                    CategoryChip(
                        label = category,
                        selected = selectedSport == category,
                        onClick = { selectedSport = category }
                    )
                }
            }
            Spacer(modifier = Modifier.height(AppSpacing.md))
            SectionHeader(title = "Filters")
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(AppSpacing.xs)
            ) {
                CategoryChip(label = "Location: Jakarta", selected = false, onClick = {})
                CategoryChip(label = "Price: Any", selected = false, onClick = {})
                CategoryChip(label = "Available", selected = false, onClick = {})
            }
            Spacer(modifier = Modifier.height(AppSpacing.md))
            SectionHeader(title = "${filteredVenues.size} venue results")
            if (filteredVenues.isEmpty()) {
                EmptyState(
                    title = "No venues found",
                    message = "Try another venue name or sport category."
                )
            } else {
                filteredVenues.forEach { venue ->
                    VenueCard(
                        name = venue.name,
                        sport = venue.sportCategory,
                        location = venue.location,
                        priceLabel = venue.priceRange,
                        ratingLabel = "${venue.rating} rating",
                        imageLabel = venue.imagePlaceholder,
                        availableStatus = venue.availableStatus,
                        facilities = venue.facilities,
                        onClick = { onVenueDetail(venue.id) }
                    )
                    Spacer(modifier = Modifier.height(AppSpacing.sm))
                }
            }
            Spacer(modifier = Modifier.height(AppSpacing.lg))
        }
    )
}
