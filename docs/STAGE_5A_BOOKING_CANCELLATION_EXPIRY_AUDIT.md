# Stage 5A Booking Cancellation And Expiry Audit

Audit date: 12 June 2026

## Status

Stage 5A is implemented for the current SQLite/libSQL direction. Customer bookings can now be cancelled from My Bookings, and overdue pending payments can be expired server-side so their reserved slots are released back to public availability.

No real payment gateway, webhook, refund transfer, payout, or scheduled worker is implemented yet. Expiry is exposed as a protected customer API and is called by the customer My Bookings flow before listing bookings.

## Implemented

- Added `cancelBookingSchema` for safe cancellation request validation.
- Added `cancelCustomerBooking` service transaction.
- Added `expirePendingCustomerBookings` service transaction.
- Added `POST /api/bookings/:id/cancel`.
- Added `POST /api/bookings/expire-pending`.
- Connected My Bookings to call pending-payment expiry before loading records.
- Added cancellation UI for pending and confirmed customer bookings.
- Updated integration coverage for:
  - pending booking cancellation,
  - confirmed booking cancellation,
  - completed booking cancellation rejection,
  - overdue pending payment expiry,
  - fresh pending payment retention.
- Updated Playwright coverage so customer can cancel the booking created in the browser flow.

## State Rules

Cancellation:

- Only authenticated `customer` users can cancel their own bookings.
- `pending_payment` bookings can be cancelled.
- `confirmed` bookings can be cancelled in the current MVP.
- `checked_in`, `completed`, `refunded`, and other finalized states are rejected.
- Pending cancellation sets payment status to `failed`.
- Paid cancellation sets payment status to `refunded`.
- Cancellation releases the reserved slot back to `available`.

Expiration:

- Only authenticated customers can trigger expiry for their own pending bookings.
- Default payment expiry window is 15 minutes.
- Expired pending bookings become `cancelled`.
- Expired pending payments become `expired`.
- Expiry releases the reserved slot back to `available`.
- Fresh pending payments remain reserved.

## API Contracts

### `POST /api/bookings/:id/cancel`

Request:

```json
{
  "reason": "Customer requested cancellation from My Bookings."
}
```

Response:

```json
{
  "data": {
    "id": "booking-id",
    "status": "cancelled",
    "payment": {
      "status": "refunded"
    }
  }
}
```

### `POST /api/bookings/expire-pending`

Request:

```json
{}
```

Response:

```json
{
  "data": {
    "expiredCount": 1,
    "bookingIds": ["booking-id"]
  }
}
```

## Validation Result

Passed:

```text
npm run typecheck
npx vitest run tests/integration/customer-booking.test.ts
npm run lint
npm run db:generate
npm run test:coverage
npm audit --audit-level=high
npm run build with BETTER_AUTH_SECRET/BETTER_AUTH_URL/NEXT_PUBLIC_APP_URL
npm run test:e2e
```

Current automated coverage:

```text
Vitest files: 7 passed
Vitest tests: 41 passed
Playwright tests: 5 passed
```

## Current Limitations

- Expiry is request-driven, not scheduled by Vercel Cron yet.
- Confirmed booking cancellation is an MVP simulation and does not execute real refunds.
- No cancellation cutoff policy is enforced yet.
- No merchant/admin cancellation approval workflow exists.
- No immutable payment event ledger exists.

## Recommended Next Stage

Proceed to Stage 5B: profile and notification persistence, or Stage 6: merchant booking management if operational workflows are the priority.

Suggested next prompt:

```text
Start Stage 5B only: implement persistent profile and notification management for Sportcation.

Requirements:
- Keep SQLite/libSQL active.
- Add customer profile API and UI persistence.
- Add notification list API, mark-read, and mark-all-read.
- Connect Profile and Notifications screens to persisted user data.
- Add integration and E2E tests.
- Run lint, typecheck, coverage, build, E2E, audit, commit, push, and verify CI.
```
