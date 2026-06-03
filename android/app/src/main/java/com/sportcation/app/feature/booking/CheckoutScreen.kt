package com.sportcation.app.feature.booking

import androidx.compose.foundation.horizontalScroll
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.rememberScrollState
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Modifier
import com.sportcation.app.data.mock.MockSportcationData
import com.sportcation.app.ui.components.AppTextField
import com.sportcation.app.ui.components.BookingCard
import com.sportcation.app.ui.components.CategoryChip
import com.sportcation.app.ui.components.EmptyState
import com.sportcation.app.ui.components.SectionHeader
import com.sportcation.app.ui.components.SportcationPlaceholderScreen
import com.sportcation.app.ui.theme.AppSpacing

@Composable
fun CheckoutScreen(
    slotId: String,
    onBack: () -> Unit,
    onContinuePayment: (String, String) -> Unit
) {
    val summary = remember(slotId) { MockSportcationData.checkoutSummaryForSlot(slotId) }
    var voucherCode by remember(slotId) { mutableStateOf("") }
    var selectedPaymentMethodId by remember(slotId) {
        mutableStateOf(summary.paymentMethods.first().id)
    }
    val selectedPaymentMethod = summary.paymentMethods.firstOrNull { it.id == selectedPaymentMethodId }
        ?: summary.paymentMethods.first()

    SportcationPlaceholderScreen(
        title = "Checkout",
        description = "Review the selected venue, court, slot, fee placeholder, and mock payment method before continuing.",
        primaryActionLabel = "Continue to Payment",
        onPrimaryAction = {
            onContinuePayment(summary.slot.id, selectedPaymentMethod.id)
        },
        secondaryActionLabel = "Back",
        onSecondaryAction = onBack,
        extraContent = {
            BookingCard(
                venueName = summary.venue.name,
                statusLabel = summary.venue.sportCategory,
                scheduleLabel = "${summary.court.name} - ${summary.slot.dateLabel} (${summary.slot.date}) - ${summary.slot.timeRange}",
                priceLabel = summary.totalAmountLabel
            )
            Spacer(modifier = Modifier.height(AppSpacing.md))
            SectionHeader(title = "Price breakdown")
            PriceLine(label = "Court fee", value = summary.courtFeeLabel)
            PriceLine(label = "Platform fee placeholder", value = summary.platformFeeLabel)
            PriceLine(label = "Admin fee placeholder", value = summary.adminFeeLabel)
            PriceLine(
                label = "Voucher placeholder",
                value = if (summary.voucher?.enabled == true) "-${summary.voucher.discountLabel}" else "Not applied"
            )
            Spacer(modifier = Modifier.height(AppSpacing.xs))
            PriceLine(label = "Total payment", value = summary.totalAmountLabel, emphasize = true)
            Spacer(modifier = Modifier.height(AppSpacing.md))
            SectionHeader(title = "Voucher")
            AppTextField(
                value = voucherCode,
                onValueChange = { voucherCode = it },
                label = "Voucher",
                placeholder = summary.voucher?.code ?: "Voucher placeholder",
                modifier = Modifier.fillMaxWidth()
            )
            Spacer(modifier = Modifier.height(AppSpacing.sm))
            EmptyState(
                title = "Voucher not applied",
                message = "Voucher input is local only and does not change the total in this sprint."
            )
            Spacer(modifier = Modifier.height(AppSpacing.md))
            SectionHeader(title = "Payment method")
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .horizontalScroll(rememberScrollState()),
                horizontalArrangement = Arrangement.spacedBy(AppSpacing.xs)
            ) {
                summary.paymentMethods.forEach { method ->
                    CategoryChip(
                        label = method.label,
                        selected = selectedPaymentMethodId == method.id,
                        onClick = { selectedPaymentMethodId = method.id }
                    )
                }
            }
            Spacer(modifier = Modifier.height(AppSpacing.sm))
            EmptyState(
                title = selectedPaymentMethod.label,
                message = selectedPaymentMethod.instruction
            )
            Spacer(modifier = Modifier.height(AppSpacing.lg))
        }
    )
}

@Composable
private fun PriceLine(
    label: String,
    value: String,
    emphasize: Boolean = false
) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(
            text = label,
            style = if (emphasize) MaterialTheme.typography.titleLarge else MaterialTheme.typography.bodyMedium
        )
        Text(
            text = value,
            style = if (emphasize) MaterialTheme.typography.titleLarge else MaterialTheme.typography.bodyMedium
        )
    }
}
