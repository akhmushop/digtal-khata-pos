-- ============================================================================
-- TRIAL-PLAN SEED + EXISTING-BUSINESS TRIAL ACTIVATION
-- ============================================================================
-- Run ONLY on the approved target database (target-asserted by the runner).
-- Effects:
--   1. Inserts the single "Free trial" plan row (idempotent via slug).
--   2. Activates a 14-day trialing subscription for every business that has
--      NO open subscription — so businesses created before this seed (e.g.
--      "Diag General Store") become fully usable, not just new ones.
--      The partial unique index subscriptions_one_open_per_business makes
--      this idempotent-safe; the NOT EXISTS guard prevents duplicates.
-- Verified beforehand (2026-10-30): subscription_plans = 0 rows,
-- subscriptions = 0 rows, businesses = the test/diagnostic businesses only.
-- ============================================================================

-- 1. The trial plan (matches what activateTrialInTx looks up by slug).
INSERT INTO subscription_plans (name, slug, interval, price, currency, is_active)
VALUES ('Free trial', 'free-trial', 'monthly', 0, 'BDT', true)
ON CONFLICT (slug) DO NOTHING;

-- 2. Backfill: 14-day trial for every business without an open subscription.
INSERT INTO subscriptions
  (business_id, plan_id, status, starts_at, current_period_start, current_period_end)
SELECT
  b.id,
  p.id,
  'trialing',
  now(),
  now(),
  now() + INTERVAL '14 days'
FROM businesses b
CROSS JOIN (
  SELECT id FROM subscription_plans
  WHERE slug = 'free-trial' AND is_active = true
) p
WHERE NOT EXISTS (
  SELECT 1 FROM subscriptions s
  WHERE s.business_id = b.id
    AND s.status IN ('trialing', 'active', 'past_due')
);

-- 3. Verification (run after):
--    SELECT COUNT(*) FROM subscription_plans;                       -- expect 1
--    SELECT b.name, s.status, s.current_period_end
--      FROM subscriptions s JOIN businesses b ON b.id = s.business_id;  -- one trialing row per business
--    Then: POST /api/products with the owner's token + X-Business-Id
--    must return 201 instead of 403 SUBSCRIPTION_REQUIRED.
