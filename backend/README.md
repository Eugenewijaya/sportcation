# Sportcation Backend

NestJS API foundation for the Sportcation Android MVP.

This backend is intentionally scoped to Sprint 10 only. It provides the server foundation, health checks, validation/error patterns, auth middleware placeholder, and database connection placeholder. It does not implement real auth, venue, booking, payment, auction, wallet, or notification APIs yet.

## Stack

- NestJS with TypeScript.
- REST API under `/api/v1`.
- Class Validator and global validation pipe.
- PostgreSQL + Prisma planned for Sprint 11.
- Firebase Auth token verification planned for Sprint 12.

## Setup

```bash
cd backend
npm install
cp .env.example .env
npm run dev
```

The default local server URL is:

```text
http://localhost:4000/api/v1
```

## Available Endpoints

```text
GET  /api/v1
GET  /api/v1/health
GET  /api/v1/routes
POST /api/v1/validation-check
POST /api/v1/auth/register
POST /api/v1/auth/login
POST /api/v1/auth/otp/request
POST /api/v1/auth/otp/verify
POST /api/v1/auth/logout
GET  /api/v1/auth/me
GET  /api/v1/users/me
```

`POST /api/v1/validation-check` exists only to demonstrate the validation and structured error pattern.

## Auth

Sprint 12 adds simulated OTP authentication only.

Register:

```bash
curl -X POST http://localhost:4000/api/v1/auth/register \
  -H "Content-Type: application/json" \
  -d '{"displayName":"Alex Sporta","email":"alex@sportcation.app"}'
```

Verify OTP:

```bash
curl -X POST http://localhost:4000/api/v1/auth/otp/verify \
  -H "Content-Type: application/json" \
  -d '{"otpSessionId":"session_id","otpCode":"123456"}'
```

Current user:

```bash
curl http://localhost:4000/api/v1/users/me \
  -H "Authorization: Bearer access_token"
```

Development behavior:

- OTP values are generated dynamically and stored as hashes.
- `AUTH_EXPOSE_SIMULATED_OTP=true` exposes the generated OTP in development responses for local testing.
- In production, configure `AUTH_TOKEN_SECRET` and disable OTP exposure.
- Password login is not implemented in this sprint, so no password is stored.

## Validation

```bash
npm run build
npm run test
npm run db:validate
npm run db:generate
```

`npm run test` currently aliases the TypeScript build until real backend tests are added.

## Database

Sprint 11 adds the Prisma schema and seed data for PostgreSQL.

```bash
cp .env.example .env
# Update DATABASE_URL in .env so it points to a real PostgreSQL database.
npm run db:migrate:dev
npm run db:seed
```

Useful commands:

```bash
npm run db:validate
npm run db:generate
npm run db:migrate:deploy
```

The initial SQL migration is stored in `prisma/migrations/20260603000000_initial_schema/migration.sql`.

## Sprint Boundary

Do not add production business APIs in this foundation sprint. The next backend sprint should create the Prisma schema, migrations, seed data, and database connection implementation.
