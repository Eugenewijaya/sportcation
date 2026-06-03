# Product Requirement Document: Sportcation Android MVP

## 1. Product Overview

### What Sportcation Is

Sportcation is a mobile-first Android app for discovering, comparing, and booking sports venues. The MVP focuses on helping users find available sports venues, select a time slot, complete a simulated checkout, and receive a booking ticket or booking code.

The current Next.js landing app should be used only as concept reference for branding, copywriting, product tone, supported sports, and high-level feature ideas. It should not be treated as the final app architecture.

### Main Problem Solved

People who want to play sports often face friction when finding available venues, comparing prices, checking schedule availability, and confirming bookings. Many bookings still rely on manual chat, unclear slot availability, and inconsistent payment confirmation.

Sportcation solves this by giving users a single mobile flow to:

- Discover nearby sports venues.
- Search and filter by sport, location, price, and availability.
- View venue details and available slots.
- Book a slot through a clear checkout flow.
- Receive a booking confirmation and QR ticket or booking code.

### Target Users

- Casual sports players who need a quick booking flow.
- Regular players who book courts or facilities weekly.
- Friend groups looking for venues for futsal, padel, tennis, badminton, basketball, gym, golf, or squash.
- Venue owners or partners who want their venues discoverable in a future partner dashboard.
- Internal admins who manage venue data, bookings, and operational records.

### Startup MVP Positioning

The MVP should validate whether users want a simple Android app for sports venue discovery and booking. It should prioritize a complete booking flow over advanced marketplace features.

The first product promise is:

"Find a venue, choose a slot, simulate payment, and receive a booking code in one mobile flow."

The MVP should not attempt to launch every future feature at once. Resell, auction, voucher, wallet, review, and partner dashboards are future foundations after the core booking flow is stable.

## 2. Product Goals

### User Goals

- Find sports venues quickly.
- Compare venue price, location, rating, sport type, and facilities.
- See available dates and time slots.
- Book a slot with minimal friction.
- Understand total payment before confirmation.
- Receive a clear booking confirmation.
- Access upcoming and past bookings.
- Manage basic profile and app settings.

### Business Goals

- Validate demand for mobile sports venue booking.
- Establish Sportcation as a sports booking platform, not only a landing brand.
- Collect structured booking, venue, and user behavior data.
- Create a foundation for future revenue through booking fees, venue partnerships, resell fees, auction fees, vouchers, and wallet flows.
- Support venue partner onboarding in later stages.

### Technical Goals

- Build a mobile-first Android architecture.
- Keep product modules clean and scalable.
- Avoid direct conversion from the current Next.js landing site.
- Avoid hardcoded credentials and local JSON production storage.
- Use proper data models, API contracts, authentication, and persistence.
- Support mock data in early MVP stages, with a clear path to backend integration.

## 3. User Roles

### Guest User

A guest user can open the app, view onboarding, browse public venue content, use basic search, and view venue details. A guest must log in or register before creating a booking.

### Registered User

A registered user can complete the full booking flow, view booking history, access booking details, receive notifications, and manage profile/settings.

### Venue Owner or Partner

A venue owner or partner is a future role. In the MVP, this role is represented only as a data ownership concept. The full partner dashboard is not required for the first Android MVP.

Future partner responsibilities:

- Manage venue profile.
- Manage court or facility availability.
- Review bookings.
- Update operating hours and pricing.
- Receive booking reports.

### Admin

An admin manages operational data and validates MVP workflows. The MVP does not require a full admin dashboard unless explicitly scoped later.

Admin responsibilities:

- Manage seed venue data.
- Monitor mock or real booking records.
- Handle user support cases.
- Validate venue and slot data.
- Prepare for production operational tooling.

## 4. Core Features

### Onboarding

Introduce Sportcation's value proposition and guide first-time users toward login/register or venue exploration.

Core requirements:

- Show 2 to 3 onboarding screens.
- Explain venue discovery, easy booking, and booking confirmation.
- Allow users to skip onboarding.
- Persist onboarding completion state locally.

### Authentication

Allow users to register or log in before booking.

Core requirements:

