from fastapi import APIRouter, Query, Depends
from pydantic import BaseModel
from typing import Optional
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
    years_owned: Optional[int] = None
    last_mutation: Optional[str] = None


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
    Utilise le modèle ML XGBoost entraîné sur l'historique DVF.
    """
    from sqlalchemy import text

    # Récupération des biens dans la zone avec données DVF
    query = text("""
        SELECT
            p.address,
            p.city,
            p.postal_code,
            p.latitude as lat,
            p.longitude as lng,
            p.sold_at as last_mutation,
            EXTRACT(YEAR FROM AGE(NOW(), p.sold_at)) as years_owned,
            z.avg_price_sqm,
            z.trend_6m
        FROM price_points p
        LEFT JOIN LATERAL (
            SELECT
                AVG(price_sqm) as avg_price_sqm,
                (AVG(CASE WHEN sold_at > NOW() - INTERVAL '6 months' THEN price_sqm END) /
                 NULLIF(AVG(CASE WHEN sold_at BETWEEN NOW() - INTERVAL '12 months'
                     AND NOW() - INTERVAL '6 months' THEN price_sqm END), 0) - 1) * 100 as trend_6m
            FROM price_points p2
            WHERE ST_DWithin(
                ST_MakePoint(p2.longitude, p2.latitude)::geography,
                ST_MakePoint(p.longitude, p.latitude)::geography,
                300
            )
        ) z ON true
        WHERE ST_DWithin(
            ST_MakePoint(p.longitude, p.latitude)::geography,
            ST_MakePoint(:lng, :lat)::geography,
            :radius
        )
        AND p.sold_at < NOW() - INTERVAL '2 years'
        LIMIT 500
    """)

    result = await db.execute(
        query, {"lat": lat, "lng": lng, "radius": radius_m}
    )
    rows = result.fetchall()

    prospects = []
    for row in rows:
        features = {
            "years_owned": row.years_owned or 0,
            "avg_price_sqm": row.avg_price_sqm or 0,
            "trend_6m": row.trend_6m or 0,
            "lat": row.lat,
            "lng": row.lng,
        }
        score = predict_sale_probability(features)

        if score < min_score:
            continue

        reasons = _build_reasons(features, score)
        label = "Très probable" if score > 0.8 else "Probable" if score > 0.65 else "Possible"

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
    if features.get("years_owned", 0) > 10:
        reasons.append(f"Détenu depuis plus de {int(features['years_owned'])} ans")
    if features.get("trend_6m", 0) > 5:
        reasons.append("Hausse de prix récente (+5% sur 6 mois) — bon moment pour vendre")
    if features.get("years_owned", 0) > 15:
        reasons.append("Profil retraite/succession probable")
    if not reasons:
        reasons.append("Signaux de marché favorables à une mise en vente")
    return reasons
