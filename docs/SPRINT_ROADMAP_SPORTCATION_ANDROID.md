# Sprint Roadmap: Sportcation Android MVP

## Purpose

This roadmap breaks the Sportcation Android MVP rebuild into small, realistic sprints. It is planning documentation only. It does not implement Android code, backend code, database migrations, or production infrastructure.

The current Next.js landing app remains a concept reference for brand, copywriting, and product ideas. The Android MVP should be rebuilt incrementally with mobile-first architecture, proper data models, and a production-ready direction.

## Roadmap Principles

- Keep each sprint narrow enough for one focused Codex task.
- Complete documentation and planning before implementation.
- Build Android UI first with mock data before backend integration.
- Keep backend setup separate from mobile UI work.
- Do not implement resell, auction, voucher, or wallet flows until the core booking MVP is stable.
- Validate every sprint with a clear checklist.
- Prefer small commits and explicit file explanations after each implementation sprint.

## Sprint 0 - Repository Audit and Documentation

### Goal

Establish shared project direction, document current repository limitations, and define product, UX, system, and sprint plans before writing Android or backend code.

### Scope

- Audit the current Next.js repository.
- Document that the existing app is a landing site and JSON-based CMS only.
- Define Android MVP product requirements.
- Define UI/UX flow.
- Define system design and API contracts.
- Define sprint roadmap.

### User Stories

- As a founder, I want a clear understanding of the current repository so that I do not build on insecure or unsuitable architecture.
- As a product owner, I want a PRD so that MVP scope is explicit.
- As a developer, I want system and sprint documentation so that implementation can be staged safely.

### Technical Tasks

- Review current framework, routes, data storage, admin flow, and API routes.
- Create or update agent instructions.
- Create PRD document.
- Create UI/UX flow document.
- Create system design document.
- Create sprint roadmap document.

### Files or Modules Likely Affected

- `AGENTS.md`
- `docs/PRD_SPORTCATION_ANDROID_MVP.md`
- `docs/UI_UX_FLOW_SPORTCATION_ANDROID.md`
- `docs/SYSTEM_DESIGN_SPORTCATION.md`
- `docs/SPRINT_ROADMAP_SPORTCATION_ANDROID.md`

### Acceptance Criteria

- Current repository limitations are documented.
- Android MVP direction is documented.
- PRD includes goals, roles, features, flows, scope, and acceptance criteria.
- UI/UX flow includes all MVP screens and navigation rules.
- System design includes architecture, entities, schema draft, API contracts, security, and scalability.
- Sprint roadmap exists and covers Sprint 0 through Sprint 17.

### Validation Checklist

- Confirm no app/backend implementation code was added.
- Confirm old JSON CMS is marked as non-production.
- Confirm roadmap aligns with PRD, UI/UX flow, and system design.
- Confirm `git status` shows only intended documentation files.

### Output/Deliverables

- Documentation foundation for the Android MVP rebuild.
- Clear next prompt for Sprint 1.

## Sprint 1 - Android Project Foundation

### Goal

Create a clean Android project foundation for Sportcation without implementing product screens yet.

### Scope

- Initialize native Android project.
- Configure Kotlin and Jetpack Compose.
- Set up Gradle project structure.
- Add baseline app entry point.
- Add package naming and project metadata.
- Add basic build verification.

### User Stories

- As a developer, I want a clean Android project scaffold so that future features can be implemented in the right environment.
- As a product owner, I want the old Next.js app not to be directly converted so that the new mobile app starts from a proper architecture.

### Technical Tasks

- Create Android app directory or module.
- Configure Gradle wrapper if needed.
- Configure Kotlin, Compose, Material 3, and Android SDK settings.
- Create app package such as `com.sportcation.app`.
- Create minimal `MainActivity`.
- Create placeholder app shell.
- Add README note for Android build commands if needed.

### Files or Modules Likely Affected

- `android/` or equivalent Android project root.
- `android/settings.gradle.kts`
- `android/build.gradle.kts`
- `android/app/build.gradle.kts`
- `android/app/src/main/AndroidManifest.xml`
- `android/app/src/main/java/com/sportcation/app/MainActivity.kt`

