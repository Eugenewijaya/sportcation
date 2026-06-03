package com.sportcation.app.ui.components

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.VisualTransformation
import com.sportcation.app.ui.theme.AppColorBorder
import com.sportcation.app.ui.theme.AppColorError
import com.sportcation.app.ui.theme.AppColorPrimary
import com.sportcation.app.ui.theme.AppColorSurface
import com.sportcation.app.ui.theme.AppColorTextPrimary
import com.sportcation.app.ui.theme.AppColorTextSecondary
import com.sportcation.app.ui.theme.AppRadius
import com.sportcation.app.ui.theme.AppSpacing

@Composable
fun AppTextField(
    value: String,
    onValueChange: (String) -> Unit,
    label: String,
    modifier: Modifier = Modifier,
    placeholder: String = "",
    enabled: Boolean = true,
    readOnly: Boolean = false,
    visualTransformation: VisualTransformation = VisualTransformation.None,
    errorText: String? = null
) {
    Column(modifier = modifier) {
        Text(
            text = label,
            style = MaterialTheme.typography.labelMedium,
            color = AppColorTextPrimary
        )
        Spacer(modifier = Modifier.height(AppSpacing.xs))
        OutlinedTextField(
            value = value,
            onValueChange = onValueChange,
            modifier = Modifier.fillMaxWidth(),
            enabled = enabled,
            readOnly = readOnly,
            singleLine = true,
            isError = errorText != null,
            visualTransformation = visualTransformation,
            placeholder = {
                if (placeholder.isNotBlank()) {
                    Text(text = placeholder, color = AppColorTextSecondary)
                }
            },
            shape = RoundedCornerShape(AppRadius.md),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = AppColorPrimary,
                unfocusedBorderColor = AppColorBorder,
                focusedContainerColor = AppColorSurface,
                unfocusedContainerColor = AppColorSurface,
                disabledContainerColor = AppColorSurface,
                focusedTextColor = AppColorTextPrimary,
                unfocusedTextColor = AppColorTextPrimary,
                focusedPlaceholderColor = AppColorTextSecondary,
                unfocusedPlaceholderColor = AppColorTextSecondary,
                errorBorderColor = AppColorError,
                errorTextColor = AppColorTextPrimary
            )
        )
        if (errorText != null) {
            Spacer(modifier = Modifier.height(AppSpacing.xxs))
            Text(
                text = errorText,
                style = MaterialTheme.typography.bodySmall,
                color = AppColorError
            )
        }
    }
}
