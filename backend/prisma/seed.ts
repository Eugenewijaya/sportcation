import {
  BookingItemStatus,
  BookingStatus,
  CourtStatus,
  NotificationType,
  PaymentMethod,
  PaymentProvider,
  PaymentStatus,
  PrismaClient,
  SlotStatus,
  UserRole,
  UserStatus,
  VenueStatus,
  VoucherDiscountType,
  VoucherStatus,
  WalletStatus
} from '@prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import 'dotenv/config';

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error('DATABASE_URL is required to run the Sportcation seed script.');
}

const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

const ids = {
  demoUser: '11111111-1111-4111-8111-111111111111',
  demoProfile: '11111111-1111-4111-8111-111111111112',
  demoWallet: '11111111-1111-4111-8111-111111111113',
  padel: '22222222-2222-4222-8222-222222222201',
  futsal: '22222222-2222-4222-8222-222222222202',
  tennis: '22222222-2222-4222-8222-222222222203',
  badminton: '22222222-2222-4222-8222-222222222204',
  basketball: '22222222-2222-4222-8222-222222222205',
  gym: '22222222-2222-4222-8222-222222222206',
  golf: '22222222-2222-4222-8222-222222222207',
  squash: '22222222-2222-4222-8222-222222222208',
  indoor: '33333333-3333-4333-8333-333333333301',
  parking: '33333333-3333-4333-8333-333333333302',
  locker: '33333333-3333-4333-8333-333333333303',
  shower: '33333333-3333-4333-8333-333333333304',
  cafe: '33333333-3333-4333-8333-333333333305',
  coach: '33333333-3333-4333-8333-333333333306',
  lighting: '33333333-3333-4333-8333-333333333307',
  shop: '33333333-3333-4333-8333-333333333308',
  padelVenue: '44444444-4444-4444-8444-444444444401',
  futsalVenue: '44444444-4444-4444-8444-444444444402',
  tennisVenue: '44444444-4444-4444-8444-444444444403',
  padelCourtOne: '55555555-5555-4555-8555-555555555501',
  padelCourtTwo: '55555555-5555-4555-8555-555555555502',
  futsalCourtA: '55555555-5555-4555-8555-555555555503',
  tennisCourtA: '55555555-5555-4555-8555-555555555504',
  confirmedSlot: '66666666-6666-4666-8666-666666666601',
  availableSlot: '66666666-6666-4666-8666-666666666602',
  heldSlot: '66666666-6666-4666-8666-666666666603',
  confirmedBooking: '77777777-7777-4777-8777-777777777701',
  pendingBooking: '77777777-7777-4777-8777-777777777702',
  confirmedBookingItem: '88888888-8888-4888-8888-888888888801',
  pendingBookingItem: '88888888-8888-4888-8888-888888888802',
  confirmedPayment: '99999999-9999-4999-8999-999999999901',
  pendingPayment: '99999999-9999-4999-8999-999999999902',
  voucher: 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaa1',
  notificationBooking: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb1',
  notificationPayment: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb2',
  notificationPromo: 'bbbbbbbb-bbbb-4bbb-8bbb-bbbbbbbbbbb3'
};

async function main() {
  await seedSportCategories();
  await seedFacilities();
  await seedUser();
  await seedVenues();
  await seedCourts();
  await seedVenueImages();
  await seedVenueFacilities();
  await seedSlots();
  await seedVoucher();
  await seedBookings();
  await seedNotifications();
}