### Acceptance Criteria

- Android project builds successfully.
- App launches to a minimal placeholder screen.
- No product feature is implemented yet.
- The app uses Kotlin and Jetpack Compose.
- Old Next.js code is not imported into Android source.

### Validation Checklist

- Run Android build command if local Android tooling is available.
- Confirm `MainActivity` uses Compose.
- Confirm package name is consistent.
- Confirm no hardcoded credentials exist.
- Confirm file changes are limited to Android foundation files.

### Output/Deliverables

- Buildable Android project foundation.
- Minimal app launch surface.
- Next prompt for design system setup.

## Sprint 2 - Design System and Reusable Components

### Goal

Create the basic Sportcation Android design system and reusable UI components needed for MVP screens.

### Scope

- Define colors, typography, spacing, shapes, and theme.
- Create reusable buttons, cards, chips, top bars, bottom navigation, empty state, loading state, and error state components.
- Create preview-friendly mock component examples.

### User Stories

- As a user, I want the app UI to feel consistent and polished.
- As a developer, I want reusable UI components so that each screen does not duplicate layout and styling.

### Technical Tasks

- Define `SportcationTheme`.
- Add color tokens based on green/teal sports identity and neutral backgrounds.
- Create reusable primary and secondary CTA components.
- Create sport category chip component.
- Create venue card component shell.
- Create loading skeleton or simple loading indicators.
- Create empty state and error state components.
- Create bottom navigation component.

### Files or Modules Likely Affected

- `android/app/src/main/java/com/sportcation/app/ui/theme/*`
- `android/app/src/main/java/com/sportcation/app/ui/components/*`
- `android/app/src/main/java/com/sportcation/app/ui/preview/*`

### Acceptance Criteria

- Theme applies globally.
- Reusable components compile.
- Components support mobile-first sizing.
- Components have preview examples where practical.
- No screen-specific business logic is added.

### Validation Checklist

- Build app.
- Inspect previews if available.
- Confirm components have clear names.
- Confirm text fits common mobile widths.
- Confirm CTAs have enabled/disabled states.

### Output/Deliverables

- Reusable design system foundation.
- Component library for later screen sprints.

## Sprint 3 - Authentication Flow UI

### Goal

Implement static UI and navigation for onboarding and authentication screens using mock state only.

### Scope

- Splash screen.
- Onboarding screen.
- Login screen.
- Register screen.
- OTP verification screen.
- Auth navigation routes.
- No real auth API.

### User Stories

- As a first-time user, I want onboarding so that I understand Sportcation.
- As a user, I want to log in or register with phone/email and OTP.
- As a guest, I want to skip onboarding and explore first.

### Technical Tasks

- Add navigation graph for splash/onboarding/auth.
- Implement static onboarding slides.
- Implement login form UI.
- Implement register form UI.
- Implement OTP input UI.
- Add simple local UI state for validation messages.
- Add mock success route to Home placeholder.

### Files or Modules Likely Affected

- `android/app/src/main/java/com/sportcation/app/navigation/*`
- `android/app/src/main/java/com/sportcation/app/features/splash/*`
- `android/app/src/main/java/com/sportcation/app/features/onboarding/*`
- `android/app/src/main/java/com/sportcation/app/features/auth/*`

### Acceptance Criteria

- User can navigate from Splash to Onboarding.
- User can skip onboarding.
- User can open Login and Register.
- User can submit mock OTP and navigate forward.
- Error messages are user-friendly.
- No real backend calls are made.

### Validation Checklist

- Build app.
- Manually navigate all auth screens.
- Confirm bottom navigation is not visible on auth screens.
- Confirm invalid form states show helpful messages.
- Confirm no credentials are hardcoded.

### Output/Deliverables

- Authentication UI shell.
- Mock navigation path into the app shell.

## Sprint 4 - Home and Explore Venue UI

### Goal

Implement static Home and Explore UI with mock venue/category data.

### Scope

