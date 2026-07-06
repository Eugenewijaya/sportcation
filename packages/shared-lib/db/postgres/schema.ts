import { relations, sql } from "drizzle-orm"
import {
  boolean,
  check,
  date,
  index,
  integer,
  jsonb,
  numeric,
  pgEnum,
  pgTable,
  primaryKey,
  text,
  time,
  timestamp,
  uniqueIndex,
  uuid,
  varchar,
} from "drizzle-orm/pg-core"

export const userRoleEnum = pgEnum("user_role", [
  "customer",
  "merchant_owner",
  "merchant_staff",
  "admin",
  "finance_admin",
  "content_admin",
  "support_admin",
])

export const accountStatusEnum = pgEnum("account_status", ["active", "pending", "restricted", "disabled"])
export const merchantStatusEnum = pgEnum("merchant_status", ["draft", "review", "verified", "suspended"])
export const venueStatusEnum = pgEnum("venue_status", ["draft", "review", "published", "rejected", "archived"])
export const courtStatusEnum = pgEnum("court_status", ["active", "maintenance", "hidden"])
export const slotStatusEnum = pgEnum("slot_status", ["available", "booked", "blocked", "expired"])
export const bookingStatusEnum = pgEnum("booking_status", ["pending_payment", "confirmed", "checked_in", "completed", "cancelled", "refunded", "disputed"])
export const paymentMethodEnum = pgEnum("payment_method", ["qris", "virtual_account", "wallet", "manual"])
export const paymentStatusEnum = pgEnum("payment_status", ["pending", "paid", "failed", "expired", "refunded", "manual_review"])
export const voucherStatusEnum = pgEnum("voucher_status", ["draft", "active", "expired", "disabled"])
export const notificationTypeEnum = pgEnum("notification_type", ["booking", "payment", "promo", "system", "auction"])
export const listingStatusEnum = pgEnum("listing_status", ["draft", "active", "sold", "cancelled", "expired"])
export const auctionStatusEnum = pgEnum("auction_status", ["draft", "live", "ended", "cancelled"])
export const bidStatusEnum = pgEnum("bid_status", ["leading", "outbid", "won", "cancelled"])
export const walletStatusEnum = pgEnum("wallet_status", ["active", "frozen", "closed"])
export const walletTransactionTypeEnum = pgEnum("wallet_transaction_type", ["topup", "payment", "refund", "payout", "adjustment"])
export const transactionDirectionEnum = pgEnum("transaction_direction", ["credit", "debit"])
export const cmsStatusEnum = pgEnum("cms_status", ["draft", "live", "archived"])

const timestamps = {
  createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  updatedAt: timestamp("updated_at", { withTimezone: true }).defaultNow().notNull(),
}

export const users = pgTable(
  "users",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    email: varchar("email", { length: 255 }),
    phone: varchar("phone", { length: 32 }),
    passwordHash: text("password_hash"),
    role: userRoleEnum("role").default("customer").notNull(),
    status: accountStatusEnum("status").default("active").notNull(),
    emailVerifiedAt: timestamp("email_verified_at", { withTimezone: true }),
    phoneVerifiedAt: timestamp("phone_verified_at", { withTimezone: true }),
    lastLoginAt: timestamp("last_login_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("users_email_unique").on(table.email),
    uniqueIndex("users_phone_unique").on(table.phone),
    index("users_role_status_idx").on(table.role, table.status),
  ],
)

