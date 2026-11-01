# Deployment Runbook

Target: a single Linux host running Docker Compose with the domain split
`ezpos.com` (website + portal), `app.ezpos.com` (POS), `api.ezpos.com`
(backend API). `admin.ezpos.com` resolves to the same website container —
`/saas-admin` is guarded by platform-admin auth.

## First deploy

1. **DNS**: A records for `ezpos.com`, `www`, `app`, `api`, `admin` → the host.
2. **Configure**: `cp .env.production.example .env`, then fill every value
   (`openssl rand -base64 32` for DB password, `-base64 48` for the JWT
   secret, `-base64 32` for INTEGRATION_ENCRYPTION_KEY — WooCommerce
   credentials are encrypted with it). Production refuses
   `PAYMENT_PROVIDER=mock`.
3. **Build & start**:
   ```bash
   docker compose build
   docker compose up -d postgres
   docker compose run --rm backend npm run db:migrate
   # seed the trial plan + optional example catalog
   docker compose run --rm backend sh -c "apt-get update >/dev/null && npm run db:migrate"
   docker compose up -d
   ```
   Seeds (run once, order matters):
   ```bash
   docker compose exec postgres psql -U ezpos -d ezpos -f - < ezPosBackend/scripts/seed-trial-plan.sql
   docker compose exec postgres psql -U ezpos -d ezpos -f - < ezPosBackend/scripts/seed-example-plans.sql
   ```
4. **TLS**: run certbot against the webroot (`nginx/ezpos.conf` already
   routes `/.well-known/acme-challenge/`), then uncomment the 443 blocks and
   `docker compose restart nginx`. Renewal: a monthly cron running
   `certbot renew --webroot -w <webroot> && docker compose exec nginx nginx -s reload`.
5. **First admin**: register normally on the website, then
   `docker compose exec postgres psql -U ezpos -d ezpos -c \
     "UPDATE users SET platform_role='platform_admin' WHERE email='you@example.com'"`
6. **Smoke test**: sign up on the website → business + trial created →
   verification email arrives → POS opens at `app.ezpos.com`.

## Upgrades

```bash
git pull
docker compose build
docker compose run --rm backend npm run db:migrate   # apply new migrations
docker compose up -d                                 # rolling recreate
```
Never edit the production schema by hand — every change goes through a
Drizzle migration (`npx drizzle-kit generate`, review the SQL, commit).

## Backups

Nightly logical backup (add to host cron):

```bash
docker compose exec postgres pg_dump -U ezpos -Fc ezpos \
  > /backups/ezpos-$(date +%F).dump
```

Restore drill (verify quarterly on a scratch host):

```bash
docker compose exec -T postgres pg_restore -U ezpos -d ezpos --clean < backup.dump
```

Keep 30 days of dumps off-host. The database is the only stateful service
(no user uploads exist yet); regenerating the stack from git + `.env` is safe.

## Operational notes

- **Jobs**: the backend runs subscription sweeps (trial expiry, reminders,
  grace suspension) hourly in-process. `JOBS_ENABLED=false` disables them
  (e.g. while debugging); `POST /api/saas/jobs/run` triggers them manually.
- **Rate limiting** is in-memory per process — correct for the single
  backend instance this compose file runs. Add a shared store before running
  multiple backend replicas.
- **SSLCommerz**: set sandbox `SSLCOMMERZ_SANDBOX=true` first, make one real
  sandbox payment through the portal, then flip to `false` with production
  store credentials. The IPN URL the gateway needs is
  `https://api.ezpos.com/api/payments/ipn`.
- **Logs**: `docker compose logs -f backend` (errors + email delivery
  failures are logged, never surfaced to clients).
