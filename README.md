# Sportcation

Sportcation is a responsive Next.js web app prototype for sports venue discovery and booking.

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

This is a web app prototype with local mock state. It is not an Android app and does not include production backend integration yet.

## Run Locally

```bash
npm install
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

## Notes For The Team

- Mobile viewport follows the Figma app screens with bottom navigation.
- Desktop viewport adapts into a web shell with sidebar navigation and wider dashboard panels.
- Venue, booking, payment, auction, and profile data are mock/local only.
- Merchant and admin screens use CRUD-ready mock resources, forms, filters, and row actions so they can later be wired to backend mutations.
- Planned backend stack: Drizzle ORM with Neon PostgreSQL.
- Do not reintroduce the old JSON admin CMS or Android project unless explicitly requested.
