# System Design: Sportcation Android MVP

## Purpose

This document defines the recommended system architecture, data model, database draft, and API contract for the Sportcation Android MVP.

The old Next.js landing app and its JSON-based CMS are concept references only. The JSON file storage pattern must not be used for production data. Sportcation needs a proper backend, database, authentication system, storage service, and API contracts.

## 1. Recommended Architecture

### High-Level Architecture

```text
Android App
  |
  | HTTPS JSON API
  v
Backend API
  |
  | SQL
  v
PostgreSQL Database

Backend API
  |
  | Signed upload URL / public asset URL
  v
Object Storage

Backend API
  |
  | auth token verification
  v
Authentication Provider

Backend API
  |
  | event creation
  v
Notification Worker / Queue
```

### Android App

The Android app is the primary user-facing product.

Responsibilities:

- Onboarding.
- Login, register, and OTP flow.
- Home, explore, search, and filter.
- Venue detail and slot selection.
- Checkout and payment simulation.
- Booking success and QR ticket.
- My bookings and booking detail.
- Notification, profile, and settings.

Architecture direction:

- Native Android with Kotlin and Jetpack Compose.
- MVVM or MVI presentation pattern.
- Repository layer for API access.
- Use-case layer for business operations.
- Local persistence for session, onboarding state, and lightweight cache.
- No business-critical booking state stored only on-device.

### Backend API

The backend API owns all durable product state.

Responsibilities:

- Authenticate requests.
- Serve venue, sport, facility, image, and availability data.
- Search and filter venues.
- Create booking drafts.
- Validate slot availability.
- Simulate checkout and payment.
- Generate booking codes and QR ticket payloads.
- Serve user profile, bookings, notifications, vouchers, and future marketplace foundations.
- Enforce authorization and booking state transitions.

Design direction:

- Modular REST API for MVP.
- Versioned endpoints under `/api/v1`.
- Explicit request/response DTOs.
- Server-side validation for all user input.
- Server-controlled booking and payment state.

### Database

Use PostgreSQL as the source of truth.

Responsibilities:

- Store users, profiles, venues, courts, facilities, slots, bookings, payments, vouchers, notifications, reviews, resell listings, auctions, bids, wallets, and wallet transactions.
- Enforce relationships through foreign keys.
- Enforce critical uniqueness constraints, especially around slot booking.
- Support audit fields and status fields.

Design direction:

- Use UUID primary keys.
- Use `created_at`, `updated_at`, and optional `deleted_at` on core tables.
- Store money in integer minor units, for example Indonesian Rupiah as whole IDR integer.
- Use enums for statuses.
- Use indexes for search, filters, and booking lookups.

### File Storage

Use object storage, not local filesystem.

Responsibilities:

- Store venue images.
- Store user avatars if enabled.
- Store admin-uploaded media in future dashboards.

Recommended pattern:

- Store original files in object storage such as S3-compatible storage, Cloudflare R2, Supabase Storage, or Firebase Storage.
- Store image metadata and public URLs in `venue_images`.
- Use signed upload URLs for admin or partner uploads.
- Do not store binary files in the database.

### Authentication

Authentication should be real and token-based.

Responsibilities:

- Login/register by phone or email.
- OTP verification.
- Issue identity token.
- Backend verifies identity token on every protected request.
- Map external auth identity to internal `users.id`.

MVP direction:

- OTP can be simulated in early non-production builds.
- Production should use a trusted provider or robust custom implementation.
- Avoid hardcoded credentials.
- Store role and app permissions server-side.

### Payment Simulation

MVP payment is simulated, not a real gateway.

Responsibilities:

- Create payment records.
- Allow simulated success or failure.
- Update booking status safely.
- Generate booking code after confirmed payment.
- Create notification events.

Rules:

- Payment amount must be calculated by backend.
- Client must not be trusted to submit final price.
- Payment status transitions must be controlled by backend.
- Real gateway integration is future work.

### Notification System

MVP notifications can be in-app only.

Responsibilities:

- Create notification records after booking/payment events.
- Serve read/unread notification list.
- Mark notifications as read.

Future direction:

- Add push notification integration with Firebase Cloud Messaging.
- Add background workers for queued notification delivery.

### Admin/Partner Future Dashboard

The Android MVP should not include admin or partner dashboard screens. The backend and schema should still prepare for future admin and partner tools.

Future responsibilities:

- Admin manages users, venues, bookings, payments, vouchers, notifications, and reports.
- Partner manages venues, courts, slot inventory, pricing, and booking reports.
- Partner dashboard can be a separate web app using the same backend API.

## 2. Recommended Tech Stack

### Primary Recommendation

| Layer | Recommendation | Notes |
| --- | --- | --- |
| Mobile frontend | Native Android, Kotlin, Jetpack Compose | Best fit for Android-only MVP, strong native UX, QR, storage, notifications, and lifecycle support. |
| Backend | NestJS with TypeScript | Modular API, fast startup development, good validation and OpenAPI support. |
| Database | PostgreSQL | Strong relational model for bookings, slots, payments, and future marketplace features. |
| ORM | Prisma | Good schema modeling, migrations, and TypeScript developer speed. |
| Authentication | Firebase Auth for OTP plus backend token verification | Practical for mobile OTP. Backend maps Firebase UID to internal user. |
| Storage | Cloudflare R2 or AWS S3 | Durable object storage for venue images and future uploads. |
| Deployment | Railway, Fly.io, Render, or AWS ECS for API; managed Postgres such as Neon/Supabase/Railway | Choose based on budget and ops maturity. |
| Analytics/logging | Firebase Analytics for app, Sentry for app/API errors, structured backend logs | Covers product analytics and operational debugging. |

### Alternative Recommendation

| Layer | Alternative | Notes |
| --- | --- | --- |
| Mobile frontend | React Native / Expo | Faster if cross-platform is required early, but this repo does not provide meaningful reusable app logic. |
| Backend | Supabase Edge Functions or Next.js API separated from old landing app | Faster prototype path, less control than a dedicated modular backend. |
| Database | Supabase Postgres | Managed Postgres with integrated auth/storage options. |
| ORM | Supabase client or Drizzle | Drizzle is lightweight; Supabase client is fast for prototypes. |
| Authentication | Supabase Auth | Email/phone auth with managed session handling. |
| Storage | Supabase Storage | Simple integrated media storage. |
| Deployment | Supabase plus Vercel for dashboard/web surfaces | Good for early validation, less ideal if backend logic becomes complex. |
| Analytics/logging | Firebase Analytics, Sentry, Supabase logs | Good enough for early MVP. |

