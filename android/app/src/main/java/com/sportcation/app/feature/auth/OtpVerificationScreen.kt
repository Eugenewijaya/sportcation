package com.sportcation.app.feature.auth

import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.sportcation.app.ui.components.AppButton
import com.sportcation.app.ui.components.AppButtonStyle
import com.sportcation.app.ui.components.AppTextField
import com.sportcation.app.ui.components.SportcationPlaceholderScreen
import com.sportcation.app.ui.theme.AppSpacing

@Composable
fun OtpVerificationScreen(onVerified: () -> Unit) {
    var otpCode by remember { mutableStateOf("") }
    var otpError by remember { mutableStateOf<String?>(null) }
    var resendMessage by remember { mutableStateOf("Resend OTP placeholder") }

    fun validateOtp(): Boolean {
        otpError = if (otpCode.isBlank()) "Enter the OTP code." else null
        return otpError == null
    }

    SportcationPlaceholderScreen(
        title = "OTP Verification",
        description = "Enter any non-empty OTP code to continue. This screen does not send or verify a real OTP.",
        primaryActionLabel = "Verify OTP",
        onPrimaryAction = {
            if (validateOtp()) {
                onVerified()
            }
        },
        extraContent = {
            AppTextField(
                value = otpCode,
                onValueChange = {
                    otpCode = it
                    otpError = null
                },
                label = "OTP code",
                placeholder = "000000",
                modifier = Modifier.fillMaxWidth(),
                errorText = otpError
            )
            Spacer(modifier = Modifier.height(AppSpacing.sm))
            AppButton(
                label = resendMessage,
                onClick = { resendMessage = "Mock OTP resend requested" },
                modifier = Modifier.fillMaxWidth(),
                style = AppButtonStyle.Text
            )
            Spacer(modifier = Modifier.height(AppSpacing.md))
        }
    )
}
