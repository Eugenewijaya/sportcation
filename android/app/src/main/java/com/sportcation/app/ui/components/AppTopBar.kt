package com.sportcation.app.ui.components

import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.heightIn
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.sportcation.app.ui.theme.AppColorTextPrimary
import com.sportcation.app.ui.theme.AppSpacing

@Composable
fun AppTopBar(
    title: String,
    modifier: Modifier = Modifier,
    navigationLabel: String? = null,
    onNavigationClick: (() -> Unit)? = null,
    actionLabel: String? = null,
    onActionClick: (() -> Unit)? = null
) {
    Row(
        modifier = modifier
            .fillMaxWidth()
            .heightIn(min = 56.dp)
            .padding(vertical = AppSpacing.xs),
        verticalAlignment = Alignment.CenterVertically
    ) {
        if (navigationLabel != null && onNavigationClick != null) {
            AppButton(
                label = navigationLabel,
                onClick = onNavigationClick,
                style = AppButtonStyle.Text
            )
        }
        Text(
            text = title,
            modifier = Modifier.weight(1f),
            style = MaterialTheme.typography.titleLarge,
            color = AppColorTextPrimary,
            textAlign = if (navigationLabel == null) TextAlign.Start else TextAlign.Center
        )
        if (actionLabel != null && onActionClick != null) {
            AppButton(
                label = actionLabel,
                onClick = onActionClick,
                style = AppButtonStyle.Text
            )
        }
    }
}
