package com.sportcation.app.feature.auth

import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.height
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.sportcation.app.ui.components.LoadingState
import com.sportcation.app.ui.components.SportcationPlaceholderScreen
import com.sportcation.app.ui.theme.AppSpacing

@Composable
fun SplashScreen(
    onOnboarding: () -> Unit,
    onLogin: () -> Unit
) {
    SportcationPlaceholderScreen(
        title = "Splash Screen",
        description = "Initial app startup placeholder for choosing first-run onboarding or the login flow.",
        primaryActionLabel = "Start Onboarding",
        onPrimaryAction = onOnboarding,
        secondaryActionLabel = "Go to Login",
        onSecondaryAction = onLogin,
        extraContent = {
            LoadingState(message = "Preparing app foundation")
            Spacer(modifier = Modifier.height(AppSpacing.lg))
        }
    )
}