async function seedSportCategories() {
  const categories = [
    { id: ids.padel, name: 'Padel', slug: 'padel', sortOrder: 1 },
    { id: ids.futsal, name: 'Futsal', slug: 'futsal', sortOrder: 2 },
    { id: ids.tennis, name: 'Tennis', slug: 'tennis', sortOrder: 3 },
    { id: ids.badminton, name: 'Badminton', slug: 'badminton', sortOrder: 4 },
    { id: ids.basketball, name: 'Basketball', slug: 'basketball', sortOrder: 5 },
    { id: ids.gym, name: 'Gym', slug: 'gym', sortOrder: 6 },
    { id: ids.golf, name: 'Golf', slug: 'golf', sortOrder: 7 },
    { id: ids.squash, name: 'Squash', slug: 'squash', sortOrder: 8 }
  ];

  for (const category of categories) {
    await prisma.sportCategory.upsert({
      where: { slug: category.slug },
      update: {
        name: category.name,
        sortOrder: category.sortOrder,
        isActive: true
      },
      create: {
        ...category,
        description: `${category.name} venue category for Sportcation MVP.`,
        isActive: true
      }
    });
  }
}

async function seedFacilities() {
  const facilities = [
    { id: ids.indoor, name: 'Indoor', slug: 'indoor', iconKey: 'building' },
    { id: ids.parking, name: 'Parking', slug: 'parking', iconKey: 'parking' },
    { id: ids.locker, name: 'Locker', slug: 'locker', iconKey: 'lock' },
    { id: ids.shower, name: 'Shower', slug: 'shower', iconKey: 'shower' },
    { id: ids.cafe, name: 'Cafe', slug: 'cafe', iconKey: 'coffee' },
    { id: ids.coach, name: 'Coach', slug: 'coach', iconKey: 'whistle' },
    { id: ids.lighting, name: 'Lighting', slug: 'lighting', iconKey: 'lamp' },
    { id: ids.shop, name: 'Shop', slug: 'shop', iconKey: 'shopping-bag' }
  ];

  for (const facility of facilities) {
    await prisma.facility.upsert({
      where: { slug: facility.slug },
      update: {
        name: facility.name,
        iconKey: facility.iconKey
      },
      create: facility
    });
  }
}

async function seedUser() {
  await prisma.user.upsert({
    where: {
      authProvider_authProviderUserId: {
        authProvider: 'firebase',
        authProviderUserId: 'demo-firebase-user-001'
      }
    },
    update: {
      email: 'alex@sportcation.app',
      phone: '+6281112345678',
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      lastLoginAt: new Date('2026-06-03T02:30:00.000Z')
    },
    create: {
      id: ids.demoUser,
      authProvider: 'firebase',
      authProviderUserId: 'demo-firebase-user-001',
      email: 'alex@sportcation.app',
      phone: '+6281112345678',
      role: UserRole.USER,
      status: UserStatus.ACTIVE,
      lastLoginAt: new Date('2026-06-03T02:30:00.000Z')
    }
  });

  await prisma.userProfile.upsert({
    where: { userId: ids.demoUser },
    update: {
      displayName: 'Alex Sporta',
      city: 'Jakarta',
      preferredSportCategoryId: ids.padel,
      notificationEnabled: true
    },
    create: {
      id: ids.demoProfile,
      userId: ids.demoUser,
      displayName: 'Alex Sporta',
      city: 'Jakarta',
      preferredSportCategoryId: ids.padel,
      notificationEnabled: true
    }
  });

  await prisma.wallet.upsert({
    where: { userId: ids.demoUser },
    update: {
      balance: 0,
      currency: 'IDR',
      status: WalletStatus.ACTIVE
    },
    create: {
      id: ids.demoWallet,
      userId: ids.demoUser,
      balance: 0,
      currency: 'IDR',
      status: WalletStatus.ACTIVE
    }
  });
}

