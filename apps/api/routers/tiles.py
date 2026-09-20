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
        grid AS (
            SELECT
                ROUND(longitude::numeric, 3)::double precision  AS grid_lng,
                ROUND(latitude::numeric, 3)::double precision   AS grid_lat,
                ROUND(AVG("pricePerSqm")::numeric, 0)::integer  AS avg_price,
                COUNT(*)                                        AS cnt,
                "propertyType"                                  AS property_type
            FROM "PricePoint"
            WHERE ST_Intersects(
                ST_Transform(
                    ST_SetSRID(ST_MakePoint(longitude, latitude), 4326),
                    3857
                ),
                (SELECT geom FROM bounds)
            )
            AND "saleDate" > NOW() - INTERVAL '24 months'
            AND "pricePerSqm" BETWEEN 500 AND 50000
            GROUP BY grid_lng, grid_lat, "propertyType"
        ),
        mvt_data AS (
            SELECT
                ST_AsMVTGeom(
                    ST_Transform(
                        ST_SetSRID(ST_MakePoint(grid.grid_lng, grid.grid_lat), 4326),
                        3857
                    ),
                    bounds.geom,
                    4096,
                    256,
                    true
                )               AS geom,
                grid.avg_price  AS avg_price,
                grid.cnt        AS cnt,
                grid.property_type AS property_type
            FROM grid, bounds
        )
        SELECT ST_AsMVT(mvt_data, 'prices', 4096, 'geom') AS tile
        FROM mvt_data
        WHERE geom IS NOT NULL
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
