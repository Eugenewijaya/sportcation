package com.sportcation.app.feature.notification

import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.sportcation.app.ui.components.EmptyState
import com.sportcation.app.ui.components.SportcationPlaceholderScreen
import com.sportcation.app.ui.theme.AppSpacing

@Composable
fun NotificationScreen(onHome: () -> Unit) {
    SportcationPlaceholderScreen(
        title = "Notification Screen",
        description = "Placeholder for in-app booking and payment update notifications.",
        primaryActionLabel = "Back to Home",
        onPrimaryAction = onHome,
        extraContent = {
            EmptyState(
                title = "No notifications yet",
                message = "Booking updates will appear here after the booking flow is implemented.",
                actionLabel = "Explore Home",
                onAction = onHome
            )
            Spacer(modifier = Modifier.height(AppSpacing.lg))
        }
    )
}