export const userProfiles = pgTable("user_profiles", {
  userId: uuid("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  fullName: varchar("full_name", { length: 160 }).notNull(),
  avatarUrl: text("avatar_url"),
  city: varchar("city", { length: 120 }),
  membershipTier: varchar("membership_tier", { length: 40 }).default("standard").notNull(),
  points: integer("points").default(0).notNull(),
  birthDate: date("birth_date"),
  ...timestamps,
})

export const merchantProfiles = pgTable(
  "merchant_profiles",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    ownerUserId: uuid("owner_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    businessName: varchar("business_name", { length: 180 }).notNull(),
    legalName: varchar("legal_name", { length: 180 }),
    taxId: varchar("tax_id", { length: 80 }),
    status: merchantStatusEnum("status").default("draft").notNull(),
    bankName: varchar("bank_name", { length: 120 }),
    bankAccountName: varchar("bank_account_name", { length: 160 }),
    bankAccountNumber: varchar("bank_account_number", { length: 80 }),
    ...timestamps,
  },
  (table) => [
    index("merchant_profiles_owner_idx").on(table.ownerUserId),
    index("merchant_profiles_status_idx").on(table.status),
  ],
)

export const merchantMembers = pgTable(
  "merchant_members",
  {
    merchantId: uuid("merchant_id")
      .notNull()
      .references(() => merchantProfiles.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: varchar("role", { length: 80 }).notNull(),
    invitedAt: timestamp("invited_at", { withTimezone: true }).defaultNow().notNull(),
    acceptedAt: timestamp("accepted_at", { withTimezone: true }),
  },
  (table) => [
    primaryKey({ columns: [table.merchantId, table.userId] }),
    index("merchant_members_user_idx").on(table.userId),
  ],
)

export const sportCategories = pgTable(
  "sport_categories",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: varchar("slug", { length: 80 }).notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    icon: varchar("icon", { length: 80 }),
    sortOrder: integer("sort_order").default(0).notNull(),
    isActive: boolean("is_active").default(true).notNull(),
    ...timestamps,
  },
  (table) => [uniqueIndex("sport_categories_slug_unique").on(table.slug), index("sport_categories_active_idx").on(table.isActive, table.sortOrder)],
)

export const venues = pgTable(
  "venues",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    merchantId: uuid("merchant_id")
      .notNull()
      .references(() => merchantProfiles.id, { onDelete: "restrict" }),
    categoryId: uuid("category_id")
      .notNull()
      .references(() => sportCategories.id, { onDelete: "restrict" }),
    name: varchar("name", { length: 180 }).notNull(),
    slug: varchar("slug", { length: 180 }).notNull(),
    description: text("description"),
    address: text("address").notNull(),
    city: varchar("city", { length: 120 }).notNull(),
    area: varchar("area", { length: 120 }),
    latitude: numeric("latitude", { precision: 10, scale: 7 }),
    longitude: numeric("longitude", { precision: 10, scale: 7 }),
    priceFrom: integer("price_from").default(0).notNull(),
    rating: numeric("rating", { precision: 3, scale: 2 }).default("0").notNull(),
    reviewCount: integer("review_count").default(0).notNull(),
    status: venueStatusEnum("status").default("draft").notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("venues_slug_unique").on(table.slug),
    index("venues_merchant_idx").on(table.merchantId),
    index("venues_category_status_idx").on(table.categoryId, table.status),
    index("venues_city_area_idx").on(table.city, table.area),
    index("venues_search_idx").on(table.name, table.city, table.area),
  ],
)

export const courts = pgTable(
  "courts",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    venueId: uuid("venue_id")
      .notNull()
      .references(() => venues.id, { onDelete: "cascade" }),
    name: varchar("name", { length: 120 }).notNull(),
    surface: varchar("surface", { length: 120 }),
    isIndoor: boolean("is_indoor").default(false).notNull(),
    status: courtStatusEnum("status").default("active").notNull(),
    ...timestamps,
  },
  (table) => [index("courts_venue_status_idx").on(table.venueId, table.status)],
)

export const venueImages = pgTable(
  "venue_images",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    venueId: uuid("venue_id")
      .notNull()
      .references(() => venues.id, { onDelete: "cascade" }),
    url: text("url").notNull(),
    alt: varchar("alt", { length: 180 }),
    sortOrder: integer("sort_order").default(0).notNull(),
    isCover: boolean("is_cover").default(false).notNull(),
    ...timestamps,
  },
  (table) => [index("venue_images_venue_sort_idx").on(table.venueId, table.sortOrder)],
)

export const facilities = pgTable(
  "facilities",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    slug: varchar("slug", { length: 80 }).notNull(),
    name: varchar("name", { length: 120 }).notNull(),
    icon: varchar("icon", { length: 80 }),
    ...timestamps,
  },
  (table) => [uniqueIndex("facilities_slug_unique").on(table.slug)],
)

