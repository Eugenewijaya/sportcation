package com.sportcation.app.feature.booking

import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.sportcation.app.ui.components.AppTextField
import com.sportcation.app.ui.components.BookingCard
import com.sportcation.app.ui.components.SectionHeader
import com.sportcation.app.ui.components.SportcationPlaceholderScreen
import com.sportcation.app.ui.theme.AppSpacing

@Composable
fun CheckoutScreen(
    onBack: () -> Unit,
    onConfirm: () -> Unit
) {
    SportcationPlaceholderScreen(
        title = "Checkout Screen",
        description = "Placeholder for booking summary, payment method selection, voucher placeholder, and total payment.",
        primaryActionLabel = "Confirm Booking",
        onPrimaryAction = onConfirm,
        secondaryActionLabel = "Back",
        onSecondaryAction = onBack,
        extraContent = {
            BookingCard(
                venueName = "PadelHub Jakarta",
                statusLabel = "Checkout draft",
                scheduleLabel = "Sat, 24 Oct - 10:00 to 11:00",
                priceLabel = "Rp 365.000"
            )
            Spacer(modifier = Modifier.height(AppSpacing.md))
            AppTextField(
                value = "",
                onValueChange = {},
                label = "Voucher",
                placeholder = "Voucher placeholder",
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(modifier = Modifier.height(AppSpacing.md))
            SectionHeader(title = "Payment simulation")
            Spacer(modifier = Modifier.height(AppSpacing.lg))
        }
    )
}
