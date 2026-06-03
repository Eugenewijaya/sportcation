package com.sportcation.app.data.mock

enum class SlotAvailability(val label: String) {
    Available("Available"),
    Unavailable("Unavailable")
}

enum class BookingStatus(val label: String) {
    Upcoming("Upcoming"),
    Completed("Completed"),
    Cancelled("Cancelled")
}

enum class PaymentStatus(val label: String) {
    Pending("Pending"),
    Paid("Paid"),
    Failed("Failed")
}

enum class PaymentMethod(val id: String, val label: String, val instruction: String) {
    Qris("qris", "QRIS / E-Wallet", "Scan the QRIS placeholder and simulate payment confirmation."),
    VirtualAccount("virtual_account", "Virtual Account", "Transfer to virtual account 8808 0000 77291."),
    Card("card", "Debit / Credit Card", "Use mock card ending 4242 for simulation only.")
}

enum class NotificationType(val label: String) {
    Booking("Booking"),
    Payment("Payment"),
    Promo("Promo"),
    System("System")
}

data class User(
    val id: String,
    val name: String,
    val emailOrPhone: String,
    val membershipLabel: String,
    val avatarInitials: String
)

data class Venue(
    val id: String,
    val name: String,
    val sportCategory: String,
    val location: String,
    val priceRange: String,
    val rating: Double,
    val description: String,
    val imagePlaceholder: String,
    val availableStatus: String,
    val facilities: List<String>,
    val featured: Boolean = false
)

data class Court(
    val id: String,
    val venueId: String,
    val name: String,
    val surfaceLabel: String
)

data class Slot(
    val id: String,
    val venueId: String,
    val courtId: String,
    val date: String,
    val dateLabel: String,
    val startTime: String,
    val endTime: String,
    val price: Int,
    val status: SlotAvailability
) {
    val timeRange: String
        get() = "$startTime - $endTime"

    val priceLabel: String
        get() = MockSportcationData.formatRupiah(price)
}

data class Voucher(
    val id: String,
    val code: String,
    val description: String,
    val discountAmount: Int,
    val enabled: Boolean
) {
    val discountLabel: String
        get() = MockSportcationData.formatRupiah(discountAmount)
}

data class Payment(
    val id: String,
    val method: PaymentMethod,
    val status: PaymentStatus,
    val amount: Int
) {
    val amountLabel: String
        get() = MockSportcationData.formatRupiah(amount)
}

data class CheckoutSummary(
    val id: String,
    val user: User,
    val venue: Venue,
    val court: Court,
    val slot: Slot,
    val platformFee: Int,
    val adminFee: Int,
    val voucher: Voucher?,
    val paymentMethods: List<PaymentMethod>
) {
    val courtFee: Int
        get() = slot.price

    val voucherDiscount: Int
        get() = voucher?.takeIf { it.enabled }?.discountAmount ?: 0

    val totalAmount: Int
        get() = courtFee + platformFee + adminFee - voucherDiscount

    val courtFeeLabel: String
        get() = MockSportcationData.formatRupiah(courtFee)

    val platformFeeLabel: String
        get() = MockSportcationData.formatRupiah(platformFee)

    val adminFeeLabel: String
        get() = MockSportcationData.formatRupiah(adminFee)

    val totalAmountLabel: String
        get() = MockSportcationData.formatRupiah(totalAmount)
}

data class Booking(
    val id: String,
    val bookingCode: String,
    val userId: String,
    val venue: Venue,
    val court: Court,
    val slot: Slot,
    val payment: Payment,
    val bookingStatus: BookingStatus
) {
    val venueId: String
        get() = venue.id

    val venueName: String
        get() = venue.name

    val sportCategory: String
        get() = venue.sportCategory

    val location: String
        get() = venue.location

    val courtName: String
        get() = court.name

    val date: String
        get() = slot.date

    val dateLabel: String
        get() = slot.dateLabel

    val timeRange: String
        get() = slot.timeRange

    val priceLabel: String
        get() = payment.amountLabel

    val paymentStatus: PaymentStatus
        get() = payment.status
}

data class Notification(
    val id: String,
    val type: NotificationType,
    val title: String,
    val message: String,
    val timestampLabel: String,
    val isRead: Boolean
)