async function seedVenues() {
  const venues = [
    {
      id: ids.padelVenue,
      sportCategoryId: ids.padel,
      name: 'PadelHub Jakarta',
      slug: 'padelhub-jakarta',
      description: 'Premium indoor padel venue with bright courts, locker access, and fast check-in flow.',
      addressLine: 'Jl. Kemang Raya No. 12',
      city: 'Jakarta',
      district: 'Jakarta Selatan',
      province: 'DKI Jakarta',
      postalCode: '12730',
      latitude: '-6.260000',
      longitude: '106.810000',
      basePrice: 350000,
      ratingAverage: '4.90',
      ratingCount: 124
    },
    {
      id: ids.futsalVenue,
      sportCategoryId: ids.futsal,
      name: 'Arena Soccer Park',
      slug: 'arena-soccer-park',
      description: 'Compact futsal park for evening sessions, team practice, and casual weekend matches.',
      addressLine: 'Jl. Tebet Barat Dalam No. 20',
      city: 'Jakarta',
      district: 'Tebet',
      province: 'DKI Jakarta',
      postalCode: '12810',
      latitude: '-6.232000',
      longitude: '106.850000',
      basePrice: 275000,
      ratingAverage: '4.70',
      ratingCount: 88
    },
    {
      id: ids.tennisVenue,
      sportCategoryId: ids.tennis,
      name: 'Rally Tennis Club',
      slug: 'rally-tennis-club',
      description: 'Tennis club with accessible courts, coaching-friendly facilities, and bright night sessions.',
      addressLine: 'Jl. Asia Afrika No. 8',
      city: 'Jakarta',
      district: 'Senayan',
      province: 'DKI Jakarta',
      postalCode: '10270',
      latitude: '-6.219000',
      longitude: '106.802000',
      basePrice: 220000,
      ratingAverage: '4.80',
      ratingCount: 96
    }
  ];

  for (const venue of venues) {
    await prisma.venue.upsert({
      where: { slug: venue.slug },
      update: {
        sportCategoryId: venue.sportCategoryId,
        name: venue.name,
        description: venue.description,
        addressLine: venue.addressLine,
        city: venue.city,
        district: venue.district,
        province: venue.province,
        postalCode: venue.postalCode,
        latitude: venue.latitude,
        longitude: venue.longitude,
        basePrice: venue.basePrice,
        currency: 'IDR',
        ratingAverage: venue.ratingAverage,
        ratingCount: venue.ratingCount,
        status: VenueStatus.ACTIVE,
        deletedAt: null
      },
      create: {
        ...venue,
        currency: 'IDR',
        status: VenueStatus.ACTIVE
      }
    });
  }
}

async function seedCourts() {
  const courts = [
    {
      id: ids.padelCourtOne,
      venueId: ids.padelVenue,
      sportCategoryId: ids.padel,
      name: 'Court 1',
      description: 'Indoor padel court for standard booking.',
      pricePerHour: 350000,
      isIndoor: true
    },
    {
      id: ids.padelCourtTwo,
      venueId: ids.padelVenue,
      sportCategoryId: ids.padel,
      name: 'Court 2',
      description: 'Indoor padel court with premium lighting.',
      pricePerHour: 400000,
      isIndoor: true
    },
    {
      id: ids.futsalCourtA,
      venueId: ids.futsalVenue,
      sportCategoryId: ids.futsal,
      name: 'Field A',
      description: 'Outdoor futsal field for team sessions.',
      pricePerHour: 275000,
      isIndoor: false
    },
    {
      id: ids.tennisCourtA,
      venueId: ids.tennisVenue,
      sportCategoryId: ids.tennis,
      name: 'Court A',
      description: 'Hard court tennis surface.',
      pricePerHour: 220000,
      isIndoor: false
    }
  ];

  for (const court of courts) {
    await prisma.court.upsert({
      where: {
        venueId_name: {
          venueId: court.venueId,
          name: court.name
        }
      },
      update: {
        sportCategoryId: court.sportCategoryId,
        description: court.description,
        pricePerHour: court.pricePerHour,
        currency: 'IDR',
        isIndoor: court.isIndoor,
        status: CourtStatus.ACTIVE,
        deletedAt: null
      },
      create: {
        ...court,
        currency: 'IDR',
        status: CourtStatus.ACTIVE
      }
    });
  }
}

