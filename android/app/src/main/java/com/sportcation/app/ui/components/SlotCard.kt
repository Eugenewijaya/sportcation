package com.sportcation.app.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.sportcation.app.ui.theme.AppColorBorder
import com.sportcation.app.ui.theme.AppColorPrimary
import com.sportcation.app.ui.theme.AppColorSurface
import com.sportcation.app.ui.theme.AppColorSurfaceMuted
import com.sportcation.app.ui.theme.AppColorTextPrimary
import com.sportcation.app.ui.theme.AppColorTextSecondary
import com.sportcation.app.ui.theme.AppRadius
import com.sportcation.app.ui.theme.AppSpacing

enum class SlotStatus {
    Available,
    Selected,
    Unavailable
}

@Composable
fun SlotCard(
    timeRange: String,
    priceLabel: String,
    status: SlotStatus,
    modifier: Modifier = Modifier,
    onClick: () -> Unit = {},
    onUnavailableClick: () -> Unit = {}
) {
    val containerColor = when (status) {
        SlotStatus.Available -> AppColorSurface
        SlotStatus.Selected -> AppColorPrimary
        SlotStatus.Unavailable -> AppColorSurfaceMuted
    }
    val contentColor = when (status) {
        SlotStatus.Selected -> Color.White
        SlotStatus.Unavailable -> AppColorTextSecondary
        SlotStatus.Available -> AppColorTextPrimary
    }
    val statusLabel = when (status) {
        SlotStatus.Available -> "Available"
        SlotStatus.Selected -> "Selected"
        SlotStatus.Unavailable -> "Unavailable"
    }

    Card(
        modifier = modifier
            .fillMaxWidth()
            .clickable(
                onClick = {
                    if (status == SlotStatus.Unavailable) {
                        onUnavailableClick()
                    } else {
                        onClick()
                    }
                }
            ),
        shape = RoundedCornerShape(AppRadius.md),
        colors = CardDefaults.cardColors(containerColor = containerColor),
        border = BorderStroke(width = 1.dp, color = if (status == SlotStatus.Selected) AppColorPrimary else AppColorBorder)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(AppSpacing.sm),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(AppSpacing.xxs)
        ) {
            Text(text = timeRange, style = MaterialTheme.typography.labelLarge, color = contentColor)
            Text(text = statusLabel, style = MaterialTheme.typography.bodySmall, color = contentColor)
            Text(text = priceLabel, style = MaterialTheme.typography.bodySmall, color = contentColor)
        }
    }
}