- App shell with bottom navigation.
- Home screen.
- Explore screen.
- Search result screen.
- Filter screen UI.
- Mock data only.

### User Stories

- As a guest, I want to see sport categories and featured venues.
- As a user, I want to browse venues by category.
- As a user, I want search/filter entry points to narrow venue options.

### Technical Tasks

- Add bottom navigation shell.
- Implement Home layout.
- Implement Explore venue list.
- Implement Search Result layout.
- Implement Filter screen as modal or full screen.
- Create mock venue and sport category models for UI use.
- Wire navigation from Home/Explore to placeholder Venue Detail route.

### Files or Modules Likely Affected

- `android/app/src/main/java/com/sportcation/app/features/home/*`
- `android/app/src/main/java/com/sportcation/app/features/explore/*`
- `android/app/src/main/java/com/sportcation/app/features/search/*`
- `android/app/src/main/java/com/sportcation/app/features/filter/*`
- `android/app/src/main/java/com/sportcation/app/data/mock/*`
- `android/app/src/main/java/com/sportcation/app/navigation/*`

### Acceptance Criteria

- Bottom navigation shows Home, Explore, Bookings, Notifications, Profile.
- Home shows location, search entry, categories, featured/recommended venues.
- Explore shows search bar, sport chips, filter action, and venue list.
- Search Result displays mock filtered results.
- Filter UI can apply/reset mock filters visually.

### Validation Checklist

- Build app.
- Navigate between Home and Explore tabs.
- Open search results and filter screen.
- Confirm venue cards render consistently.
- Confirm empty state exists for no results.

### Output/Deliverables

- Static discovery UI.
- Mock venue browsing experience.

## Sprint 5 - Venue Detail and Slot Selection UI

### Goal

Implement static Venue Detail and Slot Selection screens with mock data.

### Scope

- Venue Detail screen.
- Slot Selection screen.
- Date selector.
- Slot grid with available/booked/selected states.
- Continue-to-checkout navigation placeholder.

### User Stories

- As a user, I want to inspect venue details before booking.
- As a user, I want to select a date and available time slot.
- As a guest, I want to view slots but be prompted to log in before checkout.

### Technical Tasks

- Implement Venue Detail screen layout.
- Implement facilities and image section.
- Implement location/address placeholder.
- Implement Slot Selection screen.
- Add mock availability states.
- Add selected slot summary.
- Add navigation to Checkout placeholder.

### Files or Modules Likely Affected

- `android/app/src/main/java/com/sportcation/app/features/venue/*`
- `android/app/src/main/java/com/sportcation/app/features/slot/*`
- `android/app/src/main/java/com/sportcation/app/data/mock/*`
- `android/app/src/main/java/com/sportcation/app/navigation/*`

### Acceptance Criteria

- Venue Detail displays venue image, name, rating, location, price, facilities, and CTA.
- Slot Selection displays dates and time slots.
- Booked/unavailable slots cannot be selected.
- Selected slot is visibly highlighted.
- Continue CTA is disabled until a slot is selected.

### Validation Checklist

- Build app.
- Navigate from Explore to Venue Detail.
- Navigate to Slot Selection.
- Test selecting different dates and slots.
- Confirm validation when no slot is selected.

### Output/Deliverables

- Venue detail UI.
- Slot selection UI with mock state.

## Sprint 6 - Checkout and Payment Simulation UI

### Goal

Implement checkout and payment simulation screens using mock booking draft data.

### Scope

- Checkout screen.
- Payment method selection.
- Price breakdown.
- Payment Simulation screen.
- Simulated success/failure UI states.

### User Stories

- As a user, I want to review my booking before paying.
- As a user, I want to choose a simulated payment method.
- As a user, I want to see payment processing and failure/success states.

### Technical Tasks

- Implement Checkout screen layout.
- Add booking summary card.
- Add voucher placeholder field.
- Add payment method selection.
- Add total calculation display using mock values.
- Implement Payment Simulation screen.
- Add mock payment success/failure actions.
- Route success to Booking Success placeholder.

### Files or Modules Likely Affected

