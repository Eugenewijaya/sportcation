package com.sportcation.app.feature.settings

import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.sportcation.app.ui.components.CategoryChip
import com.sportcation.app.ui.components.SectionHeader
import com.sportcation.app.ui.components.SportcationPlaceholderScreen
import com.sportcation.app.ui.theme.AppSpacing

@Composable
fun SettingsScreen(
    onHome: () -> Unit,
    onLogin: () -> Unit
) {
    SportcationPlaceholderScreen(
        title = "Settings Screen",
        description = "Placeholder for personal info, notification preference, language, privacy, help, and logout.",
        primaryActionLabel = "Back to Home",
        onPrimaryAction = onHome,
        secondaryActionLabel = "Logout Placeholder",
        onSecondaryAction = onLogin,
        extraContent = {
            SectionHeader(title = "Preferences")
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(AppSpacing.xs)
            ) {
                CategoryChip(label = "Notifications", selected = true, onClick = {})
                CategoryChip(label = "English", selected = false, onClick = {})
            }
            Spacer(modifier = Modifier.height(AppSpacing.lg))
            SectionHeader(title = "Account")
            Spacer(modifier = Modifier.height(AppSpacing.lg))
        }
    )
}