### Recommendation Decision

Use the primary stack if Sportcation is Android-first and expected to grow into booking, payment, resell, auction, wallet, and partner operations.

Use the alternative only if the immediate priority becomes fastest prototype delivery or cross-platform testing with limited backend complexity.

## 3. Main Entities

### User

Represents an authenticated identity.

Fields:

- `id`: UUID primary key.
- `auth_provider`: provider name, for example `firebase`.
- `auth_provider_user_id`: external auth user ID.
- `email`: nullable unique email.
- `phone`: nullable unique phone.
- `role`: `guest`, `user`, `partner`, `admin`.
- `status`: `active`, `suspended`, `deleted`.
- `last_login_at`: nullable timestamp.
- `created_at`, `updated_at`.

Relationships:

- One User has one UserProfile.
- One User has many Bookings.
- One User has many Payments.
- One User has many Notifications.
- One User has many Reviews.
- One User has one Wallet.
- One User can create many ResellListings, Auctions, and Bids.

### UserProfile

Stores mutable profile details separate from auth identity.

Fields:

- `id`: UUID primary key.
- `user_id`: unique foreign key to User.
- `display_name`: required string.
- `avatar_url`: nullable string.
- `city`: nullable string.
- `date_of_birth`: nullable date.
- `preferred_sport_category_id`: nullable foreign key.
- `notification_enabled`: boolean.
- `created_at`, `updated_at`.

Relationships:

- One UserProfile belongs to one User.
- UserProfile can reference one preferred SportCategory.

### SportCategory

Represents sport types such as Padel, Futsal, Tennis, Badminton, Gym, Golf, Basketball, Squash.

Fields:

- `id`: UUID primary key.
- `name`: unique string.
- `slug`: unique string.
- `description`: nullable string.
- `icon_url`: nullable string.
- `sort_order`: integer.
- `is_active`: boolean.
- `created_at`, `updated_at`.

Relationships:

- One SportCategory has many Venues.
- One SportCategory has many Courts.
- One SportCategory can be preferred by many UserProfiles.

### Venue

Represents a sports venue or facility location.

Fields:

- `id`: UUID primary key.
- `owner_user_id`: nullable foreign key to User for future partner ownership.
- `sport_category_id`: foreign key to SportCategory.
- `name`: string.
- `slug`: unique string.
- `description`: text.
- `address_line`: string.
- `city`: string.
- `district`: nullable string.
- `province`: nullable string.
- `postal_code`: nullable string.
- `latitude`: nullable decimal.
- `longitude`: nullable decimal.
- `base_price`: integer.
- `currency`: default `IDR`.
- `rating_average`: decimal default 0.
- `rating_count`: integer default 0.
- `status`: `draft`, `active`, `inactive`, `suspended`.
- `created_at`, `updated_at`, `deleted_at`.

Relationships:

- One Venue belongs to one SportCategory.
- One Venue can be owned by one partner User.
- One Venue has many Courts.
- One Venue has many VenueImages.
- One Venue has many Slots through Courts.
- One Venue has many Reviews.
- Venue has many Facilities through a join table.

### Court

Represents a bookable unit inside a venue.

Fields:

- `id`: UUID primary key.
- `venue_id`: foreign key to Venue.
- `sport_category_id`: nullable foreign key to SportCategory.
- `name`: string, for example `Court 04`.
- `description`: nullable text.
- `price_per_hour`: integer.
- `currency`: default `IDR`.
- `capacity`: nullable integer.
- `is_indoor`: boolean.
- `status`: `active`, `inactive`, `maintenance`.
- `created_at`, `updated_at`, `deleted_at`.

Relationships:

- One Court belongs to one Venue.
- One Court has many Slots.
- One Court can be referenced by many BookingItems.

### VenueImage

Represents venue or court media.

Fields:

- `id`: UUID primary key.
- `venue_id`: foreign key to Venue.
- `court_id`: nullable foreign key to Court.
- `url`: string.
- `alt_text`: nullable string.
- `sort_order`: integer.
- `is_primary`: boolean.
- `created_at`, `updated_at`.

Relationships:

- One VenueImage belongs to one Venue.
- One VenueImage can optionally belong to one Court.

### Facility

Represents features like parking, locker, shower, cafe, indoor, changing room.

Fields:

- `id`: UUID primary key.
- `name`: unique string.
- `slug`: unique string.
- `icon_key`: nullable string.
- `created_at`, `updated_at`.

Relationships:

- Many Facilities belong to many Venues through `venue_facilities`.

### Slot

Represents a bookable time range for a court.

Fields:

- `id`: UUID primary key.
- `court_id`: foreign key to Court.
- `start_at`: timestamp with timezone.
- `end_at`: timestamp with timezone.
- `price`: integer.
- `currency`: default `IDR`.
- `status`: `available`, `held`, `booked`, `blocked`, `expired`.
- `hold_expires_at`: nullable timestamp.
- `created_at`, `updated_at`.

Relationships:

- One Slot belongs to one Court.
- One Slot can be attached to zero or one active BookingItem.

Critical rule:

- A court cannot have overlapping active slots.
- A slot cannot be confirmed by more than one active booking item.

### Booking

Represents a user order for one or more booking items.

Fields:

- `id`: UUID primary key.
- `booking_code`: unique string, for example `SP-77291`.
- `user_id`: foreign key to User.
- `status`: `draft`, `pending_payment`, `confirmed`, `cancelled`, `completed`, `expired`, `failed`.
- `subtotal_amount`: integer.
- `service_fee_amount`: integer.
- `discount_amount`: integer.
- `total_amount`: integer.
- `currency`: default `IDR`.
- `voucher_id`: nullable foreign key to Voucher.
- `expires_at`: nullable timestamp.
- `confirmed_at`: nullable timestamp.
- `cancelled_at`: nullable timestamp.
- `created_at`, `updated_at`.

Relationships:

- One Booking belongs to one User.
- One Booking has many BookingItems.
- One Booking has one or many Payments.
- One Booking can create many Notifications.
- One Booking can be referenced by one ResellListing.

### BookingItem

Represents a booked court/slot inside a Booking.

Fields:

- `id`: UUID primary key.
- `booking_id`: foreign key to Booking.
- `venue_id`: foreign key to Venue.
- `court_id`: foreign key to Court.
- `slot_id`: foreign key to Slot.
- `sport_category_id`: foreign key to SportCategory.
- `start_at`: timestamp with timezone.
- `end_at`: timestamp with timezone.
- `unit_price`: integer.
- `status`: `pending`, `confirmed`, `cancelled`, `completed`.
- `created_at`, `updated_at`.

