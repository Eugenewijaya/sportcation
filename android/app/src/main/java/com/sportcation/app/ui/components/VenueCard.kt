package com.sportcation.app.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.unit.dp
import com.sportcation.app.ui.theme.AppColorBorder
import com.sportcation.app.ui.theme.AppColorPrimary
import com.sportcation.app.ui.theme.AppColorSuccess
import com.sportcation.app.ui.theme.AppColorSurface
import com.sportcation.app.ui.theme.AppColorSurfaceMuted
import com.sportcation.app.ui.theme.AppColorTextPrimary
import com.sportcation.app.ui.theme.AppColorTextSecondary
import com.sportcation.app.ui.theme.AppRadius
import com.sportcation.app.ui.theme.AppSpacing

@Composable
fun VenueCard(
    name: String,
    sport: String,
    location: String,
    priceLabel: String,
    ratingLabel: String,
    imageLabel: String = sport,
    availableStatus: String? = null,
    facilities: List<String> = emptyList(),
    modifier: Modifier = Modifier,
    onClick: () -> Unit = {}
) {
    Card(
        onClick = onClick,
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(AppRadius.lg),
        colors = CardDefaults.cardColors(containerColor = AppColorSurface),
        border = BorderStroke(width = 1.dp, color = AppColorBorder)
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(AppSpacing.md),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(72.dp)
                    .clip(RoundedCornerShape(AppRadius.md))
                    .background(AppColorSurfaceMuted),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = imageLabel.take(1).uppercase(),
                    style = MaterialTheme.typography.titleLarge,
                    color = AppColorPrimary
                )
            }
            Spacer(modifier = Modifier.width(AppSpacing.md))
            Column(
                modifier = Modifier.weight(1f),
                verticalArrangement = Arrangement.spacedBy(AppSpacing.xxs)
            ) {
                Text(
                    text = name,
                    style = MaterialTheme.typography.titleLarge,
                    color = AppColorTextPrimary
                )
                Text(
                    text = "$sport - $ratingLabel",
                    style = MaterialTheme.typography.bodyMedium,
                    color = AppColorTextSecondary
                )
                Text(
                    text = location,
                    style = MaterialTheme.typography.bodyMedium,
                    color = AppColorTextSecondary
                )
                Text(
                    text = priceLabel,
                    style = MaterialTheme.typography.labelLarge,
                    color = AppColorPrimary
                )
                if (availableStatus != null) {
                    Text(
                        text = availableStatus,
                        style = MaterialTheme.typography.labelMedium,
                        color = AppColorSuccess
                    )
                }
                if (facilities.isNotEmpty()) {
                    Text(
                        text = facilities.take(3).joinToString(separator = " - "),
                        style = MaterialTheme.typography.bodySmall,
                        color = AppColorTextSecondary
                    )
                }
            }
        }
    }
}
