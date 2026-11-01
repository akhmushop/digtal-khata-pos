# Phase 9.0 — Omnichannel Commerce Architecture

> Status: DESIGN — pending review. No implementation has started.
> Constraints adopted from the owner: (1) one central inventory with ezPos as
> source of truth, (2) one unified order system distinguishable by channel,
> (3) platform adapters kept out of the commerce core.

## 1. What the completed SaaS platform gives us (reuse map)

| Existing system | Reuse in Phase 9 |
|---|---|
| Tenancy middleware (`x-business-id` + membership resolution per request) | Every integration and API key belongs to one business; isolation is inherited |
| Entitlements service + `subscription_plans.features` jsonb | New feature flags (`storefrontApi`, `woocommerceIntegration`, …) enforced the same way |
| Jobs: scheduler + `FOR UPDATE SKIP LOCKED` sweeps | Sync queue, reservation expiry, webhook retries run as sweeps — no new dependency |
| Payment provider abstraction + idempotency pattern | COD and online payment status handling follow the same "never trust the browser" rule |
| `inventory_stock.reserved_quantity` column (exists, **unused**) | The reservation system takes ownership of it |
| `sales` / `sale_items` / `sale_payments` / `sale_refunds` + server-side price computation | Unified orders ARE sales rows with channel metadata — no second order system |
| `productImages.imageUrl` (URL string) | External image URLs (WooCommerce hosts the file) — no upload infrastructure needed |
| Subscription payment audit patterns (`subscription_events`) | Sync logs + webhook delivery history follow the same append-only style |

Not reusable / must be built: API-key auth, credential encryption, external
mappings, sync queue, webhook endpoints, channel allocation, business modes.

## 2. Business operating modes

`businesses.mode` — new column, `pg_enum business_mode`, default
`physical_only` (every existing customer keeps working unchanged).

| Mode | POS | Storefront API | WooCommerce/custom integrations | Location required |
|---|---|---|---|---|
| `physical_only` | yes | no | no | yes (existing behavior) |
| `online_only` | optional (not forced) | yes | yes | first location auto-created as "Online Store" |
| `omnichannel` | yes | yes | yes | yes |

Enforcement points (all server-side):
- Storefront API + integration routes: middleware `requireBusinessMode("online_only" | "omnichannel")`.
- Mode is an operating model, NOT a permission and NOT an entitlement: RBAC
  still governs users, subscriptions still govern paid features. The mode
  only decides which parts of the product are switched on.
- Changing mode is a portal settings action; downgrading `omnichannel →
  physical_only` is blocked while integrations are connected.

## 3. Schema design (migration 0010, one migration per sub-phase thereafter)

New tables (all carry `business_id` + the composite `(id, business_id)`
candidate-key pattern used throughout the codebase):

```
-- 9.1 commerce core
businesses.mode                        (column + enum)
sales.channel                          (enum: pos | woocommerce | custom_storefront, default 'pos')
sales.integrationId                    (nullable FK → integrations)
sales.externalOrderId                  (nullable varchar — WooCommerce order id)
sales.externalOrderNumber              (nullable varchar)
sales.fulfillmentStatus                (enum: unfulfilled | processing | shipped | delivered, default unfulfilled)
sale_status enum += 'pending'          (online order awaiting payment/confirmation)
customers.email                        (nullable; matching uses phone OR email)

inventory_reservations
  id, businessId, variantId, locationId, saleId (nullable FK),
  integrationId (nullable FK), quantity, status (active|confirmed|released|expired),
  idempotencyKey (unique), expiresAt, createdAt, createdBy ('storefront'|'pos')

channel_inventory_allocations
  id, businessId, integrationId, variantId, locationId,
  mode (shared | reserved), allocatedQty
  -- shared (default): storefront sees all available stock
  -- reserved: storefront sees allocatedQty only

-- 9.2 storefront API
storefront_api_keys
  id, businessId, name, publishableKey (plain, ezpos_pk_…), secretKeyHash,
  scopes (text[]), allowedDomains (text[]), environment (test|production),
  lastUsedAt, requestCount, revokedAt, createdAt
storefront_api_key_requests (rate-limit counters; or in-memory first)

-- 9.3 integrations
integrations
  id, businessId, platform (woocommerce|custom_storefront), name,
  storeUrl, locationId (FK), status (connected|error|paused|disconnected),
  syncPolicy jsonb (per-field-group direction), lastSyncAt, health jsonb
integration_credentials
  id, integrationId, cipherText, iv, authTag, keyVersion   (AES-256-GCM)
integration_product_mappings
  id, businessId, integrationId, ezProductId, externalProductId,
  externalParentId (for variations), lastPushedAt, lastPulledAt
integration_variant_mappings
  id, businessId, integrationId, ezVariantId, externalVariationId, …
integration_order_mappings
  id, businessId, integrationId, saleId, externalOrderId (unique per integration),
  externalOrderNumber, lastWebhookAt
integration_sync_jobs
  id, businessId, integrationId, jobType, payload jsonb, status
  (queued|running|succeeded|failed|dead), attempts, nextAttemptAt,
  lastError, createdAt   -- swept by the existing scheduler w/ backoff
integration_sync_logs
  id, businessId, integrationId, jobType, direction, entityType,
  entityId, status, message, payload jsonb, createdAt

-- 9.4 webhooks (outbound ezPos → customer storefronts)
webhook_endpoints    id, businessId, url, secretHash, events text[], status
webhook_deliveries   id, endpointId, event, payload, status, attempts,
                     nextAttemptAt, responseStatus, createdAt
```