- Support login/register by phone number or email.
- Include OTP verification flow for MVP simulation.
- Allow authenticated session persistence.
- Provide logout.
- Avoid hardcoded credentials.

### Home

Provide a dashboard-style entry point for discovery and booking.

Core requirements:

- Show location context.
- Show search entry point.
- Show sport categories.
- Show featured venues or recommended venues.
- Show promotional placeholders for future voucher or flash sale concepts.
- Provide navigation to explore, bookings, notifications, and profile.

### Explore Venue

List available venues for discovery.

Core requirements:

- Display venue cards with image, name, sport type, location, price, rating, and availability signal.
- Support navigation to venue detail.
- Support empty state when no venue matches criteria.

### Search and Filter

Help users narrow venue options.

Core requirements:

- Search by venue name, sport type, or area.
- Filter by sport type.
- Filter by location area.
- Filter by price range.
- Filter by rating.
- Filter by available date or time slot.
- Clear filters.

### Venue Detail

Show all information needed before selecting a booking slot.

Core requirements:

- Venue image gallery or hero image.
- Venue name, sport type, rating, location, and price.
- Facilities such as parking, locker, shower, cafe, indoor, changing room.
- Description.
- Operating hours.
- Available dates.
- Available time slots.
- Map/location placeholder or address section.
- Call to action to continue booking.

### Slot Availability

Let users choose date and time.

Core requirements:

- Display selectable date list.
- Display available, selected, and unavailable slots.
- Prevent selection of unavailable slots.
- Show selected slot summary.
- Pass selected slot to checkout.

### Booking

Create a booking draft before payment simulation.

Core requirements:

- Require authenticated user.
- Require selected venue, date, and slot.
- Generate a booking draft with pending payment status.
- Show booking summary before checkout.
- Prevent duplicate slot selection in the same user flow.

### Checkout

Review booking and payment details.

Core requirements:

- Show venue, date, time, selected court/facility, and price.
- Show service fee.
- Show total payment.
- Support promo code input as disabled or placeholder if vouchers are not in MVP.
- Allow payment method selection for simulation.
- Confirm before payment simulation.

### Payment Simulation

Simulate a successful or failed payment without integrating a real payment gateway.

Core requirements:

- Support at least one simulated payment method, such as QRIS/OVO or virtual account.
- Show payment processing state.
- Allow success path.
- Optionally allow failure path for testing.
- Update booking status after simulated payment.

### Booking Success

Confirm the completed booking.

Core requirements:

- Show success message.
- Show booking ID.
- Show venue, date, time, and total payment.
- Provide navigation to booking ticket/detail.
- Provide navigation back to home.

### QR Ticket or Booking Code

Provide a proof of booking.

Core requirements:

- Generate a unique booking code.
- Show QR ticket placeholder or generated QR based on booking code.
- Show instructions for check-in.
- Make ticket available from booking detail.

### My Bookings

Let users view their booking records.

Core requirements:

- Show upcoming bookings.
- Show past bookings.
- Show cancelled bookings if cancellation is included later.
- Show booking card with venue, date, time, status, and price.
- Open booking detail.

### Notification

Provide app updates related to bookings and future product activity.

Core requirements:

- Show notification list.
- Include booking confirmation notification.
- Include payment status notification.
- Support read/unread state.
- Support empty state.

### Profile

Show user identity and account entry points.

Core requirements:

- Show name, email or phone, avatar placeholder.
- Show booking count or simple user stat.
- Link to payment methods placeholder.
- Link to notifications.
- Link to settings.
- Provide logout.

### Settings

Provide basic user and app preferences.

Core requirements:

- Personal info entry point.
- Notification preference toggle.
- Language placeholder.
- Privacy and security placeholder.
- Help center placeholder.
- Logout.

## 5. Future Features

### Resell Slot

Allow users who cannot attend to list their booked slot for resale. This should only be added after booking ownership, status rules, payment records, and transfer logic are stable.

### Auction

Allow premium slots or resale slots to be bid on. This requires strict rules around bid state, payment authorization, settlement, and anti-abuse controls.

### Voucher

Allow promo codes, discounts, and campaign-based offers. This requires voucher validation, usage limits, expiration, and merchant/platform cost ownership.