Relationships:

- One BookingItem belongs to one Booking.
- One BookingItem belongs to one Slot.
- One BookingItem references Venue, Court, and SportCategory for snapshot/query convenience.

### Payment

Represents checkout/payment state.

Fields:

- `id`: UUID primary key.
- `booking_id`: foreign key to Booking.
- `user_id`: foreign key to User.
- `provider`: `simulation`, future `xendit`, `midtrans`, etc.
- `method`: `qris`, `ovo`, `virtual_account`, `simulation`.
- `amount`: integer.
- `currency`: default `IDR`.
- `status`: `created`, `pending`, `succeeded`, `failed`, `cancelled`, `expired`.
- `provider_reference`: nullable string.
- `failure_reason`: nullable string.
- `paid_at`: nullable timestamp.
- `created_at`, `updated_at`.

Relationships:

- One Payment belongs to one Booking.
- One Payment belongs to one User.

### Voucher

Represents a discount or campaign code.

Fields:

- `id`: UUID primary key.
- `code`: unique string.
- `name`: string.
- `description`: nullable string.
- `discount_type`: `fixed`, `percentage`.
- `discount_value`: integer.
- `max_discount_amount`: nullable integer.
- `min_purchase_amount`: nullable integer.
- `usage_limit`: nullable integer.
- `used_count`: integer default 0.
- `starts_at`: nullable timestamp.
- `ends_at`: nullable timestamp.
- `status`: `active`, `inactive`, `expired`.
- `created_at`, `updated_at`.

Relationships:

- One Voucher can be used by many Bookings.

### Notification

Represents in-app notification records.

Fields:

- `id`: UUID primary key.
- `user_id`: foreign key to User.
- `type`: `booking_confirmed`, `payment_succeeded`, `payment_failed`, `booking_cancelled`, `system`.
- `title`: string.
- `message`: text.
- `related_entity_type`: nullable string.
- `related_entity_id`: nullable UUID.
- `is_read`: boolean default false.
- `created_at`, `read_at`.

Relationships:

- One Notification belongs to one User.
- Notification can reference Booking, Payment, ResellListing, Auction, or other entities through polymorphic reference fields.

### Review

Represents user rating and comment for a completed venue booking.

Fields:

- `id`: UUID primary key.
- `user_id`: foreign key to User.
- `venue_id`: foreign key to Venue.
- `booking_id`: nullable foreign key to Booking.
- `rating`: integer 1 to 5.
- `comment`: nullable text.
- `status`: `pending`, `published`, `hidden`.
- `created_at`, `updated_at`.

Relationships:

- One Review belongs to one User.
- One Review belongs to one Venue.
- One Review can reference one Booking.

### ResellListing

Future foundation for selling a confirmed booking slot.

Fields:

- `id`: UUID primary key.
- `seller_user_id`: foreign key to User.
- `booking_id`: unique foreign key to Booking.
- `booking_item_id`: foreign key to BookingItem.
- `listing_price`: integer.
- `currency`: default `IDR`.
- `status`: `draft`, `active`, `sold`, `cancelled`, `expired`.
- `expires_at`: timestamp.
- `created_at`, `updated_at`.

Relationships:

- One ResellListing belongs to one seller User.
- One ResellListing references one Booking and one BookingItem.
- One ResellListing can optionally become the basis for an Auction.

### Auction

Future foundation for bidding on premium or resale slots.

Fields:

- `id`: UUID primary key.
- `resell_listing_id`: nullable foreign key to ResellListing.
- `venue_id`: nullable foreign key to Venue.
- `booking_item_id`: nullable foreign key to BookingItem.
- `title`: string.
- `starting_price`: integer.
- `current_price`: integer.
- `currency`: default `IDR`.
- `status`: `draft`, `active`, `ended`, `cancelled`.
- `starts_at`: timestamp.
- `ends_at`: timestamp.
- `winner_bid_id`: nullable foreign key to Bid.
- `created_at`, `updated_at`.

Relationships:

- One Auction can have many Bids.
- One Auction can be linked to a ResellListing or a premium BookingItem foundation.

### Bid

Future foundation for auction bids.

Fields:

- `id`: UUID primary key.
- `auction_id`: foreign key to Auction.
- `bidder_user_id`: foreign key to User.
- `amount`: integer.
- `currency`: default `IDR`.
- `status`: `active`, `outbid`, `winning`, `cancelled`.
- `created_at`.

Relationships:

- One Bid belongs to one Auction.
- One Bid belongs to one bidder User.

### Wallet

Future foundation for stored balance, refunds, and resale proceeds.

Fields:

- `id`: UUID primary key.
- `user_id`: unique foreign key to User.
- `balance`: integer default 0.
- `currency`: default `IDR`.
- `status`: `active`, `frozen`, `closed`.
- `created_at`, `updated_at`.

Relationships:

- One Wallet belongs to one User.
- One Wallet has many WalletTransactions.

### WalletTransaction

Future ledger record for wallet balance changes.

Fields:

- `id`: UUID primary key.
- `wallet_id`: foreign key to Wallet.
- `user_id`: foreign key to User.
- `type`: `topup`, `payment`, `refund`, `resell_income`, `fee`, `adjustment`.
- `direction`: `credit`, `debit`.
- `amount`: integer.
- `currency`: default `IDR`.
- `status`: `pending`, `posted`, `failed`, `reversed`.
- `reference_type`: nullable string.
- `reference_id`: nullable UUID.
- `created_at`, `posted_at`.

Relationships:

- One WalletTransaction belongs to one Wallet.
- One WalletTransaction belongs to one User.
- WalletTransaction can reference Booking, Payment, ResellListing, Auction, or admin adjustment.

## 4. Entity Relationships

### One-to-One Relationships

- User -> UserProfile.
- User -> Wallet.
- Booking -> ResellListing, when a booking is listed for resale.

### One-to-Many Relationships

- User -> Bookings.
- User -> Payments.
- User -> Notifications.
- User -> Reviews.
- SportCategory -> Venues.
- Venue -> Courts.
- Venue -> VenueImages.
- Court -> Slots.
- Booking -> BookingItems.
- Booking -> Payments.
- Voucher -> Bookings.
- Auction -> Bids.
- Wallet -> WalletTransactions.

### Many-to-Many Relationships

- Venue <-> Facility through `venue_facilities`.

Optional future many-to-many relationships:

- User <-> Venue favorites through `user_favorite_venues`.
- Venue <-> SportCategory if one venue supports multiple sports. For MVP, a Venue has one primary SportCategory and Courts can optionally override sport category.

