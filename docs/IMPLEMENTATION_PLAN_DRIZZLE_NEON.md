# Sportcation Implementation Plan - Drizzle ORM + Neon PostgreSQL

> Archived planning snapshot. The statements below describe the pre-SQLite/pre-auth state and are retained only as Neon migration context. Do not use this file as current implementation status. See `AUDIT_AND_IMPLEMENTATION_PLAN_SQLITE_LIBSQL.md`.

## Audit Summary

The current repository is a responsive Next.js web app prototype. It now contains three UI surfaces:

- Client app: venue discovery, booking, checkout, payment simulation, auction, resell, booking list, notifications, profile, settings, help, and privacy.
- Merchant app: dashboard, venues, slots, bookings, finance, and settings.
- Admin app: command dashboard, users, venues, bookings, payments, reports, content, and settings.

The app builds as a frontend-only prototype with local mock data. It has no production authentication, backend API, database, persistence, authorization, file upload, payment gateway, notification service, or audit logging yet.

## Current Technical State

- Framework: Next.js App Router.
- Styling: Tailwind CSS v4 with global Sportcation tokens.
- UI state: local React state and static mock arrays.
- ORM foundation: Drizzle ORM.
- Database target: Neon PostgreSQL.
- Schema/migration status: initial schema and generated migration are present.
- Routing:
  - `/`
  - `/merchant`
  - `/merchant/venues`
  - `/merchant/slots`
  - `/merchant/bookings`
  - `/merchant/finance`
  - `/merchant/settings`
  - `/admin`
  - `/admin/users`
  - `/admin/venues`
  - `/admin/bookings`
  - `/admin/payments`
  - `/admin/reports`
  - `/admin/content`
  - `/admin/settings`
- Backend API routes: not implemented.
- Database runtime integration: not connected yet because a Neon `DATABASE_URL` is required.

## CRUD Readiness

The Merchant and Admin UI has resource tables, search controls, filters, create buttons, edit/archive/delete row actions, and form panels. These are intentionally local-only for now, but the resource shapes are ready to map to server mutations.

Recommended CRUD resources:

- users
- user_profiles
- merchant_profiles
- merchant_members
- sport_categories
- venues
- courts
- venue_images
- facilities
- slots
- bookings
- booking_items
- payments
- refunds
- payouts
- vouchers
- notifications
- reviews
- resell_listings
- auctions
- bids
- wallets
- wallet_transactions
- cms_entries
- audit_logs

## Recommended Backend Architecture

Use Next.js route handlers or server actions for the first backend stage, then split to a dedicated API service only if scale or team ownership requires it.

Primary recommendation:

- App: Next.js App Router
- ORM: Drizzle ORM
- Database: Neon PostgreSQL
- Auth: Auth.js, Clerk, or custom JWT/session flow after role requirements are final
- Validation: Zod
- File storage: Vercel Blob, S3-compatible storage, or Cloudflare R2
- Deployment: Vercel

## Implementation Stages

1. Environment and database foundation
   - Done: added `.env.example`.
   - Done: added `drizzle.config.ts`.
   - Done: added `lib/db` connection module.
   - Done: configured Neon pooled runtime URL and optional direct migration URL.

2. Schema and migrations
   - Done: created initial Drizzle schema.
   - Done: added primary keys, foreign keys, indexes, timestamps, status enums, and review rating check constraint.
   - Done: added generated SQL migration.
   - Done: added seed script for sport categories, demo venues, courts, slots, users, bookings, payments, wallet, auction, notifications, voucher, and CMS entry.

3. Authentication and authorization
   - Implement login/register/session.
   - Define roles: customer, merchant_owner, merchant_staff, admin, finance_admin, content_admin, support_admin.
   - Protect `/merchant/*` and `/admin/*`.
   - Add route-level authorization checks.

4. API contracts
   - Implement resource endpoints or server actions:
     - Client: venues, slots, checkout, bookings, notifications, profile.
     - Merchant: venues, courts, slots, bookings, payouts.
     - Admin: users, venue approval, bookings, payments, reports, content.

5. Replace mock data incrementally
   - Start with read-only venue and slot queries.
   - Then booking creation.
   - Then merchant venue/slot CRUD.
   - Then admin moderation and payment reconciliation.

6. Payment simulation persistence
   - Persist payment attempts and state transitions.
   - Protect booking state changes with server-side checks.
   - Keep external payment gateway out until simulation is stable.

7. Audit trail and security
   - Add `audit_logs` for admin and merchant mutations.
   - Add rate limiting for auth and payment endpoints.
   - Add ownership checks for merchant resources.
   - Add input validation and server-only state transitions.

8. QA and production readiness
   - Add unit tests for schema and service logic.
   - Add route handler tests for critical APIs.
   - Add Playwright smoke tests for client, merchant, and admin navigation.
   - Add deployment checks and environment validation.

## Archived Next Task

This task is intentionally deferred. Do not apply the Neon migration until the active SQLite/libSQL implementation has service-layer tests and the team approves a database migration:

- Add real `DATABASE_URL` and optional `DIRECT_DATABASE_URL`.
- Run `npm run db:migrate`.
- Run `npm run db:seed`.
- Inspect tables in Neon or `npm run db:studio`.
- Then implement read-only venue/category/slot API routes before wiring UI mutations.