- `android/app/src/main/java/com/sportcation/app/features/checkout/*`
- `android/app/src/main/java/com/sportcation/app/features/payment/*`
- `android/app/src/main/java/com/sportcation/app/data/mock/*`
- `android/app/src/main/java/com/sportcation/app/navigation/*`

### Acceptance Criteria

- Checkout displays venue, date, time, court, fees, and total.
- Pay Now is disabled until payment method is selected.
- Payment Simulation displays selected method and total amount.
- Processing state is visible.
- Success and failure mock paths exist.

### Validation Checklist

- Build app.
- Navigate from slot selection to checkout.
- Test Pay Now disabled/enabled state.
- Test success and failure simulation.
- Confirm back behavior does not return from success to payment processing.

### Output/Deliverables

- Checkout UI.
- Payment simulation UI.

## Sprint 7 - Booking Success, QR Ticket, and My Bookings UI

### Goal

Implement post-payment booking screens and static booking history UI.

### Scope

- Booking Success screen.
- QR Ticket screen.
- My Bookings screen.
- Booking Detail screen.
- Mock booking records.

### User Stories

- As a user, I want confirmation after successful payment.
- As a user, I want a booking code or QR ticket for check-in.
- As a user, I want to view my upcoming and past bookings.
- As a user, I want to inspect booking details.

### Technical Tasks

- Implement Booking Success screen.
- Implement QR Ticket screen with booking code/QR placeholder.
- Implement My Bookings screen with tabs.
- Implement Booking Detail screen.
- Add mock booking list.
- Add empty states for bookings.
- Wire navigation between success, ticket, bookings, and detail.

### Files or Modules Likely Affected

- `android/app/src/main/java/com/sportcation/app/features/booking/*`
- `android/app/src/main/java/com/sportcation/app/features/ticket/*`
- `android/app/src/main/java/com/sportcation/app/data/mock/*`
- `android/app/src/main/java/com/sportcation/app/navigation/*`

### Acceptance Criteria

- Booking Success shows booking ID, venue, date, time, and total.
- QR Ticket shows booking code and check-in instructions.
- My Bookings shows upcoming, past, and cancelled tabs.
- Booking Detail shows status, schedule, payment summary, and ticket action.
- Empty state exists for no bookings.

### Validation Checklist

- Build app.
- Navigate from payment success to Booking Success.
- Open QR Ticket.
- Open My Bookings tab.
- Open Booking Detail.
- Verify bottom navigation behavior on My Bookings.

### Output/Deliverables

- Complete static post-booking UI.
- Mock booking management screens.

## Sprint 8 - Notification, Profile, and Settings UI

### Goal

Implement static account-related screens with mock user state.

### Scope

- Notification screen.
- Profile screen.
- Edit Profile screen.
- Settings screen.
- Logout UI behavior placeholder.

### User Stories

- As a user, I want to view booking and payment notifications.
- As a user, I want to view and edit my profile.
- As a user, I want to manage basic app settings.

### Technical Tasks

- Implement Notification screen.
- Add read/unread notification UI.
- Add Mark all as read mock action.
- Implement Profile screen.
- Implement Edit Profile screen.
- Implement Settings screen.
- Add notification preference toggle.
- Add logout placeholder route to Login.

### Files or Modules Likely Affected

- `android/app/src/main/java/com/sportcation/app/features/notification/*`
- `android/app/src/main/java/com/sportcation/app/features/profile/*`
- `android/app/src/main/java/com/sportcation/app/features/settings/*`
- `android/app/src/main/java/com/sportcation/app/data/mock/*`
- `android/app/src/main/java/com/sportcation/app/navigation/*`

### Acceptance Criteria

- Notifications display list and empty state.
- Mark all as read updates local UI state.
- Profile displays avatar placeholder, name, contact, stats, and menu items.
- Edit Profile supports local validation.
- Settings displays preferences and logout.

### Validation Checklist

- Build app.
- Navigate to Notifications, Profile, Edit Profile, and Settings.
- Test profile form validation.
- Test notification read state.
- Test settings toggle.

