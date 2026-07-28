"""
Prédiction de marché en temps réel, agrégée par zone (RGPD-safe).

/predict/zone : combine les stats DVF de la zone (prix, tendance) avec les
indicateurs publics agrégés de la commune (décès, logements vacants, divorces,
natalité, revenu) + le taux de crédit national + la saison, via le moteur
`ml.market_score`. Renvoie un score 0–100 et le détail transparent des facteurs.
"""
from datetime import datetime
from fastapi import APIRouter, Query, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from core.database import get_db
from ml.market_score import compute_market_score

router = APIRouter()


@router.get("/zone")
async def predict_zone(
    lat: float = Query(..., description="Latitude du centre de zone"),
    lng: float = Query(..., description="Longitude du centre de zone"),
    radius_m: int = Query(1000, ge=100, le=5000),
    db: AsyncSession = Depends(get_db),
):
    # 1) Stats DVF + tendance 12 mois + code postal dominant dans le rayon
    dvf_sql = text("""
        WITH zone AS (
            SELECT "pricePerSqm", "postalCode", "saleDate"
            FROM "PricePoint"
            WHERE ST_DWithin(
                ST_MakePoint(longitude, latitude)::geography,
                ST_MakePoint(:lng, :lat)::geography,
                :radius
            )
            AND "pricePerSqm" BETWEEN 500 AND 50000
        ),
        stats AS (
            SELECT
                COUNT(*)                                                       AS cnt,
                ROUND(AVG("pricePerSqm")::numeric, 0)                          AS avg_sqm,
                ROUND(PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY "pricePerSqm")::numeric, 0) AS median_sqm
            FROM zone
        ),
        trend AS (
            SELECT
                AVG(CASE WHEN "saleDate" > NOW() - INTERVAL '12 months' THEN "pricePerSqm" END) AS recent,
                AVG(CASE WHEN "saleDate" BETWEEN NOW() - INTERVAL '24 months'
                    AND NOW() - INTERVAL '12 months' THEN "pricePerSqm" END)                    AS older
            FROM zone
        ),
        dominant AS (
            SELECT "postalCode" AS pc
            FROM zone
            WHERE "postalCode" IS NOT NULL
            GROUP BY "postalCode"
            ORDER BY COUNT(*) DESC
            LIMIT 1
        )
        SELECT
            stats.cnt, stats.avg_sqm, stats.median_sqm,
            CASE WHEN trend.older > 0
                 THEN ROUND((((trend.recent / trend.older) - 1) * 100)::numeric, 1)
                 ELSE NULL END AS trend_12m,
            (SELECT pc FROM dominant) AS postal_code
        FROM stats, trend
    """)
    row = (await db.execute(dvf_sql, {"lat": lat, "lng": lng, "radius": radius_m})).fetchone()

    postal_code = row.postal_code if row else None
    trend_12m = float(row.trend_12m) if row and row.trend_12m is not None else None

    # 2) Indicateurs agrégés de la commune (via code postal dominant)
    indicators = {}
    if postal_code:
        ind = (await db.execute(text("""
            SELECT "codeInsee", city, department, population,
                   "deathRate", "birthRate", "divorceRate",
                   "vacancyRate", "medianIncome", "referenceYear"
            FROM "ZoneIndicator"
            WHERE "postalCode" = :pc
            ORDER BY population DESC NULLS LAST
            LIMIT 1
        """), {"pc": postal_code})).fetchone()
        if ind:
            indicators = {
                "code_insee": ind.codeInsee,
                "city": ind.city,
                "department": ind.department,
                "population": ind.population,
                "death_rate": float(ind.deathRate) if ind.deathRate is not None else None,
                "birth_rate": float(ind.birthRate) if ind.birthRate is not None else None,
                "divorce_rate": float(ind.divorceRate) if ind.divorceRate is not None else None,
                "vacancy_rate": float(ind.vacancyRate) if ind.vacancyRate is not None else None,
                "median_income": float(ind.medianIncome) if ind.medianIncome is not None else None,
                "reference_year": ind.referenceYear,
            }

    # 3) Taux de crédit national le plus récent
    credit_row = (await db.execute(text("""
        SELECT value FROM "MarketIndicator"
        WHERE key = 'credit_rate_20y'
        ORDER BY date DESC LIMIT 1
    """))).fetchone()
    credit_rate = float(credit_row.value) if credit_row else None

    # 4) Calcul du score
    month = datetime.now().month
    features = {
        "trend_12m": trend_12m,
        "vacancy_rate": indicators.get("vacancy_rate"),
        "death_rate": indicators.get("death_rate"),
        "divorce_rate": indicators.get("divorce_rate"),
        "birth_rate": indicators.get("birth_rate"),
        "median_income": indicators.get("median_income"),
        "credit_rate": credit_rate,
        "month": month,
    }
    scored = compute_market_score(features)

    return {
        "zone": {
            "lat": lat, "lng": lng, "radius_m": radius_m,
            "postal_code": postal_code,
            "city": indicators.get("city"),
            "department": indicators.get("department"),
        },
        "market": {
            "transactions": row.cnt if row else 0,
            "avg_price_sqm": float(row.avg_sqm) if row and row.avg_sqm is not None else None,
            "median_price_sqm": float(row.median_sqm) if row and row.median_sqm is not None else None,
            "trend_12m": trend_12m,
        },
        "indicators": indicators or None,
        "credit_rate": credit_rate,
        "season_month": month,
        "score": scored["score"],
        "level": scored["level"],
        "factors": scored["factors"],
        "missing_indicators": scored["missing"],
    }
