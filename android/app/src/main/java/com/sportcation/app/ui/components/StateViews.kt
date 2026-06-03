package com.sportcation.app.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.sportcation.app.ui.theme.AppColorBorder
import com.sportcation.app.ui.theme.AppColorError
import com.sportcation.app.ui.theme.AppColorPrimary
import com.sportcation.app.ui.theme.AppColorSurface
import com.sportcation.app.ui.theme.AppColorTextPrimary
import com.sportcation.app.ui.theme.AppColorTextSecondary
import com.sportcation.app.ui.theme.AppRadius
import com.sportcation.app.ui.theme.AppSpacing

@Composable
fun EmptyState(
    title: String,
    message: String,
    modifier: Modifier = Modifier,
    actionLabel: String? = null,
    onAction: (() -> Unit)? = null
) {
    StateCard(modifier = modifier) {
        Text(text = title, style = MaterialTheme.typography.titleLarge, color = AppColorTextPrimary)
        Text(
            text = message,
            style = MaterialTheme.typography.bodyMedium,
            color = AppColorTextSecondary,
            textAlign = TextAlign.Center
        )
        if (actionLabel != null && onAction != null) {
            AppButton(label = actionLabel, onClick = onAction, style = AppButtonStyle.Secondary)
        }
    }
}

@Composable
fun LoadingState(
    message: String,
    modifier: Modifier = Modifier
) {
    StateCard(modifier = modifier) {
        CircularProgressIndicator(color = AppColorPrimary)
        Text(
            text = message,
            style = MaterialTheme.typography.bodyMedium,
            color = AppColorTextSecondary,
            textAlign = TextAlign.Center
        )
    }
}

@Composable
fun ErrorState(
    title: String,
    message: String,
    modifier: Modifier = Modifier,
    actionLabel: String? = null,
    onAction: (() -> Unit)? = null
) {
    StateCard(modifier = modifier) {
        Text(text = title, style = MaterialTheme.typography.titleLarge, color = AppColorError)
        Text(
            text = message,
            style = MaterialTheme.typography.bodyMedium,
            color = AppColorTextSecondary,
            textAlign = TextAlign.Center
        )
        if (actionLabel != null && onAction != null) {
            AppButton(label = actionLabel, onClick = onAction, style = AppButtonStyle.Secondary)
        }
    }
}

@Composable
private fun StateCard(
    modifier: Modifier = Modifier,
    content: @Composable () -> Unit
) {
    Card(
        modifier = modifier.fillMaxWidth(),
        shape = RoundedCornerShape(AppRadius.lg),
        colors = CardDefaults.cardColors(containerColor = AppColorSurface),
        border = BorderStroke(width = 1.dp, color = AppColorBorder)
    ) {
        Column(
            modifier = Modifier
                .fillMaxWidth()
                .padding(AppSpacing.lg),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.spacedBy(AppSpacing.sm)
        ) {
            content()
        }
    }
}