### Critical Domain Relationships

- Slot availability depends on Court and time range.
- BookingItem locks one Slot.
- Booking confirmation depends on successful Payment.
- QR ticket is derived from confirmed Booking and booking code.
- ResellListing requires a confirmed BookingItem owned by the seller.
- Auction depends on a listing or premium slot foundation.
- WalletTransaction must never be updated casually; it is a ledger-style record.

## 5. Database Schema Draft

### Core Tables

| Table | Primary Fields | Foreign Keys | Important Indexes/Constraints |
| --- | --- | --- | --- |
| `users` | `id`, `auth_provider`, `auth_provider_user_id`, `email`, `phone`, `role`, `status`, `last_login_at`, `created_at`, `updated_at` | none | unique `auth_provider + auth_provider_user_id`, unique nullable `email`, unique nullable `phone`, index `role`, index `status` |
| `user_profiles` | `id`, `user_id`, `display_name`, `avatar_url`, `city`, `date_of_birth`, `preferred_sport_category_id`, `notification_enabled`, `created_at`, `updated_at` | `user_id -> users.id`, `preferred_sport_category_id -> sport_categories.id` | unique `user_id`, index `city` |
| `sport_categories` | `id`, `name`, `slug`, `description`, `icon_url`, `sort_order`, `is_active`, `created_at`, `updated_at` | none | unique `name`, unique `slug`, index `is_active`, index `sort_order` |
| `venues` | `id`, `owner_user_id`, `sport_category_id`, `name`, `slug`, `description`, `address_line`, `city`, `district`, `province`, `postal_code`, `latitude`, `longitude`, `base_price`, `currency`, `rating_average`, `rating_count`, `status`, `created_at`, `updated_at`, `deleted_at` | `owner_user_id -> users.id`, `sport_category_id -> sport_categories.id` | unique `slug`, index `sport_category_id`, index `city`, index `district`, index `status`, index `base_price`, index `rating_average` |
| `courts` | `id`, `venue_id`, `sport_category_id`, `name`, `description`, `price_per_hour`, `currency`, `capacity`, `is_indoor`, `status`, `created_at`, `updated_at`, `deleted_at` | `venue_id -> venues.id`, `sport_category_id -> sport_categories.id` | index `venue_id`, index `status`, unique `venue_id + name` |
| `venue_images` | `id`, `venue_id`, `court_id`, `url`, `alt_text`, `sort_order`, `is_primary`, `created_at`, `updated_at` | `venue_id -> venues.id`, `court_id -> courts.id` | index `venue_id`, index `court_id`, index `is_primary`, index `sort_order` |
| `facilities` | `id`, `name`, `slug`, `icon_key`, `created_at`, `updated_at` | none | unique `name`, unique `slug` |
| `venue_facilities` | `venue_id`, `facility_id`, `created_at` | `venue_id -> venues.id`, `facility_id -> facilities.id` | primary key `venue_id + facility_id`, index `facility_id` |
| `slots` | `id`, `court_id`, `start_at`, `end_at`, `price`, `currency`, `status`, `hold_expires_at`, `created_at`, `updated_at` | `court_id -> courts.id` | index `court_id + start_at`, index `status`, unique `court_id + start_at + end_at` |
| `bookings` | `id`, `booking_code`, `user_id`, `status`, `subtotal_amount`, `service_fee_amount`, `discount_amount`, `total_amount`, `currency`, `voucher_id`, `expires_at`, `confirmed_at`, `cancelled_at`, `created_at`, `updated_at` | `user_id -> users.id`, `voucher_id -> vouchers.id` | unique `booking_code`, index `user_id + status`, index `created_at`, index `status` |
| `booking_items` | `id`, `booking_id`, `venue_id`, `court_id`, `slot_id`, `sport_category_id`, `start_at`, `end_at`, `unit_price`, `status`, `created_at`, `updated_at` | `booking_id -> bookings.id`, `venue_id -> venues.id`, `court_id -> courts.id`, `slot_id -> slots.id`, `sport_category_id -> sport_categories.id` | unique active `slot_id`, index `booking_id`, index `venue_id`, index `court_id`, index `start_at` |
| `payments` | `id`, `booking_id`, `user_id`, `provider`, `method`, `amount`, `currency`, `status`, `provider_reference`, `failure_reason`, `paid_at`, `created_at`, `updated_at` | `booking_id -> bookings.id`, `user_id -> users.id` | index `booking_id`, index `user_id`, index `status`, unique nullable `provider_reference` |
| `vouchers` | `id`, `code`, `name`, `description`, `discount_type`, `discount_value`, `max_discount_amount`, `min_purchase_amount`, `usage_limit`, `used_count`, `starts_at`, `ends_at`, `status`, `created_at`, `updated_at` | none | unique `code`, index `status`, index `starts_at + ends_at` |
| `notifications` | `id`, `user_id`, `type`, `title`, `message`, `related_entity_type`, `related_entity_id`, `is_read`, `created_at`, `read_at` | `user_id -> users.id` | index `user_id + is_read`, index `user_id + created_at` |
| `reviews` | `id`, `user_id`, `venue_id`, `booking_id`, `rating`, `comment`, `status`, `created_at`, `updated_at` | `user_id -> users.id`, `venue_id -> venues.id`, `booking_id -> bookings.id` | index `venue_id + status`, index `user_id`, unique nullable `booking_id + user_id` |

### Future Marketplace and Wallet Tables

| Table | Primary Fields | Foreign Keys | Important Indexes/Constraints |
| --- | --- | --- | --- |
| `resell_listings` | `id`, `seller_user_id`, `booking_id`, `booking_item_id`, `listing_price`, `currency`, `status`, `expires_at`, `created_at`, `updated_at` | `seller_user_id -> users.id`, `booking_id -> bookings.id`, `booking_item_id -> booking_items.id` | unique `booking_id`, index `seller_user_id`, index `status`, index `expires_at` |
| `auctions` | `id`, `resell_listing_id`, `venue_id`, `booking_item_id`, `title`, `starting_price`, `current_price`, `currency`, `status`, `starts_at`, `ends_at`, `winner_bid_id`, `created_at`, `updated_at` | `resell_listing_id -> resell_listings.id`, `venue_id -> venues.id`, `booking_item_id -> booking_items.id`, `winner_bid_id -> bids.id` | index `status + ends_at`, index `venue_id`, index `resell_listing_id` |
| `bids` | `id`, `auction_id`, `bidder_user_id`, `amount`, `currency`, `status`, `created_at` | `auction_id -> auctions.id`, `bidder_user_id -> users.id` | index `auction_id + amount`, index `bidder_user_id`, index `status` |
| `wallets` | `id`, `user_id`, `balance`, `currency`, `status`, `created_at`, `updated_at` | `user_id -> users.id` | unique `user_id`, index `status` |
| `wallet_transactions` | `id`, `wallet_id`, `user_id`, `type`, `direction`, `amount`, `currency`, `status`, `reference_type`, `reference_id`, `created_at`, `posted_at` | `wallet_id -> wallets.id`, `user_id -> users.id` | index `wallet_id + created_at`, index `user_id + created_at`, index `reference_type + reference_id`, index `status` |