Encryption: AES-256-GCM via Node's built-in `crypto`, key from
`INTEGRATION_ENCRYPTION_KEY` env (required when any integration exists);
key versioning column allows rotation. Secrets are write-only from the
API's perspective — never returned by any endpoint.

## 4. Unified inventory and reservations (the core)

**Source of truth**: `inventory_stock` per (business, variant, location).
The storefront never reads or writes stock anywhere else.

Availability formulas (all computed server-side, in the transaction that
creates the order):

```
onHand        = inventory_stock.quantity
reserved      = SUM(active inventory_reservations for this variant+location)
soldPending   = 0  (reservations ARE the pending sales; no double counting)
available     = onHand - reservedQuantity        -- reserved_quantity column
                                                   becomes derived/maintained
onlineAvailable =
  allocation.mode = 'reserved'  → min(allocation.allocatedQty, available)
  allocation.mode = 'shared'    → available
```

**Reservation lifecycle** (one transaction, `FOR UPDATE` on the
`inventory_stock` row — POS sales already lock the same rows, which is what
makes physical-vs-online overselling impossible):

1. `POST /api/v1/storefront/orders` with `Idempotency-Key` header.
2. Validate variants belong to the business; fetch real prices; compute totals.
3. Lock stock rows; check `onlineAvailable >= qty` per line; else 409 with
   per-line availability.
4. Insert `inventory_reservations` (status `active`) + bump
   `inventory_stock.reserved_quantity`; create the sale row
   (`status 'pending'`, `paymentStatus 'unpaid'`, channel, integration,
   external ids) + order mapping — all atomic, keyed by the idempotency key
   (duplicate submissions return the original order).
5. **Confirm** (webhook reports payment, or admin marks paid): run the
   EXISTING sale finalization path — deduct stock through the existing
   movement/batch rules, reservation → `confirmed`, sale → `completed`
   (or `processing` + fulfillment status).
6. **Release** (cancelled/expired/failed): reservation → `released`,
   `reserved_quantity` decremented, sale → `cancelled`. A scheduler sweep
   expires reservations past `expiresAt` (configurable, default 30 min) —
   reusing the Phase 7 sweep pattern.

Physical POS sales need **no changes**: they already decrement stock
transactionally; a concurrent online checkout simply sees the lower
`available` because both paths lock the same stock row.

Allocation is optional per integration + location; shared mode (default)
requires zero configuration.

## 5. Unified orders — status mapping

Online orders are `sales` rows with channel metadata. No separate order
table, no duplicated tax/refund/accounting logic. WooCommerce statuses map:

| WooCommerce status | ezPos sale.status | paymentStatus | Reservation |
|---|---|---|---|
| pending | pending | unpaid | active (expires) |
| on-hold | pending | unpaid | active (longer expiry) |
| processing (paid) | completed | paid | confirmed |
| completed | completed | paid | confirmed + fulfilled |
| cancelled | cancelled | unpaid | released |
| failed | cancelled | unpaid | released |
| refunded | refunded (existing refund flow) | refunded | — (existing rules) |

Fulfillment (`unfulfilled → processing → shipped → delivered`) is ezPos-side
only, managed from the portal's order view; it never comes from the gateway.
COD: order is `pending`/`processing` with a `cod` payment-method record and
stays unpaid until the business marks it paid in the portal — external "paid"
claims for COD are never auto-trusted.

Customer matching: phone (normalized) is the primary key for matching;
email secondary (new column); name is never a matching criterion. No match →
new customer record (guest checkout supported). No automatic merging, ever.

## 6. Storefront API v1

Auth: two keys per storefront integration.
- Publishable (`ezpos_pk_…`): product/category/availability reads only;
  domain-restricted (Origin check); safe for browser use.
- Secret (`ezpos_sk_…`, shown once, stored hashed): order creation, status
  reads, webhook management — server-to-server only.
