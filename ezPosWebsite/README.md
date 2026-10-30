# ezPosWebsite

The public SaaS website for **ezPos** — a web-based point of sale for small
and medium retailers. Built with Next.js (App Router), TypeScript, and
Tailwind CSS.

## Status

Phase A (this app): marketing site with static/mock pricing data and
preview-only sign-in/sign-up forms. Authentication, backend pricing, and POS
integration come in later phases.

## Getting started

```bash
npm install
npm run dev
```

The dev server runs on <http://localhost:3001> (port 3001 avoids clashing
with the ezPos backend, which is fixed on port 3000).

## Scripts

| Command           | Description                    |
| ----------------- | ------------------------------ |
| `npm run dev`     | Start the dev server (port 3001) |
| `npm run build`   | Production build               |
| `npm run start`   | Serve the production build     |
| `npm run lint`    | Run ESLint                     |

## Environment variables

Copy `.env.example` to `.env.local` and adjust:

| Variable                 | Purpose                                                        |
| ------------------------ | -------------------------------------------------------------- |
| `NEXT_PUBLIC_SITE_URL`   | Public URL of this website (SEO metadata, Open Graph).         |
| `API_BASE_URL`           | Base URL of the ezPos backend. Server-side only — never expose it with a `NEXT_PUBLIC_` prefix. |

## Structure

```text
src/
├── app/                  # App Router pages (home, features, pricing, faq, sign-in, sign-up)
├── components/
│   ├── forms/            # Preview auth forms (client-side validation only)
│   ├── layout/           # Site header and footer
│   ├── marketing/        # Hero, feature cards, FAQ items, decorative visuals
│   ├── pricing/          # Pricing plans client component
│   └── ui/               # Buttons, alerts, container
├── lib/
│   ├── api/              # Server-only backend fetchers (cached via "use cache")
│   ├── format.ts         # Price/limit formatting helpers
│   ├── validations/      # Zod schemas (forms + API response validation)
│   └── utils.ts          # cn() class helper
```

## Pricing data

The pricing page and homepage teaser fetch active plans from the backend
endpoint `GET /api/subscription-plans` via `lib/api/subscription-plans.ts`,
which is server-only and cached with the `minutes` cache profile. When the
backend is unreachable or returns malformed data, the pages show a clear
"temporarily unavailable" message instead of falling back to sample prices.
