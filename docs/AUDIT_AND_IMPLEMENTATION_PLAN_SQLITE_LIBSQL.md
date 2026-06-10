# Sportcation Technical Audit and Implementation Plan

Audit date: 10 June 2026

## Executive Decision

Sportcation is runnable as a responsive Next.js web application and is ready to continue to the next engineering stage. Authentication, role authorization, merchant ownership checks, persistent SQLite/libSQL CRUD, migration, seed, lint, typecheck, production build, HTTP flow, and browser checks pass.

The project is not ready for public booking traffic. The next stage should improve service boundaries and automated tests before adding more database-backed product features.

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

The active schema has 17 tables, including users, profiles, auth accounts/sessions/verifications/rate limits, merchant profiles/members, categories, venues, courts, slots, bookings, payments, notifications, and audit logs.

## Verified Results

- Database schema generation: passed with no drift.
- SQLite migrations `0000` through `0002`: passed.
- Auth timestamp backfill: passed; no user remains with epoch-zero auth timestamps.
- Seed: passed and remains idempotent.
- TypeScript: passed.
- ESLint: passed.
- Next.js production build: passed.
- npm dependency audit: 0 known vulnerabilities.
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

Remaining security work:

- Email verification, password reset, optional MFA, and account recovery.
- Granular admin roles such as finance, support, content, and risk.
- Security headers/CSP review and production penetration testing.
- Audit log viewer, retention rules, and alerting.
- Production secrets rotation and incident runbook.

## Product And Engineering Gaps

### Blocking Public Booking

1. Client catalog still uses mock venue and slot data.
2. Booking creation and slot hold are not server-controlled or atomic.
3. Payment simulation is not persisted as a protected state machine.
4. My Bookings and ticket data are not connected to the authenticated customer.
5. Admin resource screens are still mock UI.

### High Priority

1. Route handlers contain database/business logic directly; a service/repository layer is needed.
2. No committed unit, integration, or end-to-end test suite exists.
3. No image object storage or upload validation.
4. No database pagination; venue search currently filters in application memory.
5. Merchant UI does not yet hide actions based on membership permission, although the API enforces them.

### Production Operations

1. Turso production project and deployment environment are not configured in this repository.
2. No verified backup/restore runbook.
3. No structured logging, error monitoring, tracing, or uptime checks.
4. No CI workflow enforcing migration, lint, typecheck, test, and build.
5. Local SQLite cannot be used as durable storage on stateless hosting.

## Recommended Next Stage

Proceed with **Stage 2: service layer and automated test foundation** before client catalog or admin CRUD expansion.

Scope:

1. Extract venue, court, slot, membership, and audit logic into server-only services/repositories.
2. Standardize domain errors and transaction boundaries.
3. Add Vitest unit tests for validation, permission rules, and state transitions.
4. Add API integration tests against an isolated temporary SQLite database.
5. Add Playwright smoke tests for login, role redirects, merchant CRUD, and responsive navigation.
6. Add a CI workflow for lint, typecheck, tests, migration drift, and build.

Exit criteria:

- Route handlers are thin request/response adapters.
- Permission and ownership rules have automated regression coverage.
- Tests never write to the developer database.
- CI blocks unsafe changes.

After Stage 2 passes, continue to client catalog integration, then atomic booking/payment persistence, and only then real admin CRUD.

## Production Persistence Decision

The current SQLite-compatible direction remains valid:

- Local: `file:./data/sportcation.db`.
- Production: remote libSQL/Turso.

This satisfies local CRUD and durable production persistence without requiring the Neon migration now. Neon PostgreSQL remains a future option when scale, reporting, or team requirements justify the migration.
