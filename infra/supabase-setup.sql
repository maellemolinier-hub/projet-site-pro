-- ============================================================
-- ImmoExpert — Supabase / PostgreSQL + PostGIS setup
-- Exécuter UNE FOIS sur un projet Supabase vierge (éditeur SQL)
-- ============================================================

-- 1. Extensions
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

SELECT postgis_version();

-- ============================================================
-- Indexes spatiaux (après prisma migrate deploy)
-- Noms de colonnes alignés avec le schéma Prisma camelCase
-- ============================================================

-- PricePoint : index GIST pour les requêtes de rayon
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pp_geom
  ON "PricePoint" USING GIST (
    ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
  );

-- PricePoint : requêtes temporelles
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pp_sale_date
  ON "PricePoint" ("saleDate" DESC);

-- PricePoint : filtre type + date
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pp_type_date
  ON "PricePoint" ("propertyType", "saleDate" DESC);

-- PricePoint : filtre fourchette de prix
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_pp_price_sqm
  ON "PricePoint" ("pricePerSqm")
  WHERE "pricePerSqm" BETWEEN 500 AND 50000;

-- Prospect : index GIST
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_prospect_geom
  ON "Prospect" USING GIST (
    ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
  );

-- Subscription : recherche par customer Stripe
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_subscription_stripe
  ON "Subscription" ("stripeCustomerId")
  WHERE "stripeCustomerId" IS NOT NULL;

-- ExpertProfile : recherche par token widget
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_expert_widget_token
  ON "ExpertProfile" ("widgetToken");

-- ExpertProfile : recherche par ville
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_expert_city
  ON "ExpertProfile" (city);

-- CourseProgress
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_course_progress
  ON "CourseProgress" ("certificationId", "courseId");

-- LessonProgress
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_lesson_progress
  ON "LessonProgress" ("courseProgressId", "lessonId");

-- ============================================================
-- Fonction MVT pour les tuiles vectorielles
-- ============================================================
CREATE OR REPLACE FUNCTION get_price_tile(z INT, x INT, y INT)
RETURNS bytea
LANGUAGE plpgsql STABLE PARALLEL SAFE
AS $$
DECLARE
  result bytea;
BEGIN
  SELECT ST_AsMVT(tile, 'prices', 4096, 'geom')
  INTO result
  FROM (
    SELECT
      id,
      ROUND("pricePerSqm"::numeric, 0)  AS price_per_sqm,
      "propertyType"                     AS property_type,
      "surfaceArea"                      AS surface_area,
      "saleDate"                         AS sale_date,
      ST_AsMVTGeom(
        ST_SetSRID(ST_MakePoint(longitude, latitude), 4326),
        ST_TileEnvelope(z, x, y),
        4096, 256, true
      ) AS geom
    FROM "PricePoint"
    WHERE
      ST_Intersects(
        ST_SetSRID(ST_MakePoint(longitude, latitude), 4326),
        ST_TileEnvelope(z, x, y)
      )
      AND "saleDate" >= NOW() - INTERVAL '5 years'
      AND "pricePerSqm" BETWEEN 500 AND 50000
  ) AS tile
  WHERE geom IS NOT NULL;

  RETURN result;
END;
$$;

-- ============================================================
-- Row Level Security (RLS) Supabase
-- ============================================================

ALTER TABLE "PricePoint"    ENABLE ROW LEVEL SECURITY;
ALTER TABLE "ExpertProfile" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "User"          ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Subscription"  ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Prospect"      ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Report"        ENABLE ROW LEVEL SECURITY;

-- PricePoint : lecture publique (pas de données personnelles)
DROP POLICY IF EXISTS "price_points_public_read" ON "PricePoint";
CREATE POLICY "price_points_public_read"
  ON "PricePoint" FOR SELECT USING (true);

-- ExpertProfile : lecture publique (annuaire)
DROP POLICY IF EXISTS "expert_profiles_public_read" ON "ExpertProfile";
CREATE POLICY "expert_profiles_public_read"
  ON "ExpertProfile" FOR SELECT USING ("isPublished" = true);

-- ============================================================
-- Vue analytique zones
-- ============================================================
CREATE OR REPLACE VIEW v_zone_stats AS
SELECT
  ROUND(latitude::numeric, 3)  AS lat_bucket,
  ROUND(longitude::numeric, 3) AS lng_bucket,
  COUNT(*)                     AS transaction_count,
  ROUND(AVG("pricePerSqm")::numeric, 0)
    AS avg_price_per_sqm,
  ROUND(
    PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY "pricePerSqm")::numeric, 0
  ) AS median_price_per_sqm,
  MAX("saleDate") AS latest_transaction
FROM "PricePoint"
WHERE
  "saleDate"    >= NOW() - INTERVAL '3 years'
  AND "pricePerSqm" BETWEEN 500 AND 50000
GROUP BY lat_bucket, lng_bucket;
