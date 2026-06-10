import { relations, sql } from "drizzle-orm"
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core"

const timestamps = {
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
}

export const users = sqliteTable(
  "users",
  {
    id: text("id").primaryKey(),
    email: text("email"),
    phone: text("phone"),
    role: text("role", { enum: ["customer", "merchant_owner", "merchant_staff", "admin"] })
      .notNull()
      .default("customer"),
    status: text("status", { enum: ["active", "pending", "restricted", "disabled"] })
      .notNull()
      .default("active"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("users_email_unique").on(table.email),
    uniqueIndex("users_phone_unique").on(table.phone),
    index("users_role_status_idx").on(table.role, table.status),
  ],
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
    ...timestamps,
  },
  (table) => [
    index("merchant_profiles_owner_idx").on(table.ownerUserId),
    index("merchant_profiles_status_idx").on(table.status),
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
    uniqueIndex("booking_items_slot_unique").on(table.slotId),
    index("booking_items_booking_idx").on(table.bookingId),
  ],
)

export const payments = sqliteTable(
  "payments",
  {
    id: text("id").primaryKey(),
    bookingId: text("booking_id")
      .notNull()
      .references(() => bookings.id, { onDelete: "restrict" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "restrict" }),
    method: text("method", { enum: ["qris", "virtual_account", "wallet", "manual"] }).notNull(),
    status: text("status", { enum: ["pending", "paid", "failed", "expired", "refunded"] })
      .notNull()
      .default("pending"),
    amount: integer("amount").notNull(),
    providerReference: text("provider_reference"),
    paidAt: text("paid_at"),
    ...timestamps,
  },
  (table) => [
    uniqueIndex("payments_booking_unique").on(table.bookingId),
    index("payments_user_status_idx").on(table.userId, table.status),
  ],
)

export const notifications = sqliteTable(
  "notifications",
  {
    id: text("id").primaryKey(),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    type: text("type", { enum: ["booking", "payment", "promo", "system", "auction"] }).notNull(),
    title: text("title").notNull(),
    body: text("body").notNull(),
    actionUrl: text("action_url"),
    readAt: text("read_at"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("notifications_user_read_idx").on(table.userId, table.readAt, table.createdAt)],
)

export const auditLogs = sqliteTable(
  "audit_logs",
  {
    id: text("id").primaryKey(),
    actorUserId: text("actor_user_id").references(() => users.id, { onDelete: "set null" }),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id"),
    metadata: text("metadata", { mode: "json" }).$type<Record<string, unknown> | null>(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("audit_logs_entity_idx").on(table.entityType, table.entityId),
    index("audit_logs_actor_created_idx").on(table.actorUserId, table.createdAt),
  ],
)

export const usersRelations = relations(users, ({ one, many }) => ({
  profile: one(userProfiles, { fields: [users.id], references: [userProfiles.userId] }),
  merchant: one(merchantProfiles, { fields: [users.id], references: [merchantProfiles.ownerUserId] }),
  bookings: many(bookings),
  notifications: many(notifications),
}))

export const merchantProfilesRelations = relations(merchantProfiles, ({ one, many }) => ({
  owner: one(users, { fields: [merchantProfiles.ownerUserId], references: [users.id] }),
  venues: many(venues),
}))

export const sportCategoriesRelations = relations(sportCategories, ({ many }) => ({ venues: many(venues) }))

export const venuesRelations = relations(venues, ({ one, many }) => ({
  merchant: one(merchantProfiles, { fields: [venues.merchantId], references: [merchantProfiles.id] }),
  category: one(sportCategories, { fields: [venues.categoryId], references: [sportCategories.id] }),
  courts: many(courts),
  slots: many(slots),
  bookings: many(bookings),
}))

export const courtsRelations = relations(courts, ({ one, many }) => ({
  venue: one(venues, { fields: [courts.venueId], references: [venues.id] }),
  slots: many(slots),
}))

export const slotsRelations = relations(slots, ({ one, many }) => ({
  venue: one(venues, { fields: [slots.venueId], references: [venues.id] }),
  court: one(courts, { fields: [slots.courtId], references: [courts.id] }),
  bookingItems: many(bookingItems),
}))

export const bookingsRelations = relations(bookings, ({ one, many }) => ({
  user: one(users, { fields: [bookings.userId], references: [users.id] }),
  venue: one(venues, { fields: [bookings.venueId], references: [venues.id] }),
  items: many(bookingItems),
  payments: many(payments),
}))

export const bookingItemsRelations = relations(bookingItems, ({ one }) => ({
  booking: one(bookings, { fields: [bookingItems.bookingId], references: [bookings.id] }),
  slot: one(slots, { fields: [bookingItems.slotId], references: [slots.id] }),
}))

export const paymentsRelations = relations(payments, ({ one }) => ({
  booking: one(bookings, { fields: [payments.bookingId], references: [bookings.id] }),
  user: one(users, { fields: [payments.userId], references: [users.id] }),
}))
