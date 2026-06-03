package com.sportcation.app.ui.components

import androidx.compose.foundation.BorderStroke
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.TextButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.unit.dp
import com.sportcation.app.ui.theme.AppColorBorder
import com.sportcation.app.ui.theme.AppColorPrimary
import com.sportcation.app.ui.theme.AppRadius

enum class AppButtonStyle {
    Primary,
    Secondary,
    Text
}

@Composable
fun AppButton(
    label: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true,
    style: AppButtonStyle = AppButtonStyle.Primary
) {
    val shape = RoundedCornerShape(AppRadius.md)
    val contentPadding = PaddingValues(horizontal = 18.dp, vertical = 14.dp)

    when (style) {
        AppButtonStyle.Primary -> Button(
            onClick = onClick,
            modifier = modifier,
            enabled = enabled,
            shape = shape,
            colors = ButtonDefaults.buttonColors(
                containerColor = AppColorPrimary,
                contentColor = Color.White
            ),
            contentPadding = contentPadding
        ) {
            Text(text = label, style = MaterialTheme.typography.labelLarge)
        }

        AppButtonStyle.Secondary -> OutlinedButton(
            onClick = onClick,
            modifier = modifier,
            enabled = enabled,
            shape = shape,
            border = BorderStroke(width = 1.dp, color = AppColorBorder),
            colors = ButtonDefaults.outlinedButtonColors(contentColor = AppColorPrimary),
            contentPadding = contentPadding
        ) {
            Text(text = label, style = MaterialTheme.typography.labelLarge)
        }

        AppButtonStyle.Text -> TextButton(
            onClick = onClick,
            modifier = modifier,
            enabled = enabled,
            colors = ButtonDefaults.textButtonColors(contentColor = AppColorPrimary),
            contentPadding = contentPadding
        ) {
            Text(text = label, style = MaterialTheme.typography.labelLarge)
        }
    }
}

@Composable
fun SportcationPrimaryButton(
    label: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true
) {
    AppButton(
        label = label,
        onClick = onClick,
        modifier = modifier.fillMaxWidth(),
        enabled = enabled,
        style = AppButtonStyle.Primary
    )
}

@Composable
fun SportcationSecondaryButton(
    label: String,
    onClick: () -> Unit,
    modifier: Modifier = Modifier,
    enabled: Boolean = true
) {
    AppButton(
        label = label,
        onClick = onClick,
        modifier = modifier.fillMaxWidth(),
        enabled = enabled,
        style = AppButtonStyle.Secondary
    )
}
