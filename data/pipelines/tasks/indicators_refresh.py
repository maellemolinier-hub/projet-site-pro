"""
Agent d'ingestion des INDICATEURS DE ZONE (données publiques agrégées, RGPD-safe).

Toutes les métriques sont agrégées au niveau de la commune (code INSEE) — jamais
nominatives. Elles alimentent la table `ZoneIndicator` (+ `MarketIndicator` pour les
séries nationales comme le taux de crédit), consommées par l'endpoint /predict.

Tâches :
  - refresh_communes        : référentiel communes (code INSEE, CP, pop.) via geo.api.gouv.fr
  - refresh_deaths          : décès annuels par commune (INSEE "personnes décédées")
  - refresh_vacant_housing  : taux de logements vacants par commune (recensement INSEE)
  - refresh_credit_rate     : taux de crédit immobilier national (MarketIndicator)
  - refresh_all_indicators  : orchestration

Les URLs des gros fichiers INSEE sont configurables par variables d'environnement
(elles changent à chaque millésime) ; en leur absence la tâche log et s'arrête
proprement sans casser l'ordonnanceur.
"""
import io
import os
import logging
from datetime import datetime, date

import httpx
from celery import shared_task
from sqlalchemy import create_engine, text

logger = logging.getLogger(__name__)

DATABASE_URL = os.environ.get("DATABASE_URL", "")

GEO_API = "https://geo.api.gouv.fr/communes"
# Fichiers INSEE (millésimés) — surchargeables par env
DECES_URL = os.environ.get("INSEE_DECES_URL", "")          # ex: .../deces-2023.txt
LOGEMENTS_URL = os.environ.get("INSEE_LOGEMENTS_URL", "")  # CSV recensement logements


def _engine():
    if not DATABASE_URL:
        raise RuntimeError("DATABASE_URL non défini")
    return create_engine(DATABASE_URL, pool_pre_ping=True)


# ── Upsert générique d'un indicateur de zone ────────────────────────────────

_UPSERT_SQL = text("""
    INSERT INTO "ZoneIndicator" (
        id, "codeInsee", "postalCode", city, department, population,
        deaths, "deathRate", births, "birthRate", "divorceRate",
        "vacantHousing", "vacancyRate", "medianIncome", "referenceYear",
        "createdAt", "updatedAt"
    ) VALUES (
        gen_random_uuid(), :code_insee, :postal_code, :city, :department, :population,
        :deaths, :death_rate, :births, :birth_rate, :divorce_rate,
        :vacant_housing, :vacancy_rate, :median_income, :reference_year,
        NOW(), NOW()
    )
    ON CONFLICT ("codeInsee") DO UPDATE SET
        "postalCode"   = COALESCE(EXCLUDED."postalCode",   "ZoneIndicator"."postalCode"),
        city           = COALESCE(EXCLUDED.city,            "ZoneIndicator".city),
        department     = COALESCE(EXCLUDED.department,      "ZoneIndicator".department),
        population     = COALESCE(EXCLUDED.population,      "ZoneIndicator".population),
        deaths         = COALESCE(EXCLUDED.deaths,          "ZoneIndicator".deaths),
        "deathRate"    = COALESCE(EXCLUDED."deathRate",     "ZoneIndicator"."deathRate"),
        births         = COALESCE(EXCLUDED.births,          "ZoneIndicator".births),
        "birthRate"    = COALESCE(EXCLUDED."birthRate",     "ZoneIndicator"."birthRate"),
        "divorceRate"  = COALESCE(EXCLUDED."divorceRate",   "ZoneIndicator"."divorceRate"),
        "vacantHousing"= COALESCE(EXCLUDED."vacantHousing", "ZoneIndicator"."vacantHousing"),
        "vacancyRate"  = COALESCE(EXCLUDED."vacancyRate",   "ZoneIndicator"."vacancyRate"),
        "medianIncome" = COALESCE(EXCLUDED."medianIncome",  "ZoneIndicator"."medianIncome"),
        "referenceYear"= COALESCE(EXCLUDED."referenceYear", "ZoneIndicator"."referenceYear"),
        "updatedAt"    = NOW()
""")


def _blank_row(code_insee: str) -> dict:
    return {
        "code_insee": code_insee, "postal_code": None, "city": None,
        "department": None, "population": None, "deaths": None,
        "death_rate": None, "births": None, "birth_rate": None,
        "divorce_rate": None, "vacant_housing": None, "vacancy_rate": None,
        "median_income": None, "reference_year": None,
    }


