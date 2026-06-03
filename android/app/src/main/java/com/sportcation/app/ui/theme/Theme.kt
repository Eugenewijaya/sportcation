package com.sportcation.app.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val LightColorScheme = lightColorScheme(
    primary = AppColorPrimary,
    onPrimary = Color.White,
    secondary = AppColorSecondary,
    onSecondary = AppColorTextPrimary,
    background = AppColorBackground,
    onBackground = AppColorTextPrimary,
    surface = AppColorSurface,
    onSurface = AppColorTextPrimary,
    surfaceVariant = AppColorSurfaceMuted,
    onSurfaceVariant = AppColorTextSecondary,
    error = AppColorError,
    onError = Color.White,
    outline = AppColorBorder
)

@Composable
fun SportcationTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = LightColorScheme,
        typography = SportcationTypography,
        shapes = SportcationShapes,
        content = content
    )
}