object MockSportcationData {
    val user = User(
        id = "user-alex-sporta",
        name = "Alex Sporta",
        emailOrPhone = "alex@sportcation.app",
        membershipLabel = "Sportcation Starter Member",
        avatarInitials = "AS"
    )

    val venues = listOf(
        Venue(
            id = "padelhub-jakarta",
            name = "PadelHub Jakarta",
            sportCategory = "Padel",
            location = "Jakarta Selatan",
            priceRange = "Rp 350.000 - 450.000/hour",
            rating = 4.9,
            description = "Premium indoor padel venue with well-lit courts, locker access, and fast check-in flow.",
            imagePlaceholder = "Padel court image",
            availableStatus = "Available today",
            facilities = listOf("Indoor", "Parking", "Locker", "Shower"),
            featured = true
        ),
        Venue(
            id = "arena-soccer-park",
            name = "Arena Soccer Park",
            sportCategory = "Futsal",
            location = "Tebet",
            priceRange = "Rp 275.000 - 325.000/hour",
            rating = 4.7,
            description = "Compact futsal park for evening sessions, team practice, and casual weekend matches.",
            imagePlaceholder = "Futsal field image",
            availableStatus = "Few slots left",
            facilities = listOf("Outdoor", "Parking", "Cafe")
        ),
        Venue(
            id = "rally-tennis-club",
            name = "Rally Tennis Club",
            sportCategory = "Tennis",
            location = "Senayan",
            priceRange = "Rp 220.000 - 300.000/hour",
            rating = 4.8,
            description = "Tennis club with accessible courts, coaching-friendly facilities, and bright night sessions.",
            imagePlaceholder = "Tennis court image",
            availableStatus = "Available today",
            facilities = listOf("Coach", "Locker", "Lighting"),
            featured = true
        ),
        Venue(
            id = "smash-badminton-house",
            name = "Smash Badminton House",
            sportCategory = "Badminton",
            location = "Kelapa Gading",
            priceRange = "Rp 120.000 - 180.000/hour",
            rating = 4.6,
            description = "Indoor badminton venue for solo practice, doubles matches, and quick after-work sessions.",
            imagePlaceholder = "Badminton court image",
            availableStatus = "Available tomorrow",
            facilities = listOf("Indoor", "Shop", "Shower")
        ),
        Venue(
            id = "hooplab-senayan",
            name = "HoopLab Senayan",
            sportCategory = "Basketball",
            location = "Senayan",
            priceRange = "Rp 300.000 - 500.000/hour",
            rating = 4.5,
            description = "Basketball court rental with lighting, parking, and flexible slots for small groups.",
            imagePlaceholder = "Basketball court image",
            availableStatus = "Limited availability",
            facilities = listOf("Indoor", "Lighting", "Parking")
        )
    )

    val courts = listOf(
        Court("padelhub-jakarta-court-1", "padelhub-jakarta", "Court 1", "Indoor"),
        Court("padelhub-jakarta-court-2", "padelhub-jakarta", "Court 2", "Indoor"),
        Court("arena-soccer-park-court-1", "arena-soccer-park", "Field A", "Outdoor"),
        Court("arena-soccer-park-court-2", "arena-soccer-park", "Field B", "Outdoor"),
        Court("rally-tennis-club-court-1", "rally-tennis-club", "Court A", "Hard court"),
        Court("rally-tennis-club-court-2", "rally-tennis-club", "Court B", "Hard court"),
        Court("smash-badminton-house-court-1", "smash-badminton-house", "Court 1", "Indoor"),
        Court("smash-badminton-house-court-2", "smash-badminton-house", "Court 2", "Indoor"),
        Court("hooplab-senayan-court-1", "hooplab-senayan", "Half Court", "Indoor"),
        Court("hooplab-senayan-court-2", "hooplab-senayan", "Full Court", "Indoor")
    )

    val dateOptions = listOf(
        "2026-06-03" to "Today",
        "2026-06-04" to "Tomorrow",
        "2026-06-05" to "Jun 5"
    )

    val dateLabels = dateOptions.map { it.second }
    val sportCategories = listOf("All") + venues.map { it.sportCategory }.distinct()

    val vouchers = listOf(
        Voucher(
            id = "voucher-placeholder",
            code = "SPORTCATION",
            description = "Voucher placeholder reserved for a later sprint.",
            discountAmount = 25000,
            enabled = false
        )
    )

