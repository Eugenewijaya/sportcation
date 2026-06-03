package com.sportcation.app.feature.profile

import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.sportcation.app.data.mock.MockSportcationData
import com.sportcation.app.ui.components.AppButton
import com.sportcation.app.ui.components.AppButtonStyle
import com.sportcation.app.ui.components.EmptyState
import com.sportcation.app.ui.components.SectionHeader
import com.sportcation.app.ui.components.SportcationPlaceholderScreen
import com.sportcation.app.ui.theme.AppSpacing

@Composable
fun ProfileScreen(
    onHome: () -> Unit,
    onEditProfile: () -> Unit,
    onBookings: () -> Unit,
    onSettings: () -> Unit,
    onLogout: () -> Unit
) {
    val profile = MockSportcationData.user

    SportcationPlaceholderScreen(
        title = "Profile",
        description = "Mock account profile and menu links. No real account API is connected yet.",
        primaryActionLabel = "Edit Profile",
        onPrimaryAction = onEditProfile,
        secondaryActionLabel = "Back to Home",
        onSecondaryAction = onHome,
        extraContent = {
            EmptyState(
                title = profile.avatarInitials,
                message = "${profile.name}\n${profile.emailOrPhone}\n${profile.membershipLabel}"
            )
            Spacer(modifier = Modifier.height(AppSpacing.md))
            SectionHeader(title = "Menu")
            AppButton(
                label = "Edit Profile",
                onClick = onEditProfile,
                modifier = Modifier.fillMaxWidth(),
                style = AppButtonStyle.Secondary
            )
            Spacer(modifier = Modifier.height(AppSpacing.xs))
            AppButton(
                label = "My Bookings",
                onClick = onBookings,
                modifier = Modifier.fillMaxWidth(),
                style = AppButtonStyle.Secondary
            )
            Spacer(modifier = Modifier.height(AppSpacing.xs))
            AppButton(
                label = "Wallet Placeholder",
                onClick = {},
                modifier = Modifier.fillMaxWidth(),
                style = AppButtonStyle.Secondary
            )
            Spacer(modifier = Modifier.height(AppSpacing.xs))
            AppButton(
                label = "Help Center Placeholder",
                onClick = {},
                modifier = Modifier.fillMaxWidth(),
                style = AppButtonStyle.Secondary
            )
            Spacer(modifier = Modifier.height(AppSpacing.xs))
            AppButton(
                label = "Settings",
                onClick = onSettings,
                modifier = Modifier.fillMaxWidth(),
                style = AppButtonStyle.Secondary
            )
            Spacer(modifier = Modifier.height(AppSpacing.xs))
            AppButton(
                label = "Logout Placeholder",
                onClick = onLogout,
                modifier = Modifier.fillMaxWidth(),
                style = AppButtonStyle.Text
            )
            Spacer(modifier = Modifier.height(AppSpacing.lg))
        }
    )
}
