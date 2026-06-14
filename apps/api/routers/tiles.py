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
    Sert des tuiles vectorielles MVT (Mapbox Vector Tiles) des prix immobiliers.
    Compatible MapLibre GL JS / Deck.gl.
    """
    query = text("""
        WITH bounds AS (
            SELECT ST_TileEnvelope(:z, :x, :y) AS geom
        ),
        mvt_data AS (
            SELECT
                ST_AsMVTGeom(
                    ST_Transform(ST_SetSRID(ST_MakePoint(longitude, latitude), 4326), 3857),
                    bounds.geom,
                    4096,
                    256,
                    true
                ) AS geom,
                ROUND(AVG(price_sqm)::numeric, 0)::integer AS avg_price,
                COUNT(*) AS count,
                type
            FROM price_points, bounds
            WHERE ST_Intersects(
                ST_Transform(ST_SetSRID(ST_MakePoint(longitude, latitude), 4326), 3857),
                bounds.geom
            )
            AND sold_at > NOW() - INTERVAL '24 months'
            GROUP BY
                ST_SnapToGrid(longitude, 0.001),
                ST_SnapToGrid(latitude, 0.001),
                type,
                bounds.geom
        )
        SELECT ST_AsMVT(mvt_data, 'prices', 4096, 'geom') AS tile
        FROM mvt_data
    """)

    result = await db.execute(query, {"z": z, "x": x, "y": y})
    row = result.fetchone()

    if not row or not row.tile:
        return Response(content=b"", media_type="application/x-protobuf", status_code=204)

    return Response(
        content=bytes(row.tile),
        media_type="application/x-protobuf",
        headers={
            "Content-Encoding": "gzip",
            "Cache-Control": "public, max-age=3600",
            "Access-Control-Allow-Origin": "*",
        },
    )
