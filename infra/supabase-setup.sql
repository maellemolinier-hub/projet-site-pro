-- ============================================================
-- ImmoExpert — Supabase / PostgreSQL + PostGIS setup
-- Run this ONCE on a fresh Supabase project via SQL editor
-- ============================================================

-- 1. Enable PostGIS
CREATE EXTENSION IF NOT EXISTS postgis;
CREATE EXTENSION IF NOT EXISTS postgis_topology;
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Verify
SELECT postgis_version();

-- ============================================================
-- Spatial indexes (run AFTER prisma migrate deploy)
-- ============================================================

-- price_points spatial index
CREATE INDEX IF NOT EXISTS idx_price_points_location
  ON "PricePoint" USING GIST (
    ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
  );

-- prospects spatial index
CREATE INDEX IF NOT EXISTS idx_prospects_location
  ON "Prospect" USING GIST (
    ST_SetSRID(ST_MakePoint(longitude, latitude), 4326)
  );

-- Composite indexes for time-series queries
CREATE INDEX IF NOT EXISTS idx_price_points_date_lat_lng
  ON "PricePoint" (sale_date DESC, latitude, longitude);

CREATE INDEX IF NOT EXISTS idx_price_points_property_type
  ON "PricePoint" (property_type, sale_date DESC);

-- ============================================================
-- MVT tile function (used by FastAPI tiles router)
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
      ROUND(price_per_sqm::numeric, 0) AS price_per_sqm,
      property_type,
      surface_area,
      sale_date,
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
      AND sale_date >= NOW() - INTERVAL '5 years'
      AND price_per_sqm BETWEEN 500 AND 50000
  ) AS tile
  WHERE geom IS NOT NULL;

  RETURN result;
END;
$$;

-- ============================================================
-- Row Level Security (RLS) policies for Supabase
-- ============================================================

-- Users can only read their own data
ALTER TABLE "User" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Subscription" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Prospect" ENABLE ROW LEVEL SECURITY;
ALTER TABLE "Report" ENABLE ROW LEVEL SECURITY;

-- Public read for price points (no PII)
ALTER TABLE "PricePoint" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "price_points_public_read"
  ON "PricePoint" FOR SELECT
  USING (true);

-- Experts readable by all (public directory)
ALTER TABLE "ExpertProfile" ENABLE ROW LEVEL SECURITY;
CREATE POLICY "expert_profiles_public_read"
  ON "ExpertProfile" FOR SELECT
  USING (true);

-- ============================================================
-- Useful views
-- ============================================================

CREATE OR REPLACE VIEW v_zone_stats AS
SELECT
  ROUND(latitude::numeric, 3) AS lat_bucket,
  ROUND(longitude::numeric, 3) AS lng_bucket,
  COUNT(*) AS transaction_count,
  ROUND(AVG(price_per_sqm)::numeric, 0) AS avg_price_per_sqm,
  ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY price_per_sqm)::numeric, 0) AS median_price_per_sqm,
  MAX(sale_date) AS latest_transaction
FROM "PricePoint"
WHERE
  sale_date >= NOW() - INTERVAL '3 years'
  AND price_per_sqm BETWEEN 500 AND 50000
GROUP BY lat_bucket, lng_bucket;