### Recommended Enums

| Enum | Values |
| --- | --- |
| `user_role` | `guest`, `user`, `partner`, `admin` |
| `user_status` | `active`, `suspended`, `deleted` |
| `venue_status` | `draft`, `active`, `inactive`, `suspended` |
| `court_status` | `active`, `inactive`, `maintenance` |
| `slot_status` | `available`, `held`, `booked`, `blocked`, `expired` |
| `booking_status` | `draft`, `pending_payment`, `confirmed`, `cancelled`, `completed`, `expired`, `failed` |
| `booking_item_status` | `pending`, `confirmed`, `cancelled`, `completed` |
| `payment_status` | `created`, `pending`, `succeeded`, `failed`, `cancelled`, `expired` |
| `voucher_status` | `active`, `inactive`, `expired` |
| `resell_listing_status` | `draft`, `active`, `sold`, `cancelled`, `expired` |
| `auction_status` | `draft`, `active`, `ended`, `cancelled` |
| `bid_status` | `active`, `outbid`, `winning`, `cancelled` |
| `wallet_status` | `active`, `frozen`, `closed` |
| `wallet_transaction_status` | `pending`, `posted`, `failed`, `reversed` |

## 6. API Contracts

### API Conventions

- Base path: `/api/v1`.
- All protected endpoints require `Authorization: Bearer <token>`.
- Request/response bodies are JSON unless file upload uses signed URLs.
- Server returns errors in a consistent format.

Error response:

```json
{
  "error": {
    "code": "VALIDATION_ERROR",
    "message": "Choose a payment method to continue.",
    "details": {}
  }
}
```

### Auth

#### Register

| Field | Value |
| --- | --- |
| Endpoint | `/api/v1/auth/register` |
| Method | `POST` |
| Auth | Public |

Request:

```json
{
  "displayName": "Alex Rivera",
  "email": "alex@sportcation.com",
  "phone": "+6281112345678"
}
```

Response:

```json
{
  "otpSessionId": "otp_123",
  "deliveryTarget": "+6281112345678",
  "expiresInSeconds": 300
}
```

Notes:

- MVP can simulate OTP.
- Production should send OTP through auth provider.
- At least one of `email` or `phone` is required.

#### Login

| Field | Value |
| --- | --- |
| Endpoint | `/api/v1/auth/login` |
| Method | `POST` |
| Auth | Public |

Request:

```json
{
  "email": "alex@sportcation.com",
  "phone": null
}
```

Response:

```json
{
  "otpSessionId": "otp_456",
  "deliveryTarget": "alex@sportcation.com",
  "expiresInSeconds": 300
}
```

Notes:

- No hardcoded credentials.
- Do not reveal whether an account exists in a way that enables enumeration.

#### Verify OTP

| Field | Value |
| --- | --- |
| Endpoint | `/api/v1/auth/verify-otp` |
| Method | `POST` |
| Auth | Public |

Request:

```json
{
  "otpSessionId": "otp_456",
  "code": "123456"
}
```

Response:

```json
{
  "accessToken": "jwt_access_token",
  "refreshToken": "jwt_refresh_token",
  "user": {
    "id": "user_uuid",
    "role": "user",
    "displayName": "Alex Rivera"
  }
}
```

Notes:

- If using Firebase Auth, the Android app receives provider token and backend verifies it.
- Backend should still create or update internal User and UserProfile records.

#### Logout

| Field | Value |
| --- | --- |
| Endpoint | `/api/v1/auth/logout` |
| Method | `POST` |
| Auth | Protected |

Request:

```json
{
  "refreshToken": "jwt_refresh_token"
}
```

Response:

```json
{
  "success": true
}
```

Notes:

- For provider-managed auth, token revocation may be delegated.

### User Profile

#### Get Current Profile

| Field | Value |
| --- | --- |
| Endpoint | `/api/v1/users/me` |
| Method | `GET` |
| Auth | Protected |

Request body:

```json
{}
```

Response:

```json
{
  "id": "user_uuid",
  "email": "alex@sportcation.com",
  "phone": "+6281112345678",
  "role": "user",
  "profile": {
    "displayName": "Alex Rivera",
    "avatarUrl": null,
    "city": "Jakarta",
    "notificationEnabled": true
  }
}
```

Notes:

- Never expose provider secrets or internal auth metadata.

#### Update Current Profile

| Field | Value |
| --- | --- |
| Endpoint | `/api/v1/users/me/profile` |
| Method | `PATCH` |
| Auth | Protected |

Request:

```json
{
  "displayName": "Alex Rivera",
  "city": "Jakarta",
  "notificationEnabled": true
}
```

Response:

```json
{
  "profile": {
    "displayName": "Alex Rivera",
    "avatarUrl": null,
    "city": "Jakarta",
    "notificationEnabled": true
  }
}
```

Notes:

- Validate string lengths and allowed values.

### Venue

#### List Venues

| Field | Value |
| --- | --- |
| Endpoint | `/api/v1/venues` |
| Method | `GET` |
| Auth | Public |

Query parameters:

```text
sport=padel&city=Jakarta&district=Senayan&minPrice=0&maxPrice=500000&minRating=4&page=1&pageSize=20
```

Response:

```json
{
  "items": [
    {
      "id": "venue_uuid",
      "name": "PadelHub Senayan",
      "slug": "padelhub-senayan",
      "sportCategory": {
        "id": "sport_uuid",
        "name": "Padel",
        "slug": "padel"
      },
      "city": "Jakarta",
      "district": "Senayan",
      "basePrice": 350000,
      "currency": "IDR",
      "ratingAverage": 4.9,
      "ratingCount": 124,
      "primaryImageUrl": "https://cdn.example.com/venue.jpg"
    }
  ],
  "page": 1,
  "pageSize": 20,
  "total": 120
}
```

Notes:

- Public endpoint.
- Use pagination.
- Only return active venues.

#### Get Venue Detail