### Wallet

Support stored balance, refunds, resale proceeds, and future payouts. This requires strong ledger design and compliance review before production.

### Review and Rating

Allow users to review venues after completed bookings. This requires booking verification and moderation.

### Admin Dashboard

Allow internal admins to manage users, venues, bookings, reports, notifications, and operational issues.

### Venue Owner Dashboard

Allow partners to manage venue details, availability, pricing, booking reports, and payout-related records.

## 6. User Flow

### Guest Flow

1. User opens app.
2. User sees onboarding if first time.
3. User can skip or continue onboarding.
4. User lands on home.
5. User can browse venue categories and explore venue list.
6. User can view venue detail.
7. User must log in or register before booking.

### Login/Register Flow

1. User chooses login or register.
2. User enters phone number or email.
3. App sends or simulates OTP.
4. User enters OTP.
5. App validates OTP.
6. App creates or resumes user session.
7. User returns to intended action or home.

### Explore to Booking Flow

1. User opens Explore.
2. User searches or filters venues.
3. User selects a venue.
4. User views venue detail.
5. User selects date.
6. User selects available time slot.
7. User continues to booking summary or checkout.

### Checkout Flow

1. User reviews booking summary.
2. User selects payment simulation method.
3. User confirms payment.
4. App shows processing state.
5. App marks payment as success or failure.
6. On success, app creates confirmed booking.
7. App shows booking success screen.

### Booking Management Flow

1. User opens My Bookings.
2. User views upcoming, past, or cancelled bookings.
3. User selects a booking.
4. User sees booking detail, status, venue, time, and ticket/code.
5. User can return to bookings or home.

### Notification Flow

1. User receives booking or payment-related notification in app.
2. User opens Notification screen.
3. User sees unread notification.
4. User opens notification detail or related booking.
5. Notification becomes read.

### Profile/Settings Flow

1. User opens Profile.
2. User views account summary.
3. User opens Settings.
4. User updates preferences or views placeholders.
5. User can logout.

## 7. MVP Scope

### Must-Have

- Onboarding.
- Login/register/OTP simulation.
- Home.
- Explore venue.
- Search/filter.
- Venue detail.
- Slot availability.
- Booking draft.
- Checkout.
- Payment simulation.
- Booking success.
- Booking code or QR ticket placeholder.
- My bookings.
- Booking detail.
- Notification list.
- Profile.
- Settings.
- Mock data or seed data for venues and slots.

### Should-Have

- Read/unread notification state.
- Payment failure simulation.
- Basic booking status states: pending payment, confirmed, completed, cancelled.
- Basic local session persistence.
- Empty states for venue list, bookings, and notifications.
- Basic form validation.

### Could-Have

- Favorite venues.
- Recent searches.
- Recommended venues based on sport type.
- Simple map placeholder.
- Dark mode.
- Multi-language placeholder.
- Static promo/voucher placeholder.

### Not Included in MVP

- Real payment gateway integration.
- Real wallet ledger.
- Resell slot transaction.
- Auction bidding.
- Venue owner dashboard.
- Admin dashboard.
- Real-time slot locking across multiple users.
- Push notification integration.
- Advanced review/rating moderation.
- Production fraud prevention.
- Production settlement and payout.

## 8. Acceptance Criteria

### Onboarding

- Given a first-time user opens the app, when onboarding has not been completed, then the app shows onboarding screens.
- Given a user taps Skip, then the app navigates to home or authentication entry.
- Given onboarding is completed, then the app does not show onboarding again on the next launch.

### Authentication

- Given a user enters a valid phone number or email, when they continue, then the app shows OTP input.
- Given a user enters a valid simulated OTP, when they submit, then the app creates a registered session.
- Given a user logs out, then protected booking and profile actions require login again.
- Given a guest attempts to book, then the app redirects the user to login/register first.

### Home

- Given a user opens Home, then the app displays location, search entry, sport categories, and featured or recommended venues.
- Given a user taps a sport category, then the app navigates to Explore with that sport filter applied.
- Given a user taps a venue card, then the app opens venue detail.

