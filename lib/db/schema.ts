import { relations, sql } from "drizzle-orm"
import { index, integer, primaryKey, sqliteTable, text, uniqueIndex, real } from "drizzle-orm/sqlite-core"

const timestamps = {
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}

export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull().default("Sportcation User"),
    email: text("email"),
    emailVerified: integer("email_verified", { mode: "boolean" }).notNull().default(false),
    image: text("image"),
    phone: text("phone"),
    role: text("role", { enum: ["customer", "merchant_owner", "merchant_staff", "admin"] })
      .notNull()
      .default("customer"),
    status: text("status", { enum: ["active", "pending", "restricted", "disabled"] })
      .notNull()
      .default("active"),
    authCreatedAt: integer("auth_created_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .default(sql`0`)
      .notNull(),
    authUpdatedAt: integer("auth_updated_at", { mode: "timestamp" })
      .$defaultFn(() => new Date())
      .default(sql`0`)
      .notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("users_email_unique").on(table.email),
    uniqueIndex("users_phone_unique").on(table.phone),
    index("users_role_status_idx").on(table.role, table.status),
  ],
)

export const authSessions = sqliteTable(
  "auth_sessions",
  {
    id: text("id").primaryKey(),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    token: text("token").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
    ipAddress: text("ip_address"),
    userAgent: text("user_agent"),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
  },
  (table) => [
    uniqueIndex("auth_sessions_token_unique").on(table.token),
    index("auth_sessions_user_idx").on(table.userId),
    index("auth_sessions_expiry_idx").on(table.expiresAt),
  ],
)

