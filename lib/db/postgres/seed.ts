import "dotenv/config"
import { getDb } from "./index"
import {
  auctions,
  bids,
  bookingItems,
  bookings,
  cmsEntries,
  courts,
  facilities,
  merchantMembers,
  merchantProfiles,
  notifications,
  payments,
  slots,
  sportCategories,
  userProfiles,
  users,
  venueFacilities,
  venueImages,
  venues,
  vouchers,
  walletTransactions,
  wallets,
} from "./schema"

const ids = {
  adminUser: "00000000-0000-4000-8000-000000000001",
  merchantUser: "00000000-0000-4000-8000-000000000002",
  customerUser: "00000000-0000-4000-8000-000000000003",
  merchant: "10000000-0000-4000-8000-000000000001",
  padelCategory: "20000000-0000-4000-8000-000000000001",
  tennisCategory: "20000000-0000-4000-8000-000000000002",
  futsalCategory: "20000000-0000-4000-8000-000000000003",
  golfCategory: "20000000-0000-4000-8000-000000000004",
  parkingFacility: "30000000-0000-4000-8000-000000000001",
  lockerFacility: "30000000-0000-4000-8000-000000000002",
  showerFacility: "30000000-0000-4000-8000-000000000003",
  cafeFacility: "30000000-0000-4000-8000-000000000004",
  venue: "40000000-0000-4000-8000-000000000001",
  court: "50000000-0000-4000-8000-000000000001",
  slotAvailable: "60000000-0000-4000-8000-000000000001",
  slotBooked: "60000000-0000-4000-8000-000000000002",
  booking: "70000000-0000-4000-8000-000000000001",
  bookingItem: "71000000-0000-4000-8000-000000000001",
  payment: "72000000-0000-4000-8000-000000000001",
  wallet: "73000000-0000-4000-8000-000000000001",
  walletTransaction: "74000000-0000-4000-8000-000000000001",
  auction: "75000000-0000-4000-8000-000000000001",
  bid: "76000000-0000-4000-8000-000000000001",
  notificationBooking: "77000000-0000-4000-8000-000000000001",
  notificationPromo: "77000000-0000-4000-8000-000000000002",
  voucher: "78000000-0000-4000-8000-000000000001",
  cmsHomeFlash: "79000000-0000-4000-8000-000000000001",
}

