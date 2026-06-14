"""
Pipeline d'ingestion des données DVF (Demandes de Valeurs Foncières).
Source: https://www.data.gouv.fr/fr/datasets/demandes-de-valeurs-foncieres/
Fréquence: trimestrielle
"""
import asyncio
import httpx
import pandas as pd
import asyncpg
import logging
from io import StringIO
from datetime import datetime

logger = logging.getLogger(__name__)

DVF_BASE_URL = "https://files.data.gouv.fr/geo-dvf/latest/csv"

PROPERTY_TYPE_MAP = {
    "Appartement": "APARTMENT",
    "Maison": "HOUSE",
    "Terrain": "LAND",
    "Local industriel. commercial ou assimilé": "COMMERCIAL",
}


async def fetch_dvf_department(dept: str, year: int) -> pd.DataFrame:
    url = f"{DVF_BASE_URL}/{year}/departements/{dept}.csv.gz"
    async with httpx.AsyncClient(timeout=120) as client:
        resp = await client.get(url)
        resp.raise_for_status()

    df = pd.read_csv(
        StringIO(resp.text),
        sep=",",
        dtype={"code_postal": str, "code_departement": str},
        parse_dates=["date_mutation"],
        low_memory=False,
    )
    return df


def clean_dvf(df: pd.DataFrame) -> pd.DataFrame:
    df = df.dropna(subset=["latitude", "longitude", "valeur_fonciere", "surface_reelle_bati"])
    df = df[df["surface_reelle_bati"] > 0]
    df = df[df["valeur_fonciere"] > 0]
    df["price_sqm"] = df["valeur_fonciere"] / df["surface_reelle_bati"]
    df = df[(df["price_sqm"] > 500) & (df["price_sqm"] < 50000)]
    df["type"] = df["type_local"].map(PROPERTY_TYPE_MAP).fillna("APARTMENT")
    df["street"] = df["adresse_nom_voie"].fillna("")
    df["address"] = df["adresse_numero"].fillna("").astype(str) + " " + df["street"]
    df["address"] = df["address"].str.strip()
    return df


async def upsert_price_points(conn: asyncpg.Connection, df: pd.DataFrame) -> int:
    records = [
        (
            "dvf",
            row["address"],
            row["street"],
            row["nom_commune"],
            row["code_postal"],
            float(row["latitude"]),
            float(row["longitude"]),
            float(row["price_sqm"]),
            float(row["valeur_fonciere"]),
            float(row["surface_reelle_bati"]),
            int(row.get("nombre_pieces_principales", 0) or 0),
            row["type"],
            row["date_mutation"].date() if pd.notna(row["date_mutation"]) else None,
        )
        for _, row in df.iterrows()
    ]

    await conn.executemany(
        """
        INSERT INTO price_points
            (source, address, street, city, postal_code, latitude, longitude,
             price_sqm, price_total, surface, rooms, type, sold_at, created_at)
        VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13, NOW())
        ON CONFLICT DO NOTHING
        """,
        records,
    )
    return len(records)


async def run_ingestion(departments: list[str], year: int | None = None):
    if year is None:
        year = datetime.now().year - 1

    conn = await asyncpg.connect(
        "postgresql://user:password@localhost:5432/immoexpert"
    )

    total = 0
    for dept in departments:
        try:
            logger.info("Ingestion DVF dept %s année %s...", dept, year)
            df = await fetch_dvf_department(dept, year)
            df = clean_dvf(df)
            n = await upsert_price_points(conn, df)
            total += n
            logger.info("  → %d transactions insérées", n)
        except Exception as e:
            logger.error("Erreur dept %s: %s", dept, e)

    await conn.close()
    logger.info("Ingestion terminée: %d transactions total", total)
    return total


if __name__ == "__main__":
    logging.basicConfig(level=logging.INFO)
    # Départements IDF pour test
    asyncio.run(run_ingestion(["75", "92", "93", "94", "77", "78", "91", "95"]))
