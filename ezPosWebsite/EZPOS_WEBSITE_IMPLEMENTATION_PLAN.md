# ezPos Website — Implementation Plan

> Companion to EZPOS_WEBSITE_AUDIT.md and EZPOS_WEBSITE_GAP_TRACKER.md.
> Executed phase-by-phase (A–J per the master prompt), with per-phase
> verification (typecheck, lint, build, affected-workflow testing) and
> gap-tracker updates.

## §0 Governing policy (operative)

Two documents govern this work:

1. **Backend modification policy** (provided first): `ezPosBackend`
   changes are allowed when genuinely necessary for the website —
   extending existing modules, backward-compatible only, with a written
   proposal (problem, endpoints, DB changes, impact, tests) and explicit
   approval before significant or database-level changes.
2. **Master prompt** §2.4/§18: website-only scope, no backend changes.

Resolution: the policy block amends the master prompt. Concretely —
website features are built first; if a feature is blocked on a missing
backend capability, the dependency is documented and a proposal is
presented; nothing in `ezPosBackend` changes without approval. Current
audit finding: **no blocked features** — all existing UI calls verified
endpoints. Two P1 items (audit-log viewer) and three P2/P3 items will
require backend proposals when scheduled.

## Phase A — Audit ✅ (this document set)

Deliverables: AUDIT / GAP_TRACKER / IMPLEMENTATION_PLAN. No source code
changed.

## Phase B — Foundation

1. **Consolidate checkouts** (operator action, not code): keep one of
   `D:\ezposzcode\digtal-khata-pos` / `D:\digtal-khata-pos`, create
   `ezPosWebsite/.env` from `.env.example` (API_BASE_URL etc.).
2. **Vitest setup** (P0): `vitest` + `@testing-library/react` +
   `jsdom`; unit tests for `src/lib/api/*` clients (auth refresh race,
   `{success,data}` unwrap, portal/notifications/sessions clients) and
   form validation schemas. Add `npm test`.
3. **Lint cleanup** (P0, 16 errors): fix the React-Compiler
   setState-in-effect violations — extract async data loading into
   awaited callbacks (or, with the TanStack Query adoption below, the
   pattern disappears entirely).
4. **Global `error.tsx`** (P1): branded error boundary with retry.
5. **npm audit** (P1) and dependency bump pass.

## Phase C — Public website completion

1. Cookie Policy page (P1) + link in footer.
2. Subscription & Billing Policy page (P1) + link.
3. Canonical URLs + JSON-LD (Organization + Product on pricing) (P2).
4. Homepage copy pass after SSLCommerz go-live (remove "not open yet"
   caveats) — content task, gated on operator.

## Phase D — Auth & onboarding

1. Terms-acceptance checkbox on sign-up (P1, frontend-only; backend
   schema unchanged — acceptance stored as a note/log client-side is
   NOT acceptable; document that a backend `terms_accepted_at` column is
   the honest implementation → **backend proposal required**, 1 column).
2. Onboarding polish: resumable progress (⛔ blocked — backend proposal:
   `businesses.onboarding_step` column; present when scheduled).
3. Duplicate-submission guards already in place (isSubmitting) — verify
   in tests.

## Phase E — Customer portal

1. Support ticket list pagination (backend param + UI) (P2).
2. Settings: polish logo crop hints, per-session labels.
3. Session "last active" (⛔ backend proposal:
   `refresh_tokens.last_used_at` column updated on refresh).
4. Orders detail close affordance (P3 UX).

## Phase F — Subscription & billing

1. Already complete: grid, proration, cancel/reactivate/renew, invoices,
   pay-now, print view.
2. CSV/Excel export of invoices (P2, frontend-only from loaded data).
3. Payment-method display once providers are configured server-side
   (⛔ backend config, not code).

## Phase G — Admin portal

1. Audit-log viewer (P1 — **backend proposal**: `GET /api/saas/audit-logs`
   with filters over `saas_admin_audit`; UI page with table).
2. Customers (person-centric) view (P2 — data exists via businesses
   join; new endpoint + page).
3. Admin payments CSV export (P2).
4. Plans feature/limit full editor (P2 — endpoints exist; UI form).

## Phase H — Notifications & support

1. Notification preferences (⛔ blocked — backend proposal:
   preferences storage; defer until requested).
2. Support categories/priority (⛔ blocked — backend proposal: columns +
   validation; defer).
3. Unread-count polling on the portal bell (P2, frontend-only).

## Phase I — Production readiness

1. Lighthouse + axe accessibility pass, fix findings (P2).
2. Performance review: bundle analysis, server/client component split
   (P2).
3. Security review: CSP headers in next.config, referrer policies,
   dependency audit (P1).
4. SSLCommerz sandbox smoke test checklist (operator, gated on keys).

## Phase J — Final gap verification

Update EZPOS_WEBSITE_GAP_TRACKER.md with per-feature evidence; blocked
features remain marked ⛔ with their backend proposals attached.

## Backend change proposals requiring approval (none urgent)

| # | Change | Why | Size |
|---|---|---|---|
| 1 | `GET /api/saas/audit-logs` (read `saas_admin_audit`) | admin audit-log viewer | small, additive |
| 2 | `businesses.terms_accepted_at` column + register field | honest terms acceptance | small, additive |
| 3 | `businesses.onboarding_step` column | resumable onboarding | small, additive |
| 4 | `refresh_tokens.last_used_at` column (updated on refresh) | session "last active" | small, additive |
| 5 | support ticket `category`/`priority` columns | richer support UI | small, additive |

All are additive columns/read-endpoints: no existing POS behavior
touched, no destructive operations, backward-compatible. Approval will
be requested per-item when its phase is scheduled.

## Verification cadence (every phase)

`npx tsc --noEmit` → `npm run lint` → `npm test` (once configured) →
`npm run build` → affected-workflow manual test → gap-tracker update →
commit.
