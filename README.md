# Sportcation

Sportcation is a responsive Next.js web app for sports venue discovery, booking flows, merchant operations, and platform administration. The mobile UI follows the exported Figma layers in `D:\sportcation\figma sportcation`, while desktop viewports use dedicated web layouts.

## Current State

- Next.js 16 App Router, React 19, Tailwind CSS 4.
- Drizzle ORM with local SQLite and production-compatible remote libSQL/Turso.
- Better Auth email/password sessions.
- Role protection for customer, merchant owner/staff, and admin.
- Merchant membership permissions for owner, manager, staff, finance, and viewer.
- Persistent merchant venue, court, and slot CRUD.
- Client booking/payment and most admin modules remain mock UI.

## Local Setup

```powershell
npm install
Copy-Item .env.example .env.local
npm run db:migrate
npm run db:seed
npm run dev
```

Set a unique auth secret of at least 32 characters in `.env.local`:

```text
BETTER_AUTH_SECRET=replace-with-a-long-random-secret
BETTER_AUTH_URL=http://localhost:3000
AUTH_TRUSTED_ORIGINS=http://localhost:3000
```

Open `http://localhost:3000`.

## Provision Merchant And Admin Accounts

Public registration only creates customer accounts. Set temporary bootstrap environment variables, run the command once, then remove the credential variables:

```bash
npm run auth:bootstrap
```

Supported variables are documented in `.env.example`. Passwords must contain at least 12 characters. No operational credentials are committed to the repository.

## Main Routes

```text
/                       Client web app
/login                  Shared login
/register               Customer registration
/merchant               Protected merchant dashboard
/merchant/venues        Persistent venue CRUD
/merchant/slots         Persistent slot CRUD
/merchant/bookings      Merchant booking UI prototype
/merchant/finance       Merchant finance UI prototype
/admin                  Protected admin dashboard
/admin/users            Admin user UI prototype
/admin/venues           Admin moderation UI prototype
/admin/bookings         Admin booking UI prototype
/admin/payments         Admin payment UI prototype
```

## Database

```bash
npm run db:generate
npm run db:migrate
npm run db:seed
npm run db:studio
```

- Local development defaults to `file:./data/sportcation.db`.
- Stateless production environments must use `TURSO_DATABASE_URL=libsql://...` and `TURSO_AUTH_TOKEN`.
- A local SQLite file is not durable on Vercel because the filesystem is ephemeral.
- The previous Neon PostgreSQL schema remains under `lib/db/postgres` as a future migration reference.

## Validation

```bash
npm run lint
npm run typecheck
npm run build
npm audit
```

Production builds require `BETTER_AUTH_SECRET` and either `BETTER_AUTH_URL` or `NEXT_PUBLIC_APP_URL`.

## Current Persistent APIs

```text
GET, POST          /api/venues
GET, PATCH, DELETE /api/venues/:id
GET, POST          /api/courts
PATCH, DELETE      /api/courts/:id
GET, POST          /api/slots
PATCH, DELETE      /api/slots/:id
GET                /api/categories
```

Mutation APIs require an active merchant session, verified merchant membership, ownership, and the required membership permission. See `docs/AUDIT_AND_IMPLEMENTATION_PLAN_SQLITE_LIBSQL.md` for verified status and the recommended next stage.
