# Sportcation Technical Audit and Implementation Plan

Audit date: 11 June 2026

## Executive Decision

Sportcation is runnable as a responsive Next.js web application. Stage 2 is complete: authentication, role authorization, merchant ownership checks, persistent SQLite/libSQL CRUD, service and repository boundaries, atomic audit transactions, migration, seed, lint, typecheck, coverage, production build, HTTP flow, and Chromium end-to-end checks pass. Stage 3 is also complete for the public catalog: client home, explore, venue detail, and slot selection now use read-only SQLite/libSQL-backed public catalog contracts.

The project is not ready for public booking traffic. The next product stage is authoritative booking and payment simulation persistence, but it should preserve the public catalog security rules implemented in Stage 3.

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
| Payment | UI simulation only |
| Notification delivery | Mock UI only |
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
- Vitest: 5 test files and 28 tests passed.
- Coverage: 90.90% statements, 76.56% branches, 100% functions, and 90.58% lines.
- Playwright Chromium: 3 E2E tests passed.
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

1. Booking creation and slot hold are not server-controlled or atomic.
2. Payment simulation is not persisted as a protected state machine.
3. My Bookings and ticket data are not connected to the authenticated customer.
4. Admin resource screens are still mock UI.

### High Priority

1. No image object storage or upload validation.
2. No database pagination; venue search currently filters in application memory.
3. Merchant UI does not yet hide actions based on membership permission, although the API enforces them.
4. Booking, payment, booking success, ticket, and My Bookings still consume local flow state or mock records.
5. Admin operational screens remain UI prototypes without persistent service/API contracts.

### Production Operations

1. Deployment automation is committed, but the external Vercel project, domain, Turso databases, and secrets still require team provisioning.
2. No verified backup/restore runbook.
3. No structured logging, error monitoring, tracing, or uptime checks.
4. Local SQLite cannot be used as durable storage on stateless hosting.

## Recommended Next Stage

Stage 2 and Stage 3 are complete for the current SQLite/libSQL direction. Proceed with **Stage 4: authoritative booking and payment simulation persistence**.

Scope:

1. Add server-side booking creation from an available slot.
2. Prevent double booking with transactions and existing booking-item slot uniqueness.
3. Persist payment simulation state and transitions.
4. Update slot state only through authorized server-side booking/payment flow.
5. Connect Booking Success, ticket, and My Bookings to persisted customer booking records.
6. Extend Vitest and Playwright coverage for booking creation, failed payment, successful payment, double-book prevention, and customer booking history.

Exit criteria:

- Booking API creates one pending booking for an eligible slot.
- Payment simulation API transitions booking/payment status idempotently.
- A slot cannot be double-booked.
- Booking Success and My Bookings read persisted customer booking data.
- Existing public catalog and merchant CRUD regression tests remain green.

After Stage 4, continue to authenticated profile/notification persistence and only then expand persistent admin CRUD.

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