### Output/Deliverables

- Static account and settings UI.
- Complete MVP screen set using mock UI state.

## Sprint 9 - Mock Data and Local State Integration

### Goal

Connect the Android UI screens through shared mock repositories and local state so the MVP demo flow feels coherent.

### Scope

- Shared mock repositories.
- Local session state.
- Onboarding completion state.
- Booking draft state.
- Mock booking creation.
- In-app notification creation after mock payment.

### User Stories

- As a demo user, I want the app flow to remember my selected slot through checkout.
- As a demo user, I want a successful mock payment to create a booking.
- As a demo user, I want booking confirmation to create a notification.
- As a returning user, I want onboarding not to show again after completion.

### Technical Tasks

- Create mock data source interfaces.
- Create mock repositories for venues, slots, bookings, notifications, and profile.
- Add local state holder or ViewModels for key flows.
- Persist onboarding completion locally.
- Persist simple mock auth/session state locally.
- Convert payment success into mock confirmed booking.
- Generate mock booking code.

### Files or Modules Likely Affected

- `android/app/src/main/java/com/sportcation/app/data/mock/*`
- `android/app/src/main/java/com/sportcation/app/data/repository/*`
- `android/app/src/main/java/com/sportcation/app/domain/model/*`
- `android/app/src/main/java/com/sportcation/app/domain/usecase/*`
- `android/app/src/main/java/com/sportcation/app/features/*`
- `android/app/src/main/java/com/sportcation/app/navigation/*`

### Acceptance Criteria

- Venue selection persists into detail and slot screens.
- Selected slot persists into checkout.
- Payment success creates a confirmed booking.
- Booking appears in My Bookings.
- Booking ticket uses generated booking code.
- Booking success creates a notification.
- Onboarding completion is remembered.

### Validation Checklist

- Build app.
- Complete full mock flow from onboarding to booking ticket.
- Restart app if possible and confirm onboarding state.
- Confirm booking appears after payment success.
- Confirm notification appears after booking confirmation.

### Output/Deliverables

- Coherent mock MVP flow without backend.
- Local state integration ready for API replacement later.

## Sprint 10 - Backend Architecture Setup

### Goal

Create backend project foundation with modular architecture, but do not implement full business features yet.

### Scope

- Backend project scaffold.
- Environment configuration.
- Health endpoint.
- API versioning.
- Basic logging.
- Validation framework.
- Database connection placeholder.

### User Stories

- As a developer, I want a backend foundation so that APIs can be implemented consistently.
- As an operator, I want health checks and structured logs so that the service can be monitored.

### Technical Tasks

- Create backend app directory.
- Initialize NestJS or chosen backend framework.
- Configure TypeScript.
- Configure environment loading.
- Add health endpoint.
- Add global validation pipe.
- Add structured error response format.
- Add initial module structure.

### Files or Modules Likely Affected

- `backend/`
- `backend/package.json`
- `backend/src/main.ts`
- `backend/src/app.module.ts`
- `backend/src/health/*`
- `backend/src/common/*`
- `backend/.env.example`

### Acceptance Criteria

- Backend starts locally.
- Health endpoint returns OK.
- API base path uses `/api/v1`.
- Invalid request format returns structured error.
- No production secrets are committed.

### Validation Checklist

- Run backend build.
- Run backend dev server if possible.
- Call health endpoint.
- Confirm `.env.example` exists.
- Confirm no hardcoded credentials.

### Output/Deliverables

- Backend architecture scaffold.
- Health check and validation baseline.

## Sprint 11 - Database Schema and Seed Data

### Goal

Implement database schema and seed data for core MVP entities.

### Scope

- Prisma schema or chosen ORM schema.
- PostgreSQL connection setup.
- Migrations.
- Seed sport categories, facilities, venues, courts, and slots.
- No mobile integration yet.

### User Stories

- As a developer, I want a real schema so that Sportcation does not rely on JSON file storage.
- As a tester, I want seed data so that venue and booking flows can be tested consistently.

### Technical Tasks

