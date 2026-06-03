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
import com.sportcation.app.ui.components.AppTextField
import com.sportcation.app.ui.components.SportcationPlaceholderScreen
import com.sportcation.app.ui.theme.AppSpacing

@Composable
fun RegisterScreen(
    onContinue: () -> Unit,
    onLogin: () -> Unit
) {
    var name by remember { mutableStateOf("") }
    var account by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var nameError by remember { mutableStateOf<String?>(null) }
    var accountError by remember { mutableStateOf<String?>(null) }
    var passwordError by remember { mutableStateOf<String?>(null) }

    fun validateRegister(): Boolean {
        nameError = if (name.isBlank()) "Enter your name." else null
        accountError = if (account.isBlank()) "Enter your phone number or email." else null
        passwordError = if (password.isBlank()) "Enter your password." else null
        return nameError == null && accountError == null && passwordError == null
    }

    SportcationPlaceholderScreen(
        title = "Create Account",
        description = "Create a mock account before OTP verification. This does not create a backend user yet.",
        primaryActionLabel = "Create Account",
        onPrimaryAction = {
            if (validateRegister()) {
                onContinue()
            }
        },
        secondaryActionLabel = "Back to Login",
        onSecondaryAction = onLogin,
        extraContent = {
            AppTextField(
                value = name,
                onValueChange = {
                    name = it
                    nameError = null
                },
                label = "Name",
                placeholder = "Your full name",
                modifier = Modifier.fillMaxWidth(),
                errorText = nameError
            )
            Spacer(modifier = Modifier.height(AppSpacing.sm))
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
                placeholder = "Create any password",
                modifier = Modifier.fillMaxWidth(),
                visualTransformation = PasswordVisualTransformation(),
                errorText = passwordError
            )
            Spacer(modifier = Modifier.height(AppSpacing.md))
        }
    )
}