async function seedSportcation() {
  const db = getDb()

  await db
    .insert(users)
    .values([
      { id: ids.adminUser, email: "admin@sportcation.local", role: "admin", status: "active" },
      { id: ids.merchantUser, email: "merchant@sportcation.local", role: "merchant_owner", status: "active" },
      { id: ids.customerUser, email: "customer@sportcation.local", role: "customer", status: "active" },
    ])
    .onConflictDoNothing()

  await db
    .insert(userProfiles)
    .values([
      { userId: ids.adminUser, fullName: "Sportcation Admin", city: "Jakarta" },
      { userId: ids.merchantUser, fullName: "Nadya Venue Ops", city: "Jakarta" },
      { userId: ids.customerUser, fullName: "Alex Rivera", city: "Jakarta", membershipTier: "pro", points: 8400 },
    ])
    .onConflictDoNothing()

  await db
    .insert(merchantProfiles)
    .values({
      id: ids.merchant,
      ownerUserId: ids.merchantUser,
      businessName: "Padel Arena Partner",
      legalName: "PT Padel Arena Indonesia",
      status: "verified",
      bankName: "BCA",
      bankAccountName: "PT Padel Arena Indonesia",
    })
    .onConflictDoNothing()

  await db
    .insert(merchantMembers)
    .values({ merchantId: ids.merchant, userId: ids.merchantUser, role: "owner", acceptedAt: new Date() })
    .onConflictDoNothing()

  await db
    .insert(sportCategories)
    .values([
      { id: ids.padelCategory, slug: "padel", name: "Padel", sortOrder: 1 },
      { id: ids.tennisCategory, slug: "tennis", name: "Tennis", sortOrder: 2 },
      { id: ids.futsalCategory, slug: "futsal", name: "Futsal", sortOrder: 3 },
      { id: ids.golfCategory, slug: "golf", name: "Golf", sortOrder: 4 },
    ])
    .onConflictDoNothing()

  await db
    .insert(facilities)
    .values([
      { id: ids.parkingFacility, slug: "parking", name: "Parking", icon: "car" },
      { id: ids.lockerFacility, slug: "locker", name: "Locker", icon: "lock-keyhole" },
      { id: ids.showerFacility, slug: "shower", name: "Shower", icon: "shower-head" },
      { id: ids.cafeFacility, slug: "cafe", name: "Cafe", icon: "coffee" },
    ])
    .onConflictDoNothing()

  await db
    .insert(venues)
    .values({
      id: ids.venue,
      merchantId: ids.merchant,
      categoryId: ids.padelCategory,
      name: "Padel Arena",
      slug: "padel-arena-kebayoran-baru",
      description: "Premium indoor padel venue prepared for the Sportcation MVP.",
      address: "Jl. Suryo No. 12, Kebayoran Baru",
      city: "Jakarta",
      area: "Jakarta Selatan",
      latitude: "-6.2400000",
      longitude: "106.8100000",
      priceFrom: 350000,
      rating: "4.90",
      reviewCount: 124,
      status: "published",
    })
    .onConflictDoNothing()

  await db
    .insert(courts)
    .values({
      id: ids.court,
      venueId: ids.venue,
      name: "Court 04",
      surface: "Premium indoor turf",
      isIndoor: true,
      status: "active",
    })
    .onConflictDoNothing()

  await db
    .insert(venueImages)
    .values({
      venueId: ids.venue,
      url: "/padel-court-modern.jpg",
      alt: "Padel Arena indoor court",
      isCover: true,
    })
    .onConflictDoNothing()

  await db
    .insert(venueFacilities)
    .values([
      { venueId: ids.venue, facilityId: ids.parkingFacility },
      { venueId: ids.venue, facilityId: ids.lockerFacility },
      { venueId: ids.venue, facilityId: ids.showerFacility },
      { venueId: ids.venue, facilityId: ids.cafeFacility },
    ])
    .onConflictDoNothing()

  await db
    .insert(slots)
    .values([
      {
        id: ids.slotAvailable,
        venueId: ids.venue,
        courtId: ids.court,
        slotDate: "2026-06-15",
        startTime: "08:00:00",
        endTime: "09:00:00",
        price: 350000,
        status: "available",
      },
      {
        id: ids.slotBooked,
        venueId: ids.venue,
        courtId: ids.court,
        slotDate: "2026-06-15",
        startTime: "10:00:00",
        endTime: "11:00:00",
        price: 350000,
        status: "booked",
      },
    ])
    .onConflictDoNothing()

  await db
    .insert(bookings)
    .values({
      id: ids.booking,
      bookingCode: "SP-77291",
      userId: ids.customerUser,
      venueId: ids.venue,
      status: "confirmed",
      source: "direct",
      subtotal: 350000,
      platformFee: 15000,
      totalAmount: 365000,
      qrPayload: "sportcation:booking:SP-77291",
    })
    .onConflictDoNothing()

  await db
    .insert(bookingItems)
    .values({
      id: ids.bookingItem,
      bookingId: ids.booking,
      slotId: ids.slotBooked,
      courtName: "Court 04",
      slotDate: "2026-06-15",
      startTime: "10:00:00",
      endTime: "11:00:00",
      price: 350000,
    })
    .onConflictDoNothing()

  await db
    .insert(payments)
    .values({
      id: ids.payment,
      bookingId: ids.booking,
      userId: ids.customerUser,
      method: "qris",
      status: "paid",
      providerReference: "SIM-QRIS-SP-77291",
      amount: 365000,
      paidAt: new Date(),
      rawPayload: { simulation: true },
    })
    .onConflictDoNothing()

  await db
    .insert(wallets)
    .values({ id: ids.wallet, userId: ids.customerUser, balance: 120000, status: "active" })
    .onConflictDoNothing()

  await db
    .insert(walletTransactions)
    .values({
      id: ids.walletTransaction,
      walletId: ids.wallet,
      bookingId: ids.booking,
      paymentId: ids.payment,
      type: "adjustment",
      direction: "credit",
      amount: 120000,
      status: "paid",
      notes: "Demo wallet balance",
    })
    .onConflictDoNothing()

  await db
    .insert(notifications)
    .values([
      {
        id: ids.notificationBooking,
        userId: ids.customerUser,
        type: "booking",
        title: "Booking Confirmed",
        body: "Your session at Padel Arena is confirmed.",
        actionUrl: "/?screen=bookings",
      },
      {
        id: ids.notificationPromo,
        userId: ids.customerUser,
        type: "promo",
        title: "Flash Sale Alert",
        body: "Limited Sportcation venue slots are now discounted.",
        actionUrl: "/?screen=flash",
      },
    ])
    .onConflictDoNothing()

  await db
    .insert(vouchers)
    .values({
      id: ids.voucher,
      code: "SPORTCATION40",
      title: "MVP Launch Voucher",
      discountType: "percentage",
      discountValue: 40,
      maxDiscount: 100000,
      usageLimit: 500,
      startsAt: new Date("2026-06-01T00:00:00.000Z"),
      endsAt: new Date("2026-07-01T00:00:00.000Z"),
      status: "active",
    })
    .onConflictDoNothing()

  await db
    .insert(auctions)
    .values({
      id: ids.auction,
      venueId: ids.venue,
      slotId: ids.slotAvailable,
      title: "Center Court - Prime Time Slot",
      startingPrice: 1000000,
      currentPrice: 1450000,
      status: "live",
      startsAt: new Date("2026-06-08T00:00:00.000Z"),
      endsAt: new Date("2026-06-15T00:00:00.000Z"),
    })
    .onConflictDoNothing()

  await db
    .insert(bids)
    .values({
      id: ids.bid,
      auctionId: ids.auction,
      bidderUserId: ids.customerUser,
      amount: 1450000,
      status: "leading",
    })
    .onConflictDoNothing()

  await db
    .insert(cmsEntries)
    .values({
      id: ids.cmsHomeFlash,
      key: "home-ultra-flash-sale",
      placement: "home",
      title: "Ultra Flash Sale",
      body: "Get up to 70% off selected sports venues.",
      status: "live",
      payload: { cta: "See all", route: "/?screen=flash" },
    })
    .onConflictDoNothing()

  console.log("Sportcation seed completed.")
}

seedSportcation().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