- Configure Prisma.
- Define core tables: users, profiles, sport categories, venues, courts, images, facilities, slots, bookings, booking items, payments, notifications.
- Define future foundation tables if lightweight enough, or leave documented for later.
- Add migration.
- Add seed script.
- Add sample venues matching PRD sports.

### Files or Modules Likely Affected

- `backend/prisma/schema.prisma`
- `backend/prisma/migrations/*`
- `backend/prisma/seed.ts`
- `backend/src/database/*`
- `backend/package.json`
- `backend/.env.example`

### Acceptance Criteria

- Database migrations apply successfully.
- Seed script inserts sample categories, facilities, venues, courts, and slots.
- Money fields use integer values.
- Relationships and indexes exist for core booking flow.
- Local JSON file storage is not used.

### Validation Checklist

- Run migration command.
- Run seed command.
- Query seeded data.
- Confirm unique constraints for slots/bookings.
- Confirm schema aligns with system design.

### Output/Deliverables

- Database schema foundation.
- Seed data for API development.

## Sprint 12 - Auth API

### Goal

Implement authentication API foundation with simulated OTP for MVP development.

### Scope

- Register endpoint.
- Login endpoint.
- Verify OTP endpoint.
- Current user endpoint.
- Token/session strategy for local MVP.
- No production SMS/email OTP integration yet.

### User Stories

- As a user, I want to register or log in using email/phone and OTP.
- As a backend developer, I want internal users mapped to auth sessions.
- As a mobile developer, I want stable auth contracts for integration.

### Technical Tasks

- Implement auth module.
- Add DTO validation.
- Add simulated OTP session store for local/dev.
- Create or find user after OTP verification.
- Create user profile if missing.
- Issue access token for protected endpoints.
- Add auth guard.
- Add `/users/me` endpoint or auth current user endpoint.

### Files or Modules Likely Affected

- `backend/src/auth/*`
- `backend/src/users/*`
- `backend/src/common/guards/*`
- `backend/src/common/decorators/*`
- `backend/prisma/schema.prisma` if needed

### Acceptance Criteria

- Register returns OTP session.
- Login returns OTP session.
- Verify OTP returns token and user summary.
- Protected current user endpoint works with token.
- Invalid OTP returns user-friendly error.
- No hardcoded permanent credentials exist.

### Validation Checklist

- Run backend tests if available.
- Manually call register/login/verify endpoints.
- Verify protected endpoint rejects missing token.
- Verify protected endpoint accepts valid token.
- Confirm rate limiting is planned or implemented minimally.

### Output/Deliverables

- Auth API MVP foundation.
- Protected route capability for later APIs.

## Sprint 13 - Venue and Slot API

### Goal

Implement public venue discovery, venue detail, search/filter, and slot availability APIs.

### Scope

- Sport categories endpoint.
- Venue list endpoint.
- Venue detail endpoint.
- Search/filter endpoint.
- Slot availability endpoint.
- Pagination.

### User Stories

- As a guest, I want to browse venues.
- As a user, I want to search and filter venues.
- As a user, I want to see slot availability before booking.

### Technical Tasks

- Implement venue module.
- Implement sport category module if separate.
- Implement search query DTO.
- Implement availability query DTO.
- Read seeded data from database.
- Add pagination.
- Add simple sorting by rating, price, or default order.

### Files or Modules Likely Affected

- `backend/src/venues/*`
- `backend/src/sport-categories/*`
- `backend/src/slots/*`
- `backend/src/common/pagination/*`
- `backend/prisma/schema.prisma` if refinements are needed

### Acceptance Criteria

- `GET /api/v1/venues` returns active venues with pagination.
- `GET /api/v1/venues/{id}` returns detail data.
- `GET /api/v1/search/venues` supports query/filter parameters.
- `GET /api/v1/venues/{id}/availability` returns slots grouped by court.
- API does not expose inactive/deleted venues to public users.

### Validation Checklist

- Run backend build/test.
- Call venue list endpoint.
- Call venue detail endpoint.
- Call search/filter combinations.
- Call availability endpoint for seeded venue.
- Confirm response shapes match system design.