export const authAccounts = sqliteTable(
  "auth_accounts",
  {
    id: text("id").primaryKey(),
    accountId: text("account_id").notNull(),
    providerId: text("provider_id").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    accessToken: text("access_token"),
    refreshToken: text("refresh_token"),
    idToken: text("id_token"),
    accessTokenExpiresAt: integer("access_token_expires_at", { mode: "timestamp" }),
    refreshTokenExpiresAt: integer("refresh_token_expires_at", { mode: "timestamp" }),
    scope: text("scope"),
    password: text("password"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  },
  (table) => [
    uniqueIndex("auth_accounts_provider_account_unique").on(table.providerId, table.accountId),
    index("auth_accounts_user_idx").on(table.userId),
  ],
)

export const authVerifications = sqliteTable(
  "auth_verifications",
  {
    id: text("id").primaryKey(),
    identifier: text("identifier").notNull(),
    value: text("value").notNull(),
    expiresAt: integer("expires_at", { mode: "timestamp" }).notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull(),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull(),
  },
  (table) => [
    index("auth_verifications_identifier_idx").on(table.identifier),
    index("auth_verifications_expiry_idx").on(table.expiresAt),
  ],
)

export const authRateLimits = sqliteTable(
  "auth_rate_limits",
  {
    id: text("id").primaryKey(),
    key: text("key").notNull(),
    count: integer("count").notNull(),
    lastRequest: integer("last_request", { mode: "number" }).notNull(),
  },
  (table) => [uniqueIndex("auth_rate_limits_key_unique").on(table.key)],
)

export const userProfiles = sqliteTable("user_profiles", {
  userId: text("user_id")
    .primaryKey()
    .references(() => users.id, { onDelete: "cascade" }),
  fullName: text("full_name").notNull(),
  avatarUrl: text("avatar_url"),
  city: text("city"),
  ...timestamps,
})

export const merchantProfiles = sqliteTable(
  "merchant_profiles",
  {
    id: text("id").primaryKey(),
    ownerUserId: text("owner_user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    businessName: text("business_name").notNull(),
    legalName: text("legal_name"),
    status: text("status", { enum: ["draft", "review", "verified", "suspended"] })
      .notNull()
      .default("draft"),
    ktpUrl: text("ktp_url"),
    npwpUrl: text("npwp_url"),
    businessLicenseUrl: text("business_license_url"),
    ...timestamps,
  },
  (table) => [
    index("merchant_profiles_owner_idx").on(table.ownerUserId),
    index("merchant_profiles_status_idx").on(table.status),
  ],
)

export const merchantMembers = sqliteTable(
  "merchant_members",
  {
    merchantId: text("merchant_id")
      .notNull()
      .references(() => merchantProfiles.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role", { enum: ["owner", "manager", "staff", "finance", "viewer"] }).notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    primaryKey({ columns: [table.merchantId, table.userId] }),
    index("merchant_members_user_idx").on(table.userId),
  ],
)

export const sportCategories = sqliteTable(
  "sport_categories",
  {
    id: text("id").primaryKey(),
    slug: text("slug").notNull(),
    name: text("name").notNull(),
    icon: text("icon"),
    sortOrder: integer("sort_order").notNull().default(0),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("sport_categories_slug_unique").on(table.slug),
    index("sport_categories_active_idx").on(table.isActive, table.sortOrder),
  ],
)

export const venues = sqliteTable(
  "venues",
  {
    id: text("id").primaryKey(),
    merchantId: text("merchant_id")
      .notNull()
      .references(() => merchantProfiles.id, { onDelete: "restrict" }),
    categoryId: text("category_id")
      .notNull()
      .references(() => sportCategories.id, { onDelete: "restrict" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    address: text("address").notNull(),
    city: text("city").notNull(),
    area: text("area"),
    latitude: real("latitude"),
    longitude: real("longitude"),
    priceFrom: integer("price_from").notNull().default(0),
    rating: integer("rating").notNull().default(0),
    reviewCount: integer("review_count").notNull().default(0),
    imageUrl: text("image_url"),
    status: text("status", { enum: ["draft", "review", "published", "rejected", "archived"] })
      .notNull()
      .default("draft"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("venues_slug_unique").on(table.slug),
    index("venues_merchant_idx").on(table.merchantId),
    index("venues_category_status_idx").on(table.categoryId, table.status),
    index("venues_city_area_idx").on(table.city, table.area),
  ],
)

export const courts = sqliteTable(
  "courts",
  {
    id: text("id").primaryKey(),
    venueId: text("venue_id")
      .notNull()
      .references(() => venues.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    surface: text("surface"),
    isIndoor: integer("is_indoor", { mode: "boolean" }).notNull().default(false),
    status: text("status", { enum: ["active", "maintenance", "hidden"] })
      .notNull()
      .default("active"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("courts_venue_name_unique").on(table.venueId, table.name),
    index("courts_venue_status_idx").on(table.venueId, table.status),
  ],
)

export const slots = sqliteTable(
  "slots",
  {
    id: text("id").primaryKey(),
    venueId: text("venue_id")
      .notNull()
      .references(() => venues.id, { onDelete: "cascade" }),
    courtId: text("court_id")
      .notNull()
      .references(() => courts.id, { onDelete: "cascade" }),
    slotDate: text("slot_date").notNull(),
    startTime: text("start_time").notNull(),
    endTime: text("end_time").notNull(),
    price: integer("price").notNull(),
    status: text("status", { enum: ["available", "booked", "blocked", "expired"] })
      .notNull()
      .default("available"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("slots_court_date_time_unique").on(table.courtId, table.slotDate, table.startTime, table.endTime),
    index("slots_venue_date_status_idx").on(table.venueId, table.slotDate, table.status),
    index("slots_court_date_idx").on(table.courtId, table.slotDate),
  ],
)

export const bookings = sqliteTable(
  "bookings",
  {
    id: text("id").primaryKey(),
    bookingCode: text("booking_code").notNull(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    venueId: text("venue_id")
      .notNull()
      .references(() => venues.id, { onDelete: "restrict" }),
    status: text("status", {
      enum: ["pending_payment", "confirmed", "checked_in", "completed", "cancelled", "refunded"],
    })
      .notNull()
      .default("pending_payment"),
    source: text("source", { enum: ["online", "pos"] })
      .notNull()
      .default("online"),
    subtotal: integer("subtotal").notNull(),
    platformFee: integer("platform_fee").notNull().default(0),
    totalAmount: integer("total_amount").notNull(),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("bookings_code_unique").on(table.bookingCode),
    index("bookings_user_status_idx").on(table.userId, table.status),
    index("bookings_venue_status_idx").on(table.venueId, table.status),
  ],
)

export const bookingItems = sqliteTable(
  "booking_items",
  {
    id: text("id").primaryKey(),
    bookingId: text("booking_id")
      .notNull()
      .references(() => bookings.id, { onDelete: "cascade" }),
    slotId: text("slot_id")
      .notNull()
      .references(() => slots.id, { onDelete: "restrict" }),
    courtName: text("court_name").notNull(),
    slotDate: text("slot_date").notNull(),
    startTime: text("start_time").notNull(),
    endTime: text("end_time").notNull(),
    price: integer("price").notNull(),
    ...timestamps,
  },
  (table) => [
  ]
)

export const auctionBids = sqliteTable(
  "auction_bids",
  {
    id: text("id").primaryKey(),
    auctionId: text("auction_id")
      .notNull()
      .references(() => auctions.id),
    bidderId: text("bidder_id")
      .notNull()
      .references(() => users.id),
    amount: integer("amount").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
  },
  (table) => [
    index("auction_bids_auction_id_idx").on(table.auctionId),
  ]
)

export const resellsRelations = relations(resells, ({ one }) => ({
  booking: one(bookings, { fields: [resells.bookingId], references: [bookings.id] }),
  seller: one(users, { fields: [resells.sellerId], references: [users.id] }),
  buyer: one(users, { fields: [resells.buyerId], references: [users.id] }),
}))

export const auctionsRelations = relations(auctions, ({ one, many }) => ({
  booking: one(bookings, { fields: [auctions.bookingId], references: [bookings.id] }),
  seller: one(users, { fields: [auctions.sellerId], references: [users.id] }),
  winner: one(users, { fields: [auctions.winnerId], references: [users.id] }),
  bids: many(auctionBids),
}))

export const auctionBidsRelations = relations(auctionBids, ({ one }) => ({
  auction: one(auctions, { fields: [auctionBids.auctionId], references: [auctions.id] }),
  bidder: one(users, { fields: [auctionBids.bidderId], references: [users.id] }),
}))

export const userWallets = sqliteTable(
  "user_wallets",
  {
    userId: text("user_id").primaryKey().references(() => users.id),
    availableBalance: integer("available_balance").notNull().default(0),
    pendingBalance: integer("pending_balance").notNull().default(0),
    pinCode: text("pin_code"),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
  }
)

export const ledgerTransactions = sqliteTable(
  "ledger_transactions",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id),
    type: text("type", { enum: ["booking_credit", "fee_deduction", "withdrawal", "resell_credit", "auction_credit", "refund"] }).notNull(),
    amount: integer("amount").notNull(),
    balanceType: text("balance_type", { enum: ["available", "pending"] }).notNull(),
    referenceId: text("reference_id").notNull(),
    description: text("description").notNull(),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
  },
  (table) => [
    index("ledger_user_idx").on(table.userId),
    index("ledger_type_idx").on(table.type),
    index("ledger_ref_idx").on(table.referenceId),
  ]
)

export const withdrawals = sqliteTable(
  "withdrawals",
  {
    id: text("id").primaryKey(),
    userId: text("user_id").notNull().references(() => users.id),
    amount: integer("amount").notNull(),
    adminFee: integer("admin_fee").notNull().default(2500),
    netAmount: integer("net_amount").notNull(),
    bankName: text("bank_name").notNull(),
    accountNumber: text("account_number").notNull(),
    accountHolder: text("account_holder").notNull(),
    status: text("status", { enum: ["pending", "processing", "completed", "rejected"] }).notNull().default("pending"),
    rejectedReason: text("rejected_reason"),
    processedAt: integer("processed_at", { mode: "timestamp" }),
    createdAt: integer("created_at", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
    updatedAt: integer("updated_at", { mode: "timestamp" }).notNull().default(sql`(strftime('%s', 'now'))`),
  },
  (table) => [
    index("withdrawals_user_idx").on(table.userId),
    index("withdrawals_status_idx").on(table.status),
  ]
)

export const userWalletsRelations = relations(userWallets, ({ one, many }) => ({
  user: one(users, { fields: [userWallets.userId], references: [users.id] }),
  transactions: many(ledgerTransactions),
  withdrawals: many(withdrawals),
}))

export const ledgerTransactionsRelations = relations(ledgerTransactions, ({ one }) => ({
  user: one(users, { fields: [ledgerTransactions.userId], references: [users.id] }),
  wallet: one(userWallets, { fields: [ledgerTransactions.userId], references: [userWallets.userId] }),
}))

export const withdrawalsRelations = relations(withdrawals, ({ one }) => ({
  user: one(users, { fields: [withdrawals.userId], references: [users.id] }),
}))
export const promoBanners = sqliteTable(
  "promo_banners",
  {
    id: text("id").primaryKey(),
    title: text("title").notNull(),
    imageUrl: text("image_url").notNull(),
    termsAndConditions: text("terms_and_conditions"),
    linkUrl: text("link_url"),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    sortOrder: integer("sort_order").notNull().default(0),
    ...timestamps,
  },
  (table) => [
    index("promo_banners_active_sort_idx").on(table.isActive, table.sortOrder),
  ]
)
