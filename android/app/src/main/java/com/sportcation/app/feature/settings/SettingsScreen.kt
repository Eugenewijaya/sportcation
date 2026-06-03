package com.sportcation.app.feature.settings

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.sportcation.app.ui.components.AppButton
import com.sportcation.app.ui.components.AppButtonStyle
import com.sportcation.app.ui.components.CategoryChip
import com.sportcation.app.ui.components.EmptyState
import com.sportcation.app.ui.components.SectionHeader
import com.sportcation.app.ui.components.SportcationPlaceholderScreen
import com.sportcation.app.ui.theme.AppSpacing

@Composable
fun SettingsScreen(
    onHome: () -> Unit,
    onLogin: () -> Unit
) {
    SportcationPlaceholderScreen(
        title = "Settings",
        description = "Mock settings for account, notifications, privacy, language, and app information.",
        primaryActionLabel = "Back to Home",
        onPrimaryAction = onHome,
        secondaryActionLabel = "Logout Placeholder",
        onSecondaryAction = onLogin,
        extraContent = {
            SectionHeader(title = "Account settings")
            EmptyState(
                title = "Account",
                message = "Email, phone, and account security controls will connect to backend account services later."
            )
            Spacer(modifier = Modifier.height(AppSpacing.md))
            SectionHeader(title = "Notification preferences")
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(AppSpacing.xs)
            ) {
                CategoryChip(label = "Booking alerts", selected = true, onClick = {})
                CategoryChip(label = "Promo alerts", selected = false, onClick = {})
            }
            Spacer(modifier = Modifier.height(AppSpacing.md))
            SectionHeader(title = "Privacy")
            EmptyState(
                title = "Privacy placeholder",
                message = "Privacy controls and data export are planned for production readiness."
            )
            Spacer(modifier = Modifier.height(AppSpacing.md))
            SectionHeader(title = "Language")
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(AppSpacing.xs)
            ) {
                CategoryChip(label = "English", selected = true, onClick = {})
                CategoryChip(label = "Bahasa", selected = false, onClick = {})
            }
            Spacer(modifier = Modifier.height(AppSpacing.md))
            SectionHeader(title = "About Sportcation")
            EmptyState(
                title = "Sportcation Android MVP",
                message = "Mobile-first sports venue discovery and booking experience. Current build uses mock data only."
            )
            Spacer(modifier = Modifier.height(AppSpacing.md))
            AppButton(
                label = "Logout Placeholder",
                onClick = onLogin,
                modifier = Modifier.fillMaxWidth(),
                style = AppButtonStyle.Text
            )
            Spacer(modifier = Modifier.height(AppSpacing.lg))
        }
    )
}