### Output/Deliverables

- Venue discovery API.
- Slot availability API.

## Sprint 14 - Booking and Payment API

### Goal

Implement booking draft, payment simulation, booking confirmation, ticket, my bookings, and notification creation.

### Scope

- Create booking draft.
- Hold selected slot.
- Create simulated payment.
- Complete payment simulation.
- Confirm booking.
- Generate booking code.
- Get booking detail.
- Get my bookings.
- Get ticket payload.
- Create notification records.

### User Stories

- As a registered user, I want to book an available slot.
- As a user, I want payment simulation to confirm my booking.
- As a user, I want to view my ticket and booking history.
- As a user, I want to receive confirmation notifications.

### Technical Tasks

- Implement booking module.
- Implement payment module.
- Implement notification event creation.
- Add transaction-safe slot hold logic.
- Add booking code generation.
- Add ticket endpoint.
- Add my bookings endpoint.
- Add simple cancellation endpoint if included.

### Files or Modules Likely Affected

- `backend/src/bookings/*`
- `backend/src/payments/*`
- `backend/src/notifications/*`
- `backend/src/tickets/*`
- `backend/src/common/utils/*`
- `backend/prisma/schema.prisma` if refinements are needed

### Acceptance Criteria

- Authenticated user can create booking draft for available slot.
- Slot becomes held during pending payment.
- Payment simulation success marks payment succeeded and booking confirmed.
- Confirmed booking has unique booking code.
- My Bookings returns confirmed booking.
- Ticket endpoint returns QR payload or booking code payload.
- Notification is created after confirmation.

### Validation Checklist

- Run backend build/test.
- Create booking draft through API.
- Attempt duplicate booking for same slot and confirm rejection.
- Simulate payment success.
- Fetch booking detail.
- Fetch ticket.
- Fetch notifications.

### Output/Deliverables

- Core booking API.
- Payment simulation API.
- Ticket and notification backend.

## Sprint 15 - Mobile-Backend Integration

### Goal

Replace Android mock repositories with API-backed repositories for core MVP flows while preserving UI behavior.

### Scope

- Configure API client.
- Integrate auth API.
- Integrate venue/search/availability APIs.
- Integrate booking/payment/ticket APIs.
- Integrate notifications and profile APIs.
- Keep graceful fallback or clear error states.

### User Stories

- As a user, I want the Android app to use real backend data.
- As a user, I want venue and booking state to persist beyond the app session.
- As a developer, I want mock repositories to be replaceable by API repositories cleanly.

### Technical Tasks

- Add Retrofit/Ktor client.
- Add network DTOs.
- Add token storage.
- Implement API repositories.
- Map API DTOs to domain models.
- Update ViewModels/use cases to use repositories.
- Add environment config for API base URL.
- Integrate auth flow.
- Integrate venue and booking flows.

### Files or Modules Likely Affected

- `android/app/src/main/java/com/sportcation/app/data/api/*`
- `android/app/src/main/java/com/sportcation/app/data/repository/*`
- `android/app/src/main/java/com/sportcation/app/domain/model/*`
- `android/app/src/main/java/com/sportcation/app/domain/usecase/*`
- `android/app/src/main/java/com/sportcation/app/features/*`
- `android/app/src/main/java/com/sportcation/app/core/session/*`

### Acceptance Criteria

- Android app can authenticate through backend.
- Venue list comes from backend.
- Venue detail and availability come from backend.
- Booking draft is created through backend.
- Payment simulation confirms booking through backend.
- My Bookings and QR Ticket read backend data.
- Notifications read backend data.

### Validation Checklist

- Run Android build.
- Run backend locally.
- Complete end-to-end flow from login to ticket.
- Test network error state.
- Test invalid/missing token state.
- Confirm no local JSON production storage is used.

### Output/Deliverables

- Android MVP connected to backend APIs.
- End-to-end booking demo path.

## Sprint 16 - Testing, QA, and Cleanup

### Goal

Stabilize the MVP through focused testing, UI cleanup, error handling, and documentation updates.

### Scope