| Field | Value |
| --- | --- |
| Endpoint | `/api/v1/venues/{venueId}` |
| Method | `GET` |
| Auth | Public |

Request body:

```json
{}
```

Response:

```json
{
  "id": "venue_uuid",
  "name": "PadelHub Senayan",
  "description": "Premium padel venue in Jakarta.",
  "sportCategory": {
    "id": "sport_uuid",
    "name": "Padel",
    "slug": "padel"
  },
  "address": {
    "line": "Jl. Example No. 1",
    "city": "Jakarta",
    "district": "Senayan",
    "province": "DKI Jakarta",
    "latitude": -6.2,
    "longitude": 106.8
  },
  "facilities": [
    { "id": "facility_uuid", "name": "Parking", "slug": "parking" }
  ],
  "images": [
    { "id": "image_uuid", "url": "https://cdn.example.com/venue.jpg", "isPrimary": true }
  ],
  "courts": [
    {
      "id": "court_uuid",
      "name": "Court 04",
      "pricePerHour": 350000,
      "currency": "IDR",
      "isIndoor": true
    }
  ],
  "ratingAverage": 4.9,
  "ratingCount": 124
}
```

Notes:

- Include enough data for detail screen without overfetching every slot.

### Search/Filter

#### Search Venues

| Field | Value |
| --- | --- |
| Endpoint | `/api/v1/search/venues` |
| Method | `GET` |
| Auth | Public |

Query parameters:

```text
q=padel jakarta&sport=padel&city=Jakarta&district=Senayan&date=2026-06-10&startTime=10:00&endTime=12:00&page=1&pageSize=20
```

Response:

```json
{
  "query": "padel jakarta",
  "filters": {
    "sport": "padel",
    "city": "Jakarta",
    "district": "Senayan",
    "date": "2026-06-10"
  },
  "items": [
    {
      "id": "venue_uuid",
      "name": "PadelHub Senayan",
      "basePrice": 350000,
      "ratingAverage": 4.9,
      "primaryImageUrl": "https://cdn.example.com/venue.jpg",
      "hasAvailableSlot": true
    }
  ],
  "page": 1,
  "pageSize": 20,
  "total": 12
}
```

Notes:

- Can start with SQL search and later evolve to full-text search.

### Slot Availability

#### Get Slot Availability

| Field | Value |
| --- | --- |
| Endpoint | `/api/v1/venues/{venueId}/availability` |
| Method | `GET` |
| Auth | Public |

Query parameters:

```text
date=2026-06-10&courtId=court_uuid
```

Response:

```json
{
  "venueId": "venue_uuid",
  "date": "2026-06-10",
  "courts": [
    {
      "courtId": "court_uuid",
      "courtName": "Court 04",
      "slots": [
        {
          "slotId": "slot_uuid",
          "startAt": "2026-06-10T10:00:00+07:00",
          "endAt": "2026-06-10T11:00:00+07:00",
          "price": 350000,
          "currency": "IDR",
          "status": "available"
        }
      ]
    }
  ]
}
```

Notes:

- Slot status should be calculated using current holds, bookings, and blocked slots.
- Public users can see availability.

### Booking

#### Create Booking Draft

| Field | Value |
| --- | --- |
| Endpoint | `/api/v1/bookings` |
| Method | `POST` |
| Auth | Protected |

Request:

```json
{
  "items": [
    {
      "slotId": "slot_uuid"
    }
  ]
}
```

Response:

```json
{
  "booking": {
    "id": "booking_uuid",
    "bookingCode": null,
    "status": "pending_payment",
    "subtotalAmount": 350000,
    "serviceFeeAmount": 15000,
    "discountAmount": 0,
    "totalAmount": 365000,
    "currency": "IDR",
    "expiresAt": "2026-06-03T10:15:00+07:00",
    "items": [
      {
        "id": "booking_item_uuid",
        "slotId": "slot_uuid",
        "venueName": "PadelHub Senayan",
        "courtName": "Court 04",
        "startAt": "2026-06-10T10:00:00+07:00",
        "endAt": "2026-06-10T11:00:00+07:00",
        "unitPrice": 350000
      }
    ]
  }
}
```

Notes:

- Backend validates slot availability.
- Backend places a temporary hold.
- Backend calculates price.
- Client cannot submit final amount.

#### Get My Bookings

| Field | Value |
| --- | --- |
| Endpoint | `/api/v1/bookings/me` |
| Method | `GET` |
| Auth | Protected |

Query parameters:

```text
status=upcoming&page=1&pageSize=20
```

Response:

```json
{
  "items": [
    {
      "id": "booking_uuid",
      "bookingCode": "SP-77291",
      "status": "confirmed",
      "venueName": "PadelHub Senayan",
      "primaryImageUrl": "https://cdn.example.com/venue.jpg",
      "startAt": "2026-06-10T10:00:00+07:00",
      "endAt": "2026-06-10T11:00:00+07:00",
      "totalAmount": 365000,
      "currency": "IDR"
    }
  ],
  "page": 1,
  "pageSize": 20,
  "total": 1
}
```

Notes:

- Only return bookings belonging to the authenticated user unless admin scope is used.

#### Get Booking Detail

| Field | Value |
| --- | --- |
| Endpoint | `/api/v1/bookings/{bookingId}` |
| Method | `GET` |
| Auth | Protected |

Request body:

```json
{}
```

Response:

```json
{
  "id": "booking_uuid",
  "bookingCode": "SP-77291",
  "status": "confirmed",
  "subtotalAmount": 350000,
  "serviceFeeAmount": 15000,
  "discountAmount": 0,
  "totalAmount": 365000,
  "currency": "IDR",
  "confirmedAt": "2026-06-03T10:05:00+07:00",
  "items": [
    {
      "venueId": "venue_uuid",
      "venueName": "PadelHub Senayan",
      "courtName": "Court 04",
      "startAt": "2026-06-10T10:00:00+07:00",
      "endAt": "2026-06-10T11:00:00+07:00"
    }
  ],
  "payment": {
    "id": "payment_uuid",
    "status": "succeeded",
    "method": "qris",
    "amount": 365000
  }
}
```

Notes:

- User can access only own booking.
- Admin can access with admin scope.

#### Cancel Booking

| Field | Value |
| --- | --- |
| Endpoint | `/api/v1/bookings/{bookingId}/cancel` |
| Method | `POST` |
| Auth | Protected |

Request:

```json
{
  "reason": "Cannot attend"
}
```

Response:

```json
{
  "booking": {
    "id": "booking_uuid",
    "status": "cancelled",
    "cancelledAt": "2026-06-03T11:00:00+07:00"
  }
}
```

