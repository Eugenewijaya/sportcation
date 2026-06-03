package com.sportcation.app.feature.booking

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
import com.sportcation.app.data.mock.PaymentStatus
import com.sportcation.app.ui.components.AppButton
import com.sportcation.app.ui.components.AppButtonStyle
import com.sportcation.app.ui.components.BookingCard
import com.sportcation.app.ui.components.EmptyState
import com.sportcation.app.ui.components.ErrorState
import com.sportcation.app.ui.components.SectionHeader
import com.sportcation.app.ui.components.SportcationPlaceholderScreen
import com.sportcation.app.ui.theme.AppSpacing

@Composable
fun PaymentSimulationScreen(
    slotId: String,
    paymentMethodId: String,
    onBack: () -> Unit,
    onPaymentSuccess: (String) -> Unit
) {
    val summary = remember(slotId) { MockSportcationData.checkoutSummaryForSlot(slotId) }
    val paymentMethod = remember(paymentMethodId) {
        MockSportcationData.findPaymentMethod(paymentMethodId)
    }
    val successBooking = remember(slotId, paymentMethodId) {
        MockSportcationData.bookingForCheckout(
            slotId = slotId,
            paymentMethodId = paymentMethodId,
            paymentStatus = PaymentStatus.Paid
        )
    }
    var paymentError by remember(slotId, paymentMethodId) { mutableStateOf<String?>(null) }

    SportcationPlaceholderScreen(
        title = "Payment Simulation",
        description = "Use mock actions to continue the booking flow. No real payment gateway is connected.",
        primaryActionLabel = "Simulate Successful Payment",
        onPrimaryAction = {
            paymentError = null
            onPaymentSuccess(successBooking.id)
        },
        secondaryActionLabel = "Back",
        onSecondaryAction = onBack,
        extraContent = {
            BookingCard(
                venueName = summary.venue.name,
                statusLabel = paymentMethod.label,
                scheduleLabel = "${summary.court.name} - ${summary.slot.dateLabel} - ${summary.slot.timeRange}",
                priceLabel = summary.totalAmountLabel
            )
            Spacer(modifier = Modifier.height(AppSpacing.md))
            SectionHeader(title = "Payment instruction")
            EmptyState(
                title = paymentMethod.label,
                message = "${paymentMethod.instruction}\nTotal payment: ${summary.totalAmountLabel}"
            )
            Spacer(modifier = Modifier.height(AppSpacing.md))
            SectionHeader(title = "Timer placeholder")
            EmptyState(
                title = "15:00",
                message = "Countdown is display-only. Payment expiration logic belongs to the backend sprint."
            )
            if (paymentError != null) {
                Spacer(modifier = Modifier.height(AppSpacing.md))
                ErrorState(
                    title = "Payment failed",
                    message = paymentError ?: ""
                )
            }
            Spacer(modifier = Modifier.height(AppSpacing.md))
            AppButton(
                label = "Simulate Failed Payment",
                onClick = {
                    paymentError = "Mock payment failed. Stay on this screen and retry the successful simulation."
                },
                modifier = Modifier.fillMaxWidth(),
                style = AppButtonStyle.Secondary
            )
            Spacer(modifier = Modifier.height(AppSpacing.lg))
        }
    )
}
