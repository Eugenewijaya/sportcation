# Sportcation Vercel Deployment Runbook

Last updated: 11 June 2026

## Deployment Decision

Use one Vercel project for the current MVP:

- Customer: `/`
- Merchant: `/merchant`
- Admin: `/admin`

Do not create separate deployments per role yet. One deployment keeps authentication cookies, authorization, database migrations, observability, and releases consistent. Every protected page and API must continue to enforce role and merchant ownership on the server.

Separate projects become reasonable only when customer, merchant, and admin have different teams, release schedules, compliance boundaries, uptime requirements, or independently scaled backends.

## Required Services

1. GitHub repository: `Sportcation-id/Sportcation`.
2. One Vercel project connected to the repository.
3. One remote Turso/libSQL production database.
4. A production domain, for example `app.sportcation.id`.
5. Optional Vercel Blob or another object store before real venue image uploads.
6. Error monitoring and uptime monitoring before public traffic.

Local SQLite is only for development. A file under `data/` is not durable on Vercel.

## Vercel Environment Variables

Configure these for Production:

```text
TURSO_DATABASE_URL=libsql://...
TURSO_AUTH_TOKEN=...
BETTER_AUTH_SECRET=<random value, at least 32 characters>
BETTER_AUTH_URL=https://app.sportcation.id
AUTH_TRUSTED_ORIGINS=https://app.sportcation.id
NEXT_PUBLIC_APP_URL=https://app.sportcation.id
```

Configure separate database credentials and URLs for Preview. Never connect preview deployments to the production database.

The following bootstrap variables are temporary and must be removed after provisioning:

```text
AUTH_BOOTSTRAP_ADMIN_EMAIL
AUTH_BOOTSTRAP_ADMIN_PASSWORD
AUTH_BOOTSTRAP_ADMIN_NAME
AUTH_BOOTSTRAP_MERCHANT_EMAIL
AUTH_BOOTSTRAP_MERCHANT_PASSWORD
AUTH_BOOTSTRAP_MERCHANT_NAME
```

## Initial Production Setup

1. Create the Turso database and token.
2. Connect the GitHub repository to one Vercel project.
   Configure Vercel Git production branch so pushes to `main` create previews only; production is released by the manual GitHub Actions workflow.
3. Add production environment variables in Vercel.
4. Pull production variables locally:

```powershell
vercel link
vercel env pull .env.production.local --environment=production
```

5. Apply migrations:

```powershell
$env:NODE_ENV="production"
npm run db:migrate
```

6. Do not run `db:seed` against production. It contains demo records.
7. Provision the first admin and merchant with temporary bootstrap variables:

```powershell
$env:NODE_ENV="production"
npm run auth:bootstrap
```

8. Remove bootstrap password variables from Vercel immediately.
9. Run production preflight:

```powershell
npm run deploy:check
```

10. Deploy a preview, validate it, then promote the same artifact to production.

## Production Workflow

The repository contains `.github/workflows/deploy-production.yml`.

Create a GitHub Environment named `production` with required reviewers and these secrets:

```text
VERCEL_TOKEN
VERCEL_ORG_ID
VERCEL_PROJECT_ID
```

Runtime application secrets remain in Vercel and are pulled during the workflow. The workflow:

1. Pulls the linked Vercel project and production environment.
2. Applies Drizzle migrations to Turso.
3. Runs `npm run deploy:check`.
4. Builds with Vercel.
5. Deploys the prebuilt artifact to production.
6. Verifies `/api/health`.

Trigger it from GitHub Actions only after CI and preview acceptance pass.

## Release Gate

Before production:

```powershell
npm ci
npm run db:generate
npm run lint
npm run typecheck
npm run test:coverage
npm run build
npm run test:e2e
npm audit --audit-level=high
npm run deploy:check
```

The production database migration must complete before the production artifact is promoted.

## Post-Deploy Verification

Verify:

- `GET /api/health` returns `200` and `{ "status": "ok" }`.
- Customer home loads without authentication.
- Anonymous access to `/merchant` and `/admin` redirects to login.
- Merchant cannot access `/admin`.
- Admin cannot access `/merchant`.
- Merchant can create, edit, and delete a test draft venue.
- Database state remains after a new deployment.
- Logout invalidates the session.
- Vercel function logs contain no repeated `500` or database authentication errors.

## Rollback

Application rollback:

```powershell
vercel rollback
```

Database rollback is separate. Never assume an application rollback reverses a migration. Keep migrations backward-compatible and take a Turso backup or branch before destructive migrations.

## Domain Strategy

Recommended now:

```text
app.sportcation.id/
app.sportcation.id/merchant
app.sportcation.id/admin
```

Optional later:

```text
merchant.sportcation.id
admin.sportcation.id
```

If subdomains are added, initially point them to the same Vercel project and use explicit rewrites. Review cookie domain, trusted origins, CSRF protection, and redirect behavior before enabling them.

## Production Blockers Still Outside This Repository

- Vercel project and domain ownership.
- Turso production and preview databases.
- Real production secrets.
- Backup and restore validation.
- Error monitoring and uptime monitoring.
- Object storage for uploaded venue images.
- Email verification, password reset, and account recovery.
- Real booking/payment state machine before accepting public transactions.
