# Stage 7 Admin Booking And Payment Review Audit

Audit date: 15 June 2026

## Status

Stage 7 is implemented for the current SQLite/libSQL direction. Admin users can now review persisted booking and simulated payment records across the platform through protected read-only APIs and connected admin UI pages.

This is still an MVP review surface. It does not implement admin mutation workflows such as forced cancellation, refund approval, payout release, dispute resolution, chargeback handling, or payment gateway reconciliation.

## Implemented

- Added admin booking and payment DTO contracts.
- Added admin booking/payment query validation.
- Added admin booking list and detail service methods.
- Added admin payment list and detail service methods.
- Added admin-only read APIs:
  - `GET /api/admin/bookings`
  - `GET /api/admin/bookings/:id`
  - `GET /api/admin/payments`
  - `GET /api/admin/payments/:id`
- Connected `/admin/bookings` to persisted booking review data.
- Connected `/admin/payments` to persisted simulated payment review data.
- Added review indicators for pending, failed, expired, refunded, cancelled, and refunded states.
- Kept admin review actions read-only for this MVP stage.
- Added integration tests for admin booking/payment list, filters, details, missing records, and review flags.
- Added Playwright E2E coverage for admin booking/payment pages, APIs, details, and non-admin API rejection.

## State Rules

- Only active `admin` users can access admin review APIs.
- Admin review APIs are read-only.
- Booking review joins persisted booking, booking item, slot, payment, customer, venue, and merchant profile data.
- Payment review joins persisted payment, booking, customer, venue, and merchant profile data.
- Pending payment and pending booking states are flagged for review.
- Failed, expired, refunded, cancelled, and refunded states are flagged for review.
- Healthy paid/completed or paid/confirmed states remain visible but are not flagged.

## API Contracts

### `GET /api/admin/bookings`

Query:

```text
q?: string
status?: pending_payment | confirmed | checked_in | completed | cancelled | refunded
paymentStatus?: pending | paid | failed | expired | refunded
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
      "merchant": {
        "id": "merchant-sportcation-demo",
        "businessName": "Sportcation Venue Partner"
      },
      "venue": {
        "id": "venue-padel-arena",
        "name": "Padel Arena"
      },
      "payment": {
        "id": "payment-demo-paid",
        "status": "paid",
        "amount": 365000
      },
      "review": {
        "needsAttention": false,
        "reason": "Healthy booking and payment state."
      }
    }
  ]
}
```

### `GET /api/admin/bookings/:id`

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

### `GET /api/admin/payments`

Query:

```text
q?: string
status?: pending | paid | failed | expired | refunded
method?: qris | virtual_account | wallet | manual
```

Response:

```json
{
  "data": [
    {
      "id": "payment-demo-paid",
      "bookingId": "booking-demo-confirmed",
      "bookingCode": "SP-77291",
      "method": "qris",
      "status": "paid",
      "amount": 365000,
      "providerReference": "SIM-QRIS-SP-77291",
      "review": {
        "needsAttention": false
      }
    }
  ]
}
```

### `GET /api/admin/payments/:id`

Response:

```json
{
  "data": {
    "id": "payment-demo-paid",
    "bookingCode": "SP-77291",
    "status": "paid"
  }
}
```

## Validation Result

Passed:

```text
npm run typecheck
npx vitest run tests/integration/admin-review.test.ts
npm run lint
npm run test:coverage
npm run db:generate
npm audit --audit-level=high
npm run build with BETTER_AUTH_SECRET/BETTER_AUTH_URL/NEXT_PUBLIC_APP_URL
npm run test:e2e
```

Current automated coverage:

```text
Vitest files: 11 passed
Vitest tests: 59 passed
Coverage: 86.28% statements, 73.80% branches, 89.23% functions, 89.66% lines
Playwright tests: 8 passed
npm audit --audit-level=high: 0 vulnerabilities
```

## Current Limitations

- Admin booking/payment search is simple substring filtering in application memory.
- Admin lists have no pagination yet.
- Admin review is read-only; there is no refund, dispute, cancellation, payout, or settlement action yet.
- Real payment gateway events and webhooks are not implemented.
- Admin users and admin venue moderation still use prototype data.
- Reports, content, and admin settings remain prototype UI.

## Recommended Next Stage

Proceed to Stage 8: admin user and venue moderation persistence.

Suggested next prompt:

```text
Start Stage 8 only: implement persistent admin user and venue moderation for Sportcation.

Requirements:
- Keep SQLite/libSQL active.
- Add admin user list and detail APIs.
- Add admin venue moderation list and detail APIs.
- Connect Admin Users and Admin Venues UI to persisted data.
- Keep admin mutations out of scope unless a safe MVP action is explicitly scoped.
- Add integration and E2E coverage.
- Run lint, typecheck, coverage, build, E2E, audit, commit, push, and verify CI.
```
