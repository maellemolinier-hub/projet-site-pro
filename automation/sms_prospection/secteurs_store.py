"""Version éditable (base de données) du mapping secteur -> assistant IA.

`secteurs.py` reste la source des valeurs par défaut (utilisée pour amorcer
la table `secteur_config` au premier accès) ; toute modification faite
depuis le centre de pilotage (argumentaire, nom de l'assistant IA...) est
ensuite lue depuis la base, ce qui permet de changer l'argumentaire et les
explications sur les offres sans redéployer de code.
"""
from __future__ import annotations

from dataclasses import dataclass
from datetime import datetime, timezone

from sqlalchemy import insert, select, update

from .db import get_engine, secteur_config
from .secteurs import DEFAULT_SECTEUR, SECTEURS

_ARGUMENTAIRE_DEFAUT = (
    "Le Pack Digitalisation comprend : un site vitrine professionnel, la prise "
    "de rendez-vous en ligne, et l'assistant IA sectoriel qui répond aux clients "
    "24h/24 (devis, disponibilités, questions fréquentes). Audit initial gratuit "
    "et sans engagement."
)


@dataclass
class SecteurConfig:
    cle: str
    label_pluriel: str
    assistant_ia: str
    argumentaire: str


def _seed_if_empty() -> None:
    engine = get_engine()
    with engine.connect() as conn:
        existe = conn.execute(select(secteur_config.c.cle).limit(1)).first()
    if existe:
        return

    with engine.begin() as conn:
        for cle, secteur in SECTEURS.items():
            conn.execute(
                insert(secteur_config).values(
                    cle=cle,
                    label_pluriel=secteur.label_pluriel,
                    assistant_ia=secteur.assistant_ia,
                    argumentaire=_ARGUMENTAIRE_DEFAUT,
                )
            )


def get(cle: str) -> SecteurConfig:
    _seed_if_empty()
    cle = (cle or "").strip().lower()
    engine = get_engine()
    with engine.connect() as conn:
        row = conn.execute(
            select(secteur_config).where(secteur_config.c.cle == cle)
        ).mappings().first()
    if row is None:
        return SecteurConfig(
            cle=cle or "generique",
            label_pluriel=DEFAULT_SECTEUR.label_pluriel,
            assistant_ia=DEFAULT_SECTEUR.assistant_ia,
            argumentaire=_ARGUMENTAIRE_DEFAUT,
        )
    return SecteurConfig(
        cle=row["cle"],
        label_pluriel=row["label_pluriel"],
        assistant_ia=row["assistant_ia"],
        argumentaire=row["argumentaire"],
    )


def lister() -> list[SecteurConfig]:
    _seed_if_empty()
    engine = get_engine()
    with engine.connect() as conn:
        rows = conn.execute(select(secteur_config).order_by(secteur_config.c.cle)).mappings().all()
    return [
        SecteurConfig(
            cle=r["cle"],
            label_pluriel=r["label_pluriel"],
            assistant_ia=r["assistant_ia"],
            argumentaire=r["argumentaire"],
        )
        for r in rows
    ]


def mettre_a_jour(
    cle: str,
    label_pluriel: str | None = None,
    assistant_ia: str | None = None,
    argumentaire: str | None = None,
) -> SecteurConfig:
    _seed_if_empty()
    cle = cle.strip().lower()
    actuel = get(cle)
    champs = {
        "label_pluriel": label_pluriel or actuel.label_pluriel,
        "assistant_ia": assistant_ia or actuel.assistant_ia,
        "argumentaire": argumentaire or actuel.argumentaire,
        "updated_at": datetime.now(timezone.utc),
    }

    engine = get_engine()
    with engine.begin() as conn:
        existe = conn.execute(
            select(secteur_config.c.cle).where(secteur_config.c.cle == cle)
        ).first()
        if existe:
            conn.execute(
                update(secteur_config).where(secteur_config.c.cle == cle).values(**champs)
            )
        else:
            conn.execute(insert(secteur_config).values(cle=cle, **champs))

    return get(cle)
