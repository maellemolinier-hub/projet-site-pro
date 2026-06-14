-- ============================================================
-- ImmoExpert — Index PostGIS complémentaires
-- Exécuter après : prisma migrate deploy
-- Colonnes alignées sur le schéma Prisma (camelCase)
-- ============================================================

-- ── PricePoint ──────────────────────────────────────────────

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pp_geom
  ON "PricePoint" USING GIST (
    ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
  );

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pp_sale_date
  ON "PricePoint" ("saleDate" DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pp_type_date
  ON "PricePoint" ("propertyType", "saleDate" DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pp_price_sqm
  ON "PricePoint" ("pricePerSqm")
  WHERE "pricePerSqm" BETWEEN 500 AND 50000;

CREATE UNIQUE INDEX CONCURRENTLY IF NOT EXISTS idx_pp_mutation_id
  ON "PricePoint" ("mutationId")
  WHERE "mutationId" IS NOT NULL;

-- ── Prospect ────────────────────────────────────────────────

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_prospect_geom
  ON "Prospect" USING GIST (
    ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
  );

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_prospect_score
  ON "Prospect" ("saleScore" DESC);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_prospect_user_status
  ON "Prospect" ("userId", status);

-- ── Subscription ─────────────────────────────────────────────

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscription_stripe_customer
  ON "Subscription" ("stripeCustomerId")
  WHERE "stripeCustomerId" IS NOT NULL;

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscription_status
  ON "Subscription" (status);

-- ── ExpertProfile ────────────────────────────────────────────

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_expert_city
  ON "ExpertProfile" (city);

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_expert_widget_token
  ON "ExpertProfile" ("widgetToken")
  WHERE "widgetToken" IS NOT NULL;

-- ── Course / Progress ────────────────────────────────────────

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_course_progress_cert
  ON "CourseProgress" ("certificationId", "courseId");

CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_lesson_progress_cp
  ON "LessonProgress" ("courseProgressId", "lessonId");

-- ── Analyze ──────────────────────────────────────────────────
ANALYZE "PricePoint";
ANALYZE "Prospect";
ANALYZE "ExpertProfile";