def _upsert_rows(engine, rows: list[dict]) -> int:
    if not rows:
        return 0
    chunk = 500
    n = 0
    for i in range(0, len(rows), chunk):
        batch = rows[i : i + chunk]
        with engine.begin() as conn:
            conn.execute(_UPSERT_SQL, batch)
        n += len(batch)
    return n


# ── 1. Référentiel communes (socle) ─────────────────────────────────────────

@shared_task(bind=True, name="data.pipelines.tasks.indicators_refresh.refresh_communes", max_retries=3)
def refresh_communes(self, departments: list[str] | None = None) -> dict:
    """
    Charge le référentiel des communes (code INSEE, code postal principal,
    département, population) depuis geo.api.gouv.fr et crée/complète les
    lignes ZoneIndicator. C'est le socle qui relie PricePoint (via postalCode).
    """
    if not DATABASE_URL:
        return {"status": "skipped", "reason": "no DATABASE_URL"}

    engine = _engine()
    params = {
        "fields": "nom,code,codesPostaux,codeDepartement,population",
        "format": "json",
    }
    rows: list[dict] = []
    with httpx.Client(timeout=120, follow_redirects=True) as client:
        if departments:
            communes = []
            for dep in departments:
                resp = client.get(GEO_API, params={**params, "codeDepartement": dep})
                resp.raise_for_status()
                communes.extend(resp.json())
        else:
            resp = client.get(GEO_API, params=params)
            resp.raise_for_status()
            communes = resp.json()

    for c in communes:
        cps = c.get("codesPostaux") or []
        row = _blank_row(c["code"])
        row.update({
            "postal_code": cps[0] if cps else None,
            "city": c.get("nom"),
            "department": c.get("codeDepartement"),
            "population": c.get("population"),
        })
        rows.append(row)

    n = _upsert_rows(engine, rows)
    logger.info("refresh_communes → %d communes upsertées", n)
    return {"status": "done", "communes": n}


# ── 2. Décès annuels par commune (agrégé, RGPD-safe) ────────────────────────

def aggregate_deaths_by_commune(text_content: str) -> dict[str, int]:
    """
    Agrège les décès par code commune INSEE du lieu de décès.
    Format INSEE "Fichier des personnes décédées" (largeur fixe) :
      - positions 163-167 (index 162:167) = code lieu de décès (commune INSEE).
    On ne conserve QUE le comptage par commune — aucune donnée nominative.
    """
    counts: dict[str, int] = {}
    for line in text_content.splitlines():
        if len(line) < 167:
            continue
        code = line[162:167].strip()
        if len(code) == 5 and code.isdigit():
            counts[code] = counts.get(code, 0) + 1
    return counts


@shared_task(bind=True, name="data.pipelines.tasks.indicators_refresh.refresh_deaths", max_retries=2)
def refresh_deaths(self, url: str | None = None, reference_year: int | None = None) -> dict:
    """
    Télécharge le fichier INSEE des personnes décédées, agrège par commune,
    et met à jour deaths + deathRate (décès / population * 1000).
    URL surchargeable (INSEE_DECES_URL) car millésimée.
    """
    if not DATABASE_URL:
        return {"status": "skipped", "reason": "no DATABASE_URL"}
    target_url = url or DECES_URL
    if not target_url:
        logger.warning("refresh_deaths : aucune URL (INSEE_DECES_URL) — tâche ignorée")
        return {"status": "skipped", "reason": "no INSEE_DECES_URL"}

    with httpx.Client(timeout=300, follow_redirects=True) as client:
        resp = client.get(target_url)
        resp.raise_for_status()
        content = resp.text

    counts = aggregate_deaths_by_commune(content)
    engine = _engine()
    year = reference_year or (datetime.now().year - 1)

    # On upsert les comptes, puis on recalcule deathRate là où la population est connue.
    rows = []
    for code, deaths in counts.items():
        row = _blank_row(code)
        row.update({"deaths": deaths, "reference_year": year})
        rows.append(row)
    n = _upsert_rows(engine, rows)

    with engine.begin() as conn:
        conn.execute(text("""
            UPDATE "ZoneIndicator"
            SET "deathRate" = ROUND((deaths::numeric / NULLIF(population, 0)) * 1000, 2),
                "updatedAt" = NOW()
            WHERE deaths IS NOT NULL AND population IS NOT NULL AND population > 0
        """))

    logger.info("refresh_deaths → %d communes mises à jour (année %s)", n, year)
    return {"status": "done", "communes": n, "year": year}


