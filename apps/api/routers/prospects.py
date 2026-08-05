
from fastapi import APIRouter, Depends, Query
from pydantic import BaseModel
from sqlalchemy import text
from sqlalchemy.ext.asyncio import AsyncSession

from core.database import get_db
from ml.model import predict_sale_probability

router = APIRouter()


class ProspectResult(BaseModel):
    address: str
    city: str
    postal_code: str
    lat: float
    lng: float
    sale_score: float
    score_label: str
    reasons: list[str]
    years_owned: int | None = None
    last_mutation: str | None = None


@router.get("/scan", response_model=list[ProspectResult])
async def scan_prospects(
    lat: float = Query(..., description="Latitude centre de zone"),
    lng: float = Query(..., description="Longitude centre de zone"),
    radius_m: int = Query(500, ge=100, le=2000),
    min_score: float = Query(0.5, ge=0.0, le=1.0),
    limit: int = Query(50, ge=1, le=200),
    db: AsyncSession = Depends(get_db),
):
    """
    Scan d'une zone pour détecter les biens susceptibles d'être mis en vente.
    Colonnes alignées sur le schéma Prisma (camelCase quoté en PostgreSQL).
    """
    # Biens DVF dans la zone — on cherche ceux qui n'ont pas bougé depuis >2 ans
    query = text("""
        SELECT
            COALESCE("streetName", '') || ', ' || COALESCE(city, '')  AS address,
            COALESCE(city, '')                                          AS city,
            COALESCE("postalCode", '')                                  AS postal_code,
            latitude                                                    AS lat,
            longitude                                                   AS lng,
            "saleDate"                                                  AS last_mutation,
            EXTRACT(YEAR FROM AGE(NOW(), "saleDate"))                  AS years_owned,
            zone_stats.avg_price_sqm,
            zone_stats.trend_6m
        FROM "PricePoint" p
        LEFT JOIN LATERAL (
            SELECT
                AVG("pricePerSqm") AS avg_price_sqm,
                (
                    AVG(CASE WHEN "saleDate" > NOW() - INTERVAL '6 months'
                        THEN "pricePerSqm" END)
                    / NULLIF(
                        AVG(CASE WHEN "saleDate" BETWEEN NOW() - INTERVAL '12 months'
                            AND NOW() - INTERVAL '6 months' THEN "pricePerSqm" END),
                        0
                    ) - 1
                ) * 100 AS trend_6m
            FROM "PricePoint" p2
            WHERE ST_DWithin(
                ST_MakePoint(p2.longitude, p2.latitude)::geography,
                ST_MakePoint(p.longitude, p.latitude)::geography,
                300
            )
        ) zone_stats ON true
        WHERE ST_DWithin(
            ST_MakePoint(p.longitude, p.latitude)::geography,
            ST_MakePoint(:lng, :lat)::geography,
            :radius
        )
        AND p."saleDate" < NOW() - INTERVAL '2 years'
        AND p."pricePerSqm" BETWEEN 500 AND 50000
        ORDER BY p."saleDate" ASC
        LIMIT 500
    """)

    result = await db.execute(
        query, {"lat": lat, "lng": lng, "radius": radius_m}
    )
    rows = result.fetchall()

    prospects = []
    for row in rows:
        features = {
            "years_owned": float(row.years_owned or 0),
            "avg_price_sqm": float(row.avg_price_sqm or 0),
            "trend_6m": float(row.trend_6m or 0),
            "lat": row.lat,
            "lng": row.lng,
        }
        score = predict_sale_probability(features)

        if score < min_score:
            continue

        reasons = _build_reasons(features, score)
        label = (
            "Très probable" if score > 0.8
            else "Probable" if score > 0.65
            else "Possible"
        )

        prospects.append(
            ProspectResult(
                address=row.address,
                city=row.city,
                postal_code=row.postal_code,
                lat=row.lat,
                lng=row.lng,
                sale_score=round(score, 2),
                score_label=label,
                reasons=reasons,
                years_owned=int(row.years_owned) if row.years_owned else None,
                last_mutation=str(row.last_mutation)[:10] if row.last_mutation else None,
            )
        )

    prospects.sort(key=lambda p: p.sale_score, reverse=True)
    return prospects[:limit]


def _build_reasons(features: dict, score: float) -> list[str]:
    reasons = []
    years = features.get("years_owned", 0)
    trend = features.get("trend_6m", 0)

    if years > 15:
        reasons.append(f"Détenu depuis plus de {int(years)} ans — profil succession/retraite")
    elif years > 10:
        reasons.append(f"Détenu depuis {int(years)} ans — maturité patrimoniale")
    if trend > 5:
        reasons.append(f"Hausse des prix de +{trend:.1f}% sur 6 mois — bon moment pour vendre")
    elif trend > 2:
        reasons.append("Marché en progression dans ce secteur")
    if not reasons:
        reasons.append("Signaux de marché favorables à une mise en vente")
    return reasons
