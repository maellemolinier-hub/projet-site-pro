"""
Daily DVF refresh task.
Downloads the latest DVF (Demandes de Valeurs Foncières) from data.gouv.fr
and upserts the last 3 months into PricePoint table.
"""
import os
import io
import logging
from datetime import datetime, timedelta

import httpx
import pandas as pd
from celery import shared_task
from sqlalchemy import create_engine, text

logger = logging.getLogger(__name__)

DATABASE_URL = os.environ.get("DATABASE_URL", "")
DVF_API_BASE = "https://api.cquest.org/dvf"

DEPARTMENT_URLS = {
    dept: f"https://files.data.gouv.fr/geo-dvf/latest/csv/{datetime.now().year - 1}/departements/{dept}.csv.gz"
    for dept in ["75", "69", "13", "33", "59", "67", "31", "06", "44", "34", "76", "54"]
}

COLUMN_MAP = {
    "id_mutation": "mutation_id",
    "date_mutation": "sale_date",
    "valeur_fonciere": "price",
    "surface_reelle_bati": "surface_area",
    "longitude": "longitude",
    "latitude": "latitude",
    "type_local": "local_type",
    "nombre_pieces_principales": "room_count",
    "code_postal": "postal_code",
    "nom_commune": "city",
    "adresse_nom_voie": "street_name",
    "adresse_numero": "street_number",
}

TYPE_MAP = {
    "Appartement": "APARTMENT",
    "Maison": "HOUSE",
    "Local industriel. commercial ou assimilé": "COMMERCIAL",
    "Dépendance": "OTHER",
}


@shared_task(bind=True, name="data.pipelines.tasks.daily_refresh.refresh_dvf", max_retries=3)
def refresh_dvf(self, departments: list[str] | None = None):
    """Download and upsert DVF data for the specified departments."""
    if not DATABASE_URL:
        logger.error("DATABASE_URL not set, skipping DVF refresh")
        return {"status": "skipped", "reason": "no DATABASE_URL"}

    depts = departments or list(DEPARTMENT_URLS.keys())
    engine = create_engine(DATABASE_URL)
    total_upserted = 0
    errors = []

    for dept in depts:
        try:
            count = _refresh_department(engine, dept)
            total_upserted += count
            logger.info(f"Dept {dept}: upserted {count} records")
        except Exception as exc:
            logger.exception(f"Dept {dept} failed: {exc}")
            errors.append({"dept": dept, "error": str(exc)})

    return {
        "status": "done",
        "departments": depts,
        "total_upserted": total_upserted,
        "errors": errors,
    }


def _refresh_department(engine, dept: str) -> int:
    url = DEPARTMENT_URLS.get(dept)
    if not url:
        return 0

    logger.info(f"Downloading DVF for dept {dept} from {url}")
    with httpx.Client(timeout=120, follow_redirects=True) as client:
        resp = client.get(url)
        resp.raise_for_status()

    df = pd.read_csv(io.BytesIO(resp.content), compression="gzip", low_memory=False)

    # Keep only relevant columns that exist
    available = [c for c in COLUMN_MAP.keys() if c in df.columns]
    df = df[available].rename(columns=COLUMN_MAP)

    # Filter: last 3 months, valid coords, valid price, bâti only
    df["sale_date"] = pd.to_datetime(df["sale_date"], errors="coerce")
    cutoff = datetime.now() - timedelta(days=90)
    df = df[df["sale_date"] >= cutoff]
    df = df.dropna(subset=["latitude", "longitude", "price", "surface_area"])
    df = df[df["surface_area"] > 5]
    df = df[df["price"] > 1000]

    if "local_type" in df.columns:
        df = df[df["local_type"].isin(["Appartement", "Maison"])]
        df["property_type"] = df["local_type"].map(TYPE_MAP).fillna("OTHER")
    else:
        df["property_type"] = "OTHER"

    df["price_per_sqm"] = df["price"] / df["surface_area"]
    df = df[(df["price_per_sqm"] > 500) & (df["price_per_sqm"] < 50000)]

    if df.empty:
        return 0

    # Upsert via raw SQL (faster than ORM for bulk)
    rows = df.to_dict("records")
    upserted = 0

    with engine.begin() as conn:
        for row in rows:
            conn.execute(
                text("""
                    INSERT INTO "PricePoint" (
                        id, mutation_id, sale_date, price, surface_area,
                        price_per_sqm, property_type, latitude, longitude,
                        postal_code, city, street_name, room_count,
                        "createdAt", "updatedAt"
                    ) VALUES (
                        gen_random_uuid(),
                        :mutation_id, :sale_date, :price, :surface_area,
                        :price_per_sqm, :property_type, :latitude, :longitude,
                        :postal_code, :city, :street_name, :room_count,
                        NOW(), NOW()
                    )
                    ON CONFLICT (mutation_id) DO UPDATE SET
                        price_per_sqm = EXCLUDED.price_per_sqm,
                        "updatedAt" = NOW()
                """),
                {
                    "mutation_id": str(row.get("mutation_id", ""))[:50],
                    "sale_date": row.get("sale_date"),
                    "price": float(row.get("price", 0)),
                    "surface_area": float(row.get("surface_area", 0)),
                    "price_per_sqm": float(row.get("price_per_sqm", 0)),
                    "property_type": row.get("property_type", "OTHER"),
                    "latitude": float(row.get("latitude", 0)),
                    "longitude": float(row.get("longitude", 0)),
                    "postal_code": str(row.get("postal_code", ""))[:10],
                    "city": str(row.get("city", ""))[:100],
                    "street_name": str(row.get("street_name", ""))[:200],
                    "room_count": int(row.get("room_count", 0) or 0),
                },
            )
            upserted += 1

    return upserted