async function seedVenueImages() {
  const images = [
    {
      id: '12121212-1212-4121-8121-121212121201',
      venueId: ids.padelVenue,
      courtId: ids.padelCourtOne,
      url: 'https://cdn.sportcation.example/venues/padelhub-jakarta.jpg',
      altText: 'PadelHub Jakarta indoor court',
      isPrimary: true
    },
    {
      id: '12121212-1212-4121-8121-121212121202',
      venueId: ids.futsalVenue,
      courtId: ids.futsalCourtA,
      url: 'https://cdn.sportcation.example/venues/arena-soccer-park.jpg',
      altText: 'Arena Soccer Park futsal field',
      isPrimary: true
    },
    {
      id: '12121212-1212-4121-8121-121212121203',
      venueId: ids.tennisVenue,
      courtId: ids.tennisCourtA,
      url: 'https://cdn.sportcation.example/venues/rally-tennis-club.jpg',
      altText: 'Rally Tennis Club court',
      isPrimary: true
    }
  ];

  for (const image of images) {
    await prisma.venueImage.upsert({
      where: { id: image.id },
      update: image,
      create: image
    });
  }
}

async function seedVenueFacilities() {
  const venueFacilities = [
    { venueId: ids.padelVenue, facilityId: ids.indoor },
    { venueId: ids.padelVenue, facilityId: ids.parking },
    { venueId: ids.padelVenue, facilityId: ids.locker },
    { venueId: ids.padelVenue, facilityId: ids.shower },
    { venueId: ids.futsalVenue, facilityId: ids.parking },
    { venueId: ids.futsalVenue, facilityId: ids.cafe },
    { venueId: ids.futsalVenue, facilityId: ids.lighting },
    { venueId: ids.tennisVenue, facilityId: ids.coach },
    { venueId: ids.tennisVenue, facilityId: ids.locker },
    { venueId: ids.tennisVenue, facilityId: ids.lighting }
  ];

  await prisma.venueFacility.createMany({
    data: venueFacilities,
    skipDuplicates: true
  });
}

async function seedSlots() {
  const slots = [
    {
      id: ids.confirmedSlot,
      courtId: ids.padelCourtOne,
      startAt: new Date('2026-06-10T03:00:00.000Z'),
      endAt: new Date('2026-06-10T04:00:00.000Z'),
      price: 350000,
      status: SlotStatus.BOOKED
    },
    {
      id: ids.availableSlot,
      courtId: ids.padelCourtTwo,
      startAt: new Date('2026-06-10T04:00:00.000Z'),
      endAt: new Date('2026-06-10T05:00:00.000Z'),
      price: 400000,
      status: SlotStatus.AVAILABLE
    },
    {
      id: ids.heldSlot,
      courtId: ids.tennisCourtA,
      startAt: new Date('2026-06-11T09:00:00.000Z'),
      endAt: new Date('2026-06-11T10:00:00.000Z'),
      price: 220000,
      status: SlotStatus.HELD,
      holdExpiresAt: new Date('2026-06-11T08:45:00.000Z')
    },
    {
      id: '66666666-6666-4666-8666-666666666604',
      courtId: ids.futsalCourtA,
      startAt: new Date('2026-06-12T12:00:00.000Z'),
      endAt: new Date('2026-06-12T13:00:00.000Z'),
      price: 275000,
      status: SlotStatus.AVAILABLE
    }
  ];

  for (const slot of slots) {
    await prisma.slot.upsert({
      where: {
        courtId_startAt_endAt: {
          courtId: slot.courtId,
          startAt: slot.startAt,
          endAt: slot.endAt
        }
      },
      update: {
        price: slot.price,
        currency: 'IDR',
        status: slot.status,
        holdExpiresAt: slot.holdExpiresAt ?? null
      },
      create: {
        ...slot,
        currency: 'IDR',
        holdExpiresAt: slot.holdExpiresAt ?? null
      }
    });
  }
}

