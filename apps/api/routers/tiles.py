from fastapi import APIRouter, Path, Response, Depends
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import text
from core.database import get_db

router = APIRouter()


@router.get("/{z}/{x}/{y}.mvt")
async def get_price_tile(
    z: int = Path(..., ge=0, le=18),
    x: int = Path(..., ge=0),
    y: int = Path(..., ge=0),
    db: AsyncSession = Depends(get_db),
):
    """
    Tuiles vectorielles MVT des prix immobiliers.
    Colonnes alignées sur schéma Prisma : pricePerSqm, propertyType, saleDate.
    Compatible MapLibre GL JS / Deck.gl.
    """
    query = text("""
        WITH bounds AS (
            SELECT ST_TileEnvelope(:z, :x, :y) AS geom
        ),
        mvt_data AS (
            SELECT
                ST_AsMVTGeom(
                    ST_Transform(
                        ST_SnapToGrid(
                            ST_SetSRID(ST_MakePoint(longitude, latitude), 4326),
                            0.001::double precision
                        ),
                        3857
                    ),
                    bounds.geom,
                    4096,
                    256,
                    true
                )                                                       AS geom,
                ROUND(AVG("pricePerSqm")::numeric, 0)::integer         AS avg_price,
                COUNT(*)                                                AS cnt,
                "propertyType"                                          AS property_type
            FROM "PricePoint", bounds
            WHERE ST_Intersects(
                ST_Transform(
                    ST_SetSRID(ST_MakePoint(longitude, latitude), 4326),
                    3857
                ),
                bounds.geom
            )
            AND "saleDate" > NOW() - INTERVAL '24 months'
            AND "pricePerSqm" BETWEEN 500 AND 50000
            GROUP BY
                ST_SnapToGrid(
                    ST_SetSRID(ST_MakePoint(longitude, latitude), 4326),
                    0.001::double precision
                ),
                "propertyType",
                bounds.geom
        )
        SELECT ST_AsMVT(mvt_data, 'prices', 4096, 'geom') AS tile
        FROM mvt_data
    """)

    result = await db.execute(query, {"z": z, "x": x, "y": y})
    row = result.fetchone()

    if not row or not row.tile:
        return Response(
            content=b"",
            media_type="application/x-protobuf",
            status_code=204,
        )

    return Response(
        content=bytes(row.tile),
        media_type="application/x-protobuf",
        headers={
            "Cache-Control": "public, max-age=3600",
            "Access-Control-Allow-Origin": "*",
        },
    )