- Android unit tests for state/use cases where practical.
- Backend tests for auth, venue, booking, and payment APIs.
- Manual QA checklist.
- UI polish.
- Error state cleanup.
- Documentation updates.

### User Stories

- As a tester, I want predictable flows and clear test cases.
- As a user, I want the app to handle errors gracefully.
- As a developer, I want confidence that booking and payment state transitions work.

### Technical Tasks

- Add backend API tests for critical endpoints.
- Add Android ViewModel/use-case tests where applicable.
- Add manual QA document or checklist.
- Verify empty/loading/error states.
- Clean unused mock code or isolate it for development only.
- Fix inconsistent naming and formatting.
- Review security risks.

### Files or Modules Likely Affected

- `android/app/src/test/*`
- `android/app/src/androidTest/*`
- `backend/test/*`
- `backend/src/**/*.spec.ts`
- `docs/QA_CHECKLIST_SPORTCATION_ANDROID.md`
- Existing Android/backend feature files as needed

### Acceptance Criteria

- Critical backend endpoints have tests.
- Android core state transitions have tests or manual validation.
- Full user flow passes manual QA.
- Error states are user-friendly.
- No obvious dead code or insecure placeholder remains in active production path.

### Validation Checklist

- Run Android tests.
- Run Android build.
- Run backend tests.
- Run backend build.
- Execute manual QA path: auth -> explore -> slot -> checkout -> payment -> ticket -> bookings -> notification.
- Confirm documentation reflects current implementation.

### Output/Deliverables

- Tested MVP candidate.
- QA checklist and cleanup notes.

## Sprint 17 - Production Readiness

### Goal

Prepare the MVP for controlled demo, staging deployment, or limited pilot.

### Scope

- Environment configuration.
- Deployment readiness.
- Logging and monitoring.
- Security hardening.
- Database migration workflow.
- Release checklist.
- Known limitations.

### User Stories

- As an operator, I want the backend deployable with environment variables and health checks.
- As a founder, I want a clear release checklist and known limitations.
- As a developer, I want staging readiness before production.

### Technical Tasks

- Create production/staging environment checklist.
- Configure backend deployment docs.
- Configure database migration instructions.
- Configure object storage instructions if media upload exists.
- Add logging and monitoring guidance.
- Add Sentry/Firebase setup guidance.
- Add security review notes.
- Add release checklist.
- Confirm payment remains simulation-only unless real gateway is explicitly added.

### Files or Modules Likely Affected

- `docs/PRODUCTION_READINESS_SPORTCATION.md`
- `backend/.env.example`
- `backend/README.md`
- `android/README.md`
- Deployment config files if selected later

### Acceptance Criteria

- Staging deployment plan is documented.
- Required environment variables are listed.
- Health check exists and is documented.
- Database migration process is documented.
- Logging/monitoring setup is documented.
- Known MVP limitations are documented.
- Release checklist exists.

### Validation Checklist

- Confirm no production secrets are committed.
- Confirm backend can build for deployment.
- Confirm Android can build release or staging variant if configured.
- Confirm migration command is documented.
- Confirm payment is clearly marked as simulation.
- Confirm future production blockers are listed.

### Output/Deliverables

- Production readiness plan.
- Release checklist.
- MVP staging/pilot preparation.

## Recommended Execution Order

1. Complete Sprint 0 documentation.
2. Build Android UI with mock data through Sprint 9.
3. Build backend foundation and APIs through Sprint 14.
4. Integrate Android and backend in Sprint 15.
5. Stabilize in Sprint 16.
6. Prepare staging/pilot readiness in Sprint 17.

## Per-Sprint Prompt Template

Use this prompt shape for implementation sprints:

```text
Execute Sprint [number] from docs/SPRINT_ROADMAP_SPORTCATION_ANDROID.md.

Important:
- Analyze relevant files first.
- Keep changes focused only to this sprint.
- Do not implement future sprint scope.
- Explain assumptions.
- After changes, run available build/test commands if possible.
- Provide summary, files changed, validation result, and next recommended prompt.
```
