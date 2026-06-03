package com.sportcation.app.ui.theme

import androidx.compose.material3.Typography
import androidx.compose.ui.text.TextStyle
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.sp

object AppTypographyTokens {
    val heading = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Bold,
        fontSize = 32.sp,
        lineHeight = 38.sp
    )

    val title = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.SemiBold,
        fontSize = 24.sp,
        lineHeight = 30.sp
    )

    val body = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Normal,
        fontSize = 16.sp,
        lineHeight = 24.sp
    )

    val caption = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.Normal,
        fontSize = 12.sp,
        lineHeight = 16.sp
    )

    val button = TextStyle(
        fontFamily = FontFamily.Default,
        fontWeight = FontWeight.SemiBold,
        fontSize = 14.sp,
        lineHeight = 20.sp
    )
}

val SportcationTypography = Typography(
    headlineLarge = AppTypographyTokens.heading,
    headlineMedium = AppTypographyTokens.title,
    titleLarge = AppTypographyTokens.title.copy(
        fontSize = 20.sp,
        lineHeight = 26.sp
    ),
    bodyLarge = AppTypographyTokens.body,
    bodyMedium = AppTypographyTokens.body.copy(
        fontSize = 14.sp,
        lineHeight = 20.sp
    ),
    bodySmall = AppTypographyTokens.caption,
    labelLarge = AppTypographyTokens.button,
    labelMedium = AppTypographyTokens.caption.copy(fontWeight = FontWeight.SemiBold)
)
