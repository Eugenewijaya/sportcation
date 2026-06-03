package com.sportcation.app.feature.notification

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.sportcation.app.data.mock.MockSportcationData
import com.sportcation.app.data.mock.Notification
import com.sportcation.app.data.mock.NotificationType
import com.sportcation.app.ui.components.CategoryChip
import com.sportcation.app.ui.components.EmptyState
import com.sportcation.app.ui.components.SectionHeader
import com.sportcation.app.ui.components.SportcationPlaceholderScreen
import com.sportcation.app.ui.theme.AppColorBorder
import com.sportcation.app.ui.theme.AppColorPrimary
import com.sportcation.app.ui.theme.AppColorSurface
import com.sportcation.app.ui.theme.AppColorSurfaceMuted
import com.sportcation.app.ui.theme.AppColorTextPrimary
import com.sportcation.app.ui.theme.AppColorTextSecondary
import com.sportcation.app.ui.theme.AppRadius
import com.sportcation.app.ui.theme.AppSpacing

@Composable
fun NotificationScreen(onHome: () -> Unit) {
    var selectedType by remember { mutableStateOf<NotificationType?>(null) }
    val notifications = MockSportcationData.notifications.filter { notification ->
        selectedType == null || notification.type == selectedType
    }

    SportcationPlaceholderScreen(
        title = "Notifications",
        description = "Mock booking, payment, promo, and system updates. No push notification integration yet.",
        primaryActionLabel = "Back to Home",
        onPrimaryAction = onHome,
        extraContent = {
            SectionHeader(title = "Notification type")
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(AppSpacing.xs)
            ) {
                CategoryChip(
                    label = "All",
                    selected = selectedType == null,
                    onClick = { selectedType = null }
                )
                NotificationType.values().forEach { type ->
                    CategoryChip(
                        label = type.label,
                        selected = selectedType == type,
                        onClick = { selectedType = type }
                    )
                }
            }
            Spacer(modifier = Modifier.height(AppSpacing.md))
            SectionHeader(title = "${notifications.size} updates")
            if (notifications.isEmpty()) {
                EmptyState(
                    title = "No notifications",
                    message = "Updates for this type will appear here when available."
                )
            } else {
                notifications.forEach { notification ->
                    NotificationCard(notification = notification)
                    Spacer(modifier = Modifier.height(AppSpacing.sm))
                }
            }
            Spacer(modifier = Modifier.height(AppSpacing.lg))
        }
    )
}

@Composable
private fun NotificationCard(notification: Notification) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(AppRadius.lg),
        colors = CardDefaults.cardColors(
            containerColor = if (notification.isRead) AppColorSurface else AppColorSurfaceMuted
        ),
        border = BorderStroke(
            width = 1.dp,
            color = if (notification.isRead) AppColorBorder else AppColorPrimary
        )
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(AppSpacing.md),
            verticalArrangement = Arrangement.spacedBy(AppSpacing.xs)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween
            ) {
                Text(
                    text = notification.type.label,
                    style = MaterialTheme.typography.labelLarge,
                    color = AppColorPrimary
                )
                Text(
                    text = if (notification.isRead) "Read" else "Unread",
                    style = MaterialTheme.typography.labelMedium,
                    color = if (notification.isRead) AppColorTextSecondary else AppColorPrimary
                )
            }
            Text(
                text = notification.title,
                style = MaterialTheme.typography.titleLarge,
                color = AppColorTextPrimary
            )
            Text(
                text = notification.message,
                style = MaterialTheme.typography.bodyMedium,
                color = AppColorTextSecondary
            )
            Text(
                text = notification.timestampLabel,
                style = MaterialTheme.typography.bodySmall,
                color = AppColorTextSecondary
            )
        }
    }
}
