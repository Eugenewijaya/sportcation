# Stage 5B Profile And Notification Persistence Audit

Audit date: 14 June 2026

## Status

Stage 5B is implemented for the current SQLite/libSQL direction. Customer profile data and notification read state are now persisted through protected APIs and connected to the responsive customer web app.

This is still an MVP account experience. It does not implement email verification changes, password reset, push delivery, notification preferences persistence, or real-time notification transport.

## Implemented

- Added shared customer account DTOs for profile and notification payloads.
- Added profile update validation for account name, full name, phone, city, and avatar URL.
- Added customer account service methods for:
  - reading customer profile,
  - updating user/profile fields,
  - listing notifications,
  - marking one notification read,
  - marking all customer notifications read.
- Added protected API routes:
  - `GET /api/profile`
  - `PATCH /api/profile`
  - `GET /api/notifications`
  - `POST /api/notifications/:id/read`
  - `POST /api/notifications/mark-all-read`
- Connected Profile screen to persisted user data.
- Added Edit Profile screen with persisted save behavior.
- Connected Notifications screen to persisted notifications and read/unread state.
- Added Settings -> Personal Info navigation to Edit Profile.
- Added integration tests for profile persistence, notification ownership, mark-read, mark-all-read, and audit logs.
- Added Playwright E2E coverage for customer profile update and notification mark-all-read.
- Pinned `esbuild` to `0.28.1` through the direct dev dependency and npm override after a high-severity npm advisory affected transitive toolchain installs.

## State Rules

Profile:

- Only authenticated active `customer` users can read or update `/api/profile`.
- Email is not editable through this profile API to avoid changing auth identity in the MVP.
- Empty `phone`, `city`, and `avatarUrl` values are stored as `null`.
- Profile updates write an audit log event.

Notifications:

- Only authenticated active `customer` users can list or mutate their own notifications.
- Notification ownership is enforced in the service layer by `userId`.
- Mark-read on another user's notification returns `NOTIFICATION_NOT_FOUND`.
- Mark-all only affects unread notifications for the current customer.
- Notification read actions write audit log events.

## API Contracts

### `GET /api/profile`

Response:

```json
{
  "data": {
    "id": "user-customer-demo",
    "name": "Alex Rivera",
    "email": "customer@sportcation.local",
    "phone": null,
    "profile": {
      "fullName": "Alex Rivera",
      "avatarUrl": null,
      "city": "Jakarta"
    },
    "stats": {
      "bookings": 1,
      "unreadNotifications": 1,
      "points": 8400
    }
  }
}
```

### `PATCH /api/profile`

Request:

```json
{
  "name": "Alex Customer",
  "fullName": "Alex Customer Pro",
  "phone": "+62 812 3456 7890",
  "city": "Jakarta",
  "avatarUrl": ""
}
```

Response:

```json
{
  "data": {
    "name": "Alex Customer",
    "phone": "+62 812 3456 7890",
    "profile": {
      "fullName": "Alex Customer Pro",
      "city": "Jakarta"
    }
  }
}
```

### `GET /api/notifications`

Response:

```json
{
  "data": [
    {
      "id": "notification-demo-booking",
      "type": "booking",
      "title": "Booking Confirmed",
      "body": "Your session at Padel Arena is confirmed.",
      "actionUrl": "/?screen=bookings",
      "readAt": null,
      "createdAt": "2026-06-12 10:00:00"
    }
  ]
}
```

### `POST /api/notifications/:id/read`

Request:

```json
{}
```

Response:

```json
{
  "data": {
    "id": "notification-demo-booking",
    "readAt": "2026-06-15T09:00:00.000Z"
  }
}
```

### `POST /api/notifications/mark-all-read`

Request:

```json
{}
```

Response:

```json
{
  "data": [
    {
      "id": "notification-demo-booking",
      "readAt": "2026-06-15T09:00:00.000Z"
    }
  ]
}
```

## Validation Result

Passed:

```text
npm run typecheck
npx vitest run tests/integration/customer-account.test.ts
npm run lint
npm run db:generate
npm run test:coverage
npm audit --audit-level=high
npm run build with BETTER_AUTH_SECRET/BETTER_AUTH_URL/NEXT_PUBLIC_APP_URL
npm run test:e2e
git diff --check
npm ls esbuild
```

Current automated coverage:

```text
Vitest files: 9 passed
Vitest tests: 51 passed
Coverage: 86.86% statements, 70.96% branches, 88.46% functions, 89.89% lines
Playwright tests: 6 passed
npm audit --audit-level=high: 0 vulnerabilities
esbuild resolution: 0.28.1 across direct and transitive installs
```

## Current Limitations

- Profile image URL is text-only; there is no object storage upload yet.
- Email change and phone verification are not implemented.
- Push notification delivery is not implemented.
- Notification preferences in Settings are local UI state only.
- No admin notification composer exists.
- Notification pagination is not implemented yet.

## Recommended Next Stage

Proceed to Stage 6: merchant booking management persistence.

Suggested next prompt:

```text
Start Stage 6 only: implement persistent merchant booking management for Sportcation.

Requirements:
- Keep SQLite/libSQL active.
- Do not integrate real payment gateway yet.
- Add merchant booking list API filtered by merchant ownership.
- Add booking detail for merchant users.
- Add merchant-side booking status actions only where safe for MVP.
- Connect Merchant Bookings UI to persisted booking data.
- Add integration and E2E coverage.
- Run lint, typecheck, coverage, build, E2E, audit, commit, push, and verify CI.
```
