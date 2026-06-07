# AGENTS.md

## Project

Project name: Sportcation.

Sportcation is now a responsive web app for sports venue discovery, booking, checkout, payment simulation, auction, resell, bookings, notification, profile, and settings flows.

## Source Of Truth

- Use the exported Figma design layers in `D:\sportcation\figma sportcation` as the visual and UX reference.
- The Figma connector may require reauthentication. If it is unavailable, use the local exported PNG layers as the implementation reference.
- The app must be a web app, not Android, Kotlin, React Native, or Expo.
- The mobile viewport should closely follow the Figma app screens.
- Wider desktop viewports should adapt into a proper web layout with sidebar/top navigation and wider content, not a stretched phone mockup.

## Current Direction

- Keep the product implemented in Next.js.
- The app should prioritize a usable responsive prototype with local UI state.
- Do not reintroduce the old JSON admin CMS, hardcoded admin credentials, Android project, or backend scaffolding unless the user explicitly asks.
- Product flows can use mock/local data until real backend requirements are requested.

## Core Web App Flows

Build and maintain these flows progressively:

1. Onboarding and login entry.
2. Home dashboard.
3. Explore venues with search and category filters.
4. Venue detail and slot selection.
5. Checkout.
6. QRIS/payment simulation.
7. Booking success and ticket display.
8. Flash sale deals.
9. Auction and resell marketplace.
10. My bookings.
11. Notifications.
12. Profile.
13. Settings.
14. Help and privacy screens.

## Development Rules

- Before changing code, analyze the relevant files and the matching Figma export image.
- Make focused changes that preserve the web app direction.
- Document assumptions when requirements are incomplete.
- Explain files created, modified, or deleted.
- Run available build, lint, or visual verification commands when possible.
- Keep local mock data centralized or clearly grouped.
- Avoid hardcoded credentials and production-like secrets.
- Do not add a backend or database unless requested in a separate task.
- Do not preserve insecure or irrelevant architecture from the old landing/admin app.
- Use responsive layouts intentionally:
  - Mobile: app-like shell with bottom navigation.
  - Desktop: web shell with sidebar, top search, and grid/panel layouts.
