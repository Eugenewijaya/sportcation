# Stage 6 Merchant Booking Management Audit

Audit date: 14 June 2026

## Status

Stage 6 is implemented for the current SQLite/libSQL direction. Merchant users can now load persisted booking records for venues owned by their merchant, open booking details, and perform safe MVP operational actions.

This remains an MVP operations flow. It does not implement cancellation approval, refunds, disputes, payout reconciliation, customer attendance proof, or real payment gateway events.

## Implemented

- Added merchant booking DTO contracts.
- Added `bookings:read` and `bookings:write` merchant permissions.
- Added booking query and status-action validation.
- Added merchant-scoped booking list service.
- Added merchant-scoped booking detail service.
- Added safe booking status action service:
  - `confirmed` to `checked_in`
  - `checked_in` to `completed`
- Added customer notifications and audit-log entries for merchant status actions.
- Added slot expiry when a merchant completes a booking session.
- Added protected merchant APIs:
  - `GET /api/merchant/bookings`
  - `GET /api/merchant/bookings/:id`
  - `POST /api/merchant/bookings/:id/status`
- Connected `/merchant/bookings` to persisted booking data.
- Added integration tests for listing, filtering, ownership, status transitions, audit logs, notifications, and unsafe transitions.
- Added Playwright E2E coverage for merchant list, detail, check-in, completion, and persisted detail verification.

## State Rules

- Merchant bookings are filtered through venue ownership: `venues.merchantId` must match the active merchant context.
- Merchant users need a verified merchant membership and `bookings:read` permission to list or view booking detail.
- Merchant users need `bookings:write` permission for status actions.
- Check-in is allowed only when booking status is `confirmed` and payment status is `paid`.
- Completion is allowed only when booking status is `checked_in` and payment status is `paid`.
- Direct completion from `confirmed` is rejected.
- Pending or unpaid bookings cannot be operated by merchants.
- Completion marks the related slot as `expired`.
- Every merchant action writes an audit log and customer notification.

## API Contracts

### `GET /api/merchant/bookings`

Query:

```text
q?: string
status?: pending_payment | confirmed | checked_in | completed | cancelled | refunded
```

Response:

```json
{
  "data": [
    {
      "id": "booking-demo-confirmed",
      "bookingCode": "SP-77291",
      "status": "confirmed",
      "customer": {
        "id": "user-customer-demo",
        "name": "Alex Rivera"
      },
      "venue": {
        "id": "venue-padel-arena",
        "name": "Padel Arena"
      },
      "item": {
        "slotId": "slot-padel-booked",
        "courtName": "Court 04",
        "slotDate": "2026-06-15",
        "startTime": "10:00",
        "endTime": "11:00"
      },
      "payment": {
        "status": "paid",
        "amount": 365000
      },
      "actions": {
        "canCheckIn": true,
        "canComplete": false
      }
    }
  ]
}
```

### `GET /api/merchant/bookings/:id`

Response:

```json
{
  "data": {
    "id": "booking-demo-confirmed",
    "bookingCode": "SP-77291",
    "status": "confirmed"
  }
}
```

### `POST /api/merchant/bookings/:id/status`

Request:

```json
{
  "status": "checked_in",
  "note": "Customer arrived at desk."
}
```

Response:

```json
{
  "data": {
    "id": "booking-demo-confirmed",
    "status": "checked_in",
    "actions": {
      "canCheckIn": false,
      "canComplete": true
    }
  }
}
```

## Validation Result

Passed:

```text
npm run typecheck
npx vitest run tests/integration/merchant-booking.test.ts
npm run lint
npm run test:coverage
npm run db:generate
npm audit --audit-level=high
npm run build with BETTER_AUTH_SECRET/BETTER_AUTH_URL/NEXT_PUBLIC_APP_URL
npm run test:e2e
git diff --check
secret pattern scan for known Neon URL fragments and local build secret
```

Current automated coverage:

```text
Vitest files: 10 passed
Vitest tests: 55 passed
Coverage: 86.49% statements, 72.57% branches, 87.71% functions, 89.60% lines
Playwright tests: 7 passed
npm audit --audit-level=high: 0 vulnerabilities
```

## Current Limitations

- Merchant booking search is simple substring filtering in application memory.
- Merchant booking list has no pagination yet.
- Merchant UI exposes action buttons from API-provided action flags, but it does not yet display a full permission matrix.
- Merchant cannot cancel, refund, reschedule, dispute, or no-show a booking yet.
- Real payment gateway state remains outside this stage.
- Admin booking/payment review is still prototype UI.

## Recommended Next Stage

Proceed to Stage 7: admin booking and payment review persistence.

Suggested next prompt:

```text
Start Stage 7 only: implement persistent admin booking and payment review for Sportcation.

Requirements:
- Keep SQLite/libSQL active.
- Add admin booking list and detail APIs.
- Add admin payment list/detail APIs for simulated payments.
- Connect Admin Bookings and Admin Payments UI to persisted data.
- Keep admin actions read-first unless a safe MVP action is explicitly scoped.
- Add integration and E2E coverage.
- Run lint, typecheck, coverage, build, E2E, audit, commit, push, and verify CI.
```
