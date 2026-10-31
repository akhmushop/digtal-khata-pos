# ezPos — Commercial SaaS POS Platform

ezPos is a web-based point of sale for small and medium retailers, packaged
as a commercial SaaS: a public marketing website with subscription signup,
a customer billing portal, and a platform-owner admin panel.

## Repository layout (three apps, one git repo)

| Path | App | Stack | Dev port |
|---|---|---|---|
| `ezPosBackend/` | API (auth, tenancy, subscriptions, payments, jobs) | Express 5, TypeScript, PostgreSQL, Drizzle ORM | 3000 |
| `pos/` | POS application (customer product) | React 19, Vite, react-router v7, Tailwind v4 | 5173 |
| `ezPosWebsite/` | Marketing site + customer portal (`/account`) + admin panel (`/saas-admin`) | Next.js 16 App Router | 3001 |

## Development

```bash
# 1. PostgreSQL (any 16+) and .env files from each app's .env.example
# 2. Migrate + seed
cd ezPosBackend && npm run db:migrate
#    optional example catalog: psql -f scripts/seed-example-plans.sql
#    optional trial plan backfill: psql -f scripts/seed-trial-plan.sql
# 3. Run all three
cd ezPosBackend && npm run dev        # API on :3000
cd ezPosWebsite && npm run dev        # website on :3001
cd pos && npm run dev                 # POS on :5173
```

A new signup gets a 14-day trial automatically; verification and password
emails print to the backend console until `EMAIL_PROVIDER` is configured.

## Tests

```bash
cd ezPosBackend
npx tsc --noEmit                 # typecheck
npm test                         # unit tests only
INTEGRATION_TESTS=1 DATABASE_URL=postgres://.../ezpos_test npm test
# integration suites fail closed: they only run against a database named
# `ezpos_test`, which must be migrated first
```

CI (`.github/workflows/ci.yml`) runs backend tsc + migrations + the full
suite and both frontend builds on every PR.

## Production

See `docs/DEPLOYMENT.md` (Docker Compose, domains, TLS, backups) and
`docs/SECURITY.md` (threat model and security decisions).