### Explore Venue

- Given venues exist, then Explore displays venue cards with image, name, location, sport type, rating, and price.
- Given no venues match the current filters, then Explore displays an empty state.
- Given a user taps a venue card, then the app opens the selected venue detail.

### Search and Filter

- Given a user enters a search keyword, then venue results are filtered by venue name, sport type, or area.
- Given a user applies sport, price, rating, location, or availability filters, then results update accordingly.
- Given a user clears filters, then the default venue list is restored.

### Venue Detail

- Given a user opens venue detail, then the app shows venue information, facilities, location/address, available dates, and available slots.
- Given a user selects an available slot, then the selected state is visible.
- Given a user taps an unavailable slot, then the slot is not selected.
- Given a user taps continue without selecting a slot, then the app shows a validation message.

### Slot Availability

- Given slot data exists for a selected date, then available and unavailable slots are visually distinct.
- Given a user changes date, then the app updates the displayed slots.
- Given a slot is selected, then the checkout summary receives the correct venue, date, time, and price.

### Booking

- Given an authenticated user selects a valid slot, when they continue, then a pending booking draft is created.
- Given a guest selects a valid slot, when they continue, then the app asks the user to log in or register.
- Given a booking draft exists, then the user can review it before payment simulation.

### Checkout

- Given a booking draft exists, then checkout displays venue, date, time, price, service fee, and total payment.
- Given no payment method is selected, then the app prevents payment confirmation.
- Given a payment method is selected, then the user can start payment simulation.

### Payment Simulation

- Given payment simulation starts, then the app shows a processing state.
- Given payment succeeds, then the booking status changes to confirmed.
- Given payment fails, then the booking remains pending payment or failed and the user can retry.

### Booking Success

- Given payment succeeds, then the app displays a booking success screen.
- Given the success screen is shown, then it includes booking ID, venue, date, time, and total payment.
- Given the user taps View Ticket, then the app opens booking detail or ticket screen.

### QR Ticket or Booking Code

- Given a booking is confirmed, then the app generates a unique booking code.
- Given a user opens booking detail, then the app shows booking code or QR ticket placeholder.
- Given the ticket screen is shown, then it includes check-in instructions.

### My Bookings

- Given a user has bookings, then My Bookings shows upcoming and past booking sections or tabs.
- Given no bookings exist, then My Bookings shows an empty state.
- Given a user taps a booking, then booking detail opens.

### Booking Detail

- Given a booking detail is opened, then it shows booking status, venue, date, time, total payment, and ticket/code.
- Given a confirmed booking is opened, then the ticket/code is visible.
- Given a failed or pending booking is opened, then the app shows the correct status.

### Notification

- Given booking confirmation occurs, then a notification item is created.
- Given payment status changes, then a notification item is created.
- Given notifications exist, then the notification screen shows list items with title, message, time, and read state.
- Given no notifications exist, then the notification screen shows an empty state.

### Profile

- Given a logged-in user opens Profile, then the app shows user identity and account summary.
- Given a user taps Settings, then the app opens Settings.
- Given a user taps Logout, then the app ends the session.

### Settings

- Given a user opens Settings, then the app shows personal info, notification preference, language placeholder, privacy/security placeholder, help center, and logout.
- Given a user toggles notification preference, then the setting state updates locally.
- Given a user taps Logout, then the app ends the session and returns to guest state.

## 9. Assumptions

- The first MVP targets Android only.
- Kotlin + Jetpack Compose is the recommended implementation path unless the team later chooses cross-platform delivery.
- Real payment integration is not required for MVP validation.
- OTP can be simulated in early MVP stages.
- Venue and slot data can begin as mock or seed data before backend integration.
- Booking confirmation can use a generated booking code before a full QR implementation.
- Guest users can browse but cannot book.
- Resell, auction, voucher, and wallet are future foundations, not first-stage MVP features.
- Admin and venue owner dashboards are not required in the first Android MVP.
- Push notifications can begin as in-app notification records before external push integration.
- The current Next.js codebase is a branding and concept reference only.
- Production architecture should use real authentication, persistent database storage, modular API contracts, and secure backend services.