Notes:

- MVP can implement simple cancellation rules.
- Future versions need refund and wallet logic.

### Checkout/Payment Simulation

#### Create Payment Simulation

| Field | Value |
| --- | --- |
| Endpoint | `/api/v1/bookings/{bookingId}/payments/simulation` |
| Method | `POST` |
| Auth | Protected |

Request:

```json
{
  "method": "qris"
}
```

Response:

```json
{
  "payment": {
    "id": "payment_uuid",
    "bookingId": "booking_uuid",
    "provider": "simulation",
    "method": "qris",
    "amount": 365000,
    "currency": "IDR",
    "status": "pending"
  },
  "instructions": {
    "title": "Simulated QRIS Payment",
    "description": "Use the simulation action to complete payment."
  }
}
```

Notes:

- Backend pulls amount from booking.
- User cannot override amount.

#### Complete Payment Simulation

| Field | Value |
| --- | --- |
| Endpoint | `/api/v1/payments/{paymentId}/simulate-result` |
| Method | `POST` |
| Auth | Protected |

Request:

```json
{
  "result": "success"
}
```

Response:

```json
{
  "payment": {
    "id": "payment_uuid",
    "status": "succeeded",
    "paidAt": "2026-06-03T10:05:00+07:00"
  },
  "booking": {
    "id": "booking_uuid",
    "bookingCode": "SP-77291",
    "status": "confirmed"
  }
}
```

Notes:

- For MVP simulation only.
- In production, payment result must come from provider webhook, not the client.
- Backend must prevent changing succeeded payment back to failed.

### QR Ticket

#### Get Booking Ticket

| Field | Value |
| --- | --- |
| Endpoint | `/api/v1/bookings/{bookingId}/ticket` |
| Method | `GET` |
| Auth | Protected |

Request body:

```json
{}
```

Response:

```json
{
  "bookingId": "booking_uuid",
  "bookingCode": "SP-77291",
  "qrPayload": "sportcation:booking:SP-77291",
  "venueName": "PadelHub Senayan",
  "courtName": "Court 04",
  "startAt": "2026-06-10T10:00:00+07:00",
  "endAt": "2026-06-10T11:00:00+07:00",
  "instructions": "Show this code to venue staff at check-in."
}
```

Notes:

- Ticket is available only for confirmed bookings.
- QR image can be generated client-side from `qrPayload` or server-side later.

### Notification

#### List Notifications

| Field | Value |
| --- | --- |
| Endpoint | `/api/v1/notifications` |
| Method | `GET` |
| Auth | Protected |

Query parameters:

```text
isRead=false&page=1&pageSize=20
```

Response:

```json
{
  "items": [
    {
      "id": "notification_uuid",
      "type": "booking_confirmed",
      "title": "Booking Confirmed",
      "message": "Your session at PadelHub Senayan is confirmed.",
      "relatedEntityType": "booking",
      "relatedEntityId": "booking_uuid",
      "isRead": false,
      "createdAt": "2026-06-03T10:05:00+07:00"
    }
  ],
  "page": 1,
  "pageSize": 20,
  "total": 1
}
```

Notes:

- In-app notification source of truth.

#### Mark Notification Read

| Field | Value |
| --- | --- |
| Endpoint | `/api/v1/notifications/{notificationId}/read` |
| Method | `POST` |
| Auth | Protected |

Request:

```json
{}
```

Response:

```json
{
  "id": "notification_uuid",
  "isRead": true,
  "readAt": "2026-06-03T10:10:00+07:00"
}
```

Notes:

- User can update only own notifications.

### Voucher

#### Validate Voucher

| Field | Value |
| --- | --- |
| Endpoint | `/api/v1/vouchers/validate` |
| Method | `POST` |
| Auth | Protected |

Request:

```json
{
  "code": "SPORT10",
  "bookingId": "booking_uuid"
}
```

Response:

```json
{
  "valid": true,
  "voucher": {
    "id": "voucher_uuid",
    "code": "SPORT10",
    "discountType": "percentage",
    "discountValue": 10,
    "discountAmount": 35000
  },
  "bookingPreview": {
    "subtotalAmount": 350000,
    "serviceFeeAmount": 15000,
    "discountAmount": 35000,
    "totalAmount": 330000
  }
}
```

Notes:

- Voucher is future or placeholder for MVP.
- Backend computes discount.
- Invalid voucher should return a user-friendly error.

### Resell Foundation

#### Create Resell Listing Draft

| Field | Value |
| --- | --- |
| Endpoint | `/api/v1/resell-listings` |
| Method | `POST` |
| Auth | Protected |

Request:

```json
{
  "bookingItemId": "booking_item_uuid",
  "listingPrice": 300000
}
```

Response:

```json
{
  "listing": {
    "id": "resell_listing_uuid",
    "bookingItemId": "booking_item_uuid",
    "listingPrice": 300000,
    "currency": "IDR",
    "status": "draft"
  }
}
```

Notes:

- Future foundation only.
- User must own the booking item.
- Booking must be confirmed and eligible for resale.

#### List Active Resell Listings

| Field | Value |
| --- | --- |
| Endpoint | `/api/v1/resell-listings` |
| Method | `GET` |
| Auth | Public or Protected |

Query parameters:

```text
sport=padel&city=Jakarta&page=1&pageSize=20
```

Response:

```json
{
  "items": [
    {
      "id": "resell_listing_uuid",
      "venueName": "PadelHub Senayan",
      "startAt": "2026-06-10T10:00:00+07:00",
      "endAt": "2026-06-10T11:00:00+07:00",
      "listingPrice": 300000,
      "currency": "IDR",
      "status": "active"
    }
  ],
  "page": 1,
  "pageSize": 20,
  "total": 1
}
```

Notes:

- Not in core MVP booking flow.

### Auction Foundation

#### List Auctions

| Field | Value |
| --- | --- |
| Endpoint | `/api/v1/auctions` |
| Method | `GET` |
| Auth | Public or Protected |

Query parameters:

```text
status=active&page=1&pageSize=20
```

Response:

```json
{
  "items": [
    {
      "id": "auction_uuid",
      "title": "Center Court Prime Time Slot",
      "startingPrice": 1000000,
      "currentPrice": 1450000,
      "currency": "IDR",
      "status": "active",
      "endsAt": "2026-06-03T18:00:00+07:00"
    }
  ],
  "page": 1,
  "pageSize": 20,
  "total": 1
}
```

Notes:

- Future foundation only.

#### Place Bid

