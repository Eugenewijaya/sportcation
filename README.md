# Sportcation

Sportcation is a responsive Next.js web app for sports venue discovery, booking flows, merchant operations, and platform administration.

The current implementation follows the exported design layers in:

```text
D:\sportcation\figma sportcation
```

## Current Scope

- Onboarding and login entry.
- Home dashboard.
- Explore venues with search and category filters.
- Venue detail with schedule and slot selection.
- Checkout.
- QRIS payment simulation.
- Booking success and ticket/QR placeholder.
- Flash sale deals.
- Auction and resell flow.
- My bookings.
- Notifications.
- Profile.
- Settings.
- Help and privacy screens.
- Merchant dashboard for venue, slot, booking, finance, and settings operations.
- Admin dashboard for user, venue, booking, payment, report, content, and settings operations.
- Persistent merchant venue, court, and slot CRUD using Drizzle ORM with SQLite/libSQL.

The client booking flow and most admin modules remain prototype/mock flows. This is a web app, not an Android app.

## Run Locally

```bash
npm install
npm run db:migrate
npm run db:seed
npm run dev
```

Open:

```text
http://localhost:3000
```

Useful routes:

```text
/                  User/client web app
/merchant          Merchant dashboard
/merchant/venues   Merchant venue CRUD-ready UI
/merchant/slots    Merchant slot CRUD-ready UI
/merchant/bookings Merchant booking operations UI
/merchant/finance  Merchant settlement UI
/admin             Admin command dashboard
/admin/users       Admin user CRUD-ready UI
/admin/venues      Admin venue moderation UI
/admin/bookings    Admin booking control UI
/admin/payments    Admin payment reconciliation UI
/admin/reports     Admin reports UI
/admin/content     Admin content control UI
```

## Build

```bash
npm run build
```

## Database

The active database uses Drizzle ORM with the SQLite dialect:

- Local development: SQLite file at `data/sportcation.db`.
- Production: remote libSQL/Turso database.
- Future migration reference: the previous Neon PostgreSQL schema is preserved in `lib/db/postgres` and `drizzle-postgres`.

```bash
cp .env.example .env.local
npm run db:generate
npm run db:migrate
npm run db:seed
```

For local development, no environment variable is required because the app defaults to:

```text
file:./data/sportcation.db
```

For production deployment on Vercel or another stateless platform, configure:

```text
TURSO_DATABASE_URL=libsql://YOUR_DATABASE.turso.io
TURSO_AUTH_TOKEN=YOUR_TURSO_TOKEN
```

Do not use a local SQLite file on Vercel. Its filesystem is ephemeral and changes will not persist reliably.

## Persistent API Routes

```text
GET, POST       /api/venues
GET, PATCH, DELETE /api/venues/:id
GET, POST       /api/courts
PATCH, DELETE   /api/courts/:id
GET, POST       /api/slots
PATCH, DELETE   /api/slots/:id
GET             /api/categories
```

The persistent UI is currently available at:

```text
/merchant/venues
/merchant/slots
```

## Notes For The Team

- Mobile viewport follows the Figma app screens with bottom navigation.
- Desktop viewport adapts into a web shell with sidebar navigation and wider dashboard panels.
- Venue, court, and slot merchant data is persistent.
- Client booking/payment, merchant booking/finance, and admin data are still mock/local.
- APIs are not protected by authentication yet and must not be exposed as production-ready mutation endpoints.
- Active Drizzle schema lives in `lib/db/schema.ts`; generated SQLite/libSQL migrations live in `drizzle/`.
- See `docs/AUDIT_AND_IMPLEMENTATION_PLAN_SQLITE_LIBSQL.md` for the verified state and next development stages.
- Do not reintroduce the old JSON admin CMS or Android project unless explicitly requested.
