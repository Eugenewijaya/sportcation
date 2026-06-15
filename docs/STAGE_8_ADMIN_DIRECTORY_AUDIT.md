# Stage 8 Admin User And Venue Moderation Audit

Audit date: 15 June 2026

## Summary

Stage 8 implements persistent, read-only admin review for users and venue moderation while keeping SQLite/libSQL as the active database. Admin users can inspect platform users, user profiles, merchant links, booking counts, notification counts, venue ownership, venue status, court inventory, slot inventory, and booking GMV from persisted tables.

No admin user or venue mutation was added in this stage.

## Implemented Scope

- Admin user list API with `q`, `role`, and `status` filters.
- Admin user detail API.
- Admin venue moderation list API with `q`, `status`, and `merchantStatus` filters.
- Admin venue moderation detail API.
- Admin Users UI connected to persisted `/api/admin/users`.
- Admin Venues UI connected to persisted `/api/admin/venues`.
- Integration coverage for list, filter, detail, missing records, and review flags.
- E2E coverage for admin navigation, persisted API visibility, detail panels, and non-admin API rejection.

## API Contracts

### `GET /api/admin/users`

Query:

```text
q?: string
role?: customer | merchant_owner | merchant_staff | admin
status?: active | pending | restricted | disabled
```

Returns persisted user review records with profile, merchant memberships, owned merchant, booking stats, notification count, and review state.

### `GET /api/admin/users/:id`

Returns one persisted user review record or `404 USER_NOT_FOUND`.

### `GET /api/admin/venues`

Query:

```text
q?: string
status?: draft | review | published | rejected | archived
merchantStatus?: draft | review | verified | suspended
```

Returns persisted venue moderation records with category, merchant owner, inventory stats, booking GMV, and review state.

### `GET /api/admin/venues/:id`

Returns one persisted venue moderation record or `404 VENUE_NOT_FOUND`.

## Security And Authorization

- All new endpoints require an active `admin` session through `requireApiActor`.
- Customer and merchant sessions receive `403`.
- Unauthenticated requests receive `401`.
- Endpoints are read-only in this MVP stage.
- Query strings are bounded and validated with Zod.
- Responses are sent with `Cache-Control: no-store`.
- No hardcoded operational credentials were added.

## Data Sources

- `users`
- `user_profiles`
- `merchant_profiles`
- `merchant_members`
- `venues`
- `sport_categories`
- `courts`
- `slots`
- `bookings`
- `notifications`

## Known Limitations

- Admin user and venue actions remain read-only.
- List endpoints currently load and filter in application memory, which is acceptable for the MVP seed scale but needs pagination and database-level search before production scale.
- Admin report, content, and settings pages remain prototype UI.
- Audit log viewer and granular admin roles are not implemented.

## Validation Receipt

```text
npm run typecheck       passed
npx vitest run tests/integration/admin-directory.test.ts passed, 4 tests
npm run lint            passed
npm run test:coverage   passed, 63 tests
npm run db:generate     passed, no schema drift
npm audit --audit-level=high passed, 0 vulnerabilities
npm run build           passed with required auth env
npm run test:e2e        passed, 9 Chromium tests
```

## Recommended Next Prompt

Start Stage 9 only: implement persistent merchant finance and payout foundation for Sportcation.
