# Sportcation Security Audit

Audit date: 11 June 2026

## Scope

Reviewed:

- Next.js application routes and protected layouts.
- Better Auth configuration, session handling, registration, and bootstrap flow.
- Merchant venue, court, and slot APIs.
- Drizzle SQLite/libSQL schema, repositories, services, and transaction boundaries.
- Input validation, error responses, origin checks, and response headers.
- GitHub Actions, dependency advisories, environment templates, and deployment workflow.
- Current tracked files for committed credentials and private keys.

This report covers implemented runtime behavior. Mock customer booking/payment, admin prototype actions, file upload, auction, resell, and wallet flows are not production security surfaces yet and must not be enabled without a separate review.

## Result

No confirmed critical or high-severity vulnerability remains in the implemented persistent merchant/authentication scope reviewed here.

`npm audit --audit-level=high` reports zero known dependency vulnerabilities.

## Remediated Findings

### Merchant mutation integrity

Venue, court, and slot mutations previously wrote the resource and audit record separately. A failed audit write could leave partial state.

Resolution:

- Resource changes and audit records now share one database transaction.
- Rollback behavior is covered by integration tests.

### Cross-site mutation protection

Merchant API mutations relied on session cookies and Better Auth behavior without an explicit application-level origin policy.

Resolution:

- POST, PATCH, and DELETE requests reject untrusted browser origins.
- Same-origin browser calls and non-browser operational clients remain supported.
- E2E coverage verifies a foreign origin receives `403`.

### Unsafe venue image schemes

Merchant image fields accepted arbitrary strings that were later rendered as image sources.

Resolution:

- Only local absolute paths and HTTPS URLs are accepted.
- `javascript:`, protocol-relative, backslash, and insecure HTTP values are rejected.

### Production configuration ambiguity

Production could be misconfigured with weak placeholders, insecure application URLs, missing tables, or local SQLite.

Resolution:

- `npm run deploy:check` validates remote Turso, token, auth secret, HTTPS origins, database connectivity, and required tables.
- Vercel runtime already rejects local SQLite.
- CLI scripts now load Next.js environment files consistently.

### CI supply-chain permissions

GitHub Actions used mutable major tags and implicit workflow permissions.

Resolution:

- Official actions are pinned to resolved commit SHAs.
- CI and production workflows have read-only repository permissions.
- Production deployment requires a protected GitHub Environment and explicit secrets.

### Baseline browser protections

Resolution:

- Added minimum CSP restrictions, frame denial, MIME sniffing protection, referrer policy, permissions policy, COOP, and production HSTS.
- E2E verifies critical headers.

## Authorization Review

- Public registration can only create the default customer role.
- Role and account status are checked in protected server layouts and APIs.
- Merchant APIs require active merchant membership.
- Ownership is rechecked in service/repository queries.
- Membership permissions separate catalog read, catalog write, and slot write.
- Merchant sessions cannot enter admin routes; admin sessions cannot enter merchant routes.
- Expected domain failures return stable responses without raw database errors.

## Residual Risks

### Medium: Account lifecycle is incomplete

Email verification, password reset, account recovery, and optional MFA are not implemented. Public registration should be considered beta-only until verification and recovery are available.

### Medium: Public booking/payment is not production-ready

Slot holds, booking creation, payment transitions, idempotency, refunds, and ticket issuance are not server-controlled. The current mock flow must not accept real money or promise inventory.

### Medium: Production data operations are unproven

The repository contains migration and deployment automation, but actual Turso backup, restore, token rotation, and disaster recovery have not been executed against a production project.

### Medium: Uploads are not implemented

Do not accept arbitrary file uploads. Add object storage, MIME/type verification, size limits, randomized object keys, malware policy, and deletion authorization first.

### Low: CSP is intentionally minimal

The current policy blocks framing, plugins, and hostile form targets. A nonce-based `script-src`/`style-src` policy should be added after inspecting the final production bundle and analytics requirements.

### Low: Observability is incomplete

There is no structured security event pipeline, error monitoring, alerting, or audit-log viewer. Production launch needs log retention and alerts for repeated authentication failures, forbidden mutations, and server errors.

## Deployment Classification

- Local development: ready.
- Vercel preview/internal QA: ready after preview Turso and environment setup.
- Merchant pilot with controlled accounts: conditionally ready after backup/restore and monitoring setup.
- Public booking/payment launch: not ready.

## Required Follow-up

1. Provision separate Turso preview and production databases.
2. Validate backup and restore.
3. Add monitoring and alerting.
4. Implement email verification and password recovery.
5. Complete persistent public catalog integration.
6. Design and review atomic booking/payment state machines before public transactions.
7. Run a formal exhaustive Codex Security scan when explicit subagent delegation is authorized.

## Verification Evidence

```text
db:generate             passed, no drift
lint                    passed
typecheck               passed
Vitest                  28 passed
coverage                90.90% statements, 76.56% branches, 100% functions, 90.58% lines
production build        passed
Playwright Chromium     3 passed
npm audit               0 vulnerabilities
isolated migration      passed
idempotent seed         passed twice
```