- Scopes per key (`products:read`, `inventory:read`, `orders:write`, …);
  rate limited per key (in-memory first, shared store before scale-out);
  request counters for the usage dashboard.

Endpoints (all under `/api/v1/storefront`, all tenant-scoped by the key):
products (list/detail/variants/categories/brands; only `status='active'`;
never cost/supplier/internal fields), inventory availability, order create
(idempotency-key required) / status. Server-side prices and totals only —
client-submitted prices are ignored, as everywhere else in ezPos.

## 7. WooCommerce adapter & sync engine

Everything WooCommerce-specific lives in
`modules/integrations/adapters/woocommerce/` (client, mapper, products,
orders, webhooks) behind a `PlatformAdapter` interface so Shopify etc. slot
in later. Credentials: WooCommerce REST consumer key/secret entered in the
portal, validated against the store's own API at connect time, encrypted at
rest, never returned.

Sync policies (per integration, per field group): products/pull or push or
off; price: ezPos-master (default); description/images: WC-master (default);
inventory: always ezPos-master (decision 1 — non-negotiable).

Loops are structurally prevented: outbound pushes carry the ezPos origin
marker and inbound webhook handlers ignore self-originated changes;
direction is per-field-group, never "both" on the same field.

Order webhooks: signature-verified (HMAC-SHA256, `X-WC-Webhook-Signature`),
replay-protected (external order id + status version recorded in
`integration_order_mappings`; older events ignored), processed
asynchronously via `integration_sync_jobs` — the HTTP handler only verifies
and enqueues, so WooCommerce never times out ezPos, and nothing is lost if
processing fails (retry w/ exponential backoff, dead-letter after N tries,
manual retry from the dashboard).

Product sync: initial full sync job + change-driven jobs; mappings are
mandatory (id-based, never name/SKU matching); variations map to variants.
Inventory pushes are rate-limited and batched per store.

## 8. Entitlements

`PlanFeatures` gains: `storefrontApi`, `woocommerceIntegration`,
`customStorefront`, `multiChannelInventory` (allocations beyond shared),
`multipleOnlineStores`, `advancedWebhooks`. New `PlanLimits` fields:
`maxConnectedStores`, `maxWebhookEndpoints`. Enforced in the existing
entitlements service; expired integrations go read-only (data and billing
history stay reachable, per the Phase 4 rule).

## 9. Reliability

All async work rides the existing scheduler as new sweeps (sync jobs,
reservation expiry, webhook delivery) with `SKIP LOCKED`, attempts/backoff,
and dead-letter rows surfaced in the dashboard. No message-broker
dependency is introduced; if volume ever demands it, the `integration_sync_jobs`
table is already the queue shape a real worker pool would consume.

## 10. Sub-phase plan

| Phase | Delivers | Migration |
|---|---|---|
| 9.1 | business modes, channel columns on sales, reservations + allocation + expiry sweep, unified-order service | 0010 |
| 9.2 | API keys + scopes, storefront product/inventory/order endpoints, rate limiting, idempotency | 0011 |
| 9.3 | integrations + encrypted credentials + mappings + WC adapter + webhooks in + outbound sync + portal Integrations pages | 0012 |
| 9.4 | developer docs page, examples, webhook endpoint management for custom storefronts | 0013 (webhook tables if deferred) |
| 9.5 | unified order views/filters in portal, fulfillment workflow, refund/cancel sync, concurrency hardening | — |
| 9.6 | entitlement flags + limits enforcement + plan seeding | — |
| 9.7 | isolation/security suites, sync-reliability tests, load pass on order creation, runbook updates | — |

## 11. Open questions requiring owner review before 9.1

1. **Order creation policy**: should an unpaid WooCommerce `pending` order
   reserve stock immediately (recommended, with 30-min expiry) or only when
   payment succeeds?
2. **Tax/VAT**: online orders must compute VAT like POS (existing
   per-product VAT fields) — confirm WooCommerce tax classes should be
   ignored in v1 and prices compared inclusive-of-tax?
3. **Currency**: v1 assumes BDT across all channels (subscription plans are
   BDT). Multi-currency storefronts = later phase?
4. **Allocation default**: shared stock (recommended for v1) with
   per-variant reserved allocation as the paid `multiChannelInventory`
   feature — acceptable?
5. **Refund direction**: v1 = refunds initiated in ezPos sync OUT to
   WooCommerce (status update only, not gateway refunds). WooCommerce-initiated
   refunds create ezPos refunds in 9.5. Acceptable sequencing?
6. **Online-only location**: auto-create a single "Online Store" location
   for `online_only` businesses (inventory must live somewhere) — confirm.
