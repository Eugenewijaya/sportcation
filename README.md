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

This is a web app prototype with local mock state. It is not an Android app and does not include production backend integration.

## Run Locally

```bash
npm install
npm run dev
```

Open:

```text
http://localhost:3000
```

## Build

```bash
npm run build
```

## Notes For The Team

- Mobile viewport follows the Figma app screens with bottom navigation.
- Desktop viewport adapts into a web shell with sidebar navigation and wider dashboard panels.
- Venue, booking, payment, auction, and profile data are mock/local only.
- Do not reintroduce the old JSON admin CMS or Android project unless explicitly requested.
