-- ============================================================
-- ImmoExpert — PostGIS & performance indexes
-- Run after: prisma migrate deploy
-- ============================================================

-- ── PricePoint ──────────────────────────────────────────────

-- Spatial index (GIST) for radius searches
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pp_geom
  ON "PricePoint" USING GIST (
    ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
  );

-- Time-range queries
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pp_sale_date
  ON "PricePoint" (sale_date DESC);

-- Filter by type + date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pp_type_date
  ON "PricePoint" (property_type, sale_date DESC);

-- Price range filter
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pp_price_sqm
  ON "PricePoint" (price_per_sqm)
  WHERE price_per_sqm BETWEEN 500 AND 50000;

-- Dedup on mutation_id
CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_pp_mutation_id
  ON "PricePoint" (mutation_id)
  WHERE mutation_id IS NOT NULL;

-- ── Prospect ────────────────────────────────────────────────

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_prospect_geom
  ON "Prospect" USING GIST (
    ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
  );

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_prospect_score
  ON "Prospect" (score DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_prospect_user_status
  ON "Prospect" (user_id, status);

-- ── User / Subscription ─────────────────────────────────────

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscription_stripe_customer
  ON "Subscription" (stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscription_status
  ON "Subscription" (status);

-- ── ExpertProfile ────────────────────────────────────────────

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_expert_city
  ON "ExpertProfile" (city);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_expert_token
  ON "ExpertProfile" (widget_token)
  WHERE widget_token IS NOT NULL;

-- ── Course / Progress ────────────────────────────────────────

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_course_progress_user
  ON "CourseProgress" (user_id, course_id);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_lesson_progress_user
  ON "LessonProgress" (user_id, lesson_id);

-- ── Analyze tables after indexing ───────────────────────────
ANALYZE "PricePoint";
ANALYZE "Prospect";
ANALYZE "ExpertProfile";