async function seedVoucher() {
  await prisma.voucher.upsert({
    where: { code: 'SPORT10' },
    update: {
      name: 'Sportcation Launch Promo',
      description: 'Sample voucher for later voucher API work.',
      discountType: VoucherDiscountType.PERCENTAGE,
      discountValue: 10,
      maxDiscountAmount: 35000,
      minPurchaseAmount: 100000,
      usageLimit: 100,
      status: VoucherStatus.ACTIVE
    },
    create: {
      id: ids.voucher,
      code: 'SPORT10',
      name: 'Sportcation Launch Promo',
      description: 'Sample voucher for later voucher API work.',
      discountType: VoucherDiscountType.PERCENTAGE,
      discountValue: 10,
      maxDiscountAmount: 35000,
      minPurchaseAmount: 100000,
      usageLimit: 100,
      status: VoucherStatus.ACTIVE,
      startsAt: new Date('2026-06-01T00:00:00.000Z'),
      endsAt: new Date('2026-07-01T00:00:00.000Z')
    }
  });
}

async function seedBookings() {
  await prisma.booking.upsert({
    where: { id: ids.confirmedBooking },
    update: {
      bookingCode: 'SP-77291',
      status: BookingStatus.CONFIRMED,
      subtotalAmount: 350000,
      serviceFeeAmount: 15000,
      discountAmount: 0,
      totalAmount: 365000,
      confirmedAt: new Date('2026-06-03T03:05:00.000Z')
    },
    create: {
      id: ids.confirmedBooking,
      bookingCode: 'SP-77291',
      userId: ids.demoUser,
      status: BookingStatus.CONFIRMED,
      subtotalAmount: 350000,
      serviceFeeAmount: 15000,
      discountAmount: 0,
      totalAmount: 365000,
      currency: 'IDR',
      confirmedAt: new Date('2026-06-03T03:05:00.000Z')
    }
  });

  await prisma.bookingItem.upsert({
    where: { slotId: ids.confirmedSlot },
    update: {
      bookingId: ids.confirmedBooking,
      venueId: ids.padelVenue,
      courtId: ids.padelCourtOne,
      sportCategoryId: ids.padel,
      startAt: new Date('2026-06-10T03:00:00.000Z'),
      endAt: new Date('2026-06-10T04:00:00.000Z'),
      unitPrice: 350000,
      status: BookingItemStatus.CONFIRMED
    },
    create: {
      id: ids.confirmedBookingItem,
      bookingId: ids.confirmedBooking,
      venueId: ids.padelVenue,
      courtId: ids.padelCourtOne,
      slotId: ids.confirmedSlot,
      sportCategoryId: ids.padel,
      startAt: new Date('2026-06-10T03:00:00.000Z'),
      endAt: new Date('2026-06-10T04:00:00.000Z'),
      unitPrice: 350000,
      status: BookingItemStatus.CONFIRMED
    }
  });

  await prisma.payment.upsert({
    where: { id: ids.confirmedPayment },
    update: {
      bookingId: ids.confirmedBooking,
      userId: ids.demoUser,
      provider: PaymentProvider.SIMULATION,
      method: PaymentMethod.QRIS,
      amount: 365000,
      status: PaymentStatus.SUCCEEDED,
      paidAt: new Date('2026-06-03T03:05:00.000Z')
    },
    create: {
      id: ids.confirmedPayment,
      bookingId: ids.confirmedBooking,
      userId: ids.demoUser,
      provider: PaymentProvider.SIMULATION,
      method: PaymentMethod.QRIS,
      amount: 365000,
      currency: 'IDR',
      status: PaymentStatus.SUCCEEDED,
      providerReference: 'sim_SP-77291',
      paidAt: new Date('2026-06-03T03:05:00.000Z')
    }
  });

  await prisma.booking.upsert({
    where: { id: ids.pendingBooking },
    update: {
      status: BookingStatus.PENDING_PAYMENT,
      subtotalAmount: 220000,
      serviceFeeAmount: 15000,
      discountAmount: 0,
      totalAmount: 235000,
      expiresAt: new Date('2026-06-11T08:45:00.000Z')
    },
    create: {
      id: ids.pendingBooking,
      userId: ids.demoUser,
      status: BookingStatus.PENDING_PAYMENT,
      subtotalAmount: 220000,
      serviceFeeAmount: 15000,
      discountAmount: 0,
      totalAmount: 235000,
      currency: 'IDR',
      expiresAt: new Date('2026-06-11T08:45:00.000Z')
    }
  });

  await prisma.bookingItem.upsert({
    where: { slotId: ids.heldSlot },
    update: {
      bookingId: ids.pendingBooking,
      venueId: ids.tennisVenue,
      courtId: ids.tennisCourtA,
      sportCategoryId: ids.tennis,
      startAt: new Date('2026-06-11T09:00:00.000Z'),
      endAt: new Date('2026-06-11T10:00:00.000Z'),
      unitPrice: 220000,
      status: BookingItemStatus.PENDING
    },
    create: {
      id: ids.pendingBookingItem,
      bookingId: ids.pendingBooking,
      venueId: ids.tennisVenue,
      courtId: ids.tennisCourtA,
      slotId: ids.heldSlot,
      sportCategoryId: ids.tennis,
      startAt: new Date('2026-06-11T09:00:00.000Z'),
      endAt: new Date('2026-06-11T10:00:00.000Z'),
      unitPrice: 220000,
      status: BookingItemStatus.PENDING
    }
  });

  await prisma.payment.upsert({
    where: { id: ids.pendingPayment },
    update: {
      bookingId: ids.pendingBooking,
      userId: ids.demoUser,
      provider: PaymentProvider.SIMULATION,
      method: PaymentMethod.VIRTUAL_ACCOUNT,
      amount: 235000,
      status: PaymentStatus.PENDING
    },
    create: {
      id: ids.pendingPayment,
      bookingId: ids.pendingBooking,
      userId: ids.demoUser,
      provider: PaymentProvider.SIMULATION,
      method: PaymentMethod.VIRTUAL_ACCOUNT,
      amount: 235000,
      currency: 'IDR',
      status: PaymentStatus.PENDING,
      providerReference: 'sim_pending_84520'
    }
  });
}

