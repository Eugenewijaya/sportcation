# Stage 9 Merchant Finance Audit

Audit date: 15 June 2026

## Summary

Stage 9 implements a persistent merchant finance and payout-readiness foundation for Sportcation while keeping SQLite/libSQL as the active database. The feature is intentionally read-only: it gives merchants a settlement center sourced from persisted bookings, booking items, venues, and simulated payments, but it does not release payouts, transfer money, approve refunds, or integrate a real payment gateway.

## Implemented Scope

- Merchant finance DTO contracts in `lib/merchant-finance/types.ts`.
- Merchant `finance:read` permission.
- Merchant-scoped finance service in `lib/services/merchant-finance-service.ts`.
- `GET /api/merchant/finance`.
- Persistent `/merchant/finance` UI in `components/merchant-finance-workspace.tsx`.
- Dashboard route wiring in `components/sportcation-ops-app.tsx`.
- Integration tests for summary math, merchant ownership filtering, pending payment exclusion, and refund hold handling.
- E2E coverage for merchant finance UI/API access and role boundaries.

## API Contract

```text
GET /api/merchant/finance
```

Authorization:

- Requires an active merchant user session.
- Requires merchant membership.
- Requires `finance:read` permission.
- Customer and admin sessions receive `403`.
- Unauthenticated sessions receive `401`.

Response data:

- `summary`: booking count, paid amount, pending amount, failed amount, refunded amount, platform fees, net receivable, payout-ready amount, refund-hold amount, and next payout date.
- `settlements`: per-venue payout preview records.
- `transactions`: booking/payment transaction rows.
- `paymentBreakdown`: totals grouped by simulated payment method.
- `payoutPolicy`: plain-language MVP limits and assumptions.

## Data Sources

- `venues`
- `bookings`
- `booking_items`
- `payments`

No new payout table or migration was added in this stage. The current implementation is a calculated read model over existing persisted booking/payment records.

## Security And Authorization

- API access is enforced through `requireApiActor`.
- Merchant data is filtered by `venues.merchant_id`.
- Finance visibility is restricted through `finance:read`.
- Staff without finance permission cannot read merchant finance data.
- Customer and admin roles are blocked from the merchant finance API.

## Known Limitations

- No payout batch table.
- No bank account management.
- No real payout release.
- No payment gateway reconciliation.
- No refund approval workflow.
- No immutable ledger table.
- No background settlement job.

These are deliberate Stage 9 boundaries. The current feature is suitable for internal MVP finance review, not real merchant settlement.

## Validation Receipt

```text
npm run typecheck       passed
npx vitest run tests/unit/merchant-permissions.test.ts tests/integration/merchant-finance.test.ts passed, 8 tests
npm run lint            passed
npm run test:coverage   passed, 67 tests
npm run db:generate     passed, no schema drift
npm audit --audit-level=high passed, 0 vulnerabilities
npm run build           passed with required auth env
npm run test:e2e        passed, 10 Chromium tests
git diff --check        passed
secret pattern scan     passed, no known Neon URL fragments or local build secret found
```

## Recommended Next Prompt

Start Stage 10 only: implement persistent admin reports/content/settings foundation for Sportcation, or choose production observability if deployment readiness is higher priority.
