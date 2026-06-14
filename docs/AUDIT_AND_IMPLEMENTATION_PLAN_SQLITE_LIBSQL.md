# Sportcation Technical Audit and Implementation Plan

Audit date: 11 June 2026

## Executive Decision

Sportcation is runnable as a responsive Next.js web application. Stage 2 is complete: authentication, role authorization, merchant ownership checks, persistent SQLite/libSQL CRUD, service and repository boundaries, atomic audit transactions, migration, seed, lint, typecheck, coverage, production build, HTTP flow, and Chromium end-to-end checks pass. Stage 3 is complete for the public catalog. Stage 4 is complete for customer booking and payment simulation persistence. Stage 5A is complete for customer cancellation and pending-payment expiry. Stage 5B is complete for customer profile and notification persistence.

The project is ready for internal preview of customer booking simulation. It is not ready for public paid traffic because real payment gateway, webhooks, real refunds, production monitoring, and operational backup/restore are still not implemented.

## Current Architecture

| Layer | Current implementation |
| --- | --- |
| Web | Next.js 16 App Router, React 19, Tailwind CSS 4 |
| Validation | Zod |
| Authentication | Better Auth email/password with database sessions |
| Authorization | App roles plus merchant membership permissions |
| ORM | Drizzle ORM |
| Local database | SQLite through `@libsql/client` |
| Production persistence | Remote libSQL/Turso |
| Future database reference | Neon PostgreSQL schema under `lib/db/postgres` |
| File storage | Not implemented |
| Payment | Persisted customer payment simulation with cancellation and expiry |
| Notification delivery | Persisted in-app notification list and read state; no push delivery yet |
| Automated tests | Vitest unit/integration tests plus Playwright Chromium E2E |
| CI | GitHub Actions migration, audit, lint, typecheck, test, build, and E2E gates |

The active schema has 17 tables, including users, profiles, auth accounts/sessions/verifications/rate limits, merchant profiles/members, categories, venues, courts, slots, bookings, payments, notifications, and audit logs.

## Verified Results

- Database schema generation: passed with no drift.
- SQLite migrations `0000` through `0002`: passed.
- Auth timestamp backfill: passed; no user remains with epoch-zero auth timestamps.
- Seed: passed and remains idempotent.
- TypeScript: passed.
- ESLint: passed.
- Next.js production build: passed.
- npm dependency audit: passed with 0 known vulnerabilities.
- Vitest: 9 test files and 51 tests passed.
- Coverage: 86.86% statements, 70.96% branches, 88.46% functions, and 89.89% lines.
- Playwright Chromium: 6 E2E tests passed.
- Migration drift CI check: configured.
- GitHub Actions CI: configured for migration, dependency audit, lint, typecheck, coverage, build, and E2E.
- Public, merchant, and admin route smoke test: all expected routes returned `200` with the proper session.
- Unauthenticated merchant route: redirected to login.
- Merchant to admin route: redirected to unauthorized.
- Admin to merchant route: redirected to unauthorized.
- Merchant CRUD: create, update, read, delete, and post-delete `404` passed.
- Customer/admin calls to merchant API: rejected with `403`.
- Viewer membership: read allowed, write rejected with `403`.
- Logout: session invalidated and protected API returned `401`.
- Auth rate limit: repeated invalid login attempts returned `429`.
- Browser flow: merchant login, merchant venue data load, logout, and admin login passed.
- Responsive check: no horizontal overflow at 390 px after the dashboard panel fix; desktop 1440 px also had no overflow.
- Browser console: no relevant warnings or errors.

## Security And Authorization State

Implemented:

- Passwords are hashed by Better Auth.
- Session records are stored in the database.
- Production requires an explicit auth secret and application URL.
- Trusted-origin validation is configured.
- Public signup cannot submit role or account status.
- Merchant/admin credentials are provisioned through environment-driven bootstrap only.
- Page layouts perform full server session and role checks.
- Mutation routes repeat authorization and ownership checks.
- Merchant membership permissions distinguish catalog write, slot write, and read-only access.
- Session cookie cache is disabled so role/status revocation is checked against the database.
- Auth rate limits use database storage.
- Current mutations create audit log records.
- Venue, court, and slot mutations commit their resource change and audit event atomically.
- Customer booking creation and payment simulation persist booking, booking item, payment, notification, slot state, and audit state inside server-controlled transactions.
- Customer profile updates and notification read-state mutations are protected, ownership-scoped, validated, and audited.
- API handlers are thin authentication, validation, service invocation, and response adapters.
- Unit and integration tests use isolated temporary SQLite databases and do not write to the developer database.
- Unsafe API methods reject browser requests from untrusted origins.
- Venue image input accepts only local paths or HTTPS URLs.
- Global response headers enforce frame denial, MIME sniffing protection, a restricted minimum CSP, referrer policy, permissions policy, and production HSTS.