# ── 3. Logements vacants par commune ────────────────────────────────────────

@shared_task(bind=True, name="data.pipelines.tasks.indicators_refresh.refresh_vacant_housing", max_retries=2)
def refresh_vacant_housing(self, url: str | None = None) -> dict:
    """
    Charge le taux de logements vacants par commune depuis le recensement INSEE.
    Attendu : CSV avec au moins code commune, nb logements vacants, nb logements total.
    URL surchargeable (INSEE_LOGEMENTS_URL).
    """
    if not DATABASE_URL:
        return {"status": "skipped", "reason": "no DATABASE_URL"}
    target_url = url or LOGEMENTS_URL
    if not target_url:
        logger.warning("refresh_vacant_housing : aucune URL (INSEE_LOGEMENTS_URL) — ignorée")
        return {"status": "skipped", "reason": "no INSEE_LOGEMENTS_URL"}

    import pandas as pd

    with httpx.Client(timeout=300, follow_redirects=True) as client:
        resp = client.get(target_url)
        resp.raise_for_status()
        raw = resp.content

    df = pd.read_csv(io.BytesIO(raw), sep=None, engine="python", dtype=str)
    cols = {c.lower(): c for c in df.columns}

    def pick(*cands):
        for cand in cands:
            if cand in cols:
                return cols[cand]
        return None

    code_col = pick("codgeo", "code", "com", "code_commune")
    vac_col = pick("logvac", "p20_logvac", "nb_logements_vacants", "vacants")
    tot_col = pick("log", "p20_log", "nb_logements", "logements")
    if not (code_col and vac_col and tot_col):
        return {"status": "error", "reason": f"colonnes introuvables dans {list(df.columns)[:10]}"}

    engine = _engine()
    rows = []
    for _, r in df.iterrows():
        try:
            total = float(r[tot_col])
            vac = float(r[vac_col])
        except (TypeError, ValueError):
            continue
        if total <= 0:
            continue
        row = _blank_row(str(r[code_col]).strip())
        row.update({
            "vacant_housing": int(vac),
            "vacancy_rate": round(vac / total * 100, 2),
        })
        rows.append(row)
    n = _upsert_rows(engine, rows)
    logger.info("refresh_vacant_housing → %d communes mises à jour", n)
    return {"status": "done", "communes": n}


# ── 4. Taux de crédit immobilier national (série datée) ─────────────────────

@shared_task(bind=True, name="data.pipelines.tasks.indicators_refresh.refresh_credit_rate", max_retries=2)
def refresh_credit_rate(self, value: float | None = None, maturity: str = "20y") -> dict:
    """
    Enregistre le taux de crédit immobilier national du jour dans MarketIndicator.
    `value` peut être fournie manuellement (ou par une source externe branchée ici).
    """
    if not DATABASE_URL:
        return {"status": "skipped", "reason": "no DATABASE_URL"}
    if value is None:
        logger.warning("refresh_credit_rate : aucune valeur fournie — ignorée")
        return {"status": "skipped", "reason": "no value"}

    engine = _engine()
    with engine.begin() as conn:
        conn.execute(text("""
            INSERT INTO "MarketIndicator" (id, key, value, unit, date, source, "createdAt")
            VALUES (gen_random_uuid(), :key, :value, '%', :d, :source, NOW())
            ON CONFLICT (key, date) DO UPDATE SET value = EXCLUDED.value
        """), {
            "key": f"credit_rate_{maturity}",
            "value": float(value),
            "d": date.today(),
            "source": "manual/external",
        })
    return {"status": "done", "key": f"credit_rate_{maturity}", "value": value}


# ── Orchestration ────────────────────────────────────────────────────────────

@shared_task(bind=True, name="data.pipelines.tasks.indicators_refresh.refresh_all_indicators")
def refresh_all_indicators(self, departments: list[str] | None = None) -> dict:
    out = {"communes": refresh_communes(departments)}
    out["deaths"] = refresh_deaths()
    out["vacant_housing"] = refresh_vacant_housing()
    return {"status": "done", "steps": out}