    val paymentMethods = PaymentMethod.values().toList()

    val notifications = listOf(
        Notification(
            id = "notification-booking-confirmed",
            type = NotificationType.Booking,
            title = "Booking confirmed",
            message = "Your PadelHub Jakarta session is ready for check-in.",
            timestampLabel = "2m ago",
            isRead = false
        ),
        Notification(
            id = "notification-payment-success",
            type = NotificationType.Payment,
            title = "Payment successful",
            message = "Payment for SP-77291 has been marked as paid.",
            timestampLabel = "15m ago",
            isRead = false
        ),
        Notification(
            id = "notification-promo",
            type = NotificationType.Promo,
            title = "Weekend court promo",
            message = "Promo placeholder for future voucher and campaign flows.",
            timestampLabel = "1h ago",
            isRead = true
        ),
        Notification(
            id = "notification-system",
            type = NotificationType.System,
            title = "Sportcation MVP update",
            message = "Profile and settings screens are available as mock UI.",
            timestampLabel = "Yesterday",
            isRead = true
        )
    )

    val bookings = listOf(
        bookingForCheckout(
            slotId = "padelhub-jakarta-padelhub-jakarta-court-1-today-2",
            paymentMethodId = PaymentMethod.Qris.id,
            paymentStatus = PaymentStatus.Paid
        ).copy(
            id = "booking-77291",
            bookingCode = "SP-77291"
        ),
        bookingForCheckout(
            slotId = "rally-tennis-club-rally-tennis-club-court-2-tomorrow-3",
            paymentMethodId = PaymentMethod.VirtualAccount.id,
            paymentStatus = PaymentStatus.Paid,
            bookingStatus = BookingStatus.Completed
        ).copy(
            id = "booking-55210",
            bookingCode = "SP-55210"
        ),
        bookingForCheckout(
            slotId = "arena-soccer-park-arena-soccer-park-court-1-jun-5-4",
            paymentMethodId = PaymentMethod.Card.id,
            paymentStatus = PaymentStatus.Failed,
            bookingStatus = BookingStatus.Cancelled
        ).copy(
            id = "booking-33418",
            bookingCode = "SP-33418"
        )
    )

    val latestBooking: Booking = bookings.first()

    fun findVenue(id: String): Venue {
        return venues.firstOrNull { it.id == id } ?: venues.first()
    }

    fun findCourt(id: String): Court {
        return courts.firstOrNull { it.id == id } ?: courts.first()
    }

    fun courtsForVenue(venueId: String): List<Court> {
        return courts.filter { it.venueId == venueId }
    }

    fun slotsForVenue(
        venueId: String,
        courtId: String,
        dateLabel: String
    ): List<Slot> {
        val date = dateOptions.firstOrNull { it.second == dateLabel }?.first ?: dateOptions.first().first
        val basePrice = basePriceForVenue(venueId)
        val template = when (dateLabel) {
            "Tomorrow" -> listOf(
                Triple("08:00", "09:00", SlotAvailability.Available),
                Triple("09:00", "10:00", SlotAvailability.Available),
                Triple("10:00", "11:00", SlotAvailability.Available),
                Triple("16:00", "17:00", SlotAvailability.Unavailable),
                Triple("17:00", "18:00", SlotAvailability.Available),
                Triple("18:00", "19:00", SlotAvailability.Available)
            )
            "Jun 5" -> listOf(
                Triple("07:00", "08:00", SlotAvailability.Available),
                Triple("08:00", "09:00", SlotAvailability.Unavailable),
                Triple("14:00", "15:00", SlotAvailability.Available),
                Triple("15:00", "16:00", SlotAvailability.Available),
                Triple("19:00", "20:00", SlotAvailability.Unavailable),
                Triple("20:00", "21:00", SlotAvailability.Available)
            )
            else -> listOf(
                Triple("08:00", "09:00", SlotAvailability.Available),
                Triple("09:00", "10:00", SlotAvailability.Unavailable),
                Triple("10:00", "11:00", SlotAvailability.Available),
                Triple("11:00", "12:00", SlotAvailability.Available),
                Triple("15:00", "16:00", SlotAvailability.Unavailable),
                Triple("16:00", "17:00", SlotAvailability.Available)
            )
        }

        return template.mapIndexed { index, (startTime, endTime, status) ->
            Slot(
                id = "$venueId-$courtId-${dateLabel.lowercase().replace(" ", "-")}-$index",
                venueId = venueId,
                courtId = courtId,
                date = date,
                dateLabel = dateLabel,
                startTime = startTime,
                endTime = endTime,
                price = basePrice + if (courtId.endsWith("2")) 50000 else 0,
                status = status
            )
        }
    }