Remaining security work:

- The current-state security review is documented in `docs/SECURITY_AUDIT_2026-06-11.md`.
- Complete the formal exhaustive Codex Security scan with threat-model, discovery, validation, and attack-path phases after explicit subagent delegation is authorized.
- Email verification, password reset, optional MFA, and account recovery.
- Granular admin roles such as finance, support, content, and risk.
- Security headers/CSP review and production penetration testing.
- Audit log viewer, retention rules, and alerting.
- Production secrets rotation and incident runbook.

## Product And Engineering Gaps

### Blocking Public Booking

1. Real payment gateway, webhooks, settlement, refund, payout, and QR issuer are not implemented.
2. Pending payment expiration is request-driven; no Vercel Cron or background worker is configured yet.
3. Booking cancellation has MVP rules only; no cutoff, penalty, or merchant approval workflow exists.
4. Merchant and admin operational booking screens are still prototype UI.

### High Priority

1. No image object storage or upload validation.
2. No database pagination; venue search currently filters in application memory.
3. Merchant UI does not yet hide actions based on membership permission, although the API enforces them.
4. Merchant booking management and admin booking/payment review still consume prototype records.
5. Admin operational screens remain UI prototypes without persistent service/API contracts.

### Production Operations

1. Deployment automation is committed, but the external Vercel project, domain, Turso databases, and secrets still require team provisioning.
2. No verified backup/restore runbook.
3. No structured logging, error monitoring, tracing, or uptime checks.
4. Local SQLite cannot be used as durable storage on stateless hosting.

## Recommended Next Stage

Stage 2, Stage 3, Stage 4, Stage 5A, and Stage 5B are complete for the current SQLite/libSQL direction. Proceed with **Stage 6: merchant booking management**.

Scope:

1. Add merchant booking list API filtered by merchant ownership.
2. Add merchant booking detail API.
3. Connect Merchant Bookings UI to persisted booking data.
4. Add safe MVP merchant booking actions if needed, such as marking check-in or completed.
5. Add integration and E2E coverage for merchant booking visibility and authorization.

Exit criteria:

- Merchant users can only see bookings for venues owned by their merchant.
- Merchant booking UI consumes persisted records.
- Customer, public catalog, profile, notification, and merchant CRUD regression tests remain green.

After Stage 6, expand admin booking/payment review and operational reporting.

## Stage 5B Implementation Receipt

Implemented:

- `lib/customer-account/types.ts` for customer profile and notification DTO contracts.
- `lib/validation/account.ts` for profile update validation.
- `lib/services/account-service.ts` for profile read/update, notification list, mark-read, and mark-all-read service logic.
- `app/api/profile/route.ts`.
- `app/api/notifications/route.ts`.
- `app/api/notifications/[id]/read/route.ts`.
- `app/api/notifications/mark-all-read/route.ts`.
- `components/sportcation-web-app.tsx` Profile, Edit Profile, Settings Personal Info, and Notifications integration with persisted account data.
- `tests/integration/customer-account.test.ts`.
- Playwright customer profile and notification E2E coverage in `tests/e2e/auth-and-crud.spec.ts`.
- `docs/STAGE_5B_PROFILE_NOTIFICATION_AUDIT.md`.
- `package.json` and `package-lock.json` to pin `esbuild@0.28.1` across direct and transitive toolchain installs after npm audit flagged high-severity `esbuild <=0.28.0`.

Validation receipt:

```text
npm run typecheck       passed
npx vitest run tests/integration/customer-account.test.ts passed, 7 tests
npm run lint            passed
npm run db:generate     passed, no schema drift
npm run test:coverage   passed, 51 tests
npm audit               passed, 0 vulnerabilities
npm ls esbuild          passed, all resolved to 0.28.1
npm run build           passed with required auth env
npm run test:e2e        passed, 6 Chromium tests
```

## Stage 5A Implementation Receipt

Implemented:

- `cancelCustomerBooking` service transaction for pending and confirmed booking cancellation.
- `expirePendingCustomerBookings` service transaction for pending payment expiry.
- `POST /api/bookings/[id]/cancel`.
- `POST /api/bookings/expire-pending`.
- My Bookings cancellation UI and request-driven expiry before booking list load.
- Integration tests for pending cancellation, confirmed cancellation, finalized-state rejection, overdue expiry, and fresh-pending retention.
- Playwright coverage for cancelling a booking created in the customer browser flow.
- `docs/STAGE_5A_BOOKING_CANCELLATION_EXPIRY_AUDIT.md`.

Validation receipt:

