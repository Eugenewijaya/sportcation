package com.sportcation.app.ui.components

import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import com.sportcation.app.ui.theme.AppColorPrimary
import com.sportcation.app.ui.theme.AppColorSurface
import com.sportcation.app.ui.theme.AppColorTextPrimary

@Composable
fun CategoryChip(
    label: String,
    selected: Boolean,
    onClick: () -> Unit,
    modifier: Modifier = Modifier
) {
    FilterChip(
        selected = selected,
        onClick = onClick,
        modifier = modifier,
        label = {
            Text(text = label, style = MaterialTheme.typography.labelLarge)
        },
        colors = FilterChipDefaults.filterChipColors(
            containerColor = AppColorSurface,
            labelColor = AppColorTextPrimary,
            selectedContainerColor = AppColorPrimary,
            selectedLabelColor = Color.White
        )
    )
}
