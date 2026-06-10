# Sportcation Audit and Implementation Plan

Audit date: 10 June 2026

## Executive Status

Sportcation is a responsive Next.js 16 web application with three UI surfaces:

- Client: discovery, venue detail, slot selection, checkout, payment simulation, success ticket, auction/resell, bookings, notification, profile, settings, help, and privacy.
- Merchant: dashboard, venues, slots, bookings, finance, and settings.
- Admin: command dashboard, users, venue moderation, bookings, payments, reports, content, and settings.

The repository builds successfully as a production Next.js application. Merchant venue, court, and slot management now uses a real persistent database and API. The remaining client, merchant, and admin modules still use mock/local UI state.

## Verified Results

- `npm run db:generate`: passed, 12-table SQLite/libSQL migration generated.
- `npm run db:migrate`: passed.
- `npm run db:seed`: passed and is idempotent.
- `npm run lint`: passed.
- `npx tsc --noEmit`: passed.
- `npm run build`: passed with TypeScript errors no longer ignored.
- `npm audit --omit=dev`: 0 production vulnerabilities.
- CRUD API smoke test: create, read, update, and delete passed for venues and slots.
- Persistence test: a created venue remained available after restarting the Next.js server.

## Current Architecture

| Layer | Current implementation |
| --- | --- |
| Web app | Next.js App Router, React 19, Tailwind CSS 4 |
| Validation | Zod |
| ORM | Drizzle ORM |
| Local database | SQLite file through `@libsql/client` |
| Production database | Remote libSQL/Turso |
| Future database reference | Neon PostgreSQL schema preserved under `lib/db/postgres` |
| Authentication | Not implemented |
| File storage | Not implemented |
| Payment | UI simulation only |
| Notifications | Mock UI only |

## Database Scope

The active SQLite/libSQL schema contains:

- users
- user_profiles
- merchant_profiles
- sport_categories
- venues
- courts
- slots
- bookings
- booking_items
- payments
- notifications
- audit_logs

Current persistent UI and API coverage:

- Sport category reads.
- Merchant venue create, list, edit, and delete.
- Automatic initial court creation with a new venue.
- Court create, list, edit, and delete API.
- Merchant slot create, list, edit, and delete.
- Duplicate slot protection.
- Booked-slot deletion protection.
- Merchant mutation audit records.

## Production Persistence Decision

A SQLite file is suitable for local development and a single long-running server with a persistent disk. It is not durable on Vercel or most serverless deployments because their local filesystems are ephemeral.

Sportcation therefore uses the SQLite-compatible libSQL protocol:

- Local: `file:./data/sportcation.db`.
- Production: `libsql://...` through Turso.

This preserves the current SQLite development workflow while providing durable production storage. Set `TURSO_DATABASE_URL` and `TURSO_AUTH_TOKEN` on the production host. The runtime intentionally rejects the local file fallback when running on Vercel.

## Audit Findings

### Critical Before Public Production

1. No authentication or session management.
2. Merchant API mutations currently use a demo merchant identity.
3. No role-based authorization for `/merchant`, `/admin`, or API routes.
4. Admin resource screens are UI-only and must not receive public mutation endpoints before authorization exists.
5. Booking and payment state transitions are not server-controlled.

### High Priority

1. Client venue lists still read mock data instead of the venue API.
2. Merchant bookings and finance remain mock data.
3. Admin users, moderation, booking, payment, report, and content modules remain mock data.
4. No automated route or browser test suite is committed.
5. No object storage or upload validation for venue images.
6. API list endpoints do not yet implement pagination.

### Medium Priority

1. No rate limiting or abuse protection.
2. No structured production logging or error monitoring.
3. No database backup/restore runbook.
4. No optimistic concurrency or version fields on mutable records.
5. Audit logs exist for current mutations but have no admin viewer.
6. Search is in-memory after query and is not suitable for a large venue catalog.

## Recommended Development Sequence

### Stage 1: Authentication and Authorization

- Add secure customer, merchant, and admin sessions.
- Replace demo merchant constants with the authenticated merchant membership.
- Protect page routes through middleware or server-side guards.
- Add service-level ownership checks for every mutation.
- Add CSRF-safe mutation strategy and rate limiting.

Exit criteria: an unauthenticated user cannot call any mutation; merchants can only modify their own resources; admin access is role-restricted.

### Stage 2: Service and Repository Layer

- Move route database logic into venue, court, and slot services.
- Add transaction helpers and normalized domain errors.
- Add Vitest tests for validation and ownership rules.
- Add route integration tests against a temporary SQLite database.

Exit criteria: route handlers are thin adapters and critical CRUD rules are covered by tests.

### Stage 3: Client Catalog Integration

- Replace client mock categories, venue cards, venue detail, courts, and available slots with API reads.
- Add pagination, indexed filters, and URL query state.
- Add image upload through R2, S3, or Vercel Blob.

Exit criteria: merchant changes appear in the client catalog without code changes or seed edits.

### Stage 4: Persistent Booking and Payment Simulation

- Implement atomic slot hold and booking creation.
- Enforce booking state transitions on the server.
- Persist payment simulation attempts and expiry.
- Generate signed booking codes or QR payloads.
- Connect My Bookings and booking detail to authenticated users.

Exit criteria: two users cannot purchase the same slot and payment simulation produces a durable booking history.

### Stage 5: Admin Operations

- Build admin venue approval against real data.
- Add user/account controls, booking support actions, and payment reconciliation.
- Add an audit log viewer.
- Add CMS entities before replacing content mock data.

Exit criteria: every admin action is authorized, audited, validated, and reversible where required.

### Stage 6: Production Readiness

- Configure Turso production database and migration pipeline.
- Add backup and restore verification.
- Add Playwright smoke tests for client, merchant, and admin flows.
- Add Sentry or equivalent error monitoring and structured logs.
- Add CI checks for lint, typecheck, test, migration generation, and build.
- Run accessibility, responsive, and performance audits.

## Immediate Next Recommended Task

Implement authentication and role authorization before expanding database-backed admin CRUD. This is the dependency that prevents the current working merchant mutation APIs from being safe for public production.
