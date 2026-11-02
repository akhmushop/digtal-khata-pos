# ezPos Website — Gap Tracker

> Living document. Updated at the end of every phase.
> Statuses: ✅ Complete · 🟡 Partial · 🔴 Missing · ⛔ Blocked (external dependency)
> API dep: backend endpoint status. UI: frontend implementation status.

## Foundation

| Feature | Prev | Current | UI | API dep | Security | Tests | Notes |
|---|---|---|---|---|---|---|---|
| Auth (sign-in/up/out, refresh, reset, verify) | ✅ | ✅ | ✅ | ✅ | ✅ memory token + HttpOnly cookie | ⛔ no website tests yet | |
| Protected portal routes | ✅ | ✅ | ✅ | ✅ backend authoritative | ✅ | ⛔ | |
| Protected admin routes | ✅ | ✅ | ✅ | ✅ requirePlatformAdmin | ✅ | ✅ backend-tested | |
| Business switcher | 🔴 | ✅ | ✅ | ✅ | ✅ | ⛔ | reload-on-switch pattern |
| Pagination (orders/billing) | 🔴 | ✅ | ✅ | ✅ | ✅ | ⛔ | support list pending |
| robots/sitemap/404 | 🔴 | ✅ | ✅ | n/a | n/a | n/a | |

## Customer portal

| Feature | Prev | Current | UI | API dep | Security | Tests | Remaining issues |
|---|---|---|---|---|---|---|---|
| Overview (plan/usage/recent) | ✅ | ✅ | ✅ | ✅ | ✅ | ⛔ | respects active business |
| Orders (unified, filters, detail) | ✅ | ✅ | ✅ | ✅ | ✅ isolation tested | ⛔ | pagination ✅ |
| Subscription mgmt (upgrade/downgrade/cancel/renew) | ✅ | ✅ | ✅ | ✅ | ✅ audit-logged | ✅ backend | |
| Billing history + invoices + pay-now | ✅ | ✅ | ✅ | ✅ | ✅ server-verified payments | ✅ backend | pagination ✅ |
| Settings (business/profile/password) | ✅ | ✅ | ✅ | ✅ | ✅ | ⛔ | |
| Logo upload | 🔴 | ✅ | ✅ | ✅ | ✅ data-URL, no upload surface | ⛔ | |
| Data export (JSON) | 🔴 | ✅ | ✅ | ✅ | ✅ read-mode OK | ⛔ | CSV/Excel variant 🔴 P2 |
| Notifications (bell) | 🔴 | ✅ | ✅ | ✅ | ✅ business-scoped | ⛔ | preferences ⛔ blocked on backend |
| Active sessions | 🔴 | ✅ | ✅ | ✅ | ✅ ownership-scoped revoke | ⛔ | last-used column ⛔ blocked |
| Support tickets + threads | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ backend | categories/priority ⛔ blocked; pagination pending |
| Integrations (WooCommerce) | ✅ | ✅ | ✅ | ✅ | ✅ encrypted creds | ✅ backend | |
| Storefront API keys | ✅ | ✅ | ✅ | ✅ | ✅ one-time secret | ✅ backend | env selection P3 |
| Webhooks management | ✅ | ✅ | ✅ | ✅ | ✅ signed | ✅ backend | |

## SaaS admin

| Feature | Prev | Current | UI | API dep | Security | Tests | Notes |
|---|---|---|---|---|---|---|---|
| Overview metrics (MRR/ARR/statuses) | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ backend | definitions documented |
| Businesses list + suspend/reactivate | ✅ | ✅ | ✅ | ✅ | ✅ audited | ✅ backend | |
| Business detail drill-down | 🔴 | ✅ | ✅ | ✅ | ✅ admin-gated | ⛔ | new |
| Subscriptions (change/extend/suspend/cancel) | ✅ | ✅ | ✅ | ✅ | ✅ audited | ✅ backend | grant-trial ✅ |
| Payments (+filters) | 🟡 | ✅ | ✅ | ✅ | ✅ | ⛔ | export CSV 🔴 P2 |
| Invoices | ✅ | ✅ | ✅ | ✅ | ✅ | ⛔ | |
| Plans CRUD | ✅ | ✅ | ✅ | ✅ | ✅ | ✅ backend | feature/limit editor P2 |
| Support (all tickets, reply, status) | ✅ | ✅ | ✅ | ✅ | ✅ notifies owner | ✅ backend | |
| Audit-log viewer | 🔴 | 🔴 | 🔴 | ⛔ endpoint missing | ✅ rows written | ⛔ | P1: needs approved backend change |
| Customers view (person-centric) | 🔴 | 🟡 | 🟡 | ✅ (via businesses) | ✅ | ⛔ | P2 |

## Marketing site

| Feature | Prev | Current | UI | API dep | Security | Tests | Notes |
|---|---|---|---|---|---|---|---|
| Home/features/industries/about/contact/faq | ✅ | ✅ | ✅ | ✅ tickets + plans | ✅ | ⛔ | |
| Pricing (live plans, yearly toggle) | ✅ | ✅ | ✅ | ✅ | ✅ | ⛔ | yearly seeded |
| Legal: terms/privacy/refund | ✅ | ✅ | ✅ | n/a | ✅ | n/a | wording aligned to UI |
| Cookie policy | 🔴 | 🔴 | 🔴 | n/a | n/a | n/a | P1 |
| Subscription & billing policy page | 🔴 | 🔴 | 🔴 | n/a | n/a | n/a | P1 |
| Developers docs | ✅ | ✅ | ✅ | n/a | ✅ | n/a | |
| robots/sitemap/404 | 🔴 | ✅ | ✅ | n/a | ✅ | n/a | |
| JSON-LD structured data | 🔴 | 🔴 | 🔴 | n/a | n/a | n/a | P2 |
| Canonical URLs | 🔴 | 🔴 | 🔴 | n/a | n/a | n/a | P2 |
| Blog/resources | 🔴 | 🔴 | 🔴 | n/a | n/a | n/a | P3, "if appropriate" |

## Cross-cutting

| Item | Prev | Current | Status | Notes |
|---|---|---|---|---|
| ESLint clean | 🔴 | 🔴 | 16 errors (React-Compiler setState-in-effect) | P0 fix alongside TanStack Query adoption |
| Test framework | 🔴 | 🔴 | none configured | P0: Vitest + RTL; E2E later |
| TanStack Query adoption | 🔴 | 🔴 | fetch + useState pattern | P2: resolves lint class, dedupes requests |
| Axios | 🔴 | n/a | deliberate: typed fetch clients | deviation documented |
| Lighthouse/a11y pass | 🔴 | 🔴 | not yet run | P2 |
| npm audit (deps) | 🔴 | 🔴 | not yet run | P1 |
| Loading/empty/error states | 🟡 | ✅ | present across portal | |
| Responsive layouts | 🟡 | ✅ | nav mobile menu, grids collapse | |
