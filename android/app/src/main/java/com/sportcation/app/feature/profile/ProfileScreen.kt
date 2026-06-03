package com.sportcation.app.feature.profile

import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.sportcation.app.ui.components.AppTextField
import com.sportcation.app.ui.components.SectionHeader
import com.sportcation.app.ui.components.SportcationPlaceholderScreen
import com.sportcation.app.ui.theme.AppSpacing

@Composable
fun ProfileScreen(
    onHome: () -> Unit,
    onSettings: () -> Unit
) {
    SportcationPlaceholderScreen(
        title = "Profile Screen",
        description = "Placeholder for user identity, account summary, profile menu, and logout entry point.",
        primaryActionLabel = "Open Settings",
        onPrimaryAction = onSettings,
        secondaryActionLabel = "Back to Home",
        onSecondaryAction = onHome,
        extraContent = {
            SectionHeader(title = "Account snapshot")
            AppTextField(
                value = "Guest User",
                onValueChange = {},
                label = "Name",
                modifier = Modifier.fillMaxWidth(),
                readOnly = true
            )
            Spacer(modifier = Modifier.height(AppSpacing.sm))
            AppTextField(
                value = "guest@sportcation.app",
                onValueChange = {},
                label = "Email",
                modifier = Modifier.fillMaxWidth(),
                readOnly = true
            )
            Spacer(modifier = Modifier.height(AppSpacing.lg))
        }
    )
}