export const venueFacilities = pgTable(
  "venue_facilities",
  {
    venueId: uuid("venue_id")
      .notNull()
      .references(() => venues.id, { onDelete: "cascade" }),
    facilityId: uuid("facility_id")
      .notNull()
      .references(() => facilities.id, { onDelete: "cascade" }),
  },
  (table) => [primaryKey({ columns: [table.venueId, table.facilityId] })],
)

export const slots = pgTable(
  "slots",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    venueId: uuid("venue_id")
      .notNull()
      .references(() => venues.id, { onDelete: "cascade" }),
    courtId: uuid("court_id")
      .notNull()
      .references(() => courts.id, { onDelete: "cascade" }),
    slotDate: date("slot_date").notNull(),
    startTime: time("start_time").notNull(),
    endTime: time("end_time").notNull(),
    price: integer("price").notNull(),
    status: slotStatusEnum("status").default("available").notNull(),
    holdExpiresAt: timestamp("hold_expires_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("slots_court_date_time_unique").on(table.courtId, table.slotDate, table.startTime, table.endTime),
    index("slots_venue_date_status_idx").on(table.venueId, table.slotDate, table.status),
    index("slots_court_date_idx").on(table.courtId, table.slotDate),
  ],
)

export const bookings = pgTable(
  "bookings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    bookingCode: varchar("booking_code", { length: 40 }).notNull(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    venueId: uuid("venue_id")
      .notNull()
      .references(() => venues.id, { onDelete: "restrict" }),
    status: bookingStatusEnum("status").default("pending_payment").notNull(),
    source: varchar("source", { length: 40 }).default("direct").notNull(),
    subtotal: integer("subtotal").default(0).notNull(),
    platformFee: integer("platform_fee").default(0).notNull(),
    discountAmount: integer("discount_amount").default(0).notNull(),
    totalAmount: integer("total_amount").default(0).notNull(),
    currency: varchar("currency", { length: 3 }).default("IDR").notNull(),
    qrPayload: text("qr_payload"),
    cancelledAt: timestamp("cancelled_at", { withTimezone: true }),
    completedAt: timestamp("completed_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("bookings_code_unique").on(table.bookingCode),
    index("bookings_user_status_idx").on(table.userId, table.status),
    index("bookings_venue_status_idx").on(table.venueId, table.status),
    index("bookings_created_idx").on(table.createdAt),
  ],
)

export const bookingItems = pgTable(
  "booking_items",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    bookingId: uuid("booking_id")
      .notNull()
      .references(() => bookings.id, { onDelete: "cascade" }),
    slotId: uuid("slot_id")
      .notNull()
      .references(() => slots.id, { onDelete: "restrict" }),
    courtName: varchar("court_name", { length: 120 }).notNull(),
    slotDate: date("slot_date").notNull(),
    startTime: time("start_time").notNull(),
    endTime: time("end_time").notNull(),
    price: integer("price").notNull(),
    ...timestamps,
  },
  (table) => [uniqueIndex("booking_items_slot_unique").on(table.slotId), index("booking_items_booking_idx").on(table.bookingId)],
)

