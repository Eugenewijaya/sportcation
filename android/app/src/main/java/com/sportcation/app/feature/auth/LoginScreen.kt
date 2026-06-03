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
import androidx.compose.ui.text.input.PasswordVisualTransformation
import com.sportcation.app.ui.components.AppButton
import com.sportcation.app.ui.components.AppButtonStyle
import com.sportcation.app.ui.components.AppTextField
import com.sportcation.app.ui.components.SportcationPlaceholderScreen
import com.sportcation.app.ui.theme.AppSpacing

@Composable
fun LoginScreen(
    onLoginSuccess: () -> Unit,
    onOtpRequest: () -> Unit,
    onRegister: () -> Unit
) {
    var account by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var accountError by remember { mutableStateOf<String?>(null) }
    var passwordError by remember { mutableStateOf<String?>(null) }

    fun validateAccount(): Boolean {
        accountError = if (account.isBlank()) "Enter your phone number or email." else null
        return accountError == null
    }

    fun validateLogin(): Boolean {
        val hasAccount = validateAccount()
        passwordError = if (password.isBlank()) "Enter your password." else null
        return hasAccount && passwordError == null
    }

    SportcationPlaceholderScreen(
        title = "Login",
        description = "Use mock credentials or continue with the OTP placeholder. No real authentication is implemented.",
        primaryActionLabel = "Login",
        onPrimaryAction = {
            if (validateLogin()) {
                onLoginSuccess()
            }
        },
        secondaryActionLabel = "Create Account",
        onSecondaryAction = onRegister,
        extraContent = {
            AppTextField(
                value = account,
                onValueChange = {
                    account = it
                    accountError = null
                },
                label = "Phone or email",
                placeholder = "name@example.com",
                modifier = Modifier.fillMaxWidth(),
                errorText = accountError
            )
            Spacer(modifier = Modifier.height(AppSpacing.sm))
            AppTextField(
                value = password,
                onValueChange = {
                    password = it
                    passwordError = null
                },
                label = "Password",
                placeholder = "Enter any password",
                modifier = Modifier.fillMaxWidth(),
                visualTransformation = PasswordVisualTransformation(),
                errorText = passwordError
            )
            Spacer(modifier = Modifier.height(AppSpacing.md))
            AppButton(
                label = "Use OTP Instead",
                onClick = {
                    if (validateAccount()) {
                        onOtpRequest()
                    }
                },
                modifier = Modifier.fillMaxWidth(),
                style = AppButtonStyle.Secondary
            )
            Spacer(modifier = Modifier.height(AppSpacing.md))
        }
    )
}
