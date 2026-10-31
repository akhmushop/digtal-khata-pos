# ezPos Next.js storefront example

A minimal example of a custom storefront built on the ezPos Storefront API.

## Setup

1. In ezPos: Account → Integrations → create an API key
   (scopes: `products:read`, `inventory:read`, `orders:read`, `orders:write`).
2. Copy `.env.example` to `.env.local` and fill in your keys.
3. `npm install && npm run dev`

## What it shows

- `app/page.tsx` — server-rendered product list from
  `GET /api/v1/storefront/products` (publishable key, prices and live
  availability from ezPos).
- `app/api/checkout/route.ts` — server-side order submission with the
  SECRET key and an idempotency key (never expose the secret to the
  browser; 409 responses mean stock changed — refresh availability).

## Rules of thumb

- ezPos is the inventory source of truth: re-check availability before
  confirming checkout; never cache stock quantities across sessions.
- Totals are computed by ezPos from the catalog — display them from the
  API response, don't compute your own prices.