export const payments = pgTable(
  "payments",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    bookingId: uuid("booking_id")
      .notNull()
      .references(() => bookings.id, { onDelete: "restrict" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    method: paymentMethodEnum("method").notNull(),
    status: paymentStatusEnum("status").default("pending").notNull(),
    providerReference: varchar("provider_reference", { length: 160 }),
    amount: integer("amount").notNull(),
    currency: varchar("currency", { length: 3 }).default("IDR").notNull(),
    paidAt: timestamp("paid_at", { withTimezone: true }),
    expiresAt: timestamp("expires_at", { withTimezone: true }),
    rawPayload: jsonb("raw_payload").$type<Record<string, unknown>>().default({}).notNull(),
    ...timestamps,
  },
  (table) => [
    index("payments_booking_idx").on(table.bookingId),
    index("payments_user_status_idx").on(table.userId, table.status),
    index("payments_provider_reference_idx").on(table.providerReference),
  ],
)

export const vouchers = pgTable(
  "vouchers",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    code: varchar("code", { length: 40 }).notNull(),
    title: varchar("title", { length: 160 }).notNull(),
    discountType: varchar("discount_type", { length: 40 }).notNull(),
    discountValue: integer("discount_value").notNull(),
    maxDiscount: integer("max_discount"),
    usageLimit: integer("usage_limit"),
    usedCount: integer("used_count").default(0).notNull(),
    startsAt: timestamp("starts_at", { withTimezone: true }),
    endsAt: timestamp("ends_at", { withTimezone: true }),
    status: voucherStatusEnum("status").default("draft").notNull(),
    ...timestamps,
  },
  (table) => [uniqueIndex("vouchers_code_unique").on(table.code), index("vouchers_status_dates_idx").on(table.status, table.startsAt, table.endsAt)],
)

export const notifications = pgTable(
  "notifications",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: notificationTypeEnum("type").notNull(),
    title: varchar("title", { length: 180 }).notNull(),
    body: text("body").notNull(),
    actionUrl: text("action_url"),
    readAt: timestamp("read_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [index("notifications_user_read_idx").on(table.userId, table.readAt), index("notifications_type_idx").on(table.type)],
)

export const reviews = pgTable(
  "reviews",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    bookingId: uuid("booking_id")
      .notNull()
      .references(() => bookings.id, { onDelete: "restrict" }),
    venueId: uuid("venue_id")
      .notNull()
      .references(() => venues.id, { onDelete: "cascade" }),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    rating: integer("rating").notNull(),
    comment: text("comment"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("reviews_booking_unique").on(table.bookingId),
    index("reviews_venue_idx").on(table.venueId),
    check("reviews_rating_range", sql`rating >= 1 and rating <= 5`),
  ],
)

export const resellListings = pgTable(
  "resell_listings",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    sellerUserId: uuid("seller_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    bookingItemId: uuid("booking_item_id")
      .notNull()
      .references(() => bookingItems.id, { onDelete: "restrict" }),
    listingPrice: integer("listing_price").notNull(),
    platformFee: integer("platform_fee").default(0).notNull(),
    allowNegotiation: boolean("allow_negotiation").default(false).notNull(),
    status: listingStatusEnum("status").default("draft").notNull(),
    publishedAt: timestamp("published_at", { withTimezone: true }),
    soldAt: timestamp("sold_at", { withTimezone: true }),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("resell_listings_booking_item_unique").on(table.bookingItemId),
    index("resell_listings_seller_status_idx").on(table.sellerUserId, table.status),
  ],
)

export const auctions = pgTable(
  "auctions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    venueId: uuid("venue_id")
      .notNull()
      .references(() => venues.id, { onDelete: "restrict" }),
    slotId: uuid("slot_id").references(() => slots.id, { onDelete: "restrict" }),
    title: varchar("title", { length: 180 }).notNull(),
    startingPrice: integer("starting_price").notNull(),
    currentPrice: integer("current_price").notNull(),
    status: auctionStatusEnum("status").default("draft").notNull(),
    startsAt: timestamp("starts_at", { withTimezone: true }).notNull(),
    endsAt: timestamp("ends_at", { withTimezone: true }).notNull(),
    ...timestamps,
  },
  (table) => [index("auctions_status_dates_idx").on(table.status, table.startsAt, table.endsAt), index("auctions_venue_idx").on(table.venueId)],
)

export const bids = pgTable(
  "bids",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    auctionId: uuid("auction_id")
      .notNull()
      .references(() => auctions.id, { onDelete: "cascade" }),
    bidderUserId: uuid("bidder_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    amount: integer("amount").notNull(),
    status: bidStatusEnum("status").default("leading").notNull(),
    ...timestamps,
  },
  (table) => [index("bids_auction_amount_idx").on(table.auctionId, table.amount), index("bids_bidder_idx").on(table.bidderUserId)],
)

