from fastapi import APIRouter, Query, Depends
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from core.database import get_db

router = APIRouter()

# Noms de colonnes alignés sur le schéma Prisma (camelCase → PostgreSQL quoted)
# PricePoint : mutationId, saleDate, price, surfaceArea, pricePerSqm,
#              propertyType, latitude, longitude, postalCode, city, streetName, roomCount


class PricePointOut(BaseModel):
    lat: float
    lng: float
    price_sqm: float
    property_type: str
    sale_date: Optional[str] = None
    street_name: Optional[str] = None


class ZoneStats(BaseModel):
    zone: str
    avg_price_sqm: float
    median_price_sqm: float
    min_price_sqm: float
    max_price_sqm: float
    count: int
    trend_12m: Optional[float] = None


@router.get("/zone", response_model=ZoneStats)
async def get_zone_stats(
    lat: float = Query(..., description="Latitude centre"),
    lng: float = Query(..., description="Longitude centre"),
    radius_m: int = Query(500, ge=100, le=5000, description="Rayon en mètres"),
    property_type: Optional[str] = Query(None),
    db: AsyncSession = Depends(get_db),
):
    """Statistiques de prix pour une zone géographique."""
    query = text("""
        WITH zone AS (
            SELECT
                AVG("pricePerSqm")                                                     AS avg_price,
                PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY "pricePerSqm")            AS median_price,
                MIN("pricePerSqm")                                                     AS min_price,
                MAX("pricePerSqm")                                                     AS max_price,
                COUNT(*)                                                                AS cnt
            FROM "PricePoint"
            WHERE ST_DWithin(
                ST_MakePoint(longitude, latitude)::geography,
                ST_MakePoint(:lng, :lat)::geography,
                :radius
            )
            AND "saleDate" > NOW() - INTERVAL '24 months'
            AND "pricePerSqm" BETWEEN 500 AND 50000
            AND (CAST(:prop_type AS text) IS NULL OR "propertyType"::text = CAST(:prop_type AS text))
        ),
        trend AS (
            SELECT
                AVG(CASE WHEN "saleDate" > NOW() - INTERVAL '12 months' THEN "pricePerSqm" END) AS recent,
                AVG(CASE WHEN "saleDate" BETWEEN NOW() - INTERVAL '24 months'
                    AND NOW() - INTERVAL '12 months' THEN "pricePerSqm" END)                    AS older
            FROM "PricePoint"
            WHERE ST_DWithin(
                ST_MakePoint(longitude, latitude)::geography,
                ST_MakePoint(:lng, :lat)::geography,
                :radius
            )
        )
        SELECT
            zone.*,
            CASE WHEN trend.older > 0
                 THEN ROUND(((((trend.recent / trend.older) - 1) * 100))::numeric, 1)
                 ELSE NULL END AS trend_12m
        FROM zone, trend
    """)

    result = await db.execute(
        query,
        {"lat": lat, "lng": lng, "radius": radius_m, "prop_type": property_type},
    )
    row = result.fetchone()

    return ZoneStats(
        zone=f"{lat:.4f},{lng:.4f}",
        avg_price_sqm=round(row.avg_price or 0, 0),
        median_price_sqm=round(row.median_price or 0, 0),
        min_price_sqm=round(row.min_price or 0, 0),
        max_price_sqm=round(row.max_price or 0, 0),
        count=row.cnt or 0,
        trend_12m=float(row.trend_12m) if row.trend_12m else None,
    )


@router.get("/street", response_model=list[PricePointOut])
async def get_street_prices(
    lat: float = Query(...),
    lng: float = Query(...),
    radius_m: int = Query(200, ge=50, le=1000),
    limit: int = Query(100, ge=1, le=500),
    db: AsyncSession = Depends(get_db),
):
    """Prix des transactions dans un rayon autour d'un point."""
    query = text("""
        SELECT
            latitude,
            longitude,
            "pricePerSqm"   AS price_sqm,
            "propertyType"  AS property_type,
            "saleDate"      AS sale_date,
            "streetName"    AS street_name
        FROM "PricePoint"
        WHERE ST_DWithin(
            ST_MakePoint(longitude, latitude)::geography,
            ST_MakePoint(:lng, :lat)::geography,
            :radius
        )
        AND "pricePerSqm" BETWEEN 500 AND 50000
        ORDER BY "saleDate" DESC
        LIMIT :limit
    """)

    result = await db.execute(
        query,
        {"lat": lat, "lng": lng, "radius": radius_m, "limit": limit},
    )
    rows = result.fetchall()

    return [
        PricePointOut(
            lat=r.latitude,
            lng=r.longitude,
            price_sqm=round(r.price_sqm, 0),
            property_type=r.property_type,
            sale_date=str(r.sale_date)[:10] if r.sale_date else None,
            street_name=r.street_name,
        )
        for r in rows
    ]


@router.get("/trend")
async def get_price_trend(
    postal_code: str = Query(...),
    months: int = Query(24, ge=6, le=60),
    db: AsyncSession = Depends(get_db),
):
    """Évolution des prix sur N mois pour un code postal."""
    query = text("""
        SELECT
            DATE_TRUNC('month', "saleDate")    AS month,
            AVG("pricePerSqm")                 AS avg_price,
            COUNT(*)                           AS transactions
        FROM "PricePoint"
        WHERE "postalCode" = :postal_code
        AND "saleDate" > NOW() - make_interval(months => :months)
        AND "pricePerSqm" BETWEEN 500 AND 50000
        GROUP BY DATE_TRUNC('month', "saleDate")
        ORDER BY month ASC
    """)

    result = await db.execute(
        query, {"postal_code": postal_code, "months": months}
    )
    rows = result.fetchall()

    return [
        {
            "month": str(r.month)[:7],
            "avg_price": round(r.avg_price, 0),
            "transactions": r.transactions,
        }
        for r in rows
    ]
