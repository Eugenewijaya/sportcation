# Stage 4 Booking And Payment Persistence Audit

Audit date: 12 June 2026

## Status

Stage 4 is implemented for the current SQLite/libSQL direction. Customer checkout now creates an authoritative server-side booking from a selected available slot, payment simulation persists status transitions, Booking Success reads the persisted booking code and totals, and My Bookings reads authenticated customer booking records from the database.

This is still a simulated payment MVP. No real payment gateway, webhook, settlement, refund, payout, QR issuer, or fraud workflow is implemented.

## Implemented

- Added customer booking DTO contract in `lib/customer-bookings/types.ts`.
- Added Zod validation for booking creation and payment simulation in `lib/validation/booking.ts`.
- Added `lib/services/booking-service.ts` with transactional booking creation and payment simulation.
- Added `GET /api/bookings` for authenticated customer booking history.
- Added `POST /api/bookings` for authenticated customer booking creation.
- Added `GET /api/bookings/:id` for authenticated customer booking detail.
- Added `POST /api/payments/:bookingId/simulate` for payment simulation.
- Connected checkout, payment, booking success, and My Bookings UI to persisted booking data.
- Added isolated integration tests for booking creation, double-book prevention, payment success, payment failure, slot release, and finalized payment protection.
- Added Playwright coverage for authenticated customer booking and payment simulation.
- Added SQLite migration `0003_whole_umar.sql` to replace global booking-item slot uniqueness with a non-unique slot history index.
- Hardened merchant slot deletion so slots with booking history return a domain `409` instead of leaking a database constraint failure.

## Booking State Rules

- Only authenticated `customer` users can create customer bookings.
- Booking creation requires a public, active, available slot.
- Booking creation updates `slots.status` from `available` to `booked` inside the same transaction.
- Double booking is prevented by the transactional conditional update: `WHERE slots.status = 'available'`.
- A newly created booking starts as `bookings.status = 'pending_payment'`.
- A newly created payment starts as `payments.status = 'pending'`.
- Successful payment simulation transitions booking to `confirmed` and payment to `paid`.
- Failed payment simulation transitions booking to `cancelled`, payment to `failed`, and releases the slot back to `available`.
- Finalized bookings cannot be changed from paid to failed.
- Payment success is idempotent when the booking is already confirmed and paid.

## API Contracts

### `GET /api/bookings`

Returns persisted booking history for the authenticated customer.

Security:

- Requires active customer session.
- Returns only bookings owned by the current user.
- Uses `Cache-Control: no-store`.

### `POST /api/bookings`

Request:

```json
{
  "slotId": "slot-padel-available",
  "paymentMethod": "qris"
}
```

Response:

```json
{
  "data": {
    "id": "booking-id",
    "bookingCode": "SP-ABC12345",
    "status": "pending_payment",
    "totalAmount": 365000,
    "payment": {
      "status": "pending"
    }
  }
}
```

Security:

- Requires active customer session.
- Rejects merchant/admin sessions with `403`.
- Rejects unavailable slots with `409`.

### `POST /api/payments/:bookingId/simulate`

Request:

```json
{
  "status": "paid"
}
```

Allowed statuses:

- `paid`
- `failed`

Security:

- Requires active customer session.
- Allows mutation only for bookings owned by the current user.
- Rejects finalized state changes with `409`.

## Validation Result

Passed:

```text
npm run db:generate
npm run db:migrate
npm run db:seed
npm run lint
npm run typecheck
npx vitest run tests/integration/customer-booking.test.ts tests/integration/merchant-catalog.test.ts tests/integration/public-catalog.test.ts
npm run test:coverage
npm audit --audit-level=high
npm run build with BETTER_AUTH_SECRET/BETTER_AUTH_URL/NEXT_PUBLIC_APP_URL
npm run test:e2e
```

Current automated coverage:

```text
Vitest files: 7 passed
Vitest tests: 36 passed
Playwright tests: 5 passed
```

## Current Limitations

- Payment is still a simulation, not a real gateway integration.
- No payment expiration worker releases abandoned pending bookings yet.
- No webhook signature validation because no external payment provider is connected.
- Booking cancellation, refund, resell, auction, wallet, voucher redemption, and QR check-in remain future features.
- Merchant booking management and admin booking/payment review screens remain UI prototypes.
- Local SQLite remains a development default; Vercel production must use remote libSQL/Turso.
- No object storage exists for real venue image uploads.

## Deployment Readiness

Ready for internal preview:

- Customer can create persisted bookings from public slots.
- Customer can simulate payment success or failure.
- My Bookings reads persisted authenticated customer records.
- CI validates migrations, static checks, coverage, build, and E2E.

Not ready for public paid traffic:

- Real payment gateway and webhooks are not integrated.
- Payment expiry and automatic slot release are not implemented.
- Production Turso, Vercel secrets, monitoring, backup, and domain are still external provisioning tasks.

## Recommended Next Stage

Proceed to Stage 5: profile and notification persistence, or Stage 5A: payment expiry and booking cancellation if booking reliability is the priority.

Suggested next prompt:

```text
Start Stage 5A only: implement pending payment expiration and customer booking cancellation for Sportcation.

Requirements:
- Keep SQLite/libSQL active.
- Add server-side cancellation for pending and confirmed bookings with safe state rules.
- Add payment expiration logic that releases slots for expired pending payments.
- Connect cancellation UI in My Bookings.
- Add integration and E2E tests.
- Run lint, typecheck, coverage, build, E2E, audit, commit, push, and verify CI.
```
