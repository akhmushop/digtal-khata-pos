# Security Model

This document records the security decisions baked into the code so they
survive team changes. Everything here is enforced server-side; frontend
gating is UX only.

## Identity & sessions

- Argon2id password hashing (`@node-rs/argon2`); constant-time dummy-hash
  comparison on unknown emails so failed logins do not leak existence.
- 15-minute JWT access tokens (memory-only client-side) + opaque refresh
  tokens stored SHA-256-hashed, delivered as HttpOnly cookies scoped to
  `/api/auth`, rotated on every refresh with a 30s reuse grace; reuse after
  grace revokes ALL of the user's sessions. Password reset and password
  change revoke every session.
- Email verification + password-reset tokens are single-use, hashed at
  rest, and expire. Forgot-password responds identically whether or not the
  account exists (no enumeration).

## Tenancy

- The business selector (`x-business-id` header / `:businessId` param) is a
  hint, never proof: every request re-loads the caller's active membership,
  effective permissions (union across roles), and subscription state from
  the database. A suspended business blocks all member access
  (`BUSINESS_SUSPENDED`).
- Composite foreign keys (`id, business_id`) make cross-tenant row
  references impossible at the schema level.
- Consolidated cross-tenant probe suite: `src/test/isolation.integration.test.ts`.

## Plans & entitlements

- All plan checks flow through `src/services/entitlements.ts` and
  `src/modules/subscriptions/subscription.service.ts` — limit assertions run
  inside the caller's transaction with a per-business advisory lock.
- Subscription lifecycle transitions exist in exactly one service; every
  transition writes a `subscription_events` audit row. Admin mutations also
  write `saas_admin_audit`.

## Payments

- The browser never receives gateway credentials; checkout sessions are
  created server-side.
- Activation happens only in `verifyAndActivate()`: server-side validation
  of the gateway's `val_id` + amount comparison against the stored invoice.
  The success redirect proves nothing; duplicate IPNs are idempotent.
- `PAYMENT_PROVIDER=mock` is refused at startup in production.

## Admin panel

- `/api/saas/*` requires `users.platform_role = 'platform_admin'`
  (Super Admin). This is an account-level role, deliberately separate from
  business RBAC; granular `saas.*` roles are future work.

## Transport & headers

- TLS terminated at the nginx edge (see `nginx/ezpos.conf`); the backend
  sets `TRUST_PROXY=1` and only then trusts `X-Forwarded-For` for rate-limit
  keys.
- API responses carry `X-Content-Type-Options: nosniff`,
  `X-Frame-Options: DENY`, `Referrer-Policy: strict-origin-when-cross-origin`.

## Rate limits (per IP, in-memory)

| Endpoint | Limit |
|---|---|
| register / login / forgot / reset / resend-verification / change-password | 20 / 15 min (`AUTH_RATE_LIMIT_MAX`) |
| refresh | 60 / 15 min |
| contact form | 5 / hour |

## Omnichannel / storefront API (Phase 9)

- Storefront API keys: publishable keys are public but catalog-only and
  optionally domain-restricted; secret keys are SHA-256 hashed, shown once,
  and required for order submission. Keys are business-scoped at the query
  level — a catalog never returns another business's products.
- Order submission computes prices server-side and holds stock
  transactionally (`FOR UPDATE` on inventory rows) — cross-channel oversell
  is impossible at the database level.
- WooCommerce credentials are AES-256-GCM encrypted
  (`INTEGRATION_ENCRYPTION_KEY`); write-only from the API.
- Inbound WooCommerce webhooks: HMAC-SHA256 signature over the raw body +
  URL token routing + replay protection via order mappings.
- Outbound webhooks: signed `X-Ezpos-Signature` headers, per-endpoint
  secrets, retry with backoff, dead-letter visible in the portal.
- Integration entitlements (`storefrontApi`, `woocommerceIntegration`,
  `advancedWebhooks`, store/webhook limits) are enforced at every entry
  point; expired entitlements pause sync without hiding historical data.

## Known limitations (tracked, not hidden)

- In-memory rate limiting and the in-process scheduler assume a single
  backend instance. Both are documented; fix before scaling horizontally.
- No file uploads exist yet, so there is no upload surface to secure; the
  business logo field in the original spec is intentionally unimplemented.
- Storefront rate limiting is also in-memory (per backend instance).
- Physical POS can oversell reserved online stock (the counter is master);
  the affected online order fails confirmation and surfaces for manual
  resolution — documented trade-off from Phase 9.1.
- Refund processing through the gateway is not implemented; refunds are a
  Phase-8 reconciliation item.
- SSLCommerz integration follows the documented sandbox API but must be
  exercised with sandbox store credentials before production launch.
