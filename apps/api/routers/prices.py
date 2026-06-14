from fastapi import APIRouter, Query, Depends
from pydantic import BaseModel
from typing import Optional
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from core.database import get_db

router = APIRouter()


class PricePoint(BaseModel):
    lat: float
    lng: float
    price_sqm: float
    type: str
    sold_at: Optional[str] = None
    source: str


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
        SELECT
            AVG(price_sqm) as avg_price,
            PERCENTILE_CONT(0.5) WITHIN GROUP (ORDER BY price_sqm) as median_price,
            MIN(price_sqm) as min_price,
            MAX(price_sqm) as max_price,
            COUNT(*) as count
        FROM price_points
        WHERE ST_DWithin(
            ST_MakePoint(longitude, latitude)::geography,
            ST_MakePoint(:lng, :lat)::geography,
            :radius
        )
        AND sold_at > NOW() - INTERVAL '24 months'
        AND (:type IS NULL OR type = :type)
    """)

    result = await db.execute(
        query,
        {"lat": lat, "lng": lng, "radius": radius_m, "type": property_type},
    )
    row = result.fetchone()

    return ZoneStats(
        zone=f"{lat:.4f},{lng:.4f}",
        avg_price_sqm=round(row.avg_price or 0, 0),
        median_price_sqm=round(row.median_price or 0, 0),
        min_price_sqm=round(row.min_price or 0, 0),
        max_price_sqm=round(row.max_price or 0, 0),
        count=row.count or 0,
    )


@router.get("/street", response_model=list[PricePoint])
async def get_street_prices(
    lat: float = Query(...),
    lng: float = Query(...),
    radius_m: int = Query(200, ge=50, le=1000),
    limit: int = Query(100, ge=1, le=500),
    db: AsyncSession = Depends(get_db),
):
    """Prix des transactions dans un rayon autour d'un point."""
    query = text("""
        SELECT latitude, longitude, price_sqm, type, sold_at, source
        FROM price_points
        WHERE ST_DWithin(
            ST_MakePoint(longitude, latitude)::geography,
            ST_MakePoint(:lng, :lat)::geography,
            :radius
        )
        ORDER BY sold_at DESC
        LIMIT :limit
    """)

    result = await db.execute(
        query,
        {"lat": lat, "lng": lng, "radius": radius_m, "limit": limit},
    )
    rows = result.fetchall()

    return [
        PricePoint(
            lat=r.latitude,
            lng=r.longitude,
            price_sqm=r.price_sqm,
            type=r.type,
            sold_at=str(r.sold_at) if r.sold_at else None,
            source=r.source,
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
            DATE_TRUNC('month', sold_at) as month,
            AVG(price_sqm) as avg_price,
            COUNT(*) as transactions
        FROM price_points
        WHERE postal_code = :postal_code
        AND sold_at > NOW() - (:months || ' months')::INTERVAL
        GROUP BY DATE_TRUNC('month', sold_at)
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
