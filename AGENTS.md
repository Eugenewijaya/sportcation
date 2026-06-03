# AGENTS.md

## Project

Project name: Sportcation.

Sportcation is being redirected from a web landing site into a full Android mobile startup MVP for sports venue discovery, booking, payment simulation, ticketing, and future secondary-market features.

## Current Condition

- The current repository is a Next.js landing site with a small JSON-based admin CMS.
- It is not yet a full booking app.
- Existing code should only be treated as product reference, not as the final architecture.
- Current implemented features include:
  - Public landing pages.
  - Admin content editing using `data/content.json`.
  - Image upload.
  - Hardcoded admin login.
- Missing production app features include:
  - User authentication.
  - Venue search.
  - Booking.
  - Checkout.
  - Payment.
  - QR ticket or booking code.
  - Resell slot.
  - Auction.
  - Wallet.
  - Notification.
  - Profile.
  - Settings.
  - Real database.
  - Production-ready backend.

## Development Direction

- Rebuild Sportcation into a full Android mobile startup MVP.
- Do not directly convert the old Next.js code.
- Use the current repository only as reference for branding, content, copywriting, and product concept.
- Prioritize mobile-first architecture, clean code, scalable structure, and clear product flow.
- Work step by step. Do not implement everything at once.
- Treat each implementation stage as a focused milestone with clear scope and verification.

## Development Rules

- Before changing code, analyze the relevant files.
- Make small, focused changes per task.
- Document assumptions when requirements are incomplete.
- Explain all files created or modified.
- Run available build, lint, or test commands when possible.
- If implementation is too large, stop after completing the current stage and provide the next recommended prompt.
- Do not preserve insecure or bad architecture from the old app.
- Avoid hardcoded credentials.
- Avoid local JSON file storage for production features.
- Prefer proper database design, API contracts, authentication, and modular architecture.

## Target Android App Core Flows

Build these flows progressively:

1. Onboarding.
2. Login, register, and OTP.
3. Home.
4. Explore venue.
5. Search and filter venue.
6. Venue detail.
7. Slot selection.
8. Checkout.
9. Payment simulation.
10. Booking success.
11. QR ticket or booking code.
12. My bookings.
13. Booking detail.
14. Notification.
15. Profile.
16. Settings.

Future foundations:

- Resell slot.
- Auction.
- Voucher.
- Wallet.

## Recommended Working Sequence

1. Define the Android MVP stack and folder structure.
2. Define product flow and screen map.
3. Define data model and API contracts.
4. Build static Android UI screens with mock data.
5. Add local state and navigation.
6. Add authentication flow.
7. Add backend/database integration.
8. Add booking and checkout flow.
9. Add QR ticket or booking code generation.
10. Add profile, settings, and notification foundations.
11. Add future marketplace foundations only after the booking MVP is stable.