| Field | Value |
| --- | --- |
| Endpoint | `/api/v1/auctions/{auctionId}/bids` |
| Method | `POST` |
| Auth | Protected |

Request:

```json
{
  "amount": 1500000
}
```

Response:

```json
{
  "bid": {
    "id": "bid_uuid",
    "auctionId": "auction_uuid",
    "amount": 1500000,
    "currency": "IDR",
    "status": "winning"
  },
  "auction": {
    "id": "auction_uuid",
    "currentPrice": 1500000,
    "status": "active"
  }
}
```

Notes:

- Future work requires anti-sniping, payment authorization, fraud rules, and bid ordering guarantees.

### Wallet Foundation

#### Get Wallet

| Field | Value |
| --- | --- |
| Endpoint | `/api/v1/wallet` |
| Method | `GET` |
| Auth | Protected |

Request body:

```json
{}
```

Response:

```json
{
  "wallet": {
    "id": "wallet_uuid",
    "balance": 0,
    "currency": "IDR",
    "status": "active"
  }
}
```

Notes:

- Future foundation only.
- Do not launch real wallet without ledger and compliance review.

#### List Wallet Transactions

| Field | Value |
| --- | --- |
| Endpoint | `/api/v1/wallet/transactions` |
| Method | `GET` |
| Auth | Protected |

Query parameters:

```text
page=1&pageSize=20
```

Response:

```json
{
  "items": [
    {
      "id": "wallet_transaction_uuid",
      "type": "refund",
      "direction": "credit",
      "amount": 50000,
      "currency": "IDR",
      "status": "posted",
      "createdAt": "2026-06-03T10:00:00+07:00"
    }
  ],
  "page": 1,
  "pageSize": 20,
  "total": 1
}
```

Notes:

- Wallet transactions should be append-only or ledger-style in production.

## 7. Security Considerations

### Authentication

- Use provider-backed OTP or secure custom OTP service.
- Verify bearer tokens server-side on protected endpoints.
- Map external auth IDs to internal users.
- Rotate refresh tokens if custom auth is used.
- Never hardcode credentials.
- Never store plaintext OTP codes.

### Authorization

- Users can access only their own bookings, payments, profile, notifications, wallet, bids, and listings.
- Partner users can access only owned venues and related bookings in future dashboard.
- Admin access requires separate role and stricter audit logging.
- Do not trust client-submitted role values.

### Input Validation

- Validate every request body using DTO schemas.
- Validate UUIDs, dates, money fields, enum values, pagination values, and string lengths.
- Reject invalid slot ranges.
- Normalize and validate phone/email.
- Sanitize text fields used in admin/partner dashboard surfaces.

### Payment State Protection

- Payment amount must be calculated from booking server-side.
- Client cannot decide final payment amount.
- Payment state transitions must be one-way where appropriate.
- Production payment success must come from provider webhook, not client.
- Payment updates should be idempotent.

### Booking State Protection

- Booking creation must validate slot availability inside a database transaction.
- Slot hold must expire automatically.
- Confirmed bookings must prevent duplicate slot confirmation.
- Cancellation rules must be enforced server-side.
- Booking code must be unique and unpredictable enough for public display.

### Audit Trail

Add audit logs for:

- Admin changes.
- Partner venue changes.
- Booking status changes.
- Payment status changes.
- Voucher usage.
- Wallet transaction creation.
- Resell and auction state changes.

Audit fields:

- `actor_user_id`.
- `action`.
- `entity_type`.
- `entity_id`.
- `before_data`.
- `after_data`.
- `ip_address`.
- `user_agent`.
- `created_at`.

### Rate Limiting

Apply rate limits to:

- Login/register.
- OTP request.
- OTP verification.
- Search endpoints.
- Booking creation.
- Payment simulation result.
- Auction bid placement.

Use stricter limits on auth and money-adjacent operations.

## 8. Scalability Considerations

### Indexing

Recommended indexes:

- `venues`: `sport_category_id`, `city`, `district`, `status`, `base_price`, `rating_average`.
- `slots`: `court_id + start_at`, `status`, `hold_expires_at`.
- `bookings`: `user_id + status`, `created_at`, `booking_code`.
- `payments`: `booking_id`, `user_id`, `status`, `provider_reference`.
- `notifications`: `user_id + is_read`, `user_id + created_at`.
- `reviews`: `venue_id + status`.
- Future `auctions`: `status + ends_at`.
- Future `wallet_transactions`: `wallet_id + created_at`, `reference_type + reference_id`.

### Pagination

- Use pagination for venue lists, search results, bookings, notifications, reviews, auctions, and wallet transactions.
- MVP can use page/pageSize.
- Future high-volume feeds can move to cursor pagination.

### Caching

Cache candidates:

- Sport categories.
- Facilities.
- Venue detail for active venues.
- Search/filter results by common filters.
- Public images via CDN.

Do not cache without invalidation:

- Slot availability.
- Booking status.
- Payment status.
- Wallet balance.

### Storage

- Store images in object storage.
- Serve images through CDN.
- Use image transformations or pre-generated sizes for mobile performance.
- Store only URLs and metadata in database.
- Use signed upload URLs for admin/partner media uploads.

### Background Jobs

Recommended jobs:

- Expire held slots.
- Expire pending bookings.
- Expire vouchers.
- Send notification events.
- Recalculate venue rating aggregates.
- Close ended auctions.
- Reconcile payment states when real gateway is integrated.
- Generate reports for admin/partner dashboards.

### Concurrency

Booking and slot hold operations must use transaction-safe logic.

Minimum MVP rule:

- When creating a booking draft, lock the selected slot row.
- If slot is `available`, mark it `held` with `hold_expires_at`.
- If payment succeeds before hold expiry, mark slot `booked` and booking `confirmed`.
- If hold expires, release slot back to `available` and mark booking `expired`.

### Observability

Track:

- API latency.
- Booking creation success/failure.
- Payment simulation success/failure.
- Slot conflict attempts.
- OTP request volume.
- Search query volume.
- Error rates by endpoint.

Use:

- Structured logs.
- Request IDs.
- Sentry for app/API exceptions.
- Dashboard metrics for bookings, payments, and user funnel.

## MVP Implementation Boundary

The first Android MVP backend should implement only:

- Auth foundation.
- User profile.
- Sport categories.
- Venue list/detail.
- Search/filter.
- Slot availability.
- Booking draft.
- Payment simulation.
- Booking confirmation and ticket.
- My bookings.
- Notifications.

Future tables and contracts for voucher, resell, auction, and wallet can be documented now but should not be fully implemented until the core booking system is stable.
