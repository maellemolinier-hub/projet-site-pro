"""
DVF refresh tasks — couverture France entière (101 départements).

Deux stratégies :
  - refresh_dvf_batch   : tâche nightly — traite ~15 depts par nuit
                          (rotation sur 7 jours, France complète en 1 semaine)
  - refresh_all_france  : tâche mensuelle ou manuelle — ingestion complète
  - refresh_dvf         : entrée générique utilisée par l'admin endpoint
"""
import os
import io
import math
import logging
from datetime import datetime, timedelta

import httpx
import pandas as pd
from celery import shared_task
from sqlalchemy import create_engine, text

logger = logging.getLogger(__name__)

DATABASE_URL = os.environ.get("DATABASE_URL", "")

# ── 101 départements France entière ─────────────────────────────────────────
# Métropole : 01-19, 2A, 2B, 21-95
# DOM       : 971 (Guadeloupe), 972 (Martinique), 973 (Guyane),
#             974 (La Réunion), 976 (Mayotte)

_METRO = (
    [f"{i:02d}" for i in range(1, 20)]   # 01-19
    + ["2A", "2B"]                        # Corse
    + [f"{i:02d}" for i in range(21, 96)] # 21-95
)
_DOM = ["971", "972", "973", "974", "976"]

ALL_DEPARTMENTS: list[str] = _METRO + _DOM  # 101 départements

# Batches : 7 groupes d'environ 14-15 depts (rotation nightly)
_N_BATCHES = 7
_BATCH_SIZE = math.ceil(len(ALL_DEPARTMENTS) / _N_BATCHES)
DEPARTMENT_BATCHES: list[list[str]] = [
    ALL_DEPARTMENTS[i : i + _BATCH_SIZE]
    for i in range(0, len(ALL_DEPARTMENTS), _BATCH_SIZE)
]

DVF_BASE_URL = "https://files.data.gouv.fr/geo-dvf/latest/csv"

def _dept_url(dept: str, year: int) -> str:
    return f"{DVF_BASE_URL}/{year}/departements/{dept}.csv.gz"

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


# ── Tâche nightly : batch rotatif ───────────────────────────────────────────

@shared_task(bind=True, name="data.pipelines.tasks.daily_refresh.refresh_dvf_batch", max_retries=3)
def refresh_dvf_batch(self, batch_index: int | None = None):
    """
    Traite un batch de ~15 départements.
    batch_index : 0-6 (si None, calculé automatiquement depuis le jour de l'année).
    """
    if not DATABASE_URL:
        return {"status": "skipped", "reason": "no DATABASE_URL"}

    idx = batch_index if batch_index is not None else datetime.now().timetuple().tm_yday % _N_BATCHES
    depts = DEPARTMENT_BATCHES[idx]
    logger.info(f"[batch {idx}] Traitement de {len(depts)} départements : {depts}")
    return _run_refresh(depts)


# ── Tâche mensuelle / manuelle : France entière ─────────────────────────────

@shared_task(bind=True, name="data.pipelines.tasks.daily_refresh.refresh_all_france", max_retries=2)
def refresh_all_france(self, year: int | None = None):
    """
    Charge le fichier DVF annuel complet pour les 101 départements.
    Utilise l'année N-1 (ou l'année passée en paramètre).
    """
    if not DATABASE_URL:
        return {"status": "skipped", "reason": "no DATABASE_URL"}

    target_year = year or (datetime.now().year - 1)
    logger.info(f"[refresh_all_france] Ingestion France entière — DVF {target_year}")
    return _run_refresh(ALL_DEPARTMENTS, year=target_year, cutoff_days=None)


# ── Alias générique (utilisé par l'admin endpoint) ─────────────────────────

@shared_task(bind=True, name="data.pipelines.tasks.daily_refresh.refresh_dvf", max_retries=3)
def refresh_dvf(self, departments: list[str] | None = None, year: int | None = None):
    """Rafraîchit les départements demandés (tous si None)."""
    if not DATABASE_URL:
        return {"status": "skipped", "reason": "no DATABASE_URL"}

    depts = departments or ALL_DEPARTMENTS
    return _run_refresh(depts, year=year)


# ── Implémentation commune ───────────────────────────────────────────────────

def _run_refresh(depts: list[str], year: int | None = None, cutoff_days: int | None = 90) -> dict:
    engine = create_engine(DATABASE_URL, pool_pre_ping=True)
    target_year = year or (datetime.now().year - 1)
    total_upserted = 0
    errors: list[dict] = []

    for dept in depts:
        try:
            count = _refresh_department(engine, dept, target_year, cutoff_days)
            total_upserted += count
            logger.info(f"  {dept} → {count} enregistrements")
        except Exception as exc:
            logger.exception(f"  {dept} ERREUR : {exc}")
            errors.append({"dept": dept, "error": str(exc)})

    return {
        "status": "done",
        "year": target_year,
        "departments_processed": len(depts) - len(errors),
        "departments_errored": len(errors),
        "total_upserted": total_upserted,
        "errors": errors,
    }


def _refresh_department(engine, dept: str, year: int, cutoff_days: int | None) -> int:
    url = _dept_url(dept, year)
    logger.info(f"    ↓ {url}")

    with httpx.Client(timeout=180, follow_redirects=True) as client:
        resp = client.get(url)
        if resp.status_code == 404:
            # Certains DOM n'ont pas de fichier DVF
            logger.warning(f"    {dept} : fichier DVF introuvable (404), ignoré")
            return 0
        resp.raise_for_status()

    df = pd.read_csv(io.BytesIO(resp.content), compression="gzip", low_memory=False)

    # Sélection des colonnes disponibles
    available = [c for c in COLUMN_MAP if c in df.columns]
    df = df[available].rename(columns=COLUMN_MAP)

    # Filtre temporel
    df["sale_date"] = pd.to_datetime(df["sale_date"], errors="coerce")
    if cutoff_days is not None:
        cutoff = datetime.now() - timedelta(days=cutoff_days)
        df = df[df["sale_date"] >= cutoff]

    # Filtres qualité
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

    # Upsert par lots de 500 lignes pour limiter la mémoire transactionnelle
    rows = df.to_dict("records")
    upserted = 0
    chunk_size = 500

    insert_sql = text("""
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
    """)

    for i in range(0, len(rows), chunk_size):
        chunk = rows[i : i + chunk_size]
        params = [
            {
                "mutation_id": str(r.get("mutation_id", ""))[:50],
                "sale_date": r.get("sale_date"),
                "price": float(r.get("price", 0)),
                "surface_area": float(r.get("surface_area", 0)),
                "price_per_sqm": float(r.get("price_per_sqm", 0)),
                "property_type": r.get("property_type", "OTHER"),
                "latitude": float(r.get("latitude", 0)),
                "longitude": float(r.get("longitude", 0)),
                "postal_code": str(r.get("postal_code", ""))[:10],
                "city": str(r.get("city", ""))[:100],
                "street_name": str(r.get("street_name", ""))[:200],
                "room_count": int(r.get("room_count") or 0),
            }
            for r in chunk
        ]
        with engine.begin() as conn:
            conn.execute(insert_sql, params)
        upserted += len(chunk)

    return upserted