export const wallets = pgTable(
  "wallets",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    balance: integer("balance").default(0).notNull(),
    currency: varchar("currency", { length: 3 }).default("IDR").notNull(),
    status: walletStatusEnum("status").default("active").notNull(),
    ...timestamps,
  },
  (table) => [uniqueIndex("wallets_user_unique").on(table.userId), index("wallets_status_idx").on(table.status)],
)

export const walletTransactions = pgTable(
  "wallet_transactions",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    walletId: uuid("wallet_id")
      .notNull()
      .references(() => wallets.id, { onDelete: "restrict" }),
    bookingId: uuid("booking_id").references(() => bookings.id, { onDelete: "set null" }),
    paymentId: uuid("payment_id").references(() => payments.id, { onDelete: "set null" }),
    type: walletTransactionTypeEnum("type").notNull(),
    direction: transactionDirectionEnum("direction").notNull(),
    amount: integer("amount").notNull(),
    status: paymentStatusEnum("status").default("pending").notNull(),
    notes: text("notes"),
    ...timestamps,
  },
  (table) => [index("wallet_transactions_wallet_idx").on(table.walletId, table.createdAt), index("wallet_transactions_booking_idx").on(table.bookingId)],
)

export const cmsEntries = pgTable(
  "cms_entries",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    key: varchar("key", { length: 120 }).notNull(),
    placement: varchar("placement", { length: 80 }).notNull(),
    title: varchar("title", { length: 180 }).notNull(),
    body: text("body"),
    status: cmsStatusEnum("status").default("draft").notNull(),
    payload: jsonb("payload").$type<Record<string, unknown>>().default({}).notNull(),
    ...timestamps,
  },
  (table) => [uniqueIndex("cms_entries_key_unique").on(table.key), index("cms_entries_placement_status_idx").on(table.placement, table.status)],
)

export const auditLogs = pgTable(
  "audit_logs",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    actorUserId: uuid("actor_user_id").references(() => users.id, { onDelete: "set null" }),
    action: varchar("action", { length: 120 }).notNull(),
    entityType: varchar("entity_type", { length: 120 }).notNull(),
    entityId: varchar("entity_id", { length: 120 }),
    metadata: jsonb("metadata").$type<Record<string, unknown>>().default({}).notNull(),
    createdAt: timestamp("created_at", { withTimezone: true }).defaultNow().notNull(),
  },
  (table) => [index("audit_logs_actor_idx").on(table.actorUserId), index("audit_logs_entity_idx").on(table.entityType, table.entityId), index("audit_logs_created_idx").on(table.createdAt)],
)

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles),
  merchantProfile: one(merchantProfiles, {
    fields: [users.id],
    references: [merchantProfiles.ownerUserId],
  }),
  bookings: many(bookings),
  notifications: many(notifications),
  reviews: many(reviews),
  wallet: one(wallets),
}))

export const userProfilesRelations = relations(userProfiles, ({ one }) => ({
  user: one(users, {
    fields: [userProfiles.userId],
    references: [users.id],
  }),
}))

export const merchantProfilesRelations = relations(merchantProfiles, ({ one, many }) => ({
  owner: one(users, {
    fields: [merchantProfiles.ownerUserId],
    references: [users.id],
  }),
  members: many(merchantMembers),
  venues: many(venues),
}))

export const merchantMembersRelations = relations(merchantMembers, ({ one }) => ({
  merchant: one(merchantProfiles, {
    fields: [merchantMembers.merchantId],
    references: [merchantProfiles.id],
  }),
  user: one(users, {
    fields: [merchantMembers.userId],
    references: [users.id],
  }),
}))

export const sportCategoriesRelations = relations(sportCategories, ({ many }) => ({
  venues: many(venues),
}))

export const venuesRelations = relations(venues, ({ one, many }) => ({
  merchant: one(merchantProfiles, {
    fields: [venues.merchantId],
    references: [merchantProfiles.id],
  }),
  category: one(sportCategories, {
    fields: [venues.categoryId],
    references: [sportCategories.id],
  }),
  courts: many(courts),
  images: many(venueImages),
  facilities: many(venueFacilities),
  slots: many(slots),
  bookings: many(bookings),
  reviews: many(reviews),
}))

