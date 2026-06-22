# Sportcation

Sportcation is a responsive Next.js web app for sports venue discovery, booking flows, merchant operations, and platform administration. The mobile UI follows the exported Figma layers in `D:\sportcation\figma sportcation`, while desktop viewports use dedicated web layouts.

## Current State

- Next.js 16 App Router, React 19, Tailwind CSS 4.
- Drizzle ORM with local SQLite and production-compatible remote libSQL/Turso.
- Better Auth email/password sessions.
- Role protection for customer, merchant owner/staff, and admin.
- Merchant membership permissions for owner, manager, staff, finance, and viewer.
- Persistent merchant venue, court, and slot CRUD.
- Persistent customer booking creation, payment simulation, booking success, and My Bookings.
- Customer booking cancellation and pending-payment expiry for local/libSQL booking simulation.
- Persistent customer profile and notification read-state management.
- Persistent merchant booking list, detail, check-in, and completion actions.
- Persistent merchant finance settlement summary and payout-readiness foundation.
- Persistent admin booking and simulated payment review.
- Persistent admin user directory and venue moderation review.
- Server-only service/repository boundaries with atomic mutation and audit-log transactions.
- Vitest unit/integration tests, Playwright Chromium E2E, and GitHub Actions CI.
- Admin reports, content, and settings remain prototype UI.

## Local Setup

```powershell
npm install
Copy-Item .env.example .env.local
npm run db:migrate
npm run db:seed
npm run dev
```

Set a unique auth secret of at least 32 characters in `.env.local`:

```text
BETTER_AUTH_SECRET=replace-with-a-long-random-secret
BETTER_AUTH_URL=http://localhost:3000
AUTH_TRUSTED_ORIGINS=http://localhost:3000
```

Open `http://localhost:3000`.

## Provision Merchant And Admin Accounts

Public registration only creates customer accounts. Set temporary bootstrap environment variables, run the command once, then remove the credential variables:

```bash
npm run auth:bootstrap
```

Supported variables are documented in `.env.example`. Passwords must contain at least 12 characters. No operational credentials are committed to the repository.

## Main Routes

```text
/                       Client web app
/login                  Shared login
/register               Customer registration
/merchant               Protected merchant dashboard
/merchant/venues        Persistent venue CRUD
/merchant/slots         Persistent slot CRUD
/merchant/bookings      Persistent merchant booking operations
/merchant/finance       Persistent merchant finance foundation
/admin                  Protected admin dashboard
/admin/users            Persistent admin user directory
/admin/venues           Persistent admin venue moderation
/admin/bookings         Persistent admin booking review
/admin/payments         Persistent admin payment review
```

## Database

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
npm run db:studio
```

- Local development defaults to `file:./data/sportcation.db`.
- Stateless production environments must use `TURSO_DATABASE_URL=libsql://...` and `TURSO_AUTH_TOKEN`.
- A local SQLite file is not durable on Vercel because the filesystem is ephemeral.
- The previous Neon PostgreSQL schema remains under `lib/db/postgres` as a future migration reference.

## Validation

```bash
npm run lint
npm run typecheck
npm run test:coverage
npm run build
npm run test:e2e
npm audit
```

Production builds require `BETTER_AUTH_SECRET` and either `BETTER_AUTH_URL` or `NEXT_PUBLIC_APP_URL`.
The E2E runner creates an isolated SQLite database under `.tmp`, provisions random test credentials, starts a dedicated Next.js server, and removes process state after the suite.

For deployment, use one Vercel project for customer, merchant, and admin routes. See `docs/VERCEL_DEPLOYMENT_RUNBOOK.md`. After pulling production environment variables and applying migrations, run:

```bash
npm run deploy:check
```

The check rejects local SQLite, insecure application URLs, placeholder auth secrets, unavailable databases, and missing production tables.

The latest security review is in `docs/SECURITY_AUDIT_2026-06-11.md`. Preview/internal QA is supported after remote database setup. Customer booking and payment simulation are persistent, but real paid traffic remains out of scope until payment gateway, webhook, refund, and expiration workflows are implemented.

## Current Persistent APIs

```text
GET, POST          /api/venues
GET, PATCH, DELETE /api/venues/:id
GET, POST          /api/courts
PATCH, DELETE      /api/courts/:id
GET, POST          /api/slots
PATCH, DELETE      /api/slots/:id
GET                /api/categories
GET, POST          /api/bookings
GET                /api/bookings/:id
POST               /api/bookings/:id/cancel
POST               /api/bookings/expire-pending
POST               /api/payments/:bookingId/simulate
GET, PATCH         /api/profile
GET                /api/notifications
POST               /api/notifications/:id/read
POST               /api/notifications/mark-all-read
GET                /api/merchant/bookings
GET                /api/merchant/bookings/:id
POST               /api/merchant/bookings/:id/status
GET                /api/merchant/finance
GET                /api/admin/bookings
GET                /api/admin/bookings/:id
GET                /api/admin/payments
GET                /api/admin/payments/:id
GET                /api/admin/users
GET                /api/admin/users/:id
GET                /api/admin/venues
GET                /api/admin/venues/:id
```

Merchant APIs require an active merchant session, verified merchant membership, ownership, and the required membership permission. Admin review APIs require an active admin session and are read-only in the MVP. Customer booking, profile, and notification APIs require an active customer session and only expose the current user's records. See `docs/AUDIT_AND_IMPLEMENTATION_PLAN_SQLITE_LIBSQL.md` for verified status and the recommended next stage.

## Engineering Boundaries

- API route handlers authenticate, validate, call a service, and format the response.
- Services own business rules, transaction boundaries, and audit events.
- Repositories own Drizzle queries.
- Domain errors map expected failures to stable API codes.
- Tests must use isolated databases and must not write to `data/sportcation.db`.
