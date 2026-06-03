package com.sportcation.app.feature.profile

import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.sportcation.app.data.mock.MockSportcationData
import com.sportcation.app.ui.components.AppTextField
import com.sportcation.app.ui.components.EmptyState
import com.sportcation.app.ui.components.SectionHeader
import com.sportcation.app.ui.components.SportcationPlaceholderScreen
import com.sportcation.app.ui.theme.AppSpacing

@Composable
fun EditProfileScreen(onBack: () -> Unit) {
    val profile = MockSportcationData.user
    var name by remember { mutableStateOf(profile.name) }
    var emailOrPhone by remember { mutableStateOf(profile.emailOrPhone) }
    var nameError by remember { mutableStateOf<String?>(null) }
    var contactError by remember { mutableStateOf<String?>(null) }
    var saveMessage by remember { mutableStateOf<String?>(null) }

    fun validate(): Boolean {
        nameError = if (name.isBlank()) "Enter your name." else null
        contactError = if (emailOrPhone.isBlank()) "Enter your phone or email." else null
        return nameError == null && contactError == null
    }

    SportcationPlaceholderScreen(
        title = "Edit Profile",
        description = "Update mock profile fields locally. This does not call an account update API.",
        primaryActionLabel = "Save Changes",
        onPrimaryAction = {
            if (validate()) {
                saveMessage = "Mock profile saved locally for this screen."
            }
        },
        secondaryActionLabel = "Back",
        onSecondaryAction = onBack,
        extraContent = {
            SectionHeader(title = "Profile form")
            AppTextField(
                value = name,
                onValueChange = {
                    name = it
                    nameError = null
                    saveMessage = null
                },
                label = "Name",
                placeholder = "Your full name",
                modifier = Modifier.fillMaxWidth(),
                errorText = nameError
            )
            Spacer(modifier = Modifier.height(AppSpacing.sm))
            AppTextField(
                value = emailOrPhone,
                onValueChange = {
                    emailOrPhone = it
                    contactError = null
                    saveMessage = null
                },
                label = "Phone or email",
                placeholder = "name@example.com",
                modifier = Modifier.fillMaxWidth(),
                errorText = contactError
            )
            if (saveMessage != null) {
                Spacer(modifier = Modifier.height(AppSpacing.md))
                EmptyState(
                    title = "Saved",
                    message = saveMessage ?: ""
                )
            }
            Spacer(modifier = Modifier.height(AppSpacing.lg))
        }
    )
}