```text
npm run typecheck       passed
npx vitest run tests/integration/customer-booking.test.ts passed, 10 tests
npm run lint            passed
npm run db:generate     passed, no schema drift
npm run test:coverage   passed, 41 tests
npm audit               passed, 0 vulnerabilities
npm run build           passed with required auth env
npm run test:e2e        passed, 5 Chromium tests
```

## Stage 4 Implementation Receipt

Implemented:

- `lib/customer-bookings/types.ts` for customer booking DTO contracts.
- `lib/validation/booking.ts` for booking and payment simulation validation.
- `lib/services/booking-service.ts` for transactional booking creation, payment success, payment failure, customer booking detail, and customer booking list.
- `app/api/bookings/route.ts`, `app/api/bookings/[id]/route.ts`, and `app/api/payments/[bookingId]/simulate/route.ts`.
- `components/sportcation-web-app.tsx` checkout, payment simulation, booking success, and My Bookings integration with persisted customer booking data.
- `drizzle/0003_whole_umar.sql` to replace global booking-item slot uniqueness with a non-unique slot history index.
- `tests/integration/customer-booking.test.ts` for booking transaction and payment state tests.
- Playwright customer booking E2E coverage in `tests/e2e/auth-and-crud.spec.ts`.

Validation receipt:

```text
npm run db:generate     passed, no schema drift
npm run db:migrate      passed
npm run db:seed         passed
npm run lint            passed
npm run typecheck       passed
npm run test:coverage   passed, 36 tests
npm audit               passed, 0 vulnerabilities
npm run build           passed with required auth env
npm run test:e2e        passed, 5 Chromium tests
```

Known validation note:

- A raw `npm run build` without `BETTER_AUTH_SECRET` failed as expected because production auth configuration requires a secret. The build passed when run with the same required auth environment variables used by CI.

## Stage 3 Implementation Receipt

Implemented:

- `lib/services/public-catalog-service.ts` for read-only public catalog queries.
- `lib/validation/public-catalog.ts` for bounded public filter validation.
- `lib/public-catalog/types.ts` for DTO contracts shared by server and client.
- `app/api/public/catalog/route.ts` and `app/api/public/venues/[id]/route.ts`.
- `app/page.tsx` dynamic server data loading from SQLite/libSQL.
- `components/sportcation-web-app.tsx` catalog state, API-backed search/category filters, DB-backed venue detail, DB-backed available slot selection, and catalog loading/error/empty states.
- `tests/integration/public-catalog.test.ts` leak-prevention and filter tests.
- Playwright public catalog E2E coverage in `tests/e2e/auth-and-crud.spec.ts`.

Validation receipt:

```text
npm run lint            passed
npm run typecheck       passed
npm run test:coverage   passed, 31 tests
npm audit               passed, 0 vulnerabilities
npm run build           passed
npm run test:e2e        passed, 4 Chromium tests
```

Security receipt:

- Codex Security parent-agent fallback scan completed with no reportable findings.
- Formal subagent-assisted scan remains a follow-up because the approved subagents failed with quota/auth runtime errors.
- Final scan artifacts: `C:\tmp\codex-security-scans\v0-landing-page-sportcation\8e31e3d_20260611-161721`.

## Stage 2 Implementation Receipt

Implemented:

- `lib/repositories`: merchant, venue, court, and slot database access.
- `lib/services`: category, venue, court, slot, and audit application logic.
- `lib/domain`: stable domain errors and explicit merchant permission policy.
- Reusable migration, seed, and auth bootstrap functions.
- Thin merchant API route handlers with consistent validation and errors.
- Atomic resource and audit-log transactions.
- Vitest unit/integration tests with isolated SQLite files.
- Playwright E2E login, role-boundary, CRUD persistence, and mobile overflow checks.
- GitHub Actions CI.
- Manual production workflow that migrates Turso, runs production preflight, builds a prebuilt Vercel artifact, deploys, and verifies health.
- Public no-cache database health endpoint.
- Production deployment runbook and environment contract.
- Build-time font fallback so production builds do not depend on Google Fonts availability.

Validation receipt:

```text
npm run db:generate     passed, no schema drift
npm run lint            passed
npm run typecheck       passed
npm run test:coverage   passed, 28 tests
npm run build           passed
npm run test:e2e        passed, 3 Chromium tests
npm audit               passed, 0 vulnerabilities
```

Known validation limitation:

- The Codex in-app browser blocked `127.0.0.1` with `ERR_BLOCKED_BY_CLIENT`. Rendering and interaction were independently verified by the committed Playwright Chromium suite.

## Production Persistence Decision

The current SQLite-compatible direction remains valid:

- Local: `file:./data/sportcation.db`.
- Production: remote libSQL/Turso.

This satisfies local CRUD and durable production persistence without requiring the Neon migration now. Neon PostgreSQL remains a future option when scale, reporting, or team requirements justify the migration.
