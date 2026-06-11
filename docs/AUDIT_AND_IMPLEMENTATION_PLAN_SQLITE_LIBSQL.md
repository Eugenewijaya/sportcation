# Sportcation Technical Audit and Implementation Plan

Audit date: 11 June 2026

## Executive Decision

Sportcation is runnable as a responsive Next.js web application. Stage 2 is complete: authentication, role authorization, merchant ownership checks, persistent SQLite/libSQL CRUD, service and repository boundaries, atomic audit transactions, migration, seed, lint, typecheck, coverage, production build, HTTP flow, and Chromium end-to-end checks pass.

The project is not ready for public booking traffic. The next product stage is client catalog integration, but it should start only after the requested repository-wide Codex Security audit is completed and any reportable findings are remediated.

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

1. Client catalog still uses mock venue and slot data.
2. Booking creation and slot hold are not server-controlled or atomic.
3. Payment simulation is not persisted as a protected state machine.
4. My Bookings and ticket data are not connected to the authenticated customer.
5. Admin resource screens are still mock UI.

### High Priority

1. No image object storage or upload validation.
2. No database pagination; venue search currently filters in application memory.
3. Merchant UI does not yet hide actions based on membership permission, although the API enforces them.
4. Client catalog and booking screens still consume mock/local product data.
5. Admin operational screens remain UI prototypes without persistent service/API contracts.

### Production Operations

1. Deployment automation is committed, but the external Vercel project, domain, Turso databases, and secrets still require team provisioning.
2. No verified backup/restore runbook.
3. No structured logging, error monitoring, tracing, or uptime checks.
4. Local SQLite cannot be used as durable storage on stateless hosting.

## Recommended Next Stage

Stage 2 is complete. After the repository-wide security audit closes, proceed with **Stage 3: persistent client catalog integration**.

Scope:

1. Add public read-only venue, category, court, and slot availability service contracts.
2. Replace client home, explore, venue detail, and slot-selection mock data with API-backed queries.
3. Add server-side pagination, search, category, location, price, and availability filters.
4. Preserve the current responsive Figma-aligned UI while adding loading, empty, and recoverable error states.
5. Add cache/revalidation rules that do not expose unpublished merchant data.
6. Extend Vitest and Playwright coverage for public catalog search and venue-to-slot navigation.

Exit criteria:

- Public APIs return only published venues and eligible slots.
- Search and filters run in the database with bounded page sizes.
- Client screens no longer duplicate venue or slot mock records.
- Merchant draft/review/rejected records cannot leak to public routes.
- Loading, empty, error, and mobile/desktop navigation states are covered by E2E tests.
- Existing merchant authorization and CRUD regression tests remain green.

After Stage 3, continue to atomic booking and payment persistence, then authenticated customer bookings/tickets, and only then expand persistent admin CRUD.

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
