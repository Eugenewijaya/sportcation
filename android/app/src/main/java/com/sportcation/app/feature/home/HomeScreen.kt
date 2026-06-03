package com.sportcation.app.feature.home

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
import com.sportcation.app.ui.components.AppButton
import com.sportcation.app.ui.components.AppButtonStyle
import com.sportcation.app.ui.components.CategoryChip
import com.sportcation.app.ui.components.EmptyState
import com.sportcation.app.ui.components.SearchBar
import com.sportcation.app.ui.components.SectionHeader
import com.sportcation.app.ui.components.SportcationPlaceholderScreen
import com.sportcation.app.ui.components.VenueCard
import com.sportcation.app.ui.theme.AppSpacing

@Composable
fun HomeScreen(
    onExplore: () -> Unit,
    onVenueDetail: (String) -> Unit,
    onBookings: () -> Unit,
    onNotifications: () -> Unit,
    onProfile: () -> Unit,
    onSettings: () -> Unit
) {
    var homeQuery by remember { mutableStateOf("") }
    val featuredVenues = MockVenueRepository.venues.filter { it.featured }
    val firstFeaturedVenue = featuredVenues.first()

    SportcationPlaceholderScreen(
        title = "Hi, ready to play?",
        description = "Discover sports venues, compare availability, and prepare your next booking from one mobile flow.",
        primaryActionLabel = "Explore Venues",
        onPrimaryAction = onExplore,
        extraContent = {
            SearchBar(
                query = homeQuery,
                onQueryChange = { homeQuery = it },
                placeholder = "Search venue, sport, or area",
                onSearchClick = onExplore
            )
            Spacer(modifier = Modifier.height(AppSpacing.md))
            SectionHeader(title = "Popular sports")
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(AppSpacing.xs)
            ) {
                MockVenueRepository.sportCategories
                    .filterNot { it == "All" }
                    .forEachIndexed { index, category ->
                        CategoryChip(
                            label = category,
                            selected = index == 0,
                            onClick = onExplore
                        )
                    }
            }
            Spacer(modifier = Modifier.height(AppSpacing.md))
            SectionHeader(title = "Featured venue", actionLabel = "View all", onActionClick = onExplore)
            featuredVenues.forEach { venue ->
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
            SectionHeader(title = "Promo")
            EmptyState(
                title = "Launch promo placeholder",
                message = "Promo and voucher foundations are reserved for a later sprint."
            )
            Spacer(modifier = Modifier.height(AppSpacing.md))
            SectionHeader(title = "Upcoming booking")
            EmptyState(
                title = "No upcoming booking",
                message = "Your next session at ${firstFeaturedVenue.name} can appear here after booking is implemented.",
                actionLabel = "Browse venues",
                onAction = onExplore
            )
            Spacer(modifier = Modifier.height(AppSpacing.lg))
            AppButton(label = "My Bookings", onClick = onBookings, modifier = Modifier.fillMaxWidth(), style = AppButtonStyle.Secondary)
            Spacer(modifier = Modifier.height(AppSpacing.xs))
            AppButton(label = "Notifications", onClick = onNotifications, modifier = Modifier.fillMaxWidth(), style = AppButtonStyle.Secondary)
            Spacer(modifier = Modifier.height(AppSpacing.xs))
            AppButton(label = "Profile", onClick = onProfile, modifier = Modifier.fillMaxWidth(), style = AppButtonStyle.Secondary)
            Spacer(modifier = Modifier.height(AppSpacing.xs))
            AppButton(label = "Settings", onClick = onSettings, modifier = Modifier.fillMaxWidth(), style = AppButtonStyle.Secondary)
            Spacer(modifier = Modifier.height(AppSpacing.md))
        }
    )
}