    fun previewSlotsForVenue(venueId: String): List<Slot> {
        val firstCourt = courtsForVenue(venueId).firstOrNull() ?: return emptyList()
        return slotsForVenue(
            venueId = venueId,
            courtId = firstCourt.id,
            dateLabel = dateLabels.first()
        ).take(3)
    }

    fun findSlot(id: String): Slot {
        return venues
            .flatMap { venue -> courtsForVenue(venue.id) }
            .flatMap { court ->
                dateLabels.flatMap { dateLabel ->
                    slotsForVenue(
                        venueId = court.venueId,
                        courtId = court.id,
                        dateLabel = dateLabel
                    )
                }
            }
            .firstOrNull { it.id == id }
            ?: previewSlotsForVenue(venues.first().id).first()
    }

    fun checkoutSummaryForSlot(slotId: String): CheckoutSummary {
        val slot = findSlot(slotId)
        return CheckoutSummary(
            id = "checkout-$slotId",
            user = user,
            venue = findVenue(slot.venueId),
            court = findCourt(slot.courtId),
            slot = slot,
            platformFee = 15000,
            adminFee = 5000,
            voucher = vouchers.firstOrNull(),
            paymentMethods = paymentMethods
        )
    }

    fun findPaymentMethod(id: String): PaymentMethod {
        return paymentMethods.firstOrNull { it.id == id } ?: paymentMethods.first()
    }

    fun paymentForCheckout(
        slotId: String,
        paymentMethodId: String,
        status: PaymentStatus
    ): Payment {
        val summary = checkoutSummaryForSlot(slotId)
        return Payment(
            id = "payment-$slotId",
            method = findPaymentMethod(paymentMethodId),
            status = status,
            amount = summary.totalAmount
        )
    }

    fun bookingForCheckout(
        slotId: String,
        paymentMethodId: String,
        paymentStatus: PaymentStatus = PaymentStatus.Paid,
        bookingStatus: BookingStatus = BookingStatus.Upcoming
    ): Booking {
        val summary = checkoutSummaryForSlot(slotId)
        return Booking(
            id = "booking_${slotId}_method_$paymentMethodId",
            bookingCode = bookingCodeForSlot(slotId),
            userId = summary.user.id,
            venue = summary.venue,
            court = summary.court,
            slot = summary.slot,
            payment = paymentForCheckout(slotId, paymentMethodId, paymentStatus),
            bookingStatus = bookingStatus
        )
    }

    fun findBooking(id: String): Booking {
        return bookings.firstOrNull { it.id == id }
            ?: parseCheckoutBookingId(id)?.let { (slotId, paymentMethodId) ->
                bookingForCheckout(slotId, paymentMethodId)
            }
            ?: latestBooking
    }

    fun bookingsByStatus(status: BookingStatus): List<Booking> {
        return bookings.filter { it.bookingStatus == status }
    }

    fun formatRupiah(amount: Int): String {
        val raw = amount.toString().reversed().chunked(3).joinToString(".").reversed()
        return "Rp $raw"
    }

    private fun bookingCodeForSlot(slotId: String): String {
        val numericCode = ((slotId.hashCode() and 0x7fffffff) % 90000) + 10000
        return "SP-$numericCode"
    }

    private fun parseCheckoutBookingId(id: String): Pair<String, String>? {
        if (!id.startsWith("booking_")) return null

        val parts = id
            .removePrefix("booking_")
            .split("_method_", limit = 2)

        if (parts.size != 2) return null

        return parts[0] to parts[1]
    }

    private fun basePriceForVenue(venueId: String): Int {
        return when (venueId) {
            "padelhub-jakarta" -> 350000
            "arena-soccer-park" -> 275000
            "rally-tennis-club" -> 220000
            "smash-badminton-house" -> 120000
            "hooplab-senayan" -> 300000
            else -> 250000
        }
    }
}
