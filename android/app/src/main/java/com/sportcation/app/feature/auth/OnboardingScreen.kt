package com.sportcation.app.feature.auth

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableIntStateOf
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.sportcation.app.ui.components.CategoryChip
import com.sportcation.app.ui.components.SectionHeader
import com.sportcation.app.ui.components.SportcationPlaceholderScreen
import com.sportcation.app.ui.theme.AppSpacing

private data class OnboardingSlide(
    val title: String,
    val description: String,
    val chips: List<String>
)

private val onboardingSlides = listOf(
    OnboardingSlide(
        title = "Discover Sports Venues",
        description = "Browse nearby venues by sport, area, and available courts from a mobile-first flow.",
        chips = listOf("Explore", "Search", "Compare")
    ),
    OnboardingSlide(
        title = "Pick the Right Slot",
        description = "Review venue details, choose a date, and select an available time before checkout.",
        chips = listOf("Date", "Time", "Court")
    ),
    OnboardingSlide(
        title = "Book and Check In",
        description = "Complete a payment simulation and receive a booking code foundation for check-in.",
        chips = listOf("Checkout", "Code", "Ticket")
    )
)

@Composable
fun OnboardingScreen(
    onGetStarted: () -> Unit,
    onSkip: () -> Unit
) {
    var slideIndex by remember { mutableIntStateOf(0) }
    val currentSlide = onboardingSlides[slideIndex]
    val isLastSlide = slideIndex == onboardingSlides.lastIndex

    SportcationPlaceholderScreen(
        title = currentSlide.title,
        description = currentSlide.description,
        primaryActionLabel = if (isLastSlide) "Get Started" else "Continue",
        onPrimaryAction = {
            if (isLastSlide) {
                onGetStarted()
            } else {
                slideIndex += 1
            }
        },
        secondaryActionLabel = "Skip to Login",
        onSecondaryAction = onSkip,
        extraContent = {
            SectionHeader(title = "Step ${slideIndex + 1} of ${onboardingSlides.size}")
            Spacer(modifier = Modifier.height(AppSpacing.xs))
            Row(horizontalArrangement = Arrangement.spacedBy(AppSpacing.xs)) {
                currentSlide.chips.forEachIndexed { chipIndex, label ->
                    CategoryChip(label = label, selected = chipIndex == 0, onClick = {})
                }
            }
            Spacer(modifier = Modifier.height(AppSpacing.lg))
        }
    )
}