export const courtsRelations = relations(courts, ({ one, many }) => ({
  venue: one(venues, {
    fields: [courts.venueId],
    references: [venues.id],
  }),
  slots: many(slots),
}))

export const venueImagesRelations = relations(venueImages, ({ one }) => ({
  venue: one(venues, {
    fields: [venueImages.venueId],
    references: [venues.id],
  }),
}))

export const facilitiesRelations = relations(facilities, ({ many }) => ({
  venues: many(venueFacilities),
}))

export const venueFacilitiesRelations = relations(venueFacilities, ({ one }) => ({
  venue: one(venues, {
    fields: [venueFacilities.venueId],
    references: [venues.id],
  }),
  facility: one(facilities, {
    fields: [venueFacilities.facilityId],
    references: [facilities.id],
  }),
}))

export const slotsRelations = relations(slots, ({ one, many }) => ({
  venue: one(venues, {
    fields: [slots.venueId],
    references: [venues.id],
  }),
  court: one(courts, {
    fields: [slots.courtId],
    references: [courts.id],
  }),
  bookingItems: many(bookingItems),
}))

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  user: one(users, {
    fields: [bookings.userId],
    references: [users.id],
  }),
  venue: one(venues, {
    fields: [bookings.venueId],
    references: [venues.id],
  }),
  items: many(bookingItems),
  payments: many(payments),
}))

export const bookingItemsRelations = relations(bookingItems, ({ one, many }) => ({
  booking: one(bookings, {
    fields: [bookingItems.bookingId],
    references: [bookings.id],
  }),
  slot: one(slots, {
    fields: [bookingItems.slotId],
    references: [slots.id],
  }),
  resellListings: many(resellListings),
}))

export const paymentsRelations = relations(payments, ({ one, many }) => ({
  booking: one(bookings, {
    fields: [payments.bookingId],
    references: [bookings.id],
  }),
  user: one(users, {
    fields: [payments.userId],
    references: [users.id],
  }),
  walletTransactions: many(walletTransactions),
}))

export const notificationsRelations = relations(notifications, ({ one }) => ({
  user: one(users, {
    fields: [notifications.userId],
    references: [users.id],
  }),
}))

export const reviewsRelations = relations(reviews, ({ one }) => ({
  booking: one(bookings, {
    fields: [reviews.bookingId],
    references: [bookings.id],
  }),
  venue: one(venues, {
    fields: [reviews.venueId],
    references: [venues.id],
  }),
  user: one(users, {
    fields: [reviews.userId],
    references: [users.id],
  }),
}))

export const resellListingsRelations = relations(resellListings, ({ one }) => ({
  seller: one(users, {
    fields: [resellListings.sellerUserId],
    references: [users.id],
  }),
  bookingItem: one(bookingItems, {
    fields: [resellListings.bookingItemId],
    references: [bookingItems.id],
  }),
}))

export const auctionsRelations = relations(auctions, ({ one, many }) => ({
  venue: one(venues, {
    fields: [auctions.venueId],
    references: [venues.id],
  }),
  slot: one(slots, {
    fields: [auctions.slotId],
    references: [slots.id],
  }),
  bids: many(bids),
}))

export const bidsRelations = relations(bids, ({ one }) => ({
  auction: one(auctions, {
    fields: [bids.auctionId],
    references: [auctions.id],
  }),
  bidder: one(users, {
    fields: [bids.bidderUserId],
    references: [users.id],
  }),
}))

export const walletsRelations = relations(wallets, ({ one, many }) => ({
  user: one(users, {
    fields: [wallets.userId],
    references: [users.id],
  }),
  transactions: many(walletTransactions),
}))

export const walletTransactionsRelations = relations(walletTransactions, ({ one }) => ({
  wallet: one(wallets, {
    fields: [walletTransactions.walletId],
    references: [wallets.id],
  }),
  booking: one(bookings, {
    fields: [walletTransactions.bookingId],
    references: [bookings.id],
  }),
  payment: one(payments, {
    fields: [walletTransactions.paymentId],
    references: [payments.id],
  }),
}))