async function seedNotifications() {
  const notifications = [
    {
      id: ids.notificationBooking,
      type: NotificationType.BOOKING_CONFIRMED,
      title: 'Booking confirmed',
      message: 'Your PadelHub Jakarta session is confirmed.',
      relatedEntityType: 'booking',
      relatedEntityId: ids.confirmedBooking,
      isRead: false
    },
    {
      id: ids.notificationPayment,
      type: NotificationType.PAYMENT_SUCCEEDED,
      title: 'Payment successful',
      message: 'Payment for SP-77291 has been marked as paid.',
      relatedEntityType: 'payment',
      relatedEntityId: ids.confirmedPayment,
      isRead: false
    },
    {
      id: ids.notificationPromo,
      type: NotificationType.PROMO,
      title: 'Launch voucher available',
      message: 'SPORT10 is seeded as a sample voucher for future voucher API work.',
      relatedEntityType: 'voucher',
      relatedEntityId: ids.voucher,
      isRead: true
    }
  ];

  for (const notification of notifications) {
    await prisma.notification.upsert({
      where: { id: notification.id },
      update: {
        type: notification.type,
        title: notification.title,
        message: notification.message,
        relatedEntityType: notification.relatedEntityType,
        relatedEntityId: notification.relatedEntityId,
        isRead: notification.isRead,
        readAt: notification.isRead ? new Date('2026-06-03T04:00:00.000Z') : null
      },
      create: {
        ...notification,
        userId: ids.demoUser,
        readAt: notification.isRead ? new Date('2026-06-03T04:00:00.000Z') : null
      }
    });
  }
}

main()
  .then(async () => {
    console.log('Sportcation seed data completed.');
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
